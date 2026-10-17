import type { EvidenceEvent, GameState, QuotaState, Stage } from '../contracts';
export { scenarios } from '../fixtures/scenarios';
export { createInitialState } from '../fixtures/initialState';
import { isWorkflowStage, mergeBlockReason } from './workflow';
export { workflowDefinition, isWorkflowStage } from './workflow';

const quotas:QuotaState[]=['ok','low','unknown','exhausted','stale'];
export function issueProgress(state:GameState,id:string):string {
  const issue=state.issues.find(i=>i.id===id);
  if(!issue) return 'Unknown issue';
  if(!issue.prIds.length) return 'No linked PRs';
  const merged=issue.prIds.filter(prId=>state.prs.some(p=>p.id===prId&&p.merged)).length;
  return `${merged} of ${issue.prIds.length} linked PRs merged`;
}

export function reduceEvent(state:GameState,event:EvidenceEvent):GameState {
  if(event.source!=='fixture'||state.seen.includes(event.id)) return state;
  const next:GameState=structuredClone(state);
  next.seen.push(event.id); next.tick=Math.max(next.tick,event.at);
  const p=event.payload, pr=next.prs.find(item=>item.id===event.entityId);
  const stage=(issueId:string,value:Stage)=>{ if(next.holds.some(h=>h.issueId===issueId&&!h.resolved))value='hold'; const issue=next.issues.find(i=>i.id===issueId); if(issue) issue.stage=value; next.robots.filter(r=>r.issueId===issueId).forEach(r=>{r.stage=value;}); };
  let message='';
  switch(event.type){
    case 'activity': {const robot=next.robots.find(r=>r.id===event.entityId);if(robot&&isWorkflowStage(p.stage)&&typeof p.issueId==='string'&&next.issues.some(i=>i.id===p.issueId)&&typeof p.activityId==='string'){robot.stage=p.stage;robot.issueId=p.issueId;robot.activityId=p.activityId;message=`${robot.name}: ${robot.activityId} → ${robot.stage}`;}} break;
    case 'stage': if(isWorkflowStage(p.stage)){stage(event.entityId,p.stage);message=`${event.entityId} → ${p.stage}`;} break;
    case 'head': if(pr&&!pr.merged&&typeof p.head==='string'&&p.head!==pr.head){pr.head=p.head;stage(pr.issueId,'build');message=`${pr.title}: new head ${pr.head}; fresh review and QA required.`;} break;
    case 'review': if(pr&&typeof p.head==='string'&&typeof p.approved==='boolean'){pr.reviews[p.head]=p.approved?'approved':'changes_requested';if(p.head===pr.head&&!pr.merged)stage(pr.issueId,p.approved?'qa':'repair');message=`${pr.title}: ${p.approved?'approved':'changes requested'} on ${p.head}${p.head!==pr.head?' (historical head)':''}.`;} break;
    case 'qa': if(pr&&typeof p.head==='string'&&typeof p.passed==='boolean'){pr.qa[p.head]=p.passed;if(p.head===pr.head&&!pr.merged)stage(pr.issueId,p.passed?'qa':'repair');message=`${pr.title}: QA ${p.passed?'passed':'failed'} on ${p.head}.`;} break;
    case 'merge': if(pr){
      const blocked=mergeBlockReason(next,pr,p.head);
      if(blocked){message=`Merge blocked: ${pr.title}; ${blocked}.`;break;}
      pr.merged=true;
      const issue=next.issues.find(i=>i.id===pr.issueId);
      if(issue&&issue.prIds.every(id=>next.prs.some(candidate=>candidate.id===id&&candidate.merged)))stage(issue.id,'merge');
      message=`Simulated merge verified: ${pr.title}. ${issueProgress(next,pr.issueId)}.`;
    } break;
    case 'quota': {const provider=next.providers.find(item=>item.id===event.entityId);if(provider&&quotas.includes(p.state as QuotaState)){provider.state=p.state as QuotaState;provider.reason=typeof p.reason==='string'?p.reason:`Synthetic ${p.state==='ok'?'known':p.state} observation`; provider.level=p.state==='unknown'?null:p.state==='exhausted'?0:typeof p.level==='number'?Math.max(0,Math.min(1,p.level)):null;message=`${provider.name} capacity: ${provider.state}.`;}} break;
    case 'connection': if(typeof p.connected==='boolean'){next.connected=p.connected;message=p.connected?'Fixture source reconciled.':'Fixture source disconnected — last known state retained.';} break;
    case 'hold': {const hold=next.holds.find(h=>h.id===event.entityId);if(hold&&typeof p.resolved==='boolean'){hold.resolved=p.resolved;stage(hold.issueId,p.resolved?'review':'hold');message=`${hold.title}: ${p.resolved?'decision recorded':'needs you'}.`;}} break;
    case 'pause': if(typeof p.requested==='boolean'){next.requestedPause=p.requested;message=`Dispatch ${p.requested?'pause':'resume'} requested.`;} if(typeof p.effective==='boolean'&&p.effective===next.requestedPause){next.paused=p.effective;message=`Simulated executor confirmed dispatch ${p.effective?'paused':'resumed'}.`;} break;
  }
  if(message)next.log=[`[fixture · ${event.id}] ${message}`,...next.log].slice(0,100);
  return next;
}

export function resolveHold(state:GameState,id:string):GameState {return reduceEvent(state,{id:`decision-${id}-${state.seen.length}`,at:state.tick+1,type:'hold',source:'fixture',entityId:id,payload:{resolved:true}});}
/** Records intent only. The shell must simulate a separate acknowledgement. */
export function setPause(state:GameState,paused:boolean):GameState {return reduceEvent(state,{id:`pause-${state.seen.length}`,at:state.tick+1,type:'pause',source:'fixture',entityId:'dispatch',payload:{requested:paused}});}
