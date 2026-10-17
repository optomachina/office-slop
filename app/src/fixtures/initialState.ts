import type { GameState } from '../contracts';

/** A fresh synthetic office per game; never shared mutable state. */
export function createInitialState():GameState {
  return {
    logCount:3,tick:0,seen:[],connected:true,paused:false,requestedPause:false,
    issues:[
      {id:'issue-history',title:'Historical: Office Slop architecture consultation',stage:'planning',prIds:[],provenance:'Imported from planning/opus-development-plan.md; Claude consultation observed October 16, 2026. Recorded recommendation only; no runtime activity or owner hold inferred.'},
      {id:'issue-billing',title:'Connect the revenue scoreboard',stage:'qa',prIds:['pr-billing-api','pr-billing-ui']},
      {id:'issue-onboarding',title:'Turn a spark into a product brief',stage:'build',prIds:['pr-onboarding']},
      {id:'issue-office',title:'Give every robot a clear route',stage:'review',prIds:['pr-office']},
      {id:'issue-sharing',title:'Choose what your factory shares',stage:'hold',prIds:['pr-sharing']},
      {id:'issue-ideas',title:'Design day / week / month / all-time boards',stage:'planning',prIds:[]},
    ],
    prs:[
      {id:'pr-billing-api',issueId:'issue-billing',title:'Revenue event contract',head:'billing-api-1',reviews:{'billing-api-1':'approved'},qa:{'billing-api-1':true},merged:true},
      {id:'pr-billing-ui',issueId:'issue-billing',title:'Revenue leaderboard interface',head:'billing-ui-1',reviews:{'billing-ui-1':'approved'},qa:{'billing-ui-1':false},merged:false},
      {id:'pr-onboarding',issueId:'issue-onboarding',title:'Adaptive idea interview',head:'onboard-1',reviews:{},qa:{},merged:false},
      {id:'pr-office',issueId:'issue-office',title:'Office navigation paths',head:'office-1',reviews:{},qa:{},merged:false},
      {id:'pr-sharing',issueId:'issue-sharing',title:'Granular sharing options',head:'sharing-1',reviews:{},qa:{},merged:false},
    ],
    robots:[
      {id:'robot-ada',name:'Ada',role:'Planner',provider:'Claude',activityId:'run-ada-1',issueId:'issue-ideas',stage:'planning',color:'#f1b65b'},
      {id:'robot-pip',name:'Pip',role:'Builder',provider:'Codex',activityId:'run-pip-1',issueId:'issue-onboarding',stage:'build',color:'#76c8c1'},
      {id:'robot-jev',name:'Jev',role:'UI / review',provider:'Jev',activityId:'run-jev-1',issueId:'issue-office',stage:'review',color:'#a6a1ef'},
      {id:'robot-dot',name:'Dot',role:'Independent QA',provider:'Codex',activityId:'run-dot-1',issueId:'issue-billing',stage:'qa',color:'#e7899b'},
      {id:'robot-bolt',name:'Bolt',role:'Builder',provider:'Claude',activityId:'run-bolt-1',issueId:'issue-sharing',stage:'hold',color:'#e9c96e'},
      {id:'robot-moss',name:'Moss',role:'Reviewer',provider:'Claude',activityId:'run-moss-1',issueId:'issue-onboarding',stage:'review',color:'#9bc28c'},
    ],
    providers:[{id:'claude',name:'Claude',level:0.75,state:'ok',reason:'Synthetic window observed',reset:'Demo · resets in 2h 14m'},{id:'codex',name:'Codex',level:0.62,state:'ok',reason:'Synthetic window observed',reset:'Demo · resets in 4h 02m'},{id:'grok',name:'Grok',level:null,state:'unknown',reason:'No simulated reading available',reset:'Demo · unknown window'},{id:'cursor',name:'Cursor',level:0.4,state:'stale',reason:'Last simulated observation expired',reset:'Demo · last known window'}],
    holds:[{id:'hold-sharing',issueId:'issue-sharing',title:'Choose the public showcase',detail:'Allow this demo factory to share its office layout? Revenue and source code stay private.',resolved:false}],
    log:['SIMULATION — every robot, PR, quota and revenue value is a fixture.','Billing: 1 of 2 linked PRs merged; UI check failed.','Sharing: a product decision needs you.'],
  };
}

