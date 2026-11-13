// Two shoulder/elbow/wrist chains articulate isolated sleeves and one rigid camera.
// Camera and hands share a rigid transform; there are no pose frames or opacity blends.
const LEFT = { s:[.285,.610], e:[.202,.695], w:[.303,.471], side:-1 };
const RIGHT = { s:[.715,.610], e:[.735,.750], w:[.586,.515], side:1 };
const length = (a,b) => Math.hypot(a[0]-b[0],a[1]-b[1]);
function matrix(a,b,c,d) {
  const l=length(a,b),t=length(c,d),u=[(b[0]-a[0])/l,(b[1]-a[1])/l],v=[-u[1],u[0]],U=[(d[0]-c[0])/t,(d[1]-c[1])/t],V=[-U[1],U[0]],k=t/l;
  const xx=U[0]*k*u[0]+V[0]*v[0],xy=U[0]*k*u[1]+V[0]*v[1],yx=U[1]*k*u[0]+V[1]*v[0],yy=U[1]*k*u[1]+V[1]*v[1];
  return [xx,yx,0,xy,yy,0,c[0]-xx*a[0]-xy*a[1],c[1]-yx*a[0]-yy*a[1],1];
}
export function armMatrices(progress) {
  const rest=1-progress;
  // A shallow curved path avoids a mechanical straight-line lift.
  const offset=[.025*rest + .012*Math.sin(rest*Math.PI),.30*rest];
  const result=[];
  for (const chain of [LEFT,RIGHT]) {
    const wrist=[chain.w[0]+offset[0],chain.w[1]+offset[1]];
    const restingElbow=chain===LEFT ? [.205,.820] : [.760,.830];
    const joint=chain.e.map((v,i)=>v+(restingElbow[i]-v)*rest);
    result.push(matrix(chain.s,chain.e,chain.s,joint),matrix(chain.e,chain.w,joint,wrist));
  }
  result.push([1,0,0,0,1,0,...offset,1]);
  return result;
}
export function armJoints(progress) {
  const rest=1-progress;
  return [LEFT,RIGHT].map(chain=>{
    const end=chain===LEFT ? [.205,.820] : [.760,.830];
    return {s:chain.s,e:chain.e.map((v,i)=>v+(end[i]-v)*rest)};
  });
}

export function upperSleeveMatrices(progress) {
  return armJoints(progress).map(({s,e},i)=>matrix(i===0?[.27,.57]:[.72,.57],i===0?[.20,.91]:[.79,.94],s,e));
}

// Closed tapered sleeve surfaces have rounded ends and overlap under the hands.
function sleeveSurface(a,b,r0,r1) {
  const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy),u=[dx/len,dy/len],n=[-u[1],u[0]];
  const point=(p,r,side)=>[(p[0]+n[0]*r*side)*1000,(p[1]+n[1]*r*side)*1000];
  const fmt=p=>p.map(v=>v.toFixed(2)).join(' ');
  const a0=point(a,r0,1),a1=point(a,r0,-1),b0=point(b,r1,1),b1=point(b,r1,-1);
  return `M${fmt(a0)} L${fmt(b0)} A${r1*1000} ${r1*1000} 0 0 0 ${fmt(b1)} L${fmt(a1)} A${r0*1000} ${r0*1000} 0 0 0 ${fmt(a0)} Z`;
}
export function armContours(progress) {
  const camera=armMatrices(progress)[4];
  return armJoints(progress).map(({s,e},i)=>{
    const source=i===0?LEFT.w:RIGHT.w,wrist=[source[0]+camera[6],source[1]+camera[7]];
    const shade=(a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy),x=(a[0]+b[0])/2,y=(a[1]+b[1])/2;return {x1:(x+dy/l*.052)*1000,y1:(y-dx/l*.052)*1000,x2:(x-dy/l*.052)*1000,y2:(y+dx/l*.052)*1000};};
    return {d:sleeveSurface(e,wrist,.054,.034),upper:sleeveSurface(s,e,.052,.054),shade:shade(e,wrist),upperShade:shade(s,e),wrist,shoulder:s,elbow:e};
  });
}
