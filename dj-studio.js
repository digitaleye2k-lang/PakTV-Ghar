/* Four on-demand virtual DJs, using existing verified YouTube catalogue. */
(()=>{"use strict";
const tabs=[...document.querySelectorAll("[data-music-tab]")];
const panels=[...document.querySelectorAll("[data-panel]")];
let tracks=[];
const DJs=[
 {id:"classic",name:"DJ Classic",emoji:"📻",tag:"Golden-era melodies and soulful favourites",genres:["classic","ghazal","qawwali","folk","sufi"],intro:"./assets/Djs/Classic.mp4"},
 {id:"rap",name:"DJ Rap",emoji:"🎤",tag:"Urdu hip-hop, bars and beats",genres:["rap"],intro:"./assets/Djs/Rap.mp4"},
 {id:"rock",name:"DJ Rock",emoji:"🎸",tag:"Guitars, rock and modern fusion",genres:["rock","indie"],intro:"./assets/Djs/Rock.mp4"},
 {id:"jazz",name:"DJ Jazz",emoji:"🎷",tag:"Smooth jazz, Pakistani fusion and late-night grooves",genres:["jazz","indie"],intro:"./assets/Djs/Jazz.mp4"}
];
const DJ_FLOATING={
 classic:{name:"SAADIA",src:"./assets/Djs/Person_nodding_head_to_music_20261018222953.mp4",fallback:"./assets/Djs/Classic.mp4"},
 jazz:{name:"Jawaad",src:"./assets/Djs/nodding_jazz.mp4",fallback:"./assets/Djs/Jazz.mp4"},
 rap:{name:"Rose",src:"./assets/Djs/nodding_rap.mp4",fallback:"./assets/Djs/Rap.mp4"},
 rock:{name:"Saad",src:"./assets/Djs/nodding_rock.mp4",fallback:"./assets/Djs/Rock.mp4"}
};
let activeOverlay=null;
function closeDJOverlay(){
 if(!activeOverlay)return;
 const video=activeOverlay.querySelector("video");
 if(video){video.pause();video.removeAttribute("src");video.load();}
 activeOverlay.remove();activeOverlay=null;
}
function showDJOverlay(id){
 closeDJOverlay();
 const cfg=DJ_FLOATING[id];if(!cfg)return;
 const box=node("aside","classic-dj-float");
 box.setAttribute("aria-label",cfg.name+" silent dancing video");
 const top=node("div","classic-dj-float-head");
 top.append(node("strong","",cfg.name));
 const close=node("button","","✕");
 close.type="button";close.setAttribute("aria-label","Close "+cfg.name+" video");
 close.addEventListener("click",closeDJOverlay);top.append(close);
 const video=node("video","");
 video.autoplay=true;video.muted=true;video.defaultMuted=true;video.loop=true;
 video.playsInline=true;video.setAttribute("playsinline","");
 video.setAttribute("muted","");video.setAttribute("aria-label","Silent looping video of "+cfg.name);
 let fallbackUsed=false;
 video.addEventListener("error",()=>{
  if(fallbackUsed){closeDJOverlay();return;}
  fallbackUsed=true;video.src=cfg.fallback;video.play().catch(()=>{});
 });
 video.src=cfg.src;
 box.append(top,video);document.body.append(box);activeOverlay=box;
 video.play().catch(()=>{});
}
function setTab(tab,hash=true){
 if(!["music","radio","djs"].includes(tab))tab="music";
 for(const a of tabs){const active=a.dataset.musicTab===tab;active?a.setAttribute("aria-current","page"):a.removeAttribute("aria-current");}
 for(const p of panels)p.hidden=(p.dataset.parentTab||p.dataset.panel)!==tab;
 if(hash&&location.hash!=="#"+tab)history.replaceState(null,"","#"+tab);
 // Switching away from radio stops live streaming. Never autoplay on tab switch.
 if(tab!=="radio")document.getElementById("radioStop")?.click();
 if(tab!=="music")closeDJOverlay();
}
for(const a of tabs)a.addEventListener("click",e=>{e.preventDefault();setTab(a.dataset.musicTab);document.getElementById("musicTabs").scrollIntoView({block:"start",behavior:"smooth"});});
function sample(dj){
 const selected=[],seen=new Set();
 for(const genre of dj.genres){
  for(const track of tracks.filter(t=>t.genre===genre)){
   if(selected.length===10)break;
   if(!seen.has(track.id)){selected.push(track);seen.add(track.id);}
  }
 }
 return selected.slice(0,10);
}
function node(tag,className,value){const n=document.createElement(tag);if(className)n.className=className;if(value!==undefined)n.textContent=value;return n;}
function draw(){
 const host=document.getElementById("virtualDJCards");if(!host)return;
 host.replaceChildren();
 for(const dj of DJs){
  const songs=sample(dj),card=node("article","virtual-dj-card");card.dataset.style=dj.id;
  const media=node("div","virtual-dj-media"),fallback=node("span","virtual-dj-fallback",dj.emoji);
  // Show an actual still frame from the DJ's uploaded introduction video.
  // Media fragments request a frame near one second without autoplay or sound.
  const preview=node("video","virtual-dj-preview");
  preview.muted=true;preview.playsInline=true;preview.preload="metadata";
  preview.setAttribute("aria-label",dj.name+" video preview");
  preview.src=dj.intro+"#t=1";
  preview.addEventListener("error",()=>{preview.remove();fallback.hidden=false;});
  fallback.hidden=true;media.append(preview,fallback);
  // Intros supplied by owner: optional media, never autoplay or fetch on initial page load.
  const toggle=node("button","","▶ Watch DJ intro");toggle.type="button";
  toggle.addEventListener("click",()=>{
   const video=node("video");video.controls=true;video.playsInline=true;video.preload="none";
   video.src=dj.intro;
   video.addEventListener("error",()=>{media.replaceChildren(fallback);toggle.hidden=false;toggle.textContent="Video unavailable";toggle.disabled=true;});
   media.replaceChildren(video);toggle.hidden=true;video.play().catch(()=>{});
  },{once:true});
  const body=node("div","virtual-dj-body");
  body.append(node("span","eyebrow",dj.id.toUpperCase()+" DJ SELECTS"),node("h3","",dj.name),node("p","",dj.tag),toggle);
  const list=node("ol");
  for(const song of songs)list.append(node("li","",song.title+" — "+song.publisher));
  body.append(node("p","",songs.length+"/10 verified tracks ready"),list);
  const play=node("button","","▶ Play "+dj.name+"'s set");play.type="button";play.disabled=!songs.length;
  play.addEventListener("click",()=>{setTab("music");document.dispatchEvent(new CustomEvent("paktv:virtual-dj-play",{detail:{tracks:songs}}));showDJOverlay(dj.id);});
  body.append(play);card.append(media,body);host.append(card);
 }
 document.getElementById("virtualDJStatus").textContent="";
}
document.addEventListener("paktv:music-catalog-ready",e=>{tracks=e.detail.tracks||[];draw();});
document.addEventListener("paktv:dj-queue-start",()=>setTab("music",false));
document.addEventListener("paktv:music-queue-changed",()=>closeDJOverlay());
window.addEventListener("pagehide",closeClassicOverlay);
window.addEventListener("hashchange",()=>{const h=location.hash.slice(1);if(["music","radio","djs"].includes(h))setTab(h,false);});
setTab(["music","radio","djs"].includes(location.hash.slice(1))?location.hash.slice(1):"music",false);draw();
})();