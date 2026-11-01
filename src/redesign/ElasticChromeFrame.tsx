import React, { useId, useLayoutEffect, useRef } from "react";
type Point={x:number;y:number;nx:number;ny:number};

/** One complete contour, sized from the actual button. The label and hit area stay still. */
export function ElasticChromeFrame({children,theme,paused,round=false}:{children:React.ReactNode;theme:"dark"|"light";paused:boolean;round?:boolean}) {
  const host=useRef<HTMLSpanElement>(null),svg=useRef<SVGSVGElement>(null),path=useRef<SVGPathElement>(null),gradient=useRef<SVGLinearGradientElement>(null);
  const id=`chrome-${useId().replace(/:/g,"")}`,points=useRef<Point[]>([]);
  const state=useRef({frame:0,last:0,a:0,v:0,target:0,x:0,y:0,tx:0,ty:0,nx:0,ny:-1,tnx:0,tny:-1});
  const paint=()=>{const s=state.current,spread=round?9:19;const d=points.current.map(p=>{const weight=Math.exp(-((p.x-s.x)**2+(p.y-s.y)**2)/(2*spread*spread))*Math.max(0,p.nx*s.nx+p.ny*s.ny);return `${(p.x+p.nx*s.a*weight).toFixed(2)},${(p.y+p.ny*s.a*weight).toFixed(2)}`;});if(d.length)path.current?.setAttribute("d",`M${d.join(" L")}Z`);};
  const tick=(time:number)=>{const s=state.current,dt=Math.min(.035,Math.max(.008,(time-(s.last||time-16))/1000));s.last=time;s.v+=((s.target-s.a)*155-s.v*21)*dt;s.a+=s.v*dt;s.x+=(s.tx-s.x)*.24;s.y+=(s.ty-s.y)*.24;s.nx+=(s.tnx-s.nx)*.24;s.ny+=(s.tny-s.ny)*.24;paint();if(Math.abs(s.target-s.a)>.005||Math.abs(s.v)>.02||Math.abs(s.tx-s.x)+Math.abs(s.ty-s.y)>.1)s.frame=requestAnimationFrame(tick);else{s.frame=0;s.last=0;}};
  const start=()=>{if(!state.current.frame)state.current.frame=requestAnimationFrame(tick);};
  const release=()=>{state.current.target=0;start();};
  useLayoutEffect(()=>{
    const el=host.current;if(!el)return;
    const resize=()=>{
      const w=el.offsetWidth,h=el.offsetHeight;if(!w||!h)return;
      const ps:Point[]=[],inset=2,r=round?Math.min(w,h)/2-inset:Math.min(7,h/2-inset);
      const line=(x1:number,y1:number,x2:number,y2:number,nx:number,ny:number)=>{const n=Math.max(1,Math.ceil(Math.hypot(x2-x1,y2-y1)/4));for(let i=0;i<n;i++)ps.push({x:x1+(x2-x1)*i/n,y:y1+(y2-y1)*i/n,nx,ny});};
      const arc=(cx:number,cy:number,angle:number)=>{for(let i=0;i<14;i++){const a=angle+i/14*Math.PI/2;ps.push({x:cx+r*Math.cos(a),y:cy+r*Math.sin(a),nx:Math.cos(a),ny:Math.sin(a)});}};
      if(round)for(let i=0;i<96;i++){const a=i/96*Math.PI*2;ps.push({x:w/2+r*Math.cos(a),y:h/2+r*Math.sin(a),nx:Math.cos(a),ny:Math.sin(a)});}
      else{line(inset+r,inset,w-inset-r,inset,0,-1);arc(w-inset-r,inset+r,-Math.PI/2);line(w-inset,inset+r,w-inset,h-inset-r,1,0);arc(w-inset-r,h-inset-r,0);line(w-inset-r,h-inset,inset+r,h-inset,0,1);arc(inset+r,h-inset-r,Math.PI/2);line(inset,h-inset-r,inset,inset+r,-1,0);arc(inset+r,inset+r,Math.PI);}
      points.current=ps;svg.current?.setAttribute("viewBox",`-7 -7 ${w+14} ${h+14}`);gradient.current?.setAttribute("x2",String(w));gradient.current?.setAttribute("y2",String(h));paint();
    };
    resize();const observer=new ResizeObserver(resize);observer.observe(el);return()=>{observer.disconnect();cancelAnimationFrame(state.current.frame);};
  },[round]);
  useLayoutEffect(()=>{if(paused){const s=state.current;cancelAnimationFrame(s.frame);s.frame=0;s.last=0;s.a=0;s.v=0;s.target=0;paint();}},[paused]);
  const dark=theme==="dark";
  return <span ref={host} className={`elastic-chrome-frame ${round?"elastic-chrome-round":"elastic-chrome-rect"}`} data-elastic-theme={theme} onPointerMove={e=>{
    if(paused||e.pointerType==="touch"||matchMedia("(prefers-reduced-motion: reduce)").matches)return;
    const r=e.currentTarget.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;let nearest:Point|undefined,distance=Infinity;
    for(const p of points.current){const d=(p.x-x)**2+(p.y-y)**2;if(d<distance){distance=d;nearest=p;}}if(!nearest)return;
    const s=state.current;if(!s.frame&&Math.abs(s.a)<.02){s.x=nearest.x;s.y=nearest.y;s.nx=nearest.nx;s.ny=nearest.ny;}s.tx=nearest.x;s.ty=nearest.y;s.tnx=nearest.nx;s.tny=nearest.ny;s.target=-Math.min(round?3.5:3,1.2+Math.sqrt(distance)*.12);start();
  }} onPointerLeave={release} onPointerCancel={release}>{children}<svg ref={svg} className="elastic-chrome-rim" aria-hidden="true"><defs><linearGradient ref={gradient} id={id} x1="0" y1="0" x2="150" y2="44" gradientUnits="userSpaceOnUse"><stop stopColor={dark?"#f4f7fd":"#455569"}/><stop offset=".2" stopColor={dark?"#929fb2":"#8796aa"}/><stop offset=".39" stopColor={dark?"#fff":"#4e6078"}/><stop offset=".57" stopColor={dark?"#8d9aae":"#a1adbc"}/><stop offset=".77" stopColor={dark?"#e7eef9":"#4d5d73"}/><stop offset="1" stopColor={dark?"#b3bfd1":"#7d8da2"}/>{!paused&&<animateTransform attributeName="gradientTransform" type="rotate" values="0 50 22;18 50 22;0 50 22;-18 50 22;0 50 22" dur="9s" repeatCount="indefinite"/>}</linearGradient></defs><path ref={path} fill="none" stroke={`url(#${id})`} strokeWidth={round?3.4:2.8} strokeLinejoin="round"/></svg></span>;
}
