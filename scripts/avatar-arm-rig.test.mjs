import test from 'node:test';
import assert from 'node:assert/strict';
import {armMatrices,armJoints,upperSleeveMatrices} from '../src/avatarArmRig.js';
const apply=(m,p)=>[m[0]*p[0]+m[3]*p[1]+m[6],m[1]*p[0]+m[4]*p[1]+m[7]];
const near=(a,b)=>a.forEach((v,i)=>assert.ok(Math.abs(v-b[i])<1e-9,`${a} must meet ${b}`));
test('elbows and wrists stay connected throughout raising and lowering',()=>{
  for(let sample=0;sample<=100;sample++) {
    const p=sample/100,arms=armMatrices(p),joints=armJoints(p),upper=upperSleeveMatrices(p);
    for(const [i,e,w,s0,e0] of [[0,[.202,.695],[.303,.471],[.27,.57],[.20,.91]],[1,[.735,.750],[.586,.515],[.72,.57],[.79,.94]]]) {
      near(apply(arms[i*2+1],e),joints[i].e);
      near(apply(arms[i*2+1],w),apply(arms[4],w));
      near(apply(upper[i],s0),joints[i].s);
      near(apply(upper[i],e0),joints[i].e);
    }
    for(const m of [...arms,...upper]) {
      assert.ok(m.every(Number.isFinite));
      assert.ok(m[0]*m[4]-m[1]*m[3]>0,'a sleeve must never flip inside out');
    }
    near(arms[4].slice(0,6),[1,0,0,0,1,0]);
  }
});
