import { describe, expect, it } from 'vitest';
import { fromEvidenceEvent, parseSourceEvent, versionKey, SOURCE_EVENT_SCHEMA } from './contract';
import { scenarios } from '../domain';

describe('SourceEvent schema 2 contract', () => {
  it('loads every Milestone A fixture event through the adapter as a valid schema-2 event', () => {
    const events = scenarios.flatMap((scenario) => scenario.events);
    expect(events.length).toBeGreaterThan(0);
    for (const event of events) {
      const adapted = fromEvidenceEvent(event);
      expect({ id: adapted.eventId.slice('fixture:'.length), at: Number(adapted.sourceVersion), type: adapted.kind, entityId: adapted.entity.id, payload: adapted.payload }).toEqual({ id: event.id, at: event.at, type: event.type, entityId: event.entityId, payload: event.payload });
      expect(adapted.payload).not.toBe(event.payload);
      expect(adapted.schema).toBe(SOURCE_EVENT_SCHEMA);
      expect(adapted).toMatchObject({ source: 'fixture', visibility: 'public', scope: { account: 'fixture' }, provenance: { fetchedVia: 'fixture' } });
      const parsed = parseSourceEvent(JSON.parse(JSON.stringify(adapted)));
      expect(parsed, event.id).toEqual({ ok: true, event: adapted });
    }
  });

  it('rejects oversized payload text and non-scalar payload values', () => {
    const base = fromEvidenceEvent(scenarios[0].events[0]);
    expect(parseSourceEvent({ ...base, payload: { title: 'x'.repeat(501) } })).toEqual({ ok: false, reason: 'payload values must be bounded scalars' });
    expect(parseSourceEvent({ ...base, payload: { nested: { a: 1 } } })).toEqual({ ok: false, reason: 'payload values must be bounded scalars' });
  });
});

const base = fromEvidenceEvent(scenarios[0].events[0]);
const invalidCases: [unknown, string][] = [
  [{ ...base, extra: true }, 'unknown field extra'],
  [{ ...base, scope: { ...base.scope, extra: true } }, 'unknown field scope.extra'],
  [{ ...base, entity: { ...base.entity, extra: true } }, 'unknown field entity.extra'],
  [{ ...base, provenance: { ...base.provenance, extra: true } }, 'unknown field provenance.extra'],
  ...['javascript:alert(1)', 42, '', undefined].map((url): [unknown, string] => [{ ...base, provenance: { ...base.provenance, url } }, 'bad provenance.url']),
  ...[42, '', undefined, 'x'.repeat(101)].map((generation): [unknown, string] => [{ ...base, provenance: { ...base.provenance, generation } }, 'bad provenance.generation']),
  [{ ...base, source: 'github' }, 'github events need scope.repoId'],
  [{ ...base, source: 'linear' }, 'linear events need scope.linearTeamId'],
  [{ ...base, source: 'github', scope: { account: 'a', repoId: 1, linearTeamId: 't' } }, 'github events take no scope.linearTeamId'],
  [{ ...base, source: 'linear', scope: { account: 'a', repoId: 1, linearTeamId: 't' } }, 'linear events take no scope.repoId'],
  [{ ...base, scope: { ...base.scope, repoId: -1 } }, 'scope.repoId must be an integer id'],
  [{ ...base, sourceVersion: '1a' }, 'unparseable sourceVersion'],
  [null, 'not an object'],
  [{ ...base, schema: 1, extra: true }, 'unsupported schema version'],
];
it.each(invalidCases)('fails closed: %j', (raw, reason) => {
  expect(parseSourceEvent(raw)).toEqual({ ok: false, reason });
});
it('orders integer versions and normalizes zoned instants', () => {
  expect(versionKey('2')).toEqual({ domain: 'integer', value: 2 });
  expect(versionKey('10')).toEqual({ domain: 'integer', value: 10 });
  expect(versionKey('0')).toEqual({ domain: 'integer', value: 0 });
  for (const invalid of ['1a', '2026-02-30T11:30:00Z', '2026-10-03T24:00:00Z', '2026-10-03T11:30:00', '1000000000000000', '007', '00']) expect(versionKey(invalid)).toBeNull();
  expect(versionKey('2026-10-03T13:30:00+02:00')).toEqual(versionKey('2026-10-03T11:30:00Z'));
  expect(versionKey('2026-10-03T11:30:00Z')).toEqual({ domain: 'instant', value: Date.UTC(2026, 9, 3, 11, 30) });
});
it('keeps the raw kind name of an unknown kind', () => {
  const parsed = parseSourceEvent({ ...base, kind: 'deployment_status' });
  expect(parsed).toMatchObject({ ok: true, event: { kind: 'unknown', rawKind: 'deployment_status' }, warning: 'unknown event kind' });
  expect(parseSourceEvent({ ...base, kind: '' })).toEqual({ ok: false, reason: 'missing kind' });
});
