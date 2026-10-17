// Milestone B event contract (schema 2): versioned, scoped, head-bound and
// visibility-tagged. Pure types plus a validator; no network, no tokens.
import type { EvidenceEvent } from '../contracts';

export const SOURCE_EVENT_SCHEMA = 2 as const;
export const SOURCES = ['github', 'linear', 'fixture', 'reconcile'] as const;
export const ENTITY_KINDS = ['issue', 'pr', 'head', 'check', 'review', 'merge', 'link', 'repo', 'connector'] as const;
// Closed kind set. Anything else is kept as 'unknown', ignored by reducers and surfaced as a warning.
export const EVENT_KINDS = ['stage', 'head', 'review', 'qa', 'check', 'merge', 'quota', 'connection', 'hold', 'pause', 'activity', 'unknown'] as const;
export const FETCHED_VIA = ['poll', 'webhook', 'reconcile', 'fixture'] as const;

export type Source = (typeof SOURCES)[number];
export type EntityKind = (typeof ENTITY_KINDS)[number];
export type EventKind = (typeof EVENT_KINDS)[number];
export type PayloadValue = string | number | boolean | null;

export interface SourceEvent {
  schema: typeof SOURCE_EVENT_SCHEMA;
  eventId: string; // deterministic dedupe key: source|scope|entity|sourceVersion|kind
  source: Source;
  scope: { account: string; repoId?: number; linearTeamId?: string };
  entity: { kind: EntityKind; id: string };
  kind: EventKind;
  occurredAt: string | null; // source time; may be wrong or skewed
  observedAt: string; // ingest time (logical clock in tests)
  sourceVersion: string; // updated_at / head sha / check attempt / Linear updatedAt
  headSha?: string; // binds review/check evidence to a head
  payload: Record<string, PayloadValue>;
  provenance: { url?: string; fetchedVia: (typeof FETCHED_VIA)[number]; generation?: string };
  visibility: 'public' | 'private';
}

export type ParseResult = { ok: true; event: SourceEvent; warning?: string } | { ok: false; reason: string };

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const str = (v: unknown, max = 200): v is string => typeof v === 'string' && v.length > 0 && v.length <= max;
const oneOf = <T extends readonly string[]>(list: T, v: unknown): v is T[number] => typeof v === 'string' && list.includes(v);
const MAX_PAYLOAD_KEYS = 32;
const MAX_TEXT = 500;

/** Validate untrusted input as a schema-2 SourceEvent. Rejects rather than repairs. */
export function parseSourceEvent(raw: unknown): ParseResult {
  if (!isObj(raw)) return { ok: false, reason: 'not an object' };
  if (raw.schema !== SOURCE_EVENT_SCHEMA) return { ok: false, reason: 'unsupported schema version' };
  if (!str(raw.eventId)) return { ok: false, reason: 'missing eventId' };
  if (!oneOf(SOURCES, raw.source)) return { ok: false, reason: 'unknown source' };
  const { scope, entity, payload, provenance } = raw;
  if (!isObj(scope) || !str(scope.account)) return { ok: false, reason: 'missing scope.account' };
  if (scope.repoId !== undefined && !Number.isSafeInteger(scope.repoId)) return { ok: false, reason: 'scope.repoId must be an integer id' };
  if (scope.linearTeamId !== undefined && !str(scope.linearTeamId)) return { ok: false, reason: 'bad scope.linearTeamId' };
  if (!isObj(entity) || !oneOf(ENTITY_KINDS, entity.kind) || !str(entity.id)) return { ok: false, reason: 'missing or unknown entity' };
  if (typeof raw.kind !== 'string') return { ok: false, reason: 'missing kind' };
  if (raw.occurredAt !== null && !str(raw.occurredAt, 64)) return { ok: false, reason: 'bad occurredAt' };
  if (!str(raw.observedAt, 64)) return { ok: false, reason: 'missing observedAt' };
  if (!str(raw.sourceVersion, 100)) return { ok: false, reason: 'missing sourceVersion' };
  if (raw.headSha !== undefined && !(typeof raw.headSha === 'string' && /^[0-9a-f]{7,64}$/.test(raw.headSha))) return { ok: false, reason: 'bad headSha' };
  if (!isObj(payload) || Object.keys(payload).length > MAX_PAYLOAD_KEYS) return { ok: false, reason: 'bad payload' };
  for (const v of Object.values(payload)) {
    if (!(v === null || typeof v === 'number' || typeof v === 'boolean' || (typeof v === 'string' && v.length <= MAX_TEXT))) return { ok: false, reason: 'payload values must be bounded scalars' };
  }
  if (!isObj(provenance) || !oneOf(FETCHED_VIA, provenance.fetchedVia)) return { ok: false, reason: 'bad provenance' };
  if (raw.visibility !== 'public' && raw.visibility !== 'private') return { ok: false, reason: 'bad visibility' };
  const known = oneOf(EVENT_KINDS, raw.kind);
  const event = {
    schema: SOURCE_EVENT_SCHEMA, eventId: raw.eventId, source: raw.source,
    scope: { account: scope.account, ...(scope.repoId !== undefined ? { repoId: scope.repoId as number } : {}), ...(scope.linearTeamId !== undefined ? { linearTeamId: scope.linearTeamId as string } : {}) },
    entity: { kind: entity.kind, id: entity.id }, kind: known ? (raw.kind as EventKind) : 'unknown',
    occurredAt: raw.occurredAt as string | null, observedAt: raw.observedAt, sourceVersion: raw.sourceVersion,
    ...(raw.headSha !== undefined ? { headSha: raw.headSha as string } : {}),
    payload: payload as Record<string, PayloadValue>,
    provenance: { fetchedVia: provenance.fetchedVia, ...(str(provenance.url, 300) ? { url: provenance.url } : {}), ...(str(provenance.generation, 100) ? { generation: provenance.generation } : {}) },
    visibility: raw.visibility,
  } satisfies SourceEvent;
  return known ? { ok: true, event } : { ok: true, event, warning: 'unknown event kind' };
}

const A_ENTITY: Record<EvidenceEvent['type'], EntityKind> = {
  stage: 'issue', hold: 'issue', activity: 'issue', head: 'head', review: 'review', qa: 'check', merge: 'merge', quota: 'connector', connection: 'connector', pause: 'connector',
};

/** Adapter so Milestone A fixtures (EvidenceEvent) keep loading as schema-2 events. */
export function fromEvidenceEvent(e: EvidenceEvent): SourceEvent {
  const head = typeof e.payload.head === 'string' && /^[0-9a-f]{7,64}$/.test(e.payload.head) ? { headSha: e.payload.head } : {};
  return {
    schema: SOURCE_EVENT_SCHEMA, eventId: `fixture:${e.id}`, source: 'fixture', scope: { account: 'fixture' },
    entity: { kind: A_ENTITY[e.type], id: e.entityId }, kind: e.type, occurredAt: null, observedAt: `tick:${e.at}`,
    sourceVersion: String(e.at), ...head, payload: e.payload, provenance: { fetchedVia: 'fixture' }, visibility: 'public',
  };
}
