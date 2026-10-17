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
  it('has the three seed cases, each with input, expectation and notes', () => {
    expect(cases).toEqual(['01-malformed', '02-duplicated', '03-out-of-order']);
    for (const name of cases) {
      expect(expectations[`./${name}/expected.json`], name).toBeDefined();
      expect(notes[`./${name}/notes.md`], name).toMatch(/Synthetic data only/);
    }
  });

  for (const name of ['01-malformed', '02-duplicated', '03-out-of-order']) {
    describe(name, () => {
      const lines = (inputs[`./${name}/input.jsonl`] ?? '').split('\n');
      it('projects to expected.json', () => {
        expect(projectCorpus(lines)).toEqual(expectations[`./${name}/expected.json`]);
      });
      it('replays deterministically, including shuffled arrival', () => {
        const once = JSON.stringify(projectCorpus(lines));
        expect(JSON.stringify(projectCorpus(lines))).toBe(once);
        for (const seed of [1, 7, 42, 2026]) expect(JSON.stringify(projectCorpus(shuffle(lines, seed))), `seed ${seed}`).toBe(once);
      });
    });
  }
});
