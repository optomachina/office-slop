import type { Stage } from '../contracts';

export type StationId = Stage | 'capacity';
export type Point = { x:number; y:number };
export const W=1100,H=700;
export const iso=(x:number,y:number,z=0)=>({x:535+(x-y)*39,y:105+(x+y)*21-z});
export const colors={mint:0x9ce9bd,amber:0xf6bd65,blue:0x9dc5fa,pink:0xe4a3ad};
export const stations:Record<Stage,[number,number,string,number]>={intake:[1,1,'01 INTAKE',colors.amber],planning:[4.75,1,'02 PLANNING',colors.blue],build:[9,1,'03 BUILD LAB',colors.mint],review:[10.5,4,'04 REVIEW',colors.blue],qa:[10.5,6.5,'05 QUALITY',colors.pink],merge:[7.5,8,'06 MERGED',colors.mint],repair:[4.5,4.5,'REPAIR BAY',colors.amber],hold:[7,4.5,'NEEDS YOU',colors.pink]};
const wall=(x:number,y:number,x2:number,y2:number)=>({from:{x,y},to:{x:x2,y:y2}});
/** Logical coordinates define rendering and navigation; portal markers identify selected passageways. */
export const OfficeLayout={
 width:13,height:10,grid:.25,
 rooms:[{id:'intake',x:0,y:0,w:4,h:3.5},{id:'planning',x:4,y:0,w:4,h:3.5},{id:'build',x:8,y:0,w:5,h:3.5},{id:'review-qa',x:10,y:3.5,w:3,h:5},{id:'merged',x:4,y:7.5,w:6,h:2.5},{id:'capacity',x:0,y:6.5,w:4,h:3.5},{id:'repair-owner',x:4,y:3.5,w:6,h:4}],
 walls:[wall(0,0,13,0),wall(0,0,0,10),wall(13,0,13,10),wall(0,10,13,10),wall(4,0,4,2.5),wall(8,0,8,2.5),wall(0,3.5,1.5,3.5),wall(2.5,3.5,5.5,3.5),wall(6.5,3.5,9,3.5),wall(10,3.5,13,3.5),wall(10,3.5,10,4.75),wall(10,5.75,10,7),wall(10,8,10,10),wall(0,6.5,1.5,6.5),wall(2.5,6.5,4,6.5),wall(4,7.5,5.5,7.5),wall(6.5,7.5,9,7.5)],
 portals:[{x:4,y:3},{x:8,y:3},{x:2,y:3.5},{x:6,y:3.5},{x:9.5,y:3.5},{x:10,y:5.25},{x:10,y:7.5},{x:2,y:6.5},{x:6,y:7.5}],
 furniture:[...Object.values(stations).map(([x,y])=>({x,y,w:1.8,h:1.5})),{x:10.8,y:1,w:1.8,h:1.5},{x:.5,y:7,w:3.5,h:1.5}],
 stations:[...Object.entries(stations).map(([id,[x,y,label,color]])=>({id:id as Stage,x,y,label,color,approach:{x:x+.75,y:y+1.75},anchors:id==='build'?[{x:x+.75,y:y+1.75},{x:11.5,y:2.75}]:[{x:x+.75,y:y+1.75}],desks:id==='build'?2:1})),{id:'capacity' as StationId,x:.5,y:7,label:'CAPACITY',color:colors.mint,approach:{x:2,y:8.75},anchors:[{x:2,y:8.75}],desks:1}],
};
export function isWalkable(p:Point):boolean {
 return p.x>0&&p.y>0&&p.x<OfficeLayout.width&&p.y<OfficeLayout.height&&!OfficeLayout.walls.some(w=>w.from.x===w.to.x?Math.abs(p.x-w.from.x)<.12&&p.y>=w.from.y&&p.y<=w.to.y:Math.abs(p.y-w.from.y)<.12&&p.x>=w.from.x&&p.x<=w.to.x)&&!OfficeLayout.furniture.some(f=>p.x>=f.x&&p.x<=f.x+f.w&&p.y>=f.y&&p.y<=f.y+f.h);
}
export const walkableGrid:Point[]=[];
for(let x=.25;x<13;x+=.25)for(let y=.25;y<10;y+=.25)if(isWalkable({x,y}))walkableGrid.push({x,y});
const key=(p:Point)=>`${p.x},${p.y}`;
export function gridPath(start:Point,end:Point):Point[]{
 if(!isWalkable(start)||!isWalkable(end))return [];
 const queue=[start],previous=new Map<string,Point|null>([[key(start),null]]);let found=false;
 for(let i=0;i<queue.length;i++){const p=queue[i];if(key(p)===key(end)){found=true;break;}for(const [dx,dy] of [[.25,0],[-.25,0],[0,.25],[0,-.25]]){const next={x:p.x+dx,y:p.y+dy};if(!previous.has(key(next))&&isWalkable(next)){previous.set(key(next),p);queue.push(next);}}}
 if(!found)return [];const result:Point[]=[];let p:Point|null=end;while(p){result.push(p);p=previous.get(key(p))??null;}return result.reverse();
}
/** Queue slots expand through connected walkable cells, never inside a desk or wall. */
export function stationSlots(stage:StationId,count:number):Point[]{
 const station=OfficeLayout.stations.find(s=>s.id===stage)!;const queue=[...station.anchors],seen=new Set(station.anchors.map(key));
 for(let i=0;i<queue.length&&queue.length<count;i++)for(const [dx,dy] of [[.25,0],[0,.25],[-.25,0],[0,-.25]]){const p={x:queue[i].x+dx,y:queue[i].y+dy};if(isWalkable(p)&&!seen.has(key(p))){seen.add(key(p));queue.push(p);}}
 return queue.slice(0,count);
}
export type HitTarget={id:string;x:number;y:number;radius:number};
export function hitTest(targets:readonly HitTarget[],point:Point):string|null {return [...targets].reverse().find(t=>Math.hypot(t.x-point.x,t.y-point.y)<=t.radius)?.id??null;}

