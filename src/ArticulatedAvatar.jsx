import { useEffect, useRef, useState } from 'react';
import { armMatrices, armContours } from './avatarArmRig';
const asset = name => `${import.meta.env.BASE_URL}projects/about/${name}`;
const transform = m => `matrix(${m[0]} ${m[1]} ${m[3]} ${m[4]} ${m[6]*1000} ${m[7]*1000})`;

export default function ArticulatedAvatar({ aimed, paused, onReady, previewPose }) {
  const [ready,setReady]=useState(false);
  useEffect(()=>{
    let cancelled=false;
    Promise.all(['alex-rig-crewneck-v6.png','alex-rig-camera-hands-v5.png'].map(name=>new Promise((resolve,reject)=>{const image=new Image();image.onload=resolve;image.onerror=reject;image.src=asset(name);}))).then(()=>{if(!cancelled){setReady(true);onReady(true);}}).catch(()=>{});
    return()=>{cancelled=true;};
  },[onReady]);
  const groups=useRef([]), paths=useRef([]), upper=useRef([]), shades=useRef([]), target=useRef(aimed?1:0), pose=useRef(0), raf=useRef(0), last=useRef(0), wake=useRef(()=>{});
  useEffect(()=>{
    const draw=()=>{
      const matrices=armMatrices(pose.current);
      groups.current[2]?.setAttribute('transform',transform(matrices[4]));
      armContours(pose.current).forEach(({d,upper:back,shade,upperShade},i)=>{paths.current[i]?.setAttribute('d',d);upper.current[i]?.setAttribute('d',back);[shade,upperShade].forEach((values,j)=>Object.entries(values).forEach(([key,value])=>shades.current[i*2+j]?.setAttribute(key,value)));});
      groups.current[2]?.closest('svg')?.setAttribute('data-pose',pose.current.toFixed(3));
    };
    const frame=time=>{
      const dt=last.current ? Math.min(40,time-last.current):16.67;last.current=time;
      const delta=target.current-pose.current;
      pose.current=Math.abs(delta)<.0005 ? target.current:pose.current+delta*(1-Math.exp(-dt/200));
      draw();raf.current=pose.current!==target.current ? requestAnimationFrame(frame):0;
    };
    wake.current=()=>{if(!raf.current){last.current=0;raf.current=requestAnimationFrame(frame);}};
    const motion=matchMedia('(prefers-reduced-motion: reduce)');
    const motionChanged=()=>{if(motion.matches){pose.current=target.current;wake.current();}};
    motion.addEventListener('change',motionChanged);
    draw();
    return()=>{cancelAnimationFrame(raf.current);raf.current=0;motion.removeEventListener('change',motionChanged);};
  },[onReady]);
  useEffect(()=>{
    target.current=previewPose ?? (aimed?1:0);
    if(previewPose!==undefined) pose.current=previewPose;
    if(paused || matchMedia('(prefers-reduced-motion: reduce)').matches) pose.current=target.current;
    wake.current();
  },[aimed,paused,previewPose]);
  return <span className={`articulated-avatar${ready ? ' is-ready':''}`}>
    <svg className="articulated-avatar-arms" viewBox="0 0 1000 1000" aria-hidden="true">
      <defs>
        {armContours(0).flatMap(({shade,upperShade},i)=>[shade,upperShade].map((values,j)=><linearGradient key={`${i}-${j}`} id={`alex-knit-${i}-${j}`} ref={el=>shades.current[i*2+j]=el} gradientUnits="userSpaceOnUse" {...values}><stop stopColor="#202536"/><stop offset=".4" stopColor="#373f56"/><stop offset=".65" stopColor="#30374d"/><stop offset="1" stopColor="#202536"/></linearGradient>))}
        <pattern id="alex-knit-texture" width="160" height="160" patternUnits="userSpaceOnUse" viewBox="400 650 160 160"><image href={asset('alex-rig-crewneck-v6.png')} width="1000" height="1000"/></pattern>
      </defs>
      {armContours(0).map(({upper:back},i)=><g key={`back-${i}`}><path id={`alex-upper-${i}`} ref={el=>upper.current[i]=el} d={back} fill={`url(#alex-knit-${i}-1)`}/><use href={`#alex-upper-${i}`} fill="url(#alex-knit-texture)" opacity=".45"/></g>)}
      <image className="articulated-avatar-body" href={asset('alex-rig-crewneck-v6.png')} width="1000" height="1000"/>
      {armContours(0).map(({d},i)=><g key={i}><path id={`alex-fore-${i}`} ref={el=>paths.current[i]=el} d={d} fill={`url(#alex-knit-${i}-0)`}/><use href={`#alex-fore-${i}`} fill="url(#alex-knit-texture)" opacity=".45"/></g>)}
      <g ref={el=>groups.current[2]=el}><image href={asset('alex-rig-camera-hands-v5.png')} width="1000" height="1000"/></g>
    </svg>
  </span>;
}
