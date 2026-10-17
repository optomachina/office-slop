import { useCallback, useEffect, useRef } from 'react';
/** Synthetic quiet electrical room tone. Call start from a user gesture; failures stay silent. */
export function useOfficeAudio(muted:boolean,volume:number){
 const ref=useRef<{context:AudioContext;gain:GainNode;oscillators:OscillatorNode[]}|null>(null);
 const settings=useRef({muted,volume});settings.current={muted,volume};
 const start=useCallback(()=>{try{if(!ref.current){const context=new AudioContext();const gain=context.createGain();gain.gain.value=0;gain.connect(context.destination);const oscillators=[60,120,180].map((frequency,index)=>{const osc=context.createOscillator();const local=context.createGain();osc.type='sine';osc.frequency.value=frequency;local.gain.value=[.3,.09,.025][index];osc.connect(local);local.connect(gain);osc.start();return osc;});ref.current={context,gain,oscillators};}const {context,gain}=ref.current;void context.resume().catch(()=>{});gain.gain.setTargetAtTime(settings.current.muted?0:Math.min(1,Math.max(0,settings.current.volume))*.045,context.currentTime,.3);}catch{/* Audio is optional; retain silent operation. */}},[]);
 useEffect(()=>{const audio=ref.current;if(audio)audio.gain.gain.setTargetAtTime(muted?0:Math.min(1,Math.max(0,volume))*.045,audio.context.currentTime,.3);},[muted,volume]);
 useEffect(()=>()=>{const audio=ref.current;ref.current=null;if(audio){audio.oscillators.forEach(o=>o.stop());void audio.context.close().catch(()=>{});}},[]);
 return {start};
}
