// Corpus harness: raw lines -> validate -> dedupe -> per-entity version order -> projection.
// Pure and order-independent, so a shuffled arrival must give the same projection.
import { parseSourceEvent, type SourceEvent } from '../contract';

export interface EntityProjection { kind: string; sourceVersion: string; eventId: string; headSha: string | null; visibility: string }
export interface CorpusProjection {
  entities: Record<string, EntityProjection>;
  accepted: number; // unique valid events
  duplicates: number; // repeated eventIds ignored
  stale: number; // valid events superseded by a newer sourceVersion
  warnings: string[]; // sorted, so arrival order cannot change them
}

const MAX_LINE = 64 * 1024;

/** Numeric versions compare as numbers, everything else lexically; ties break on eventId. */
export function compareVersion(a: SourceEvent, b: SourceEvent): number {
  const na = Number(a.sourceVersion), nb = Number(b.sourceVersion);
  const byVersion = Number.isFinite(na) && Number.isFinite(nb) ? na - nb : a.sourceVersion < b.sourceVersion ? -1 : a.sourceVersion > b.sourceVersion ? 1 : 0;
  return byVersion || (a.eventId < b.eventId ? -1 : a.eventId > b.eventId ? 1 : 0);
}

export function projectCorpus(lines: readonly string[]): CorpusProjection {
  const warnings: string[] = [];
  const seen = new Map<string, SourceEvent>();
  let duplicates = 0;
  for (const line of lines) {
    if (!line.trim()) continue;
    if (line.length > MAX_LINE) { warnings.push('rejected: line over size cap'); continue; }
    let raw: unknown;
    try { raw = JSON.parse(line); } catch { warnings.push('rejected: invalid JSON'); continue; }
    const parsed = parseSourceEvent(raw);
    if (!parsed.ok) { warnings.push(`rejected: ${parsed.reason}`); continue; }
    if (parsed.warning) warnings.push(`kept: ${parsed.warning} (${parsed.event.eventId})`);
    if (seen.has(parsed.event.eventId)) { duplicates++; continue; }
    seen.set(parsed.event.eventId, parsed.event);
  }
  const latest = new Map<string, SourceEvent>();
  let stale = 0;
  for (const event of seen.values()) {
    if (event.kind === 'unknown') continue; // kept in the log, never applied
    const key = `${event.source}|${event.scope.account}|${event.entity.kind}|${event.entity.id}`;
    const current = latest.get(key);
    if (!current) latest.set(key, event);
    else { stale++; if (compareVersion(event, current) > 0) latest.set(key, event); }
  }
  const entities: Record<string, EntityProjection> = {};
  for (const key of [...latest.keys()].sort()) {
    const e = latest.get(key)!;
    entities[key] = { kind: e.kind, sourceVersion: e.sourceVersion, eventId: e.eventId, headSha: e.headSha ?? null, visibility: e.visibility };
  }
  return { entities, accepted: seen.size, duplicates, stale, warnings: warnings.sort() };
}
