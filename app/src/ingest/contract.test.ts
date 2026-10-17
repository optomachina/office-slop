import { describe, expect, it } from 'vitest';
import { fromEvidenceEvent, parseSourceEvent, SOURCE_EVENT_SCHEMA } from './contract';
import { scenarios } from '../domain';

describe('SourceEvent schema 2 contract', () => {
  it('loads every Milestone A fixture event through the adapter as a valid schema-2 event', () => {
    const events = scenarios.flatMap((scenario) => scenario.events);
    expect(events.length).toBeGreaterThan(0);
    for (const event of events) {
      const adapted = fromEvidenceEvent(event);
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
