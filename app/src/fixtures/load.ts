import type { Stage } from '../contracts';
import { createInitialState } from './initialState';
/** Fixed representative load, with no runtime/random identities. */
export function createLoadState() {
  const state = createInitialState();
  const stages: Stage[] = ['intake','planning','build','review','qa','merge','repair','hold'];
  state.issues = Array.from({length:200}, (_, i) => ({id:`load-card-${i}`, title:`Load card ${i + 1}`, stage:stages[i % stages.length], prIds:[]}));
  state.robots = Array.from({length:20}, (_, i) => ({id:`load-robot-${i}`, name:`Robot ${i + 1}`, role:'Synthetic worker', provider:'Demo', activityId:`load-run-${i}`, issueId:state.issues[i].id, stage:state.issues[i].stage, color:'#9ce9bd'}));
  state.prs=[]; state.holds=[]; state.log=['Representative simulation: 20 robots and 200 cards.'];
  return state;
}
