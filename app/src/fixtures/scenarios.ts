import type { EvidenceEvent, Scenario } from '../contracts';

const e = (id:string, at:number, type:EvidenceEvent['type'], entityId:string, payload:EvidenceEvent['payload']):EvidenceEvent => ({id,at,type,entityId,payload,source:'fixture'});
export const scenarios:Scenario[] = [
  {id:'delivery',name:'A clean delivery',description:'Onboarding moves from implementation through independent review and QA to a verified simulated merge.',events:[
    e('delivery-1',1,'stage','issue-onboarding',{stage:'review'}),e('delivery-2',2,'review','pr-onboarding',{head:'onboard-1',approved:true}),e('delivery-3',3,'stage','issue-onboarding',{stage:'qa'}),e('delivery-4',4,'qa','pr-onboarding',{head:'onboard-1',passed:true}),e('delivery-5',5,'merge','pr-onboarding',{head:'onboard-1'})]},
  {id:'repair',name:'Review → repair',description:'A rejected change gets a new commit. Old-head evidence cannot authorize the merge.',events:[
    e('repair-1',1,'review','pr-office',{head:'office-1',approved:false}),e('repair-2',2,'head','pr-office',{head:'office-2'}),e('repair-3',3,'review','pr-office',{head:'office-1',approved:true}),e('repair-4',4,'merge','pr-office',{head:'office-2'}),e('repair-5',5,'review','pr-office',{head:'office-2',approved:true}),e('repair-6',6,'qa','pr-office',{head:'office-2',passed:true}),e('repair-7',7,'merge','pr-office',{head:'office-2'})]},
  {id:'owner',name:'Needs your decision',description:'A product decision holds work. Approval clears the hold; it does not replace review or testing.',events:[
    e('owner-1',1,'review','pr-sharing',{head:'sharing-1',approved:true}),e('owner-2',2,'qa','pr-sharing',{head:'sharing-1',passed:true}),e('owner-3',3,'merge','pr-sharing',{head:'sharing-1'}),e('owner-4',4,'hold','hold-sharing',{resolved:true}),e('owner-5',5,'merge','pr-sharing',{head:'sharing-1'})]},
  {id:'capacity',name:'Provider pressure',description:'Known, low, exhausted, unknown and stale are different observations. Missing capacity is never zero.',events:[
    e('quota-1',1,'quota','claude',{state:'low',level:0.16}),e('quota-2',2,'quota','claude',{state:'exhausted',level:0}),e('quota-3',3,'quota','claude',{state:'unknown',level:null}),e('quota-4',4,'quota','claude',{state:'stale',level:0.45}),e('quota-5',5,'quota','claude',{state:'ok',level:0.75})]},
  {id:'reconnect',name:'Disconnect & reconcile',description:'The office retains last verified state while disconnected, then resumes from a synthetic snapshot.',events:[
    e('connect-1',1,'connection','fixture',{connected:false}),e('connect-2',2,'quota','codex',{state:'stale',level:0.62}),e('connect-3',3,'connection','fixture',{connected:true}),e('connect-4',4,'quota','codex',{state:'ok',level:0.58})]},
  {id:'partial',name:'One of two PRs',description:'Billing has two required linked PRs. One merge cannot complete the issue.',events:[
    e('partial-1',1,'stage','issue-billing',{stage:'qa'}),e('partial-2',2,'qa','pr-billing-ui',{head:'billing-ui-1',passed:false}),e('partial-3',3,'merge','pr-billing-ui',{head:'billing-ui-1'})]},
  {id:'switch',name:'Dispatch switch',description:'Requested pause and effective pause remain separate until a simulated executor acknowledges the change.',events:[
    e('switch-1',1,'pause','dispatch',{requested:true}),e('switch-2',2,'pause','dispatch',{effective:true}),e('switch-3',3,'pause','dispatch',{requested:false}),e('switch-4',4,'pause','dispatch',{effective:false})]},
];
