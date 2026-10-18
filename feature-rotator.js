/* Small accessible image slideshow for standalone Kids and GUPSHUP heroes. */
(()=>{
"use strict";
function attach(root){
 const pictures=[...root.querySelectorAll("[data-feature-image]")];
 if(pictures.length<2)return;
 const buttons=[...root.querySelectorAll("[data-feature-go]")];
 let index=0,timer=null;
 const motion=window.matchMedia("(prefers-reduced-motion: reduce)");
 const select=next=>{
   index=(next+pictures.length)%pictures.length;
   pictures.forEach((el,i)=>{el.classList.toggle("is-active",i===index);el.setAttribute("aria-hidden",String(i!==index));});
   buttons.forEach(b=>{if(b.dataset.featureGo!=="next"&&b.dataset.featureGo!=="previous")
     b.setAttribute("aria-pressed",String(Number(b.dataset.featureGo)===index));});
 };
 const stop=()=>{if(timer!==null){clearTimeout(timer);timer=null;}};
 const cycle=()=>{
   stop();
   if(motion.matches||document.hidden||root.matches(":hover")||root.contains(document.activeElement))return;
   timer=setTimeout(()=>{select(index+1);cycle();},7000);
 };
 buttons.forEach(b=>b.addEventListener("click",()=>{
   const step=b.dataset.featureGo;
   select(step==="next"?index+1:step==="previous"?index-1:Number(step));cycle();
 }));
 root.addEventListener("mouseenter",stop);
 root.addEventListener("mouseleave",cycle);
 root.addEventListener("focusin",stop);
 root.addEventListener("focusout",()=>setTimeout(cycle,0));
 document.addEventListener("visibilitychange",cycle);
 motion.addEventListener?.("change",cycle);
 pictures.forEach((img,i)=>{
   img.addEventListener("error",()=>{
     if(img.dataset.fallback){img.src=img.dataset.fallback;delete img.dataset.fallback;}
     else if(i>0){img.remove();} // first image stays available as a final fallback
   });
 });
 select(index);cycle();
}
const start=()=>document.querySelectorAll("[data-feature-rotator]").forEach(attach);
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});
else start();
})();