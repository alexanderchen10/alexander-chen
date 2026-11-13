import { useEffect, useId, useState } from 'react';
const avatar = `${import.meta.env.BASE_URL}projects/about/alex-greeting-v7.png`;
// Both layers use identical rendered pixels. The shoulder overlaps the body mask,
// so a small arm rotation cannot reveal a cut edge or duplicate the head.
const ARM = 'M690 190 H1000 V850 H790 Q730 800 700 735 Q705 660 690 560 Z';
const CLEAR = 'M690 190 H1000 V850 H790 Q730 800 710 735 L730 630 L710 560 L690 500 Z';
export default function GreetingAvatar({ active, paused, onReady, previewAngle }) {
  const id=useId().replaceAll(':',''),[ready,setReady]=useState(false);
  useEffect(()=>{let cancelled=false;const image=new Image();image.onload=()=>{if(!cancelled){setReady(true);onReady(true);}};image.src=avatar;return()=>{cancelled=true;};},[onReady]);
  const fixed=previewAngle!==undefined;
  return <span className={`greeting-avatar${ready?' is-ready':''}${active?' is-greeting':''}${paused?' is-paused':''}`}>
    <img className="greeting-fallback" src={avatar} width="1254" height="1254" alt="" />
    <svg className="greeting-layers" viewBox="0 0 1000 1000" aria-hidden="true">
      <defs>
        <clipPath id={`${id}-arm`}><path d={ARM}/></clipPath>
        <mask id={`${id}-body`} maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1000"><rect width="1000" height="1000" fill="white"/><path d={CLEAR} fill="black"/></mask>
      </defs>
      <g className="greeting-wave" style={fixed?{animation:'none',transform:`rotate(${previewAngle}deg)`}:undefined}>
        <image href={avatar} width="1000" height="1000" clipPath={`url(#${id}-arm)`}/>
      </g>
      <image href={avatar} width="1000" height="1000" mask={`url(#${id}-body)`}/>
    </svg>
  </span>;
}
