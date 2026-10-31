/* PKG Originals: user-supplied locally hosted recordings. */
(()=>{"use strict";
const tracks=[
{title:"Pehli Barish",filename:"Pehli Barish.mp3",kind:"Romantic melody",icon:"🌧️"},
{title:"Sitaaron Se Aage",filename:"Sitaaron Se Aage.mp3",kind:"Dreamy ballad",icon:"🌠"},
{title:"اس راہ پر",filename:"اس راہ پر.mp3",kind:"Urdu original",icon:"🌿"},
{title:"آؤ رقص کریں",filename:"آؤ رقص کریں.mp3",kind:"Dance & celebration",icon:"💃"},
{title:"برسات کی چھاؤں",filename:"برسات کی چھاؤں.mp3",kind:"Rainy day melody",icon:"☔"},
{title:"فنا کی بقا",filename:"فنا کی بقا.mp3",kind:"Sufi-inspired original",icon:"✨"},
{title:"کعبۂ عاشقین",filename:"کعبۂ عاشقین.mp3",kind:"Devotional qawwali-inspired original",icon:"🤲"},
{title:"یادوں کی مہک",filename:"یادوں کی مہک.mp3",kind:"Nostalgic ballad",icon:"💫"},
{title:"Sands of Time",filename:"Sands of Time.mp3",kind:"Cinematic instrumental",icon:"⏳",artist:"VortexDrift",newFile:true},
{title:"Desert Warrior",filename:"Desert Warrior.mp3",kind:"Epic instrumental",icon:"⚔️",artist:"VortexDrift",newFile:true},
{title:"Desert Wants Me Back",filename:"Desert Wants Me Back.mp3",kind:"Electronic instrumental",icon:"🏜️",artist:"VortexDrift",newFile:true}
];
const $=id=>document.getElementById(id);
const audio=$("pkgOriginalAudio"),host=$("pkgOriginalTracks"),deck=document.querySelector(".pkg-originals-deck");
if(!audio||!host)return;
const title=$("pkgOriginalTitle"),artist=$("pkgOriginalArtist"),status=$("pkgOriginalStatus"),playButton=$("pkgOriginalPlay"),shuffleButton=$("pkgOriginalShuffle");
let selected=-1,shuffle=false;
const countBadge=document.querySelector(".pkg-originals-count");
function available(i){return !tracks[i].newFile||tracks[i].verified===true}
function updateCount(){
 if(!countBadge)return;
 const playable=tracks.filter((song,i)=>available(i)).length;
 const awaiting=tracks.length-playable;
 countBadge.textContent=playable+" original tracks · On-demand listening"+
   (awaiting?" · "+awaiting+" awaiting audio upload":"");
}
audio.volume=.55;
const djVideo=$("pkgOriginalDjVideo"),djFallback=$("pkgOriginalDjFallback");
if(djVideo){djVideo.addEventListener("loadeddata",()=>{djVideo.hidden=false;if(djFallback)djFallback.hidden=true});djVideo.addEventListener("error",()=>{djVideo.hidden=true;if(djFallback)djFallback.hidden=false});}
function src(index){return "./assets/audio/PKG-Originals/"+encodeURIComponent(tracks[index].filename)}
function update(){const playing=!audio.paused;if(djVideo){if(playing){djVideo.play().catch(()=>{})}else djVideo.pause()}deck.classList.toggle("is-playing",playing);playButton.textContent=playing?"❚❚ Pause":"▶ Play";playButton.setAttribute("aria-label",playing?"Pause original song":"Play original song");for(const [i,node] of [...host.children].entries()){node.classList.toggle("active",i===selected);const b=node.querySelector("button");if(b&&!b.disabled)b.textContent=i===selected&&playing?"❚❚":"▶"}}
async function choose(index){
 index=(index+tracks.length)%tracks.length;
 if(!available(index)){status.textContent="This track is awaiting its MP3 upload to GitHub.";return}
 selected=index;const song=tracks[selected];audio.pause();audio.src=src(selected);title.textContent=song.title;artist.textContent=(song.artist?song.artist+" · ":"PakTV Ghar Originals · ")+song.kind;status.textContent="Loading "+song.title+"…";document.getElementById("radioStop")?.click();const musicPlayer=document.getElementById("musicPlayer");if(musicPlayer)musicPlayer.replaceChildren();document.dispatchEvent(new CustomEvent("paktv:pkg-originals-play"));update();try{await audio.play()}catch{status.textContent="Couldn't play this track. Confirm the MP3 is uploaded to assets/audio/PKG-Originals/."}}
function next(delta){
 const indices=tracks.map((song,i)=>available(i)?i:-1).filter(i=>i>=0);
 if(!indices.length){status.textContent="No original recordings are available.";return}
 if(selected<0){void choose(indices[0]);return}
 const current=indices.indexOf(selected);let index;
 if(shuffle&&indices.length>1){
   index=Math.floor(Math.random()*(indices.length-1));
   if(index>=current)index++;
 }else index=((current<0?0:current)+delta+indices.length)%indices.length;
 void choose(indices[index]);
}
for(const [i,song] of tracks.entries()){const card=document.createElement("article");card.className="pkg-original-track";const ico=document.createElement("span");ico.className="pkg-original-icon";ico.textContent=song.icon;const copy=document.createElement("div");copy.className="pkg-original-track-text";const heading=document.createElement("strong");heading.textContent=song.title;const sub=document.createElement("small");sub.textContent=song.kind+" · "+(song.artist||"PKG Originals");copy.append(heading,sub);const button=document.createElement("button");button.type="button";button.textContent="▶";button.setAttribute("aria-label","Play "+song.title);if(song.newFile){button.disabled=true;button.title="Checking MP3 availability";sub.textContent="Checking audio · "+(song.artist||"PKG Originals");card.classList.add("pkg-original-pending")}button.addEventListener("click",()=>{if(selected===i&&!audio.paused)audio.pause();else if(selected===i&&audio.src){void audio.play().catch(()=>{status.textContent="Audio unavailable. Please confirm the MP3 is published."})}else void choose(i)});card.append(ico,copy,button);host.append(card)}
// These newly supplied songs become playable only after their binary files
// are actually present on GitHub Pages. Avoid broken play buttons in the meantime.
async function probeNewFiles(){
 const pending=tracks.map((song,i)=>song.newFile?i:-1).filter(i=>i>=0);
 await Promise.all(pending.map(async i=>{
   let ok=false;
   try{
     const response=await fetch(src(i),{method:"HEAD",cache:"no-store"});
     const type=response.headers.get("content-type")||"";
     ok=response.ok&&/audio\/|octet-stream/i.test(type);
   }catch{}
   tracks[i].verified=ok;
   const card=host.children[i],btn=card?.querySelector("button"),sub=card?.querySelector("small");
   if(!btn||!sub)return;
   btn.disabled=!ok;
   btn.title=ok?"Play "+tracks[i].title:"Upload "+tracks[i].filename+" to assets/audio/PKG-Originals/ to enable playback";
   sub.textContent=(ok?"New · "+tracks[i].kind:"Awaiting MP3 upload")+" · "+tracks[i].artist;
   card.classList.toggle("pkg-original-pending",!ok);
 }));
 updateCount();
}
updateCount();void probeNewFiles();
playButton.addEventListener("click",()=>{if(selected<0){void choose(0)}else if(!audio.paused)audio.pause();else void audio.play().catch(()=>status.textContent="Audio unavailable. Check that the MP3 is published.")});
$("pkgOriginalNext").addEventListener("click",()=>next(1));$("pkgOriginalPrevious").addEventListener("click",()=>next(-1));
shuffleButton.addEventListener("click",()=>{shuffle=!shuffle;shuffleButton.textContent=shuffle?"🔀 Shuffle on":"🔀 Shuffle off";shuffleButton.setAttribute("aria-pressed",String(shuffle))});
$("pkgOriginalVolume").addEventListener("input",e=>audio.volume=Number(e.target.value)/100);
audio.addEventListener("playing",()=>{status.textContent="Now playing · "+tracks[selected]?.title;update()});audio.addEventListener("pause",update);audio.addEventListener("ended",()=>next(1));audio.addEventListener("error",()=>{status.textContent="This recording isn't available yet. Upload the MP3 to assets/audio/PKG-Originals/.";update()});
document.querySelectorAll("[data-music-tab]").forEach(tab=>tab.addEventListener("click",()=>{if(tab.dataset.musicTab!=="originals")audio.pause()}));
document.addEventListener("paktv:music-video-play",()=>audio.pause());document.addEventListener("paktv:virtual-dj-play",()=>audio.pause());document.addEventListener("paktv:radio-play",()=>audio.pause());
window.addEventListener("pagehide",()=>audio.pause());update();
})();