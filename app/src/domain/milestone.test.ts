import { describe, expect, it } from 'vitest';
import { createInitialState, reduceEvent, scenarios, setPause } from './index';

describe('Milestone A fixture invariants', () => {
  it.each(scenarios)('$id replays identically with stable counts and identities', scenario => {
    const initial = createInitialState();
    const run = () => scenario.events.reduce(reduceEvent, createInitialState());
    const state = run();
    expect(state).toEqual(run());
    for (const key of ['issues', 'prs', 'robots', 'providers'] as const) {
      expect(state[key].map(item => item.id)).toEqual(initial[key].map(item => item.id));
      expect(new Set(state[key].map(item => item.id)).size).toBe(state[key].length);
    }
    expect(scenario.events.reduce(reduceEvent, state)).toEqual(state);
  });
  it('represents intake, planning and two distinct concurrent build lanes', () => {
    let state = createInitialState();
    const events = scenarios.find(s => s.id === 'delivery')!.events;
    for (const e of events.slice(0, 5)) state = reduceEvent(state, e);
    const builders = state.robots.filter(r => r.issueId === 'issue-onboarding' && r.stage === 'build' && r.role === 'Builder');
    expect(builders).toHaveLength(2);
    expect(new Set(builders.map(r => r.activityId)).size).toBe(2);
    expect(events.slice(0, 3).map(e => e.payload.stage)).toEqual(['intake', 'planning', 'build']);
  });
  it('preserves separate pools through every capacity state with explanations', () => {
    let state = createInitialState();
    expect(state.providers.map(p => p.name)).toEqual(['Claude', 'Codex', 'Grok', 'Cursor']);
    const others = state.providers.slice(1);
    const observed = [state.providers[0].state];
    for (const e of scenarios.find(s => s.id === 'capacity')!.events) {
      state = reduceEvent(state, e);
      observed.push(state.providers[0].state);
      expect(state.providers[0].reason.length).toBeGreaterThan(0);
      expect(state.providers.slice(1)).toEqual(others);
    }
    expect(new Set(observed)).toEqual(new Set(['ok', 'low', 'exhausted', 'unknown', 'stale']));
  });
  it('pause intent and confirmation never stop or remove running activities', () => {
    const initial = createInitialState();
    let state = setPause(initial, true);
    expect(state).toMatchObject({ requestedPause: true, paused: false });
    state = reduceEvent(state, { id:'confirm', at:2, source:'fixture', type:'pause', entityId:'dispatch', payload:{effective:true} });
    expect(state).toMatchObject({ requestedPause: true, paused: true });
    expect(state.robots).toEqual(initial.robots);
    expect(setPause(initial, true)).toEqual(setPause(initial, true));
  });
  it('labels imported history with provenance and no invented runtime or holds', () => {
    const state = createInitialState(), historical = state.issues.find(i => i.id === 'issue-history')!;
    expect(historical.provenance).toContain('planning/opus-development-plan.md');
    expect(state.robots.some(r => r.issueId === historical.id)).toBe(false);
    expect(state.holds.some(h => h.issueId === historical.id)).toBe(false);
  });
});

it('keeps activity on a held issue at hold', () => {
 const state=reduceEvent(createInitialState(), {id:'held-activity',at:1,source:'fixture',type:'activity',entityId:'robot-pip',payload:{issueId:'issue-sharing',stage:'build',activityId:'held-run'}});
 expect(state.robots.find(r=>r.id==='robot-pip')?.stage).toBe('hold');
});
it('counts log appends beyond the retained window', () => {
 let state=createInitialState();
 for(let i=0;i<110;i++) state=setPause(state,true);
 expect(state.logCount).toBe(113);
 expect(state.log).toHaveLength(100);
});
