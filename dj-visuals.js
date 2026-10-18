/* Full-page music and radio visualization. Actual frequency data is used only where
   a browser grants access to a radio stream; YouTube iframe audio is inaccessible. */
(()=>{"use strict";
const radio=document.getElementById("radioAudio");
const select=[...document.querySelectorAll(".dj-visual-style")];
const toggles=[...document.querySelectorAll(".dj-visual-enabled")];
const reduce=matchMedia("(prefers-reduced-motion: reduce)");
const canvas=document.createElement("canvas"),ctx=canvas.getContext("2d",{alpha:true});
canvas.className="paktv-full-visual";canvas.setAttribute("aria-hidden","true");document.body.prepend(canvas);
let on=false,style="glow",mode="none",raf=0,w=0,h=0,analyser=null,audioCtx=null,freq=null,last=0;
try{on=localStorage.getItem("paktv-gentle-visuals")==="yes";style=localStorage.getItem("paktv-visual-style")||"glow";}catch{}
const styles=["glow","waves","stars","bars","rings","particles","aurora"];
if(!styles.includes(style))style="glow";
function resize(){const d=Math.min(devicePixelRatio||1,1.5);w=innerWidth;h=innerHeight;canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);ctx.setTransform(d,0,0,d,0,0);}
function sync(){const active=on&&!reduce.matches&&mode!=="none";document.body.classList.toggle("paktv-visual-running",active);toggles.forEach(x=>x.checked=on);select.forEach(x=>x.value=style);if(active&&!raf)raf=requestAnimationFrame(render);if(!active){cancelAnimationFrame(raf);raf=0;ctx.clearRect(0,0,w,h);}}
function save(){try{localStorage.setItem("paktv-gentle-visuals",on?"yes":"no");localStorage.setItem("paktv-visual-style",style);}catch{}sync();}
toggles.forEach(x=>x.addEventListener("change",()=>{on=x.checked;save();if(on&&mode==="radio")void connectRadio();}));
select.forEach(x=>x.addEventListener("change",()=>{style=x.value;save();}));
function switchMode(m){mode=m;sync();}
document.addEventListener("paktv:music-video-play",()=>switchMode("music"));
document.addEventListener("paktv:radio-play",()=>switchMode("radio"));
radio?.addEventListener("playing",()=>{switchMode("radio");if(on)void connectRadio();});
radio?.addEventListener("pause",()=>{if(mode==="radio")switchMode("none");});
radio?.addEventListener("emptied",()=>{if(mode==="radio")switchMode("none");});
radio?.addEventListener("ended",()=>{if(mode==="radio")switchMode("none");});
let connected=false;
async function connectRadio(){
 if(connected||!radio||!on||!radio.captureStream)return;
 // captureStream does not reroute playback and is safer for cross-origin radio.
 try{
  const stream=radio.captureStream();
  if(!stream.getAudioTracks().length)return;
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  audioCtx=audioCtx||new AC();
  const source=audioCtx.createMediaStreamSource(stream);
  analyser=audioCtx.createAnalyser();analyser.fftSize=256;analyser.smoothingTimeConstant=.82;
  source.connect(analyser);freq=new Uint8Array(analyser.frequencyBinCount);
  connected=true;await audioCtx.resume();
 }catch{analyser=null;}
}
function ellipse(x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,Math.max(1,rx),Math.max(1,ry),0,0,Math.PI*2);ctx.fill();}
function render(now){
 raf=0;if(!on||reduce.matches||mode==="none")return;
 if(now-last<32){raf=requestAnimationFrame(render);return;}last=now;
 ctx.clearRect(0,0,w,h);
 const t=now*.001;
 let beat=.26+.13*Math.sin(t*2.1)+.08*Math.sin(t*3.7),spectrum=null;
 if(mode==="radio"&&analyser&&freq){analyser.getByteFrequencyData(freq);const sum=freq.reduce((a,b)=>a+b,0)/freq.length/255;if(sum>.008){beat=Math.min(.95,Math.max(.12,sum*3));spectrum=freq;}}
 ctx.globalCompositeOperation="screen";
 if(style==="glow"||style==="aurora"){
  const n=style==="aurora"?6:4;
  for(let i=0;i<n;i++){
   const x=w*(.15+.7*(i/(n-1)))+Math.sin(t*.28+i)*w*.11;
   const y=h*(.2+.5*((i%3)/3))+Math.cos(t*.23+i*2)*h*.13;
   const radius=Math.min(w,h)*(.19+beat*.2);
   const g=ctx.createRadialGradient(x,y,0,x,y,radius*2);
   g.addColorStop(0,i%2?"rgba(138,100,211,.26)":"rgba(44,190,153,.25)");
   g.addColorStop(1,"transparent");ellipse(x,y,radius*2,radius*2,g);
  }
 }else if(style==="bars"){
  const count=54,bw=w/count;
  for(let i=0;i<count;i++){
   const v=spectrum?spectrum[Math.min(spectrum.length-1,Math.floor(i*spectrum.length/count))]/255:(.15+.18*Math.abs(Math.sin(i*.3+t*2))+.18*beat);
   const height=Math.max(5,h*v*.48);
   ctx.fillStyle=i%3?"rgba(80,226,170,.3)":"rgba(236,172,117,.27)";
   ctx.fillRect(i*bw+2,h-height,Math.max(2,bw-4),height);
  }
 }else if(style==="waves"){
  for(let j=0;j<6;j++){ctx.strokeStyle=j%2?"rgba(129,212,242,.24)":"rgba(120,239,177,.24)";ctx.lineWidth=2+beat*3;ctx.beginPath();
   for(let x=0;x<=w;x+=8){const y=h*(.3+j*.09)+Math.sin(x*.008+t*(.45+beat)+j*.9)*h*(.04+beat*.045);x?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();}
 }else if(style==="rings"){
  const cx=w*.5,cy=h*.53;
  for(let i=0;i<9;i++){const rad=((t*30+i*75)%(Math.max(w,h)*.7));ctx.strokeStyle=i%2?"rgba(184,155,238,.27)":"rgba(111,232,193,.28)";ctx.lineWidth=2+beat*5;ctx.beginPath();ctx.arc(cx,cy,rad*(1+beat*.15),0,Math.PI*2);ctx.stroke();}
 }else{
  const n=style==="particles"?100:55;
  for(let i=0;i<n;i++){const x=((i*127.71+t*(5+i%7*2))%Math.max(1,w)),y=((i*87.3+Math.sin(t*.5+i)*30+t*(3+i%4))%Math.max(1,h));ellipse(x,y,(i%4+1)*(1+beat), (i%4+1)*(1+beat),i%3?"rgba(159,242,216,.38)":"rgba(229,197,255,.3)");}
 }
 ctx.globalCompositeOperation="source-over";
 raf=requestAnimationFrame(render);
}
window.addEventListener("resize",resize,{passive:true});reduce.addEventListener?.("change",sync);
document.addEventListener("visibilitychange",()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else sync();});
resize();sync();
})();