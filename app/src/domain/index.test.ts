import { describe, expect, it } from 'vitest';
import { createInitialState, issueProgress, reduceEvent, resolveHold, scenarios, setPause } from './index';
import type { EvidenceEvent, GameState } from '../contracts';
const event=(id:string,type:EvidenceEvent['type'],entityId:string,payload:EvidenceEvent['payload']):EvidenceEvent=>({id,at:1,source:'fixture',type,entityId,payload});
const replay=(id:string)=>scenarios.find(s=>s.id===id)!.events.reduce(reduceEvent,createInitialState());
describe('evidence reducer',()=>{
  it('does not mutate input and deduplicates repeated deliveries',()=>{
    const initial=createInitialState(), e=event('once','connection','fixture',{connected:false});
    const result=reduceEvent(initial,e);
    expect(initial.connected).toBe(true);expect(result.connected).toBe(false);expect(reduceEvent(result,e)).toBe(result);
  });
  it('keeps partial linked merges incomplete',()=>{
    const state=replay('partial');expect(issueProgress(state,'issue-billing')).toBe('1 of 2 linked PRs merged');
    expect(state.issues.find(i=>i.id==='issue-billing')!.stage).not.toBe('merge');
    expect(state.prs.find(p=>p.id==='pr-billing-ui')!.merged).toBe(false);
  });
  it('blocks merging a new head using old evidence while preserving history',()=>{
    let state=createInitialState();
    const apply=(e:EvidenceEvent)=>{state=reduceEvent(state,e);};
    apply(event('review','review','pr-office',{head:'office-1',approved:true}));
    apply(event('qa','qa','pr-office',{head:'office-1',passed:true}));
    apply(event('head','head','pr-office',{head:'office-2'}));
    apply(event('merge','merge','pr-office',{head:'office-2'}));
    expect(state.prs.find(p=>p.id==='pr-office')).toMatchObject({head:'office-2',merged:false,reviews:{'office-1':'approved'}});
    expect(state.log[0]).toContain('Merge blocked');
  });
  it('requires current-head evidence and an owner decision independently',()=>{
    let state=createInitialState();
    for(const e of scenarios.find(s=>s.id==='owner')!.events.slice(0,3))state=reduceEvent(state,e);
    expect(state.prs.find(p=>p.id==='pr-sharing')!.merged).toBe(false);
    state=resolveHold(state,'hold-sharing');
    state=reduceEvent(state,event('after-decision','merge','pr-sharing',{head:'sharing-1'}));
    expect(state.prs.find(p=>p.id==='pr-sharing')!.merged).toBe(true);
  });
  it('finishes clean delivery and repaired head deterministically',()=>{
    expect(replay('delivery').prs.find(p=>p.id==='pr-onboarding')!.merged).toBe(true);
    expect(replay('repair').prs.find(p=>p.id==='pr-office')).toMatchObject({merged:true,head:'office-2'});
    expect(replay('repair')).toEqual(replay('repair'));
  });
  it('distinguishes unknown quota from confirmed exhaustion',()=>{
    let state:GameState=createInitialState();
    state=reduceEvent(state,event('empty','quota','claude',{state:'exhausted',level:null}));
    expect(state.providers[0].level).toBe(0);
    state=reduceEvent(state,event('unknown','quota','claude',{state:'unknown',level:0}));
    expect(state.providers[0].level).toBeNull();
  });
  it('does not equate requested pause with effective pause or apply a stale acknowledgement',()=>{
    let state=setPause(createInitialState(),true);
    expect(state.requestedPause).toBe(true);expect(state.paused).toBe(false);
    state=reduceEvent(state,event('ack','pause','dispatch',{effective:true}));expect(state.paused).toBe(true);
    state=setPause(state,false);
    state=reduceEvent(state,event('stale-ack','pause','dispatch',{effective:true}));
    expect(state.requestedPause).toBe(false);expect(state.paused).toBe(true);
    state=reduceEvent(state,event('resume-ack','pause','dispatch',{effective:false}));expect(state.paused).toBe(false);
  });
  it('retains PR truth during disconnect and reconciles without replay side effects',()=>{
    const initial=createInitialState(),state=replay('reconnect');
    expect(state.connected).toBe(true);expect(state.prs).toEqual(initial.prs);
  });
});
