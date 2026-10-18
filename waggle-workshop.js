/* The Waggle Workshop official-only videos. No channel data is invented. */
(()=>{"use strict";
const $=id=>document.getElementById(id),channelURL="https://www.youtube.com/@TheWaggleWorkshop";
const state={videos:[],show:12,loading:true};
function element(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=String(text);return e;}
function safeVideo(v){return !!v&&v.channelId==="waggleworkshop"&&v.category==="waggle"&&/^[A-Za-z0-9_-]{11}$/.test(v.id||"")&&typeof v.title==="string"&&v.title.trim().length>2;}
function linkFor(id){return "https://www.youtube.com/watch?v="+encodeURIComponent(id);}
function card(v){
 const el=element("article","video-card");
 const cover=element("button","cover"),im=document.createElement("img");
 cover.type="button";cover.setAttribute("aria-label","Play "+v.title);im.src="https://i.ytimg.com/vi/"+encodeURIComponent(v.id)+"/hqdefault.jpg";im.alt="";im.loading="lazy";
 const icon=element("span","","▶");icon.setAttribute("aria-hidden","true");cover.append(im,icon);cover.addEventListener("click",()=>openVideo(v));el.append(cover);
 const body=element("div","video-body");body.append(element("h3","",v.title.slice(0,170)));body.append(element("p","",v.date?"The Waggle Workshop · "+v.date:"The Waggle Workshop"));
 const acts=element("div","video-actions"),watch=element("button","","▶ Watch video");watch.type="button";watch.addEventListener("click",()=>openVideo(v));
 const open=element("a","","Open on YouTube ↗");open.href=linkFor(v.id);open.target="_blank";open.rel="noopener noreferrer";acts.append(watch,open);body.append(acts);el.append(body);return el;
}
function render(){
 const list=$("waggleVideosGrid");list.replaceChildren();
 for(const v of state.videos.slice(0,state.show))list.append(card(v));
 $("showMore").hidden=state.show>=state.videos.length;
 $("feedCount").textContent=state.videos.length+" channel videos";
 $("feedStatus").textContent=state.videos.length? "Official channel uploads; availability is controlled by YouTube and the publisher.":
 state.loading?"Checking the channel's published videos…":"No indexed channel videos are available yet. The scheduled YouTube refresh will keep checking. You can visit the official channel directly.";
}
async function getFile(path){const r=await fetch(path+"?t="+Date.now(),{cache:"no-store",signal:AbortSignal.timeout(13000)});if(!r.ok)throw Error("Unavailable");return r.json();}
async function load(){
 const results=await Promise.allSettled([getFile("./data/videos.json"),getFile("./data/archive.json")]);
 const seen=new Set();
 const all=[];
 for(const result of results){if(result.status==="fulfilled"&&Array.isArray(result.value?.videos))all.push(...result.value.videos);}
 state.videos=all.filter(v=>safeVideo(v)&&!seen.has(v.id)&&seen.add(v.id))
  .sort((a,b)=>String(b.published||b.date||"").localeCompare(String(a.published||a.date||"")));
 state.loading=false;render();
}
function openVideo(v){
 if(!safeVideo(v))return;
 $("videoTitle").textContent=v.title;
 $("videoExternal").href=linkFor(v.id);
 const frame=document.createElement("iframe");
 frame.src="https://www.youtube-nocookie.com/embed/"+encodeURIComponent(v.id)+"?rel=0";
 frame.title=v.title;frame.referrerPolicy="strict-origin-when-cross-origin";frame.allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";frame.allowFullscreen=true;
 $("videoSlot").replaceChildren(frame);
 $("videoOverlay").hidden=false;document.body.style.overflow="hidden";$("closeVideo").focus();
}
function closeVideo(){$("videoSlot").replaceChildren();$("videoOverlay").hidden=true;document.body.style.overflow="";}
$("closeVideo").addEventListener("click",closeVideo);$("videoOverlay").addEventListener("click",e=>{if(e.target===$("videoOverlay"))closeVideo();});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("videoOverlay").hidden)closeVideo();});
$("showMore").addEventListener("click",()=>{state.show+=12;render();});
render();void load();
})();