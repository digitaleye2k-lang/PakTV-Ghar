/* PakTV Ghar viewer ratings. Illustrative starter previews NEVER count as votes. */
(()=>{
"use strict";
const config=window.PAKTV_COMMUNITY_CONFIG||{};
const kindPattern=/^(show|movie)$/;
const itemPattern=/^[A-Za-z0-9_-]{1,96}$/;
const nodes=()=>[...document.querySelectorAll(".pgh-rating[data-rating-kind][data-rating-item]")];
const cache=new Map(), pending=new Set();
let client=null, connecting=null, lastLoadedAt=0;
const key=(kind,item)=>kind+":"+item;
function valid(kind,item){return kindPattern.test(kind)&&itemPattern.test(item);}
function starter(item){
 let hash=2166136261;
 for(let i=0;i<item.length;i++)hash=Math.imul(hash^item.charCodeAt(i),16777619)>>>0;
 return (3.8+(hash%10)/10).toFixed(1);
}
function create(tag,className,text){
 const element=document.createElement(tag);
 if(className)element.className=className;
 if(text!==undefined)element.textContent=String(text);
 return element;
}
function announce(host,message,error=false){
 let notice=host.querySelector(".pgh-rating-message");
 if(!notice){notice=create("span","pgh-rating-message");notice.setAttribute("role","status");host.append(notice);}
 notice.textContent=message;
 notice.classList.toggle("pgh-rating-error",error);
}
function draw(host,record){
 const kind=host.dataset.ratingKind,item=host.dataset.ratingItem;
 if(!valid(kind,item))return;
 const k=key(kind,item),row=create("div","pgh-rating-row"),summary=create("span","pgh-rating-summary");
 const votes=Number(record?.votes)||0,avg=Number(record?.average)||0;
 const mine=Number(record?.yours)||0;
 const preview=starter(item);
 const heading=votes>0?avg.toFixed(1)+" / 5 • "+votes+" viewer "+(votes===1?"rating":"ratings"):
   "Starter preview "+preview+" / 5 • illustrative, 0 votes";
 summary.textContent=heading;
 if(!votes)summary.title="Illustrative site preview only. This is not an audience rating or fabricated vote.";
 else summary.title="Average from actual authenticated guest votes; one rating per user per title.";
 const stars=create("div","pgh-rating-stars");
 stars.setAttribute("role","group");stars.setAttribute("aria-label","Rate "+kind+" from one to five stars");
 const dim=pending.has(k);
 for(let i=1;i<=5;i++){
   const b=create("button","pgh-star"+(mine>=i?" selected":""),mine>=i?"★":"☆");
   b.type="button";b.disabled=dim||!client;
   b.setAttribute("aria-label","Rate "+i+" "+(i===1?"star":"stars"));
   b.setAttribute("aria-pressed",String(mine===i));
   b.setAttribute("title",i+" out of 5"+(mine===i?" — your rating":""));
   b.addEventListener("click",()=>void vote(kind,item,i));
   stars.append(b);
 }
 row.append(stars,summary);
 host.replaceChildren(row);
 const foot=create("div","pgh-rating-foot",
   mine?"You rated this "+mine+" / 5. Select a different star to update.":
   client?"Choose a star to add your own rating. Guest sign-in is automatic.":
   "Connecting secure guest ratings…");
 host.append(foot);
}
function redraw(kind,item){
 const record=cache.get(key(kind,item));
 nodes().filter(n=>n.dataset.ratingKind===kind&&n.dataset.ratingItem===item)
   .forEach(n=>draw(n,record));
}
function parse(records){
 if(!Array.isArray(records))return;
 for(const row of records){
   if(!valid(row?.kind,row?.item))continue;
   const votes=Math.max(0,Number(row.votes)||0);
   const average=votes>0?Number(row.average):null;
   cache.set(key(row.kind,row.item),{
     votes,average:Number.isFinite(average)?average:null,
     yours:Number(row.yours)||null
   });
   redraw(row.kind,row.item);
 }
}
async function connect(){
 if(client)return client;
 if(connecting)return connecting;
 connecting=(async()=>{
   const url=config.supabaseUrl||"",publishableKey=config.publishableKey||"";
   if(!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url)||
      !/^(?:sb_publishable_[A-Za-z0-9_-]+|eyJ[A-Za-z0-9._-]+)$/.test(publishableKey))
      throw Error("Ratings backend not configured");
   if(!window.supabase?.createClient){
     await new Promise((resolve,reject)=>{
       const script=document.createElement("script");
       script.src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";
       script.async=true;
       script.onload=resolve;script.onerror=()=>reject(Error("Rating service unavailable"));
       document.head.append(script);
     });
   }
   if(!window.supabase?.createClient)throw Error("Supabase SDK missing");
   client=window.supabase.createClient(url,publishableKey,{
     auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}
   });
   return client;
 })();
 try{return await connecting;}finally{connecting=null;}
}
async function refresh(force=false){
 const visible=nodes();
 if(!visible.length)return;
 for(const host of visible)draw(host,cache.get(key(host.dataset.ratingKind,host.dataset.ratingItem)));
 if(!force&&Date.now()-lastLoadedAt<12000)return;
 try{
   const db=await connect();
   const items=[],seen=new Set();
   for(const n of visible){
     const kind=n.dataset.ratingKind,item=n.dataset.ratingItem,k=key(kind,item);
     if(valid(kind,item)&&!seen.has(k)){seen.add(k);items.push({kind,item});}
   }
   for(let i=0;i<items.length;i+=80){
     const {data,error}=await db.rpc("pgh_rating_summary",{p_items:items.slice(i,i+80)});
     if(error)throw error;
     parse(data);
   }
   lastLoadedAt=Date.now();
   for(const n of nodes())draw(n,cache.get(key(n.dataset.ratingKind,n.dataset.ratingItem)));
 }catch(error){
   for(const n of visible){
     const record=cache.get(key(n.dataset.ratingKind,n.dataset.ratingItem));
     draw(n,record);
     announce(n,"Ratings temporarily unavailable. Preview scores are not real votes.",true);
   }
 }
}
async function ensureGuest(db){
 const {data,error}=await db.auth.getSession();
 if(error)throw error;
 if(data?.session?.access_token)return;
 const result=await db.auth.signInAnonymously();
 if(result.error)throw result.error;
 if(!result.data?.session?.access_token)throw Error("Guest sign-in unavailable");
}
async function vote(kind,item,stars){
 if(!valid(kind,item)||!(stars>=1&&stars<=5))return;
 const k=key(kind,item);
 if(pending.has(k))return;
 pending.add(k);redraw(kind,item);
 let message="",failed=false;
 try{
   const db=await connect();
   await ensureGuest(db);
   const {data,error}=await db.rpc("pgh_rate_content",{p_kind:kind,p_item:item,p_stars:stars});
   if(error)throw error;
   parse(data);
   lastLoadedAt=0;
   await refresh(true);
   message="Your "+stars+"-star rating has been saved.";
 }catch(error){
   const detail=String(error?.message||"");
   message=/wait|limit/i.test(detail)?detail:
     "Could not save your rating. Please try again.";
   failed=true;
 }finally{
   pending.delete(k);
   redraw(kind,item);
   for(const n of nodes().filter(n=>n.dataset.ratingKind===kind&&n.dataset.ratingItem===item)){
     announce(n,message,failed);
   }
 }
}
document.addEventListener("paktv:paint",()=>{void refresh();});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{void refresh();});
else void refresh();
})();