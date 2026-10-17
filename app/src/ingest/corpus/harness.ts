// Pure corpus projection; canonical content and sorted output make arrival order irrelevant.
import { parseSourceEvent, versionKey, type SourceEvent } from '../contract';

export type EntityProjection = Pick<SourceEvent, 'source' | 'scope' | 'entity' | 'kind' | 'sourceVersion' | 'eventId' | 'visibility' | 'payload'> & { headSha: string | null; fetchedVia: string[] };
export interface CorpusProjection {
  entities: Record<string, EntityProjection>;
  conflicts: { key: string; reason: string; eventIds: string[] }[];
  rejected: { line: number; digest: string; reason: string }[];
  accepted: number;
  duplicates: number;
  stale: number;
  warnings: string[];
}
// Components are escaped (% then |) so a '|' inside an id cannot make two scopes collide.
const esc = (v: string | number) => String(v).replace(/%/g, '%25').replace(/\|/g, '%7C');
const keyOf = (e: SourceEvent) => [e.source, e.scope.account, e.scope.repoId ?? e.scope.linearTeamId ?? '-', e.entity.kind, e.entity.id].map(esc).join('|');
// What a copy asserts. observedAt (ingest time) and provenance (delivery channel) are observation metadata, not content.
const content = (e: SourceEvent) => JSON.stringify(stable({ schema: e.schema, eventId: e.eventId, source: e.source, scope: e.scope, entity: e.entity, kind: e.kind, rawKind: e.rawKind ?? null, occurredAt: e.occurredAt, sourceVersion: e.sourceVersion, headSha: e.headSha ?? null, payload: e.payload, visibility: e.visibility }));
const cmp = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0;
function stable(value: unknown): unknown {
  if (value === null || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).sort(([a], [b]) => cmp(a, b)).map(([key, v]) => [key, stable(v)]));
}
function digest(line: string): string {
  let hash = 2166136261;
  for (const byte of new TextEncoder().encode(line)) hash = Math.imul(hash ^ byte, 16777619);
  return (hash >>> 0).toString(16).padStart(8, '0');
}
export function projectCorpus(lines: readonly string[]): CorpusProjection {
  const rejected: CorpusProjection['rejected'] = [], conflicts: CorpusProjection['conflicts'] = [], warnings: string[] = [];
  const seen = new Map<string, SourceEvent[]>();
  lines.forEach((line, index) => {
    const reject = (reason: string) => rejected.push({ line: index + 1, digest: digest(line), reason });
    if (!line.trim()) { reject('empty record'); return; }
    if (new TextEncoder().encode(line).length > 64 * 1024) { reject('line over size cap'); return; }
    let raw: unknown;
    try { raw = JSON.parse(line); } catch { reject('invalid JSON'); return; }
    const parsed = parseSourceEvent(raw);
    if (!parsed.ok) { reject(parsed.reason); return; }
    const copies = seen.get(parsed.event.eventId) ?? [];
    copies.push(parsed.event);
    seen.set(parsed.event.eventId, copies);
  });
  const groups = new Map<string, { event: SourceEvent; fetchedVia: string[] }[]>();
  let accepted = 0, duplicates = 0, stale = 0;
  for (const [eventId, copies] of seen) {
    const contents = new Set(copies.map(content));
    if (contents.size > 1) {
      conflicts.push({ key: copies.map(keyOf).sort()[0], reason: 'same eventId, different content', eventIds: [eventId] });
      continue;
    }
    accepted++;
    duplicates += copies.length - 1;
    const event = copies[0];
    if (event.kind === 'unknown') { warnings.push(`kept: unknown event kind (${eventId})`); continue; }
    const key = keyOf(event), group = groups.get(key) ?? [];
    group.push({ event, fetchedVia: [...new Set(copies.map((e) => e.provenance.fetchedVia))].sort() });
    groups.set(key, group);
  }
  const entities: CorpusProjection['entities'] = {};
  for (const key of [...groups.keys()].sort()) {
    const group = groups.get(key)!;
    const versions = group.map(({ event }) => versionKey(event.sourceVersion)!);
    if (new Set(versions.map((v) => v.domain)).size > 1) {
      conflicts.push({ key, reason: 'mixed version domains', eventIds: group.map(({ event }) => event.eventId).sort() });
      continue;
    }
    const max = Math.max(...versions.map((v) => v.value));
    const winners = group.filter((_, i) => versions[i].value === max);
    stale += group.length - winners.length;
    if (winners.length > 1) {
      conflicts.push({ key, reason: 'version tie', eventIds: winners.map(({ event }) => event.eventId).sort() });
      continue;
    }
    const { event: e, fetchedVia } = winners[0];
    entities[key] = { source: e.source, scope: e.scope, entity: e.entity, kind: e.kind, sourceVersion: e.sourceVersion, eventId: e.eventId, headSha: e.headSha ?? null, visibility: e.visibility, fetchedVia, payload: stable(e.payload) as SourceEvent['payload'] };
  }
  conflicts.sort((a, b) => cmp(a.key, b.key) || cmp(a.reason, b.reason) || cmp(a.eventIds.join('\u0000'), b.eventIds.join('\u0000')));
  rejected.sort((a, b) => cmp(a.digest, b.digest) || cmp(a.reason, b.reason) || a.line - b.line);
  return { entities, conflicts, rejected, accepted, duplicates, stale, warnings: warnings.sort() };
}
