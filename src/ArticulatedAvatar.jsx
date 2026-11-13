import { useEffect, useRef, useState } from 'react';
import { armMatrices, upperSleeveMatrices } from './avatarArmRig';
const asset = name => `${import.meta.env.BASE_URL}projects/about/${name}`;
const transform = m => `matrix(${m[0]} ${m[1]} ${m[3]} ${m[4]} ${m[6]*1000} ${m[7]*1000})`;

export default function ArticulatedAvatar({ aimed, paused, onReady }) {
  const [ready,setReady]=useState(false);
  useEffect(()=>{
    let cancelled=false;
    Promise.all(['alex-rig-body-v4.png','alex-rig-arms-v4.png','alexander-chen-hero-natural-v2-idle.png'].map(name=>new Promise((resolve,reject)=>{const image=new Image();image.onload=resolve;image.onerror=reject;image.src=asset(name);}))).then(()=>{if(!cancelled){setReady(true);onReady(true);}}).catch(()=>{});
    return()=>{cancelled=true;};
  },[onReady]);
  const groups=useRef([]), paths=useRef([]), target=useRef(aimed?1:0), pose=useRef(0), raf=useRef(0), last=useRef(0), wake=useRef(()=>{});
  useEffect(()=>{
    const draw=()=>{
      const matrices=armMatrices(pose.current);
      [1,3,4].forEach((bone,i)=>groups.current[i]?.setAttribute('transform',transform(matrices[bone])));
      upperSleeveMatrices(pose.current).forEach((m,i)=>paths.current[i]?.setAttribute('transform',transform(m)));
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
    target.current=aimed?1:0;
    if(paused || matchMedia('(prefers-reduced-motion: reduce)').matches) pose.current=target.current;
    wake.current();
  },[aimed,paused]);
  return <span className={`articulated-avatar${ready ? ' is-ready':''}`}>
    <img className="articulated-avatar-fallback" src={asset('alexander-chen-hero-natural-v2-idle.png')} width="1254" height="1254" alt="" />
    <img className="articulated-avatar-body" src={asset('alex-rig-body-v4.png')} width="1254" height="1254" alt="" />
    <svg className="articulated-avatar-arms" viewBox="0 0 1000 1000" aria-hidden="true">
      <defs>
        <clipPath id="alex-upper-left"><path d="M266 540 Q232 544 213 598 L169 771 L165 838 Q201 874 263 848 L300 744 L335 585 Z"/></clipPath>
        <clipPath id="alex-upper-right"><path d="M715 540 Q750 537 777 594 L826 781 L835 846 Q789 877 733 849 L699 741 L670 585 Z"/></clipPath>
        <clipPath id="alex-left-forearm"><path d="M265 435 L345 485 L307 640 L252 744 Q194 790 152 738 Q123 700 151 638 Z"/></clipPath>
        <clipPath id="alex-right-forearm"><path d="M534 490 L610 476 L686 620 L774 725 Q809 773 756 804 Q705 826 668 775 L587 657 Z"/></clipPath>
        <clipPath id="alex-camera-hands"><path d="M280 273 L400 273 L430 299 L545 299 L548 353 L579 370 L612 464 L609 492 L563 544 L509 524 L401 481 L340 478 L299 491 L260 445 L265 345 Z"/></clipPath>
      </defs>
      <g ref={el=>paths.current[0]=el}><image href={asset('alexander-chen-hero-natural-v2-idle.png')} width="1000" height="1000" clipPath="url(#alex-upper-left)"/></g>
      <g ref={el=>paths.current[1]=el}><image href={asset('alexander-chen-hero-natural-v2-idle.png')} width="1000" height="1000" clipPath="url(#alex-upper-right)"/></g>
      <g ref={el=>groups.current[0]=el}><image href={asset('alex-rig-arms-v4.png')} width="1000" height="1000" clipPath="url(#alex-left-forearm)"/></g>
      <g ref={el=>groups.current[1]=el}><image href={asset('alex-rig-arms-v4.png')} width="1000" height="1000" clipPath="url(#alex-right-forearm)"/></g>
      <g ref={el=>groups.current[2]=el}><image href={asset('alex-rig-arms-v4.png')} width="1000" height="1000" clipPath="url(#alex-camera-hands)"/></g>
    </svg>
  </span>;
}
