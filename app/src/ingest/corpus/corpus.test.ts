/// <reference types="vite/client" />
import { describe, expect, it } from 'vitest';
import { projectCorpus } from './harness';

const inputs = import.meta.glob<string>('./*/input.jsonl', { query: '?raw', import: 'default', eager: true });
const expectations = import.meta.glob<unknown>('./*/expected.json', { import: 'default', eager: true });
const notes = import.meta.glob<string>('./*/notes.md', { query: '?raw', import: 'default', eager: true });
const cases = Object.keys(inputs).map((path) => path.split('/')[1]).sort();

// Seeded Fisher-Yates so shuffled-arrival checks are reproducible.
function shuffle<T>(items: readonly T[], seed: number): T[] {
  const out = [...items];
  let s = seed >>> 0;
  for (let i = out.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

describe('Milestone B seed corpus', () => {
  it('has the four seed cases, each with input, expectation and notes', () => {
    expect(cases).toEqual(['01-malformed', '02-duplicated', '03-out-of-order', '04-conflicts']);
    for (const name of cases) {
      expect(expectations[`./${name}/expected.json`], name).toBeDefined();
      expect(notes[`./${name}/notes.md`], name).toMatch(/Synthetic data only/);
    }
  });

  for (const name of ['01-malformed', '02-duplicated', '03-out-of-order', '04-conflicts']) {
    describe(name, () => {
      const lines = (inputs[`./${name}/input.jsonl`] ?? '').split('\n');
      if (lines.at(-1) === '') lines.pop();
      it('projects to expected.json', () => {
        expect(projectCorpus(lines)).toEqual(expectations[`./${name}/expected.json`]);
      });
      it('replays deterministically, including shuffled arrival', () => {
        const normalize = (input: readonly string[]) => {
          const result = projectCorpus(input);
          return { ...result, rejected: result.rejected.map(({ digest, reason }) => ({ digest, reason })).sort((a, b) => a.digest.localeCompare(b.digest) || a.reason.localeCompare(b.reason)) };
        };
        const once = JSON.stringify(normalize(lines));
        expect(JSON.stringify(normalize(lines))).toBe(once);
        for (const seed of [1, 7, 42, 2026]) expect(JSON.stringify(normalize(shuffle(lines, seed))), `seed ${seed}`).toBe(once);
      });
    });
  }
});

const mutations: [string, string, string, string | number, string | number][] = [
  ['03-out-of-order', 'o-4', 'conclusion', 'success', 'failure'],
  ['02-duplicated', 'd-1', 'state', 'APPROVED', 'CHANGES_REQUESTED'],
  ['03-out-of-order', 'o-8', 'repoId', 1000002, 1000001],
];
for (const [name, id, field, before, after] of mutations) {
  it(`${name}: detects mutation of ${id}`, () => {
    const lines = inputs[`./${name}/input.jsonl`].split('\n');
    if (lines.at(-1) === '') lines.pop();
    let changed = 0;
    const mutated = lines.map((line) => {
      let record;
      try { record = JSON.parse(line); } catch { return line; }
      if (record?.eventId !== id) return line;
      const target = field === 'repoId' ? record.scope : record.payload;
      expect(target[field]).toBe(before);
      target[field] = after;
      changed++;
      return JSON.stringify(record);
    });
    expect(changed, `operator fixture must contain ${id}`).toBeGreaterThan(0);
    expect(projectCorpus(mutated)).not.toEqual(projectCorpus(lines));
    expect(projectCorpus(mutated)).not.toEqual(expectations[`./${name}/expected.json`]);
  });
}
