import { expect, it } from 'vitest';
import { type SourceEvent } from '../contract';
import { projectCorpus } from './harness';

function event(eventId: string, sourceVersion: string, repoId = 1): SourceEvent {
  return { schema: 2, eventId, source: 'github', scope: { account: 'test', repoId }, entity: { kind: 'pr', id: '1' }, kind: 'head', occurredAt: null, observedAt: 'logical:1', sourceVersion, payload: { state: 'open' }, provenance: { fetchedVia: 'poll' }, visibility: 'public' };
}
function both(a: SourceEvent, b: SourceEvent) {
  const forward = projectCorpus([JSON.stringify(a), JSON.stringify(b)]);
  expect(JSON.stringify(projectCorpus([JSON.stringify(b), JSON.stringify(a)]))).toBe(JSON.stringify(forward));
  return forward;
}
it('orders integer versions numerically', () => {
  const result = both(event('a', '2'), event('b', '10'));
  expect(Object.values(result.entities)[0].eventId).toBe('b');
  expect(result.stale).toBe(1);
});
it('rejects an unparseable version', () => {
  expect(projectCorpus([JSON.stringify(event('a', '1a'))]).rejected).toEqual([{ line: 1, digest: expect.stringMatching(/^[0-9a-f]{8}$/), reason: 'unparseable sourceVersion' }]);
});
it('compares instants in UTC', () => {
  expect(Object.values(both(event('a', '2026-10-03T13:30:00+02:00'), event('b', '2026-10-03T12:00:00Z')).entities)[0].eventId).toBe('b');
});
it.each([
  [event('a', '2'), event('b', '2026-10-03T12:00:00Z'), 'mixed version domains', ['a', 'b']],
  [event('a', '2'), event('b', '2'), 'version tie', ['a', 'b']],
  [event('a', '2'), event('a', '10'), 'same eventId, different content', ['a']],
])('reports conflicts without choosing a winner', (a, b, reason, eventIds) => {
  const result = both(a, b);
  expect(result.entities).toEqual({});
  expect(result.conflicts).toEqual([{ key: 'github|test|1|pr|1', reason, eventIds }]);
  expect(result.stale).toBe(0);
  expect(result.accepted).toBe(reason === 'same eventId, different content' ? 0 : 2);
});
it('keeps repo-local ids separate', () => {
  const result = both(event('a', '2', 1), event('b', '10', 2));
  expect(Object.keys(result.entities)).toEqual(['github|test|1|pr|1', 'github|test|2|pr|1']);
  expect(result.stale).toBe(0);
});
it('rejects empty records and hashes the raw line with FNV-1a', () => {
  expect(projectCorpus(['']).rejected).toEqual([{ line: 1, digest: '811c9dc5', reason: 'empty record' }]);
  expect(projectCorpus(['hello']).rejected[0].digest).toBe('4f9f2cab');
});
it('unions provenance and canonicalizes payload key order', () => {
  const a = { ...event('a', '2'), payload: { a: 1, b: 2 } };
  const b: SourceEvent = { ...a, payload: { b: 2, a: 1 }, provenance: { fetchedVia: 'webhook' } };
  const result = both(a, b);
  expect(result.duplicates).toBe(1);
  expect(Object.values(result.entities)[0].fetchedVia).toEqual(['poll', 'webhook']);
});
it('counts only lower versions as stale on a tie', () => {
  const result = projectCorpus([event('a', '1'), event('b', '2'), event('c', '2')].map((e) => JSON.stringify(e)));
  expect(result.stale).toBe(1);
  expect(result.conflicts[0].eventIds).toEqual(['b', 'c']);
});
it('retains unknown kinds without applying them', () => {
  const result = projectCorpus([JSON.stringify({ ...event('a', '2'), kind: 'future' })]);
  expect(result.accepted).toBe(1);
  expect(result.entities).toEqual({});
  expect(result.warnings).toEqual(['kept: unknown event kind (a)']);
});
it('dedupes copies that differ only in observedAt and provenance', () => {
  const a = event('a', '2');
  const b: SourceEvent = { ...a, observedAt: 'logical:2', provenance: { fetchedVia: 'webhook' } };
  const result = both(a, b);
  expect(result.conflicts).toEqual([]);
  expect(result.duplicates).toBe(1);
  expect(Object.values(result.entities)[0].fetchedVia).toEqual(['poll', 'webhook']);
});
it('orders several conflicts on one key independently of arrival', () => {
  const lines = [event('p', '1'), event('q', '1'), event('p', '2'), event('q', '2')].map((e) => JSON.stringify(e));
  const orders = [[0, 1, 2, 3], [1, 0, 3, 2], [3, 2, 1, 0], [2, 3, 0, 1], [1, 3, 0, 2]];
  const first = JSON.stringify(projectCorpus(lines));
  for (const order of orders) expect(JSON.stringify(projectCorpus(order.map((i) => lines[i])))).toBe(first);
  expect(projectCorpus(lines).conflicts.map((c) => c.eventIds)).toEqual([['p'], ['q']]);
});
it("escapes '|' so ids cannot collide across scopes", () => {
  const a: SourceEvent = { ...event('a', '1', 1), scope: { account: 'a', repoId: 1 }, entity: { kind: 'pr', id: 'x|5|pr|z' } };
  const b: SourceEvent = { ...event('b', '1', 5), scope: { account: 'a|1|pr|x', repoId: 5 }, entity: { kind: 'pr', id: 'z' } };
  const result = both(a, b);
  expect(Object.keys(result.entities).sort()).toEqual(['github|a%7C1%7Cpr%7Cx|5|pr|z', 'github|a|1|pr|x%7C5%7Cpr%7Cz']);
  expect(result.stale).toBe(0);
});
it('treats different unknown raw kinds under one eventId as a conflict', () => {
  const result = both({ ...event('u', '1'), kind: 'foo' } as unknown as SourceEvent, { ...event('u', '1'), kind: 'bar' } as unknown as SourceEvent);
  expect(result.conflicts.map((c) => c.reason)).toEqual(['same eventId, different content']);
  expect(result.accepted).toBe(0);
});
