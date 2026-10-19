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
{title:"یادوں کی مہک",filename:"یادوں کی مہک.mp3",kind:"Nostalgic ballad",icon:"💫"}
];
const $=id=>document.getElementById(id);
const audio=$("pkgOriginalAudio"),host=$("pkgOriginalTracks"),deck=document.querySelector(".pkg-originals-deck");
if(!audio||!host)return;
const title=$("pkgOriginalTitle"),artist=$("pkgOriginalArtist"),status=$("pkgOriginalStatus"),playButton=$("pkgOriginalPlay"),shuffleButton=$("pkgOriginalShuffle");
let selected=-1,shuffle=false;
audio.volume=.55;
function src(index){return "./assets/audio/PKG-Originals/"+encodeURIComponent(tracks[index].filename)}
function update(){const playing=!audio.paused;deck.classList.toggle("is-playing",playing);playButton.textContent=playing?"❚❚ Pause":"▶ Play";playButton.setAttribute("aria-label",playing?"Pause original song":"Play original song");for(const [i,node] of [...host.children].entries()){node.classList.toggle("active",i===selected);node.querySelector("button").textContent=i===selected&&playing?"❚❚":"▶"}}
async function choose(index){selected=(index+tracks.length)%tracks.length;const song=tracks[selected];audio.pause();audio.src=src(selected);title.textContent=song.title;artist.textContent="PakTV Ghar Originals · "+song.kind;status.textContent="Loading "+song.title+"…";document.getElementById("radioStop")?.click();const musicPlayer=document.getElementById("musicPlayer");if(musicPlayer)musicPlayer.replaceChildren();document.dispatchEvent(new CustomEvent("paktv:pkg-originals-play"));update();try{await audio.play()}catch{status.textContent="Couldn't play this track. Confirm the MP3 is uploaded to assets/audio/PKG-Originals/."}}
function next(delta){if(selected<0){void choose(0);return}let n=selected+delta;if(shuffle&&tracks.length>1){n=Math.floor(Math.random()*(tracks.length-1));if(n>=selected)n++}void choose((n+tracks.length)%tracks.length)}
for(const [i,song] of tracks.entries()){const card=document.createElement("article");card.className="pkg-original-track";const ico=document.createElement("span");ico.className="pkg-original-icon";ico.textContent=song.icon;const copy=document.createElement("div");copy.className="pkg-original-track-text";const heading=document.createElement("strong");heading.textContent=song.title;const sub=document.createElement("small");sub.textContent=song.kind+" · PKG Originals";copy.append(heading,sub);const button=document.createElement("button");button.type="button";button.textContent="▶";button.setAttribute("aria-label","Play "+song.title);button.addEventListener("click",()=>{if(selected===i&&!audio.paused)audio.pause();else if(selected===i&&audio.src){void audio.play().catch(()=>{status.textContent="Audio unavailable. Please confirm the MP3 is published."})}else void choose(i)});card.append(ico,copy,button);host.append(card)}
playButton.addEventListener("click",()=>{if(selected<0){void choose(0)}else if(!audio.paused)audio.pause();else void audio.play().catch(()=>status.textContent="Audio unavailable. Check that the MP3 is published.")});
$("pkgOriginalNext").addEventListener("click",()=>next(1));$("pkgOriginalPrevious").addEventListener("click",()=>next(-1));
shuffleButton.addEventListener("click",()=>{shuffle=!shuffle;shuffleButton.textContent=shuffle?"🔀 Shuffle on":"🔀 Shuffle off";shuffleButton.setAttribute("aria-pressed",String(shuffle))});
$("pkgOriginalVolume").addEventListener("input",e=>audio.volume=Number(e.target.value)/100);
audio.addEventListener("playing",()=>{status.textContent="Now playing · "+tracks[selected]?.title;update()});audio.addEventListener("pause",update);audio.addEventListener("ended",()=>next(1));audio.addEventListener("error",()=>{status.textContent="This recording isn't available yet. Upload the MP3 to assets/audio/PKG-Originals/.";update()});
document.querySelectorAll("[data-music-tab]").forEach(tab=>tab.addEventListener("click",()=>{if(tab.dataset.musicTab!=="originals")audio.pause()}));
document.addEventListener("paktv:music-video-play",()=>audio.pause());document.addEventListener("paktv:virtual-dj-play",()=>audio.pause());document.addEventListener("paktv:radio-play",()=>audio.pause());
window.addEventListener("pagehide",()=>audio.pause());update();
})();