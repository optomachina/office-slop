import type { Stage } from '../contracts';

// Logical tile coordinates are independent of workflow IDs and screen size.
export const W=1100,H=700;
export const iso=(x:number,y:number,z=0)=>({x:535+(x-y)*39,y:105+(x+y)*21-z});
export const colors={mint:0x9ce9bd,amber:0xf6bd65,blue:0x9dc5fa,pink:0xe4a3ad};
export const stations:Record<Stage,[number,number,string,number]>={intake:[1.5,1.5,'01  INTAKE',colors.amber],planning:[4.7,1.5,'02  PLANNING',colors.blue],build:[9,1.5,'03  BUILD LAB',colors.mint],review:[11,4.4,'04  REVIEW',colors.blue],qa:[11,7,'05  QUALITY',colors.pink],merge:[8,8.6,'06  SHIPPED',colors.mint],repair:[5.2,5.5,'REPAIR BAY',colors.amber],hold:[7.6,5.5,'NEEDS YOU',colors.pink]};
