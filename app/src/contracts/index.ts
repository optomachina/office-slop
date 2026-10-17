export type Stage = 'intake'|'planning'|'build'|'review'|'qa'|'merge'|'repair'|'hold';
export type QuotaState = 'ok'|'low'|'unknown'|'exhausted'|'stale';
export interface WorkItem { id:string; title:string; stage:Stage; prIds:string[]; }
export interface PullRequest { id:string; issueId:string; title:string; head:string; reviews:Record<string,'approved'|'changes_requested'>; qa:Record<string,boolean>; merged:boolean; }
export interface Robot { id:string; name:string; role:string; provider:string; activityId:string; issueId:string; stage:Stage; color:string; }
export interface Provider { id:string; name:string; level:number|null; state:QuotaState; reset:string; }
export interface Hold { id:string; issueId:string; title:string; detail:string; resolved:boolean; }
export interface GameState { tick:number; seen:string[]; issues:WorkItem[]; prs:PullRequest[]; robots:Robot[]; providers:Provider[]; holds:Hold[]; connected:boolean; paused:boolean; requestedPause:boolean; log:string[]; }
export interface EvidenceEvent { id:string; at:number; source:'fixture'; type:'stage'|'head'|'review'|'qa'|'merge'|'quota'|'connection'|'hold'|'pause'; entityId:string; payload:Record<string,string|number|boolean|null>; }
export interface Scenario { id:string; name:string; description:string; events:EvidenceEvent[]; }
export interface IdeaBrief { name:string; idea:string; customer:string; outcome:string; }
export interface Options { muted:boolean; reducedMotion:boolean; volume:number; autonomy:boolean; sharing:{revenue:string;layout:string;code:string}; }
export interface SceneProps { state:GameState; reducedMotion:boolean; selectedId:string|null; onSelect:(id:string)=>void; }
