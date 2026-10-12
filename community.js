/* PakTV Ghar Community UI. Public anon key + strict server-side RLS/RPC.
   Disabled until configured: never pretend to receive messages. */
(()=>{
"use strict";
const cfg=window.PAKTV_COMMUNITY_CONFIG||{};
const configured=/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(cfg.supabaseUrl||"") &&
  typeof cfg.publishableKey==="string"&&cfg.publishableKey.length>20;
const el=id=>document.getElementById(id);
const topics=new Set(["general","dramas","movies","comedy","politics","youtubers"]);
const reportKinds=new Set(["racism","bullying","namecalling","spam","unsafe","other"]);
const countryNames=typeof Intl.DisplayNames==="function" ?
  new Intl.DisplayNames(["en"],{type:"region"}):null;
let backend=null,loading=false,chatTimer=null,chatRoom="general",moderator=false;
const safeCountry=code=>/^[A-Z]{2}$/.test(code)?(
  code==="ZZ"?"Unknown":(countryNames?.of(code)||code)):"Unknown";
function status(node,message,success=false){
  if(!node)return;node.textContent=message;node.classList.toggle("success",success);
}
function setReady(enabled){
  el("communitySetup").hidden=enabled;
  document.querySelectorAll("form button[type='submit']").forEach(b=>{b.disabled=!enabled;});
  el("chatRefresh").disabled=!enabled;
}
function showTab(){
  const hash=location.hash.replace("#","");
  const tab=["visitors","chat","contact","report","moderator"].includes(hash)?hash:"visitors";
  document.querySelectorAll("[data-community-panel]").forEach(panel=>{panel.hidden=panel.dataset.communityPanel!==tab;});
  document.querySelectorAll("[data-community-tab]").forEach(link=>{
    const active=link.dataset.communityTab===tab;
    link.classList.toggle("active",active);
    if(active)link.setAttribute("aria-current","page");
    else link.removeAttribute("aria-current");
  });
  clearInterval(chatTimer);
  if(tab==="chat"&&backend){
    void loadChat();
    chatTimer=setInterval(()=>{if(!document.hidden&&!loading)void loadChat();},25000);
  }
}
function h(tag,cls,value){
  const node=document.createElement(tag);
  if(cls)node.className=cls;
  if(value!==undefined)node.textContent=String(value);
  return node;
}
function friendlyError(error,fallback="Please try again later."){
  const message=String(error?.message||"");
  if(/limit reached/i.test(message))return "You've reached the daily limit. Please try tomorrow.";
  if(/cooldown|wait 20 seconds/i.test(message))return "Please wait about 20 seconds between messages.";
  if(/safety|filter/i.test(message))return "The safety filter blocked that text. Please rewrite it without insults, links, personal details or offensive language.";
  if(/guest|jwt|token/i.test(message))return "Guest session could not be created. Please refresh and try again.";
  if(/duplicate|already reported/i.test(message))return "You've already reported that message.";
  if(/invalid|check your form/i.test(message))return "Please check all the fields before submitting.";
  return fallback;
}
async function guest(){
  if(!backend)throw new Error("Not configured");
  const {data,error}=await backend.auth.getSession();
  if(error)throw error;
  if(data?.session?.access_token)return data.session;
  // People post anonymously: Supabase issues a unique guest account without
  // requiring an email. It is used for rate limits and abuse reports only.
  const signed=await backend.auth.signInAnonymously();
  if(signed.error)throw signed.error;
  if(!signed.data?.session)throw new Error("Guest session unavailable");
  return signed.data.session;
}
async function stats(){
  if(!backend)return;
  const {data,error}=await backend.rpc("pgh_visit_summary");
  if(error||!data)return;
  el("statAll").textContent=Number(data.visits||0).toLocaleString();
  el("statMonth").textContent=Number(data.last30||0).toLocaleString();
  const countries=Array.isArray(data.countries)?data.countries:[];
  el("statTop").textContent=countries.length?safeCountry(countries[0].country):"No data yet";
  const rows=el("countryRows");rows.replaceChildren();
  const max=Math.max(1,...countries.map(c=>Number(c.visits)||0));
  if(!countries.length){rows.append(h("p","subtle","No recorded country visits yet."));return;}
  for(const item of countries){
    const row=h("div","country-row");
    row.append(h("span","",safeCountry(item.country)));
    const bar=h("div","country-bar"),fill=h("div");
    fill.style.width=(Math.min(100,(Number(item.visits)||0)*100/max)).toFixed(1)+"%";
    bar.append(fill);row.append(bar);row.append(h("strong","",Number(item.visits||0).toLocaleString()));
    rows.append(row);
  }
}
async function recordVisit(){
  if(!backend)return;
  // This function receives IP addresses at the backend and discards them after
  // hashing the day's visit. GeoIP is optional in the server configuration.
  try{
    await fetch(cfg.supabaseUrl.replace(/\/$/,"")+"/functions/v1/"+encodeURIComponent(cfg.analyticsFunction||"community-visit"),{
      method:"POST",headers:{"Content-Type":"application/json","apikey":cfg.publishableKey},
      body:"{}",cache:"no-store",keepalive:true,signal:AbortSignal.timeout(8000)
    });
  }catch{/* public stats can still display if a count cannot be recorded */}
  await stats();
}
function messageCard(item){
  const card=h("article","chat-message");
  const head=h("div","chat-message-head");
  head.append(h("strong","",item.nickname||"Guest"));
  const tm=h("time","",new Date(item.created_at).toLocaleString(undefined,{dateStyle:"medium",timeStyle:"short"}));
  tm.dateTime=item.created_at;head.append(tm);
  card.append(head);card.append(h("p","",item.body));
  const report=h("button","message-report","🚩 Report inappropriate message");
  report.type="button";
  report.addEventListener("click",()=>void reportMessage(item.id));
  card.append(report);
  return card;
}
async function loadChat(){
  if(!backend||loading)return;
  loading=true;
  try{
    const {data,error}=await backend.from("community_messages")
      .select("id,topic,nickname,body,created_at")
      .eq("topic",chatRoom).order("created_at",{ascending:false}).limit(75);
    if(error)throw error;
    const box=el("chatMessages");box.replaceChildren();
    const list=(data||[]).slice().reverse();
    if(!list.length)box.append(h("p","subtle","No messages in this room yet. Start a friendly conversation!"));
    else for(const item of list)box.append(messageCard(item));
  }catch{
    status(el("chatStatus"),"Messages are temporarily unavailable.");
  }finally{loading=false;}
}
async function reportMessage(id){
  if(!backend)return;
  const answer=window.prompt(
   "Why are you reporting this message?\nEnter one: racism, bullying, namecalling, spam, unsafe, other",
   "bullying");
  if(answer===null)return;
  const category=answer.trim().toLowerCase();
  if(!reportKinds.has(category)){status(el("chatStatus"),"Choose one of the listed report reasons.");return;}
  try{
    await guest();
    const {error}=await backend.rpc("pgh_report_message",{p_message_id:id,p_category:category,p_note:""});
    if(error)throw error;
    status(el("chatStatus"),"Report submitted privately. Thank you for helping protect the community.",true);
    await loadChat();
  }catch(error){status(el("chatStatus"),friendlyError(error,"Could not submit this report."));}
}
async function sendMessage(event){
  event.preventDefault();if(!backend)return;
  const btn=el("chatSend"),name=el("chatNickname").value.trim(),body=el("chatBody").value.trim();
  if(name.length<2||name.length>22||body.length<2||body.length>450)return;
  btn.disabled=true;
  status(el("chatStatus"),"Posting your message…");
  try{
    await guest();
    const {error}=await backend.rpc("pgh_post_message",{
      p_topic:chatRoom,p_nickname:name,p_body:body
    });
    if(error)throw error;
    el("chatBody").value="";
    try{sessionStorage.setItem("pgh_chat_nickname",name);}catch{}
    status(el("chatStatus"),"Your message has been posted. Keep the conversation respectful.",true);
    await loadChat();
  }catch(error){status(el("chatStatus"),friendlyError(error,"Unable to send the message."));}
  finally{btn.disabled=false;}
}
async function sendForm(event){
  event.preventDefault();
  const form=event.currentTarget,kind=form.dataset.intakeKind;
  if(!backend||!["contact","report","moderator"].includes(kind))return;
  const btn=form.querySelector("button[type=submit]"),message=form.querySelector(".form-status");
  const data=new FormData(form);
  const subject=String(data.get("subject")||"").trim(),details=String(data.get("details")||"").trim();
  const email=String(data.get("email")||"").trim(),nickname=String(data.get("nickname")||"").trim();
  const url=String(data.get("related_url")||"").trim();
  if(subject.length<5||details.length<20||details.length>2500||(kind==="moderator"&&!email)){
    status(message,"Please complete the required fields.");return;
  }
  btn.disabled=true;status(message,"Sending your private message…");
  try{
    await guest();
    const {data:ref,error}=await backend.rpc("pgh_submit",{
      p_kind:kind,p_subject:subject,p_details:details,p_email:email,p_nickname:nickname,p_related_url:url
    });
    if(error)throw error;
    form.reset();
    status(message,"Received successfully — reference #"+ref+". Your details are kept private for review.",true);
  }catch(error){status(message,friendlyError(error,"We couldn't receive your form. Please try again."));}
  finally{btn.disabled=false;}
}
async function checkModerator(){
  if(!backend)return;
  try{
    const {data}=await backend.rpc("pgh_moderator");
    moderator=!!data;
    el("moderatorTools").hidden=!moderator;
    if(moderator)await reviewQueue();
  }catch{moderator=false;}
}
async function reviewQueue(){
  if(!moderator||!backend)return;
  const area=el("moderatorQueue");area.replaceChildren();
  const {data,error}=await backend.rpc("pgh_review_queue");
  if(error){area.append(h("p","subtle","Review queue unavailable."));return;}
  if(!data?.length){area.append(h("p","subtle","There are no reported or hidden messages."));return;}
  for(const item of data){
    const row=h("div","moderator-item");
    row.append(h("strong","",item.nickname+" · "+item.topic+" · "+item.report_count+" report(s)"));
    row.append(h("p","",item.body));
    for(const action of ["hide","restore","remove"]){
      const button=h("button","secondary",action);
      button.type="button";
      button.addEventListener("click",async()=>{
        const {error:e}=await backend.rpc("pgh_moderate",{p_message_id:item.id,p_action:action});
        if(!e){await reviewQueue();await loadChat();}
      });
      row.append(button);
    }
    area.append(row);
  }
}
async function initBackend(){
  if(!configured){setReady(false);return;}
  try{
    const script=document.createElement("script");
    script.src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";
    script.async=true;
    await new Promise((resolve,reject)=>{
      script.onload=resolve;script.onerror=reject;document.head.append(script);
    });
    if(!window.supabase?.createClient)throw new Error("Supabase library unavailable");
    backend=window.supabase.createClient(cfg.supabaseUrl,cfg.publishableKey,{
      auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}
    });
    setReady(true);
    await Promise.allSettled([recordVisit(),loadChat(),checkModerator()]);
  }catch{setReady(false);}
}
el("chatTopic").addEventListener("change",e=>{
  const chosen=e.target.value;
  if(topics.has(chosen)){chatRoom=chosen;void loadChat();}
});
el("chatRefresh").addEventListener("click",()=>void loadChat());
el("chatForm").addEventListener("submit",sendMessage);
el("moderatorRefresh").addEventListener("click",()=>void reviewQueue());
for(const form of document.querySelectorAll(".intake-form"))form.addEventListener("submit",sendForm);
try{el("chatNickname").value=(sessionStorage.getItem("pgh_chat_nickname")||"").slice(0,22);}catch{}
window.addEventListener("hashchange",showTab);
showTab();
void initBackend();
})();