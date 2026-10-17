import type { GameState } from '../contracts';
import { OfficeLayout, iso, stationSlots, type HitTarget } from './layout';
export const CARD_LIMIT=4;
/** No animation clock or mutation: replay yields precisely the same presentation facts. */
export function selectScene(state:GameState){
 const stations=OfficeLayout.stations.map(station=>{const cards=state.issues.filter(i=>!i.provenance&&i.stage===station.id);return {...station,cards:cards.slice(0,CARD_LIMIT).map((card,i)=>({...card,x:station.x+.25+i*.35,y:station.y+1.05})),count:cards.length,excess:Math.max(0,cards.length-CARD_LIMIT)};});
 const robots=stations.flatMap(station=>{const robots=state.robots.filter(r=>r.stage===station.id);const slots=stationSlots(station.id,robots.length);return robots.map((r,i)=>({...r,...slots[i],queued:i>=station.desks,queuePosition:Math.max(0,i-station.desks+1)}));});
 const targets:HitTarget[]=[...stations.map(s=>({id:`station:${s.id}`,...iso(s.x+.75,s.y+.5,30),radius:36})),...stations.flatMap(s=>s.cards.map(c=>({id:c.id,...iso(c.x,c.y,35),radius:12}))),...robots.map(r=>({id:r.id,...iso(r.x,r.y,40),radius:20}))];
 return {stations,robots,targets,cardCount:state.issues.filter(i=>!i.provenance).length,robotCount:state.robots.length};
}
