/* PakTV Ghar Music: public publisher metadata, local DJ sets and on-demand embeds. */
(()=>{"use strict";
const $=id=>document.getElementById(id),ID=/^[A-Za-z0-9_-]{11}$/;
const genres=[
 {id:"all",label:"🎵 All music"}, {id:"classic",label:"📻 Golden classics"},
 {id:"ghazal",label:"🌙 Ghazal"},{id:"qawwali",label:"🤲 Qawwali"},
 {id:"folk",label:"🪕 Folk & regional"},{id:"sufi",label:"✨ Sufi"},
 {id:"pop",label:"🌈 Pop"},{id:"rock",label:"🎸 Rock"},
 {id:"rap",label:"🎤 Hip-hop & rap"},{id:"jazz",label:"🎷 Jazz & fusion"},
 {id:"indie",label:"🌿 Indie & acoustic"}
];
const publishers={
 cokestudio:{name:"Coke Studio Pakistan",genre:"sufi"},
 nescafebasement:{name:"NESCAFÉ Basement",genre:"rock"},
 emipakistan:{name:"EMI Pakistan",genre:"classic"},
 talhaanjum:{name:"Talha Anjum",genre:"rap"},
 youngstunners:{name:"Young Stunners",genre:"rap"},
 sajjadali:{name:"Sajjad Ali",genre:"pop"},
 jaubi:{name:"Jaubi",genre:"jazz"},
 mekaalhasan:{name:"Mekaal Hasan Band",genre:"rock"},
 rahatfateh:{name:"Rahat Fateh Ali Khan",genre:"qawwali"},
 atifs:{name:"Atif Aslam",genre:"pop"}
};
const sets=[
 {title:"Golden Hour",emoji:"📻",desc:"A journey through Pakistani music's timeless sound.",genre:["classic","ghazal"],limit:18},
 {title:"Qawwali After Dark",emoji:"🌙",desc:"Spiritual voices, poetry and soulful evenings.",genre:["qawwali","sufi"],limit:20},
 {title:"The Desi Drive",emoji:"🚗",desc:"Modern Pakistani pop, indie and guitar-driven energy.",genre:["pop","rock","indie"],limit:22},
 {title:"Karachi Mic Check",emoji:"🎤",desc:"Urdu bars, hip-hop beats and Pakistan's rap scene.",genre:["rap"],limit:20},
 {title:"Jazz on the Rooftop",emoji:"🎷",desc:"A mellow detour into jazz, fusion and creative sounds.",genre:["jazz","rock"],limit:20},
 {title:"DJ's Folk & Fusion",emoji:"🪕",desc:"Regional melodies, Sufi fusion and rhythmic traditions.",genre:["folk","sufi","jazz"],limit:20}
];
const state={tracks:[],genre:"all",search:"",visible:20,queue:[],index:-1,shuffle:false,loading:true};
let ytReady=null,ytPlayer=null;
const text=(tag,cl,value)=>{const node=document.createElement(tag);if(cl)node.className=cl;if(value!==undefined)node.textContent=String(value);return node;};
const clipPattern=/\b(?:shorts?|teaser|trailer|promo|reaction|podcast|interview|behind the scenes|behind-the-scenes|making of|bts|vlog|behind the mic)\b/i;
function category(v){
 const t=String(v.title||"").toLowerCase(),raw=String(v.genre||"").toLowerCase();
 if(/\b(jazz|jazz fusion|jaubi|instrumental fusion)\b/.test(t)||v.channelId==="jaubi")return "jazz";
 if(/\b(ghazal|ghazals|غزل)\b/.test(t))return "ghazal";
 if(/\b(qawwali|qawali|قوالی)\b/.test(t))return "qawwali";
 if(/\b(classic|retro|old is gold|evergreen|golden|noor jehan|mehdi hassan|malika[- ]e[- ]tarannum)\b/.test(t))return "classic";
 if(/\b(hip[- ]hop|urdu rap|rap|diss track|cypher)\b/.test(t))return "rap";
 if(/\b(folk|punjabi folk|sindhi|balochi|pashto|saraiki|regional)\b/.test(t))return "folk";
 if(/\b(sufi|kalam|hamd|naat|manqabat)\b/.test(t))return "sufi";
 if(/\b(indie|acoustic|unplugged)\b/.test(t))return "indie";
 if(/\b(rock|metal|guitar)\b/.test(t))return "rock";
 if(v.channelId==="cokestudio")return "sufi"; // publisher's fusion catalogue; not a jazz claim
 if(raw.includes("ghazal"))return "ghazal";
 if(raw.includes("qawwali"))return "qawwali";
 if(raw.includes("classic"))return "classic";
 return publishers[v.channelId]?.genre||"pop";
}
function safe(v){
 if(!v||!ID.test(v.id||"")||!publishers[v.channelId])return false;
 const title=String(v.title||"");
 if(title.length<4||clipPattern.test(title))return false;
 if(v.embeddable===false)return false;
 if(Number(v.durationSeconds)>0 && Number(v.durationSeconds)<95)return false;
 return true;
}
function normalize(v){return {id:v.id,title:v.title,channelId:v.channelId,
 publisher:v.channel||publishers[v.channelId]?.name||"Pakistani music",
 date:v.published||v.date||"",genre:category(v)};}
const art=track=>"https://i.ytimg.com/vi/"+encodeURIComponent(track.id)+"/hqdefault.jpg";
const link=track=>"https://www.youtube.com/watch?v="+encodeURIComponent(track.id);
function compare(a,b){return String(b.date).localeCompare(String(a.date));}
function uniq(items){const seen=new Set();return items.filter(t=>t&&!seen.has(t.id)&&seen.add(t.id));}
function chooseSet(set){
 // DJ order alternates genres, then publisher, retaining only genuine uploads.
 const byGenre=set.genre.map(g=>state.tracks.filter(t=>t.genre===g).sort(compare));
 const mixed=[],ids=new Set();let round=0;
 while(mixed.length<set.limit&&round<70){
   for(const group of byGenre){const next=group[round];if(next&&!ids.has(next.id)){ids.add(next.id);mixed.push(next);}}
   round++;
 }
 return mixed;
}
function trackCard(t){
 const article=text("article","music-card");
 const play=text("button","music-cover"),im=document.createElement("img");
 play.type="button";im.src=art(t);im.alt="";im.loading="lazy";
 const glyph=text("span","","▶");glyph.setAttribute("aria-hidden","true");play.append(im,glyph);
 play.setAttribute("aria-label","Play "+t.title);
 play.addEventListener("click",()=>startQueue([t],0));
 const body=text("div","music-card-body");
 body.append(text("h4","",t.title.slice(0,135)),text("p","credit",t.publisher),
   text("span","music-genre",genres.find(g=>g.id===t.genre)?.label||"Pakistani music"));
 const acts=text("div","actions"),playBtn=text("button","","▶ Play"),addBtn=text("button","","+ Add to DJ queue");
 playBtn.type=addBtn.type="button";
 playBtn.addEventListener("click",()=>startQueue([t],0));
 addBtn.addEventListener("click",()=>{state.queue.push(t);drawQueue();notify("Added to your DJ queue.");});
 acts.append(playBtn,addBtn);body.append(acts);article.append(play,body);return article;
}
function notify(message){$("musicStatus").textContent=message;}
function drawGenres(){
 const host=$("genreFilters");host.replaceChildren();
 for(const g of genres){const b=text("button","",g.label);b.type="button";
 b.setAttribute("aria-pressed",String(state.genre===g.id));
 b.addEventListener("click",()=>{state.genre=g.id;state.visible=20;drawGenres();drawTracks();});
 host.append(b);}
}
function drawTracks(){
 const host=$("musicGrid");host.replaceChildren();
 const query=state.search.toLowerCase().trim();
 const filtered=state.tracks.filter(t=>(state.genre==="all"||t.genre===state.genre)&&
  (!query||t.title.toLowerCase().includes(query)||t.publisher.toLowerCase().includes(query)));
 for(const track of filtered.slice(0,state.visible))host.append(trackCard(track));
 $("musicResultTitle").textContent=state.genre==="all"?"Latest Pakistani music":
   genres.find(g=>g.id===state.genre).label+" · Songs";
 $("showMoreMusic").hidden=filtered.length<=state.visible;
 $("musicStatus").textContent=filtered.length?
   filtered.length+" publisher videos available • Latest uploads are checked automatically.":
   state.loading?"Checking official Pakistani music publishers…":
   "No verified tracks are indexed for this selection yet. New songs are added during the scheduled channel refresh.";
}
function drawSets(){
 const host=$("playlistCards");host.replaceChildren();
 for(const set of sets){
   const tracks=chooseSet(set),card=text("article","dj-set");
   const head=text("div");head.append(text("span","set-emoji",set.emoji),text("h3","",set.title),
     text("p","",set.desc));
   const btn=text("button","",tracks.length?"▶ Play "+tracks.length+" tracks":"Waiting for music");
   btn.type="button";btn.disabled=!tracks.length;
   btn.addEventListener("click",()=>startQueue(tracks,0));
   card.append(head,btn);host.append(card);
 }
}
function drawQueue(){
 const host=$("queueList");host.replaceChildren();
 state.queue.forEach((t,i)=>{
   const li=text("li",i===state.index?"is-playing":"");
   const b=text("button"),im=document.createElement("img"),details=text("span","queue-info");
   b.type="button";b.setAttribute("aria-label","Play queued song "+t.title);
   im.src=art(t);im.alt="";im.className="queue-art";im.loading="lazy";
   details.append(text("strong","",t.title.slice(0,100)),text("small","",t.publisher));
   b.append(text("span","queue-index",String(i+1).padStart(2,"0")),im,details);
   b.addEventListener("click",()=>playAt(i));li.append(b);host.append(li);
 });
 $("queueCount").textContent=state.queue.length+" "+(state.queue.length===1?"track":"tracks");
 $("playerNext").disabled=state.queue.length<2;
 $("playerPrevious").disabled=state.queue.length<2;
}
function startQueue(tracks,index=0){
 state.queue=uniq(tracks);state.index=-1;drawQueue();playAt(index);
 document.querySelector(".studio")?.scrollIntoView({behavior:"smooth",block:"center"});
}
function playAt(index){
 if(!state.queue.length)return;
 const normalized=(index+state.queue.length)%state.queue.length;
 state.index=normalized;
 const t=state.queue[normalized];
 $("nowTitle").textContent=t.title;$("nowArtist").textContent=t.publisher;
 $("djStatus").textContent="DJ DECK · NOW PLAYING";
 $("openTrack").hidden=false;$("openTrack").href=link(t);
 const slot=$("musicPlayer");
 slot.replaceChildren();
 const iframe=document.createElement("iframe");
 iframe.src="https://www.youtube-nocookie.com/embed/"+encodeURIComponent(t.id)+"?rel=0&autoplay=1&playsinline=1";
 iframe.title="PakTV Ghar music: "+t.title;iframe.allow="autoplay; encrypted-media; picture-in-picture";
 iframe.referrerPolicy="strict-origin-when-cross-origin";iframe.allowFullscreen=true;
 slot.append(iframe);drawQueue();
}
function nextSong(step){
 if(!state.queue.length)return;
 if(state.shuffle&&step>0&&state.queue.length>1){
   let index=Math.floor(Math.random()*(state.queue.length-1));
   if(index>=state.index)index++;
   playAt(index);
 }else playAt(state.index+step);
}
async function load(){
 const paths=["./data/archive.json","./data/videos.json"];
 const responses=await Promise.allSettled(paths.map(async path=>{
   const res=await fetch(path,{cache:"no-store"});
   if(!res.ok)throw Error("Music feed unavailable");
   return await res.json();
 }));
 const entries=[];
 for(const r of responses)if(r.status==="fulfilled"&&Array.isArray(r.value?.videos))entries.push(...r.value.videos);
 state.tracks=uniq(entries.filter(safe).map(normalize)).sort(compare);
 state.loading=false;drawTracks();drawSets();
}
$("musicSearch").addEventListener("input",e=>{state.search=e.target.value;state.visible=20;drawTracks();});
$("showMoreMusic").addEventListener("click",()=>{state.visible+=20;drawTracks();});
$("playerPrevious").addEventListener("click",()=>nextSong(-1));
$("playerNext").addEventListener("click",()=>nextSong(1));
$("playerShuffle").addEventListener("click",()=>{
 state.shuffle=!state.shuffle;
 $("playerShuffle").setAttribute("aria-pressed",String(state.shuffle));
 $("playerShuffle").textContent=state.shuffle?"🔀 Shuffle on":"🔀 Shuffle off";
});
drawGenres();drawTracks();drawSets();void load();
})();