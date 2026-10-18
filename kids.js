/* PakTV Ghar Kids — curated publishers only, source-linked videos, no children accounts. */
(()=>{"use strict";
const channels=[
 {id:"kidsland",name:"Kids Land",handle:"kidslandofficial",genre:"Cartoons & stories",initials:"KL",desc:"Urdu animated cartoons, Kaneez Fatima and Ghulam Rasool stories."},
 {id:"kidsmadani",name:"Kids Madani Channel",handle:"kidsmadanichannel",genre:"Learning & values",initials:"KM",desc:"Urdu animated poems, stories, learning and family values."},
 {id:"salamkids",name:"Salam Kids TV",handle:"salamkidstvofficial",genre:"Rhymes & poems",initials:"SK",desc:"Urdu nursery rhymes, songs and educational stories."},
 {id:"urdukidsstudio",name:"Urdu Kids Studio",handle:"urdukidsstudio",genre:"Rhymes & poems",initials:"UK",desc:"Urdu rhymes, poems, moral stories and playful early learning."},
 {id:"shirazi",name:"Shirazi Village Vlogs",handle:"shirazi786",genre:"Family vlogs",initials:"SV",desc:"Family-run Pakistani village-life and everyday adventures."},
 {id:"haimparishay",name:"Haim & Parishay Khan",handle:"HaimParishayKhan",genre:"Kids creators",initials:"HP",desc:"Parent-managed Pakistani kids entertainment and family activities."}
];
const known=new Map(channels.map(c=>[c.id,c]));
const labels=["Cartoons & stories","Rhymes & poems","Learning & values","Family vlogs","Kids creators"];
const $=id=>document.getElementById(id);
let videos=[],active="all",shown=12,loading=true;
const element=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=String(text);return n;};
function youtubeURL(id){return "https://www.youtube.com/watch?v="+encodeURIComponent(id);}
function validVideo(v){return typeof v==="object"&&v&&/^[a-zA-Z0-9_-]{11}$/.test(v.id||"") && known.has(v.channelId) && v.category==="kids" && typeof v.title==="string" && v.title.length>1;}
function makeCard(video){
 const c=known.get(video.channelId);
 const card=element("article","video-card");
 const cover=element("button","thumb");cover.type="button";cover.title="Play "+video.title;
 const img=document.createElement("img");img.src="https://i.ytimg.com/vi/"+encodeURIComponent(video.id)+"/hqdefault.jpg";img.alt="";img.loading="lazy";
 const play=element("span","play-icon","▶");play.setAttribute("aria-hidden","true");cover.append(img,play);cover.addEventListener("click",()=>openPlayer(video));card.append(cover);
 const body=element("div","video-copy");
 body.append(element("span","video-category",c.genre),element("h4","",video.title.slice(0,135)));
 const meta=element("p","",c.name+(video.date?" · "+video.date:""));body.append(meta);
 const actions=element("div","video-actions");
 const watch=element("button","","▶ Watch here");watch.type="button";watch.addEventListener("click",()=>openPlayer(video));
 const external=element("a","","Open on YouTube ↗");external.href=youtubeURL(video.id);external.target="_blank";external.rel="noopener noreferrer";
 actions.append(watch,external);body.append(actions);card.append(body);return card;
}
function setFilter(f){
 if(f!=="all"&&!labels.includes(f))return;
 active=f;shown=12;
 for(const b of document.querySelectorAll("[data-category]")){
  const yes=b.dataset.category===f;b.classList.toggle("active",yes);b.setAttribute("aria-pressed",String(yes));
 }
 renderVideos();
}
function renderVideos(){
 const host=$("kidsVideos");host.replaceChildren();
 const chosen=videos.filter(v=>active==="all"||known.get(v.channelId)?.genre===active);
 $("resultHeading").textContent=active==="all"?"Latest kids videos":active;
 const count=chosen.length;
 for(const item of chosen.slice(0,shown))host.append(makeCard(item));
 $("showMore").hidden=shown>=count;
 $("feedStatus").textContent=count?count+" available videos from selected Pakistani channels. Most recent uploads first.":loading?"Checking the latest YouTube uploads…":"No indexed uploads in this category yet. Explore the curated channels below and check back after the next refresh.";
}
function renderChannels(){
 const host=$("kidsChannels");host.replaceChildren();
 for(const label of labels){
  const section=element("section","channel-category");
  section.append(element("h3","",label));
  const grid=element("div","channel-grid");
  for(const c of channels.filter(x=>x.genre===label)){
    const card=element("article","channel-card");
    const top=element("div","channel-top");top.append(element("span","channel-icon",c.initials));
    const wrap=element("div");wrap.append(element("strong","",c.name),element("small","",label));top.append(wrap);card.append(top);
    card.append(element("p","",c.desc));
    const a=element("a","","Browse original YouTube channel ↗");
    a.href="https://www.youtube.com/@"+encodeURIComponent(c.handle);a.target="_blank";a.rel="noopener noreferrer";
    card.append(a);grid.append(card);
  }
  section.append(grid);host.append(section);
 }
}
function openPlayer(v){
 if(!validVideo(v))return;
 const overlay=$("playerOverlay");$("playerTitle").textContent=v.title.slice(0,115);
 $("openYoutube").href=youtubeURL(v.id);
 const iframe=document.createElement("iframe");
 iframe.src="https://www.youtube-nocookie.com/embed/"+encodeURIComponent(v.id)+"?rel=0";
 iframe.title=v.title.slice(0,115);iframe.allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";
 iframe.referrerPolicy="strict-origin-when-cross-origin";iframe.allowFullscreen=true;iframe.loading="eager";
 $("playerSlot").replaceChildren(iframe);overlay.hidden=false;document.body.style.overflow="hidden";$("closePlayer").focus();
}
function closePlayer(){
 $("playerSlot").replaceChildren();$("playerOverlay").hidden=true;document.body.style.overflow="";
 $("resultHeading").scrollIntoView({block:"nearest"});
}
function loadJson(path){
 return fetch(path+"?t="+Date.now(),{cache:"no-store",signal:AbortSignal.timeout(16000)}).then(async r=>{
   if(!r.ok)throw Error("Source unavailable");return r.json();
 });
}
async function loadVideos(){
 try{
  const results=await Promise.allSettled([loadJson("./data/archive.json"),loadJson("./data/videos.json")]);
  const merged=[];
  for(const r of results)if(r.status==="fulfilled"&&Array.isArray(r.value?.videos))merged.push(...r.value.videos);
  const seen=new Set();
  videos=merged.filter(v=>validVideo(v)&&!seen.has(v.id)&&seen.add(v.id))
   .sort((a,b)=>String(b.published||b.date||"").localeCompare(String(a.published||a.date||"")));
  $("feedUpdated").textContent=videos.length?videos.length+" curated uploads":"Sources refresh automatically";
 }catch{
  videos=[];$("feedUpdated").textContent="Source temporarily unavailable";
 }finally{loading=false;renderVideos();}
}
document.querySelectorAll("[data-category]").forEach(btn=>btn.addEventListener("click",()=>setFilter(btn.dataset.category)));
$("showMore").addEventListener("click",()=>{shown+=12;renderVideos();});
$("closePlayer").addEventListener("click",closePlayer);
$("playerOverlay").addEventListener("click",e=>{if(e.target===$("playerOverlay"))closePlayer();});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("playerOverlay").hidden)closePlayer();});
renderChannels();renderVideos();void loadVideos();
})();