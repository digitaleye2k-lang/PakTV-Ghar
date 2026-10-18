/* Lightweight decorative animations: silent, non-audio-reactive, opt-in. */
(()=>{"use strict";
const targets=[document.querySelector(".studio-main"),document.querySelector(".radio-studio")].filter(Boolean);
const prefersReduce=window.matchMedia("(prefers-reduced-motion: reduce)");
let enabled=false,style="glow";
try{enabled=localStorage.getItem("paktv-gentle-visuals")==="yes";style=localStorage.getItem("paktv-visual-style")||"glow";}catch{}
if(!["glow","waves","stars"].includes(style))style="glow";
const mediaRadio=document.getElementById("radioAudio");
let musicStarted=false;
function sync(){
 for(const target of targets){
  const isRadio=target.classList.contains("radio-studio");
  const playing=isRadio?!!mediaRadio&&!mediaRadio.paused&&!mediaRadio.ended:musicStarted;
  target.classList.toggle("dj-visual-active",enabled&&!prefersReduce.matches&&playing);
  target.dataset.visualStyle=style;
  const toggle=target.querySelector(".dj-visual-enabled"),select=target.querySelector(".dj-visual-style");
  if(toggle)toggle.checked=enabled;
  if(select)select.value=style;
 }
}
for(const target of targets){
 target.querySelector(".dj-visual-enabled")?.addEventListener("change",e=>{
  enabled=e.target.checked;try{localStorage.setItem("paktv-gentle-visuals",enabled?"yes":"no");}catch{}sync();
 });
 target.querySelector(".dj-visual-style")?.addEventListener("change",e=>{
  style=e.target.value;try{localStorage.setItem("paktv-visual-style",style);}catch{}sync();
 });
}
document.addEventListener("paktv:music-video-play",()=>{musicStarted=true;sync();});
document.addEventListener("paktv:radio-play",()=>{musicStarted=false;sync();});
for(const event of ["playing","pause","ended","error","emptied"])mediaRadio?.addEventListener(event,sync);
prefersReduce.addEventListener?.("change",sync);
sync();
})();