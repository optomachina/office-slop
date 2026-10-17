import type { GameState, PullRequest, Stage } from '../contracts';

/** Presentation vocabulary for this playable, not an executor configuration. */
export const workflowDefinition = {
  version:'office-demo-v1',
  stages:{
    intake:{label:'Intake'}, planning:{label:'Planning'}, build:{label:'Build'},
    review:{label:'Review'}, qa:{label:'QA'}, merge:{label:'Merged'},
    repair:{label:'Repair'}, hold:{label:'Needs you'},
  } satisfies Record<Stage,{label:string}>,
} as const;

export function isWorkflowStage(value:unknown):value is Stage {
  return typeof value==='string'&&Object.prototype.hasOwnProperty.call(workflowDefinition.stages,value);
}

/** Eligibility in a fixture is deliberately independent of animation/stage. */
export function mergeBlockReason(state:GameState,pr:PullRequest,requestedHead:unknown):string|null {
  if(state.holds.some(hold=>hold.issueId===pr.issueId&&!hold.resolved))return 'owner decision pending';
  if(requestedHead!==pr.head||pr.reviews[pr.head]!=='approved'||pr.qa[pr.head]!==true)return 'current-head approval and passing QA required';
  return null;
}