export const providerAnchors=(count:number)=>Array.from({length:count},(_,i)=>({x:.5+i*1.5,y:8}));
export const dispatchAnchor={x:5,y:9.4};
export const wallHeight=(wall:typeof OfficeLayout.walls[number])=>
 (wall.from.y===0&&wall.to.y===0)||(wall.from.x===0&&wall.to.x===0)?70:15;
export type LabelRectangle={id:string;text:string;x:number;y:number;width:number;height:number;size:number;color:number};
export const rectanglesIntersect=(a:LabelRectangle,b:LabelRectangle)=>Math.abs(a.x-b.x)<(a.width+b.width)/2+4&&Math.abs(a.y-b.y)<(a.height+b.height)/2+4;
/** Conservative text bounds; labels move upward only, remaining above monitors. */
export function sceneLabels(stationCounts:readonly {id:string;count:number;excess:number}[],providers:readonly {id:string;name:string}[]):LabelRectangle[]{
 const result:LabelRectangle[]=[];
 const add=(id:string,text:string,p:Point,size:number,color:number)=>{const rect={id,text,...p,width:text.length*(size+1),height:size+4,size,color};while(result.some(other=>rectanglesIntersect(rect,other)))rect.y-=18;result.push(rect);};
 for(const [i,provider] of providers.entries()){const p=iso(providerAnchors(providers.length)[i].x,8);add(`provider:${provider.id}`,provider.name.toUpperCase(),{x:p.x,y:p.y+29},9,0xd9e4d8);add(`level:${provider.id}`,'LAST KNOWN 100%',{x:p.x,y:p.y-90},8,colors.mint);}
 const lever=iso(dispatchAnchor.x,dispatchAnchor.y,15);add('dispatch','DISPATCH',{x:lever.x,y:lever.y+27},9,0xc9d5c7);
 const sign=iso(2,9.5);add('capacity','PROVIDER POWER',{x:sign.x,y:sign.y+34},11,0xb8ccc0);
 for(const station of OfficeLayout.stations.filter(s=>s.id!=='capacity')){const p=iso(station.x+.7,station.y-.15,110);const count=stationCounts.find(s=>s.id===station.id);if(count?.count)add(`count:${station.id}`,`${count.count} cards${count.excess?` · +${count.excess} grouped`:''}`,{x:p.x,y:p.y+18},10,0xb7c9c5);add(`station:${station.id}`,station.label,p,11,station.color);}
 return result;
}
export function robotRoute(start:Point,target:Point){const path=gridPath(start,target);return {path,position:path.length?start:target};}
