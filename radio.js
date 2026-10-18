/* Pakistan live radio: source-backed stations; no autoplay, tracking or fabricated scores. */
(()=>{
"use strict";
const $=id=>document.getElementById(id);
const streamOK=value=>typeof value==="string"&&/^https:\/\/[^\s"'<>]+$/i.test(value)&&!/\.(?:m3u8?|pls)(?:$|\?)/i.test(value);
const pageOK=value=>typeof value==="string"&&/^https:\/\/[^\s"'<>]+$/i.test(value);
const state={stations:[],query:"",selected:null,loading:true};
const audio=$("radioAudio");
const make=(tag,cls,txt)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(txt!==undefined)el.textContent=String(txt);return el;};
function announce(msg){$("radioPlayerStatus").textContent=msg;}
function stop(){
 audio.pause();audio.removeAttribute("src");audio.load();
 state.selected=null;
 $("radioStop").disabled=true;
 $("radioNowTitle").textContent="Choose a station";
 $("radioNowDetail").textContent="FM music, talk, culture and local broadcasts from Pakistan.";
 announce("Radio stopped. Select a station to listen.");
 render();
}
function stationCard(st){
 const playable=streamOK(st.stream),card=make("article","radio-card");
 const icon=make("span","radio-icon","📻");
 const info=make("div","radio-card-info");
 info.append(make("strong","",st.name.slice(0,90)),make("small","",(st.city||"Pakistan").slice(0,70)));
 const desc=make("p","",(st.genre||"Pakistani radio").slice(0,145));
 const actions=make("div","radio-actions");
 if(playable){
   const listen=make("button","radio-listen",state.selected?.name===st.name?"▶ Listening":"▶ Listen live");
   listen.type="button";listen.setAttribute("aria-label","Listen to "+st.name);
   listen.addEventListener("click",()=>void play(st));
   actions.append(listen);
 }else{
   const offline=make("span","radio-website-only","Official web player");actions.append(offline);
 }
 const external=make("a","radio-link","Station website ↗");
 external.href=pageOK(st.homepage)?st.homepage:"https://www.radio.gov.pk/live-streaming";
 external.target="_blank";external.rel="noopener noreferrer";
 actions.append(external);
 card.append(icon,info,desc,actions);
 return card;
}
function render(){
 const host=$("radioStations");host.replaceChildren();
 const matches=state.stations.filter(s=>{
  const words=[s.name,s.city,s.genre].join(" ").toLocaleLowerCase();
  return !state.query||words.includes(state.query);
 });
 matches.slice(0,30).forEach(s=>host.append(stationCard(s)));
 $("radioCount").textContent=matches.length+" "+(matches.length===1?"station":"stations");
 const direct=matches.filter(s=>streamOK(s.stream)).length;
 $("radioStatus").textContent=state.loading?"Finding Pakistani radio stations…":
   direct?direct+" HTTPS audio streams listed. Station availability may change without notice.":
   "Direct streams are temporarily unavailable; open these broadcasters' official live players.";
}
async function play(st){
 if(!streamOK(st.stream))return;
 audio.pause();
 audio.src=st.stream;
 state.selected=st;
 $("radioNowTitle").textContent=st.name;
 $("radioNowDetail").textContent=(st.city||"Pakistan")+" · "+(st.genre||"Radio")+" · Live station";
 $("radioStop").disabled=false;
 announce("Connecting to "+st.name+"…");
 // Give priority to radio; do not continue an embedded YouTube song at the same time.
 const slot=$("musicPlayer");
 if(slot){slot.replaceChildren(make("div","deck-placeholder","📻 Live radio selected. Choose a song to return to the DJ deck."));}
 document.dispatchEvent(new CustomEvent("paktv:radio-play"));
 render();
 try{await audio.play();}
 catch{announce("Your browser couldn't start this stream. Try again or open the station's website.");}
}
async function load(){
 try{
  const response=await fetch("./data/radio.json",{cache:"no-store"});
  if(!response.ok)throw Error("Radio directory offline");
  const data=await response.json();
  if(!Array.isArray(data?.stations))throw Error("Radio directory format");
  const seen=new Set();
  state.stations=data.stations.filter(s=>{
   if(!s||typeof s.name!=="string"||s.name.length<3||!pageOK(s.homepage))return false;
   const key=s.name.toLocaleLowerCase()+"|"+(s.city||"");
   if(seen.has(key))return false;
   seen.add(key);return true;
  });
  const date=data.updatedAt?new Date(data.updatedAt):null;
  if(date&&!Number.isNaN(date.getTime()))
   $("radioCount").title="Station directory checked "+date.toLocaleString();
 }catch{
  state.stations=[
   {name:"Radio Pakistan · FM 101",city:"Nationwide",genre:"Music and public radio",stream:"",homepage:"https://www.radio.gov.pk/live-streaming"},
   {name:"Radio Pakistan · Planet FM 87.6",city:"Islamabad",genre:"Music and entertainment",stream:"",homepage:"https://www.radio.gov.pk/live-streaming"},
   {name:"Mast FM 103",city:"Multiple cities",genre:"Music and entertainment",stream:"",homepage:"https://mastfm103.com.pk/"}
  ];
 }
 state.loading=false;render();
}
audio.addEventListener("playing",()=>{if(state.selected)announce("On air: "+state.selected.name+". Playback is provided by the station.");});
audio.addEventListener("error",()=>{if(state.selected)announce("This station's stream is unavailable. Use its official website link or select another station.");});
$("radioStop").addEventListener("click",stop);
$("radioSearch").addEventListener("input",e=>{state.query=e.target.value.toLocaleLowerCase().trim();render();});
document.addEventListener("paktv:music-video-play",()=>{if(state.selected)stop();});
window.addEventListener("pagehide",()=>{audio.pause();audio.removeAttribute("src");});
render();void load();
})();