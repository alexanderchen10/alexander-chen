// Two shoulder/elbow/wrist chains articulate isolated sleeves and one rigid camera.
// Camera and hands share a rigid transform; there are no pose frames or opacity blends.
const LEFT = { s:[.285,.570], e:[.202,.695], w:[.303,.471], side:-1 };
const RIGHT = { s:[.730,.570], e:[.735,.750], w:[.586,.515], side:1 };
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
    const restingElbow=chain===LEFT ? [.225,.825] : [.765,.865];
    const joint=chain.e.map((v,i)=>v+(restingElbow[i]-v)*rest);
    result.push(matrix(chain.s,chain.e,chain.s,joint),matrix(chain.e,chain.w,joint,wrist));
  }
  result.push([1,0,0,0,1,0,...offset,1]);
  return result;
}
export function armJoints(progress) {
  const rest=1-progress;
  return [LEFT,RIGHT].map(chain=>{
    const end=chain===LEFT ? [.225,.825] : [.765,.865];
    return {s:chain.s,e:chain.e.map((v,i)=>v+(end[i]-v)*rest)};
  });
}

export function upperSleeveMatrices(progress) {
  return armJoints(progress).map(({s,e},i)=>matrix(i===0?[.27,.57]:[.72,.57],i===0?[.20,.91]:[.79,.94],s,e));
}
