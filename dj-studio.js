/* Four on-demand virtual DJs, using existing verified YouTube catalogue. */
(()=>{"use strict";
const tabs=[...document.querySelectorAll("[data-music-tab]")];
const panels=[...document.querySelectorAll("[data-panel]")];
let tracks=[];
const DJs=[
 {id:"classic",name:"DJ Classic",emoji:"📻",tag:"Golden-era melodies and soulful favourites",genres:["classic","ghazal","qawwali","folk","sufi"],intro:"./assets/djs/Classic.mp4"},
 {id:"rap",name:"DJ Rap",emoji:"🎤",tag:"Urdu hip-hop, bars and beats",genres:["rap"],intro:"./assets/djs/Rap.mp4"},
 {id:"rock",name:"DJ Rock",emoji:"🎸",tag:"Guitars, rock and modern fusion",genres:["rock","indie"],intro:"./assets/djs/Rock.mp4"},
 {id:"jazz",name:"DJ Jazz",emoji:"🎷",tag:"Smooth jazz, Pakistani fusion and late-night grooves",genres:["jazz","indie"],intro:"./assets/djs/Jazz.mp4"}
];
function setTab(tab,hash=true){
 if(!["music","radio","djs"].includes(tab))tab="music";
 for(const a of tabs){const active=a.dataset.musicTab===tab;active?a.setAttribute("aria-current","page"):a.removeAttribute("aria-current");}
 for(const p of panels)p.hidden=(p.dataset.parentTab||p.dataset.panel)!==tab;
 if(hash&&location.hash!=="#"+tab)history.replaceState(null,"","#"+tab);
 // Switching away from radio stops live streaming. Never autoplay on tab switch.
 if(tab!=="radio")document.getElementById("radioStop")?.click();
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
  media.append(fallback);
  // Intros supplied by owner: optional media, never autoplay or fetch on initial page load.
  const toggle=node("button","","▶ Watch DJ intro");toggle.type="button";
  toggle.addEventListener("click",()=>{
   const video=node("video");video.controls=true;video.playsInline=true;video.preload="none";
   video.src=dj.intro;
   video.addEventListener("error",()=>{media.replaceChildren(fallback);toggle.textContent="Intro video not uploaded yet";toggle.disabled=true;});
   media.replaceChildren(video);toggle.hidden=true;video.play().catch(()=>{});
  },{once:true});
  const body=node("div","virtual-dj-body");
  body.append(node("span","eyebrow",dj.id.toUpperCase()+" DJ SELECTS"),node("h3","",dj.name),node("p","",dj.tag),toggle);
  const list=node("ol");
  for(const song of songs)list.append(node("li","",song.title+" — "+song.publisher));
  body.append(node("p","",songs.length+"/10 verified tracks ready"),list);
  const play=node("button","","▶ Play "+dj.name+"'s set");play.type="button";play.disabled=!songs.length;
  play.addEventListener("click",()=>{setTab("music");document.dispatchEvent(new CustomEvent("paktv:virtual-dj-play",{detail:{tracks:songs}}));});
  body.append(play);card.append(media,body);host.append(card);
 }
 document.getElementById("virtualDJStatus").textContent="DJ playlists use identified tracks from verified publishers. Some styles may have fewer than 10 songs until the catalogue refreshes. DJ intro videos require assets/djs/Classic.mp4, Rap.mp4, Rock.mp4 and Jazz.mp4 to be uploaded to GitHub.";
}
document.addEventListener("paktv:music-catalog-ready",e=>{tracks=e.detail.tracks||[];draw();});
document.addEventListener("paktv:dj-queue-start",()=>setTab("music",false));
window.addEventListener("hashchange",()=>{const h=location.hash.slice(1);if(["music","radio","djs"].includes(h))setTab(h,false);});
setTab(["music","radio","djs"].includes(location.hash.slice(1))?location.hash.slice(1):"music",false);draw();
})();