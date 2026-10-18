/* GUPSHUP — independent presentation, existing PakTV Ghar Supabase chat backend. */
(()=>{
"use strict";
const el=id=>document.getElementById(id);
const cfg=window.PAKTV_COMMUNITY_CONFIG||{};
const configured=/^https:\/\/[a-z0-9-]+[.]supabase[.]co\/?$/.test(cfg.supabaseUrl||"") &&
  /^sb_publishable_[a-zA-Z0-9_-]{12,}$/.test(cfg.publishableKey||"");
const rooms={
 general:["General GUPSHUP","Say hello and talk about what you love."],
 dramas:["Pakistani dramas","Your favourite shows, episodes and storylines."],
 movies:["Movies","New releases, classics and film recommendations."],
 comedy:["Comedy","Share a smile, talk sketches and funny shows."],
 politics:["Political shows","Respectful discussion about talk shows and current affairs."],
 youtubers:["YouTubers","Discuss creators, vlogs and online series."]
};
let backend=null,room="general",busy=false,timer=null,pendingReport=null,ready=false;
const status=(message,mode="")=>{
 const target=el("chatStatus");target.textContent=message;
 target.className="status-line"+(mode?" "+mode:"");
};
function make(tag,cls,txt){
 const n=document.createElement(tag);if(cls)n.className=cls;
 if(txt!==undefined)n.textContent=String(txt);
 return n;
}
function timeText(str){
 const d=new Date(str);
 if(!Number.isFinite(d.getTime()))return "";
 return new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}).format(d);
}
function warningMessage(error,defaultText){
 const msg=String(error?.message||"");
 if(/20 seconds|cooldown/i.test(msg))return "Please wait 20 seconds between messages.";
 if(/daily|limit reached/i.test(msg))return "You've reached the daily posting limit.";
 if(/safety|filter/i.test(msg))return "Please rewrite your message without abuse, links or private details.";
 if(/already reported|duplicate/i.test(msg))return "You have already reported that message.";
 if(/captcha/i.test(msg))return "Please complete the anti-spam verification and try again.";
 if(/sign-?in|guest|jwt|token/i.test(msg))return "Guest sign-in failed. Please try again.";
 return defaultText;
}
function showEmpty(msg){
 const host=el("gupshupMessages");host.replaceChildren();
 host.append(make("p","placeholder",msg));
}
function setRoom(next){
 if(!Object.hasOwn(rooms,next))return;
 room=next;
 for(const button of document.querySelectorAll("[data-room]")){
  const active=button.dataset.room===room;
  button.classList.toggle("active",active);
  button.setAttribute("aria-pressed",String(active));
 }
 el("activeRoom").textContent=rooms[room][0];
 el("roomDescription").textContent=rooms[room][1];
 showEmpty("Loading "+rooms[room][0]+" messages…");
 void loadMessages();
}
function messageElement(message,index){
 const container=make("article","chat-message");
 const header=make("div","message-head");
 const nickname=String(message.nickname||"Guest").slice(0,22);
 const avatar=make("span","avatar variant-"+(index%4),nickname.slice(0,1).toUpperCase()||"G");
 avatar.setAttribute("aria-hidden","true");
 header.append(avatar,make("strong","message-author",nickname));
 const time=make("time","message-time",timeText(message.created_at));
 time.dateTime=message.created_at;
 header.append(time);
 const body=make("p","message-body",String(message.body||""));
 const report=make("button","report-link","🚩 Report message");
 report.type="button";
 report.setAttribute("aria-label","Report message by "+nickname);
 report.addEventListener("click",()=>openReport(message.id));
 container.append(header,body,report);
 return container;
}
async function loadMessages(){
 if(!backend||busy)return;
 busy=true;
 const shownRoom=room;
 try{
  const {data,error}=await backend.rpc("pgh_public_messages",{p_topic:shownRoom,p_limit:75});
  if(error)throw error;
  if(shownRoom!==room)return;
  const host=el("gupshupMessages");
  const nearBottom=host.scrollHeight-host.scrollTop-host.clientHeight<100;
  host.replaceChildren();
  const messages=Array.isArray(data)?data.slice().reverse():[];
  if(!messages.length)host.append(make("p","placeholder","Be the first to start the gupshup in this room! ☕"));
  else messages.forEach((m,i)=>host.append(messageElement(m,i)));
  if(nearBottom)host.scrollTop=host.scrollHeight;
  status("Messages are public. Be respectful and keep personal details private.");
 }catch{
  if(shownRoom===room){
   showEmpty("Messages are temporarily unavailable. Try refreshing.");
   status("Could not load messages right now.","error");
  }
 }finally{
  busy=false;
  // If the visitor changed rooms during the request, fetch the new room now.
  if(shownRoom!==room)void loadMessages();
 }
}
async function ensureGuest(){
 const session=await backend.auth.getSession();
 if(session.error)throw session.error;
 if(session.data?.session?.access_token)return;
 const signed=await backend.auth.signInAnonymously();
 if(signed.error)throw signed.error;
 if(!signed.data?.session?.access_token)throw Error("Guest sign-in unavailable");
}
async function send(event){
 event.preventDefault();
 if(!ready)return;
 const nickname=el("guestNickname").value.trim();
 const body=el("guestMessage").value.trim();
 if(nickname.length<2||nickname.length>22||body.length<2||body.length>450){
  status("Use a nickname of 2–22 characters and a message of 2–450 characters.","error");
  return;
 }
 const button=el("sendMessage");button.disabled=true;
 status("Sending your message…");
 try{
  await ensureGuest();
  const {error}=await backend.rpc("pgh_post_message",
   {p_topic:room,p_nickname:nickname,p_body:body});
  if(error)throw error;
  el("guestMessage").value="";
  try{sessionStorage.setItem("pgh_chat_nickname",nickname);}catch{}
  await loadMessages();
  status("Message posted. Thanks for keeping GUPSHUP friendly!","success");
 }catch(error){
  status(warningMessage(error,"Could not send your message. Please try again."),"error");
 }finally{button.disabled=false;}
}
function openReport(messageId){
 if(!Number.isSafeInteger(Number(messageId))||Number(messageId)<=0)return;
 pendingReport=Number(messageId);
 el("reportOverlay").hidden=false;
 el("reportStatus").textContent="";
 el("reportReason").focus();
}
function closeReport(){
 pendingReport=null;el("reportOverlay").hidden=true;
 el("chatRefresh").focus();
}
async function report(event){
 event.preventDefault();
 if(!ready||pendingReport===null)return;
 const button=el("submitReport");button.disabled=true;
 el("reportStatus").textContent="Submitting report…";
 try{
  await ensureGuest();
  const reason=el("reportReason").value;
  const {error}=await backend.rpc("pgh_report_message",
   {p_message_id:pendingReport,p_category:reason,p_note:""});
  if(error)throw error;
  closeReport();
  status("Thank you. Your private report was submitted for moderator review.","success");
  await loadMessages();
 }catch(error){
  el("reportStatus").textContent=warningMessage(error,"Could not submit the report.");
 }finally{button.disabled=false;}
}
async function init(){
 if(!configured){
  showEmpty("GUPSHUP is being set up. Messages cannot be posted yet.");
  status("Community connection is not configured.","error");return;
 }
 try{
  const script=document.createElement("script");
  script.src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";
  script.async=true;
  await new Promise((resolve,reject)=>{
   script.onload=resolve;script.onerror=reject;document.head.append(script);
  });
  if(!window.supabase?.createClient)throw Error("Supabase is unavailable");
  backend=window.supabase.createClient(cfg.supabaseUrl,cfg.publishableKey,
    {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
  ready=true;el("sendMessage").disabled=false;
  await loadMessages();
  timer=setInterval(()=>{if(!document.hidden)void loadMessages();},25000);
 }catch{
  showEmpty("Connection currently unavailable. Please try again later.");
  status("Unable to connect to GUPSHUP. Refresh this page to retry.","error");
 }
}
for(const btn of document.querySelectorAll("[data-room]")){
 btn.addEventListener("click",()=>setRoom(btn.dataset.room));
}
el("chatRefresh").addEventListener("click",()=>void loadMessages());
el("gupshupForm").addEventListener("submit",send);
el("reportForm").addEventListener("submit",report);
el("cancelReport").addEventListener("click",closeReport);
el("reportOverlay").addEventListener("click",e=>{if(e.target===el("reportOverlay"))closeReport();});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!el("reportOverlay").hidden)closeReport();});
try{el("guestNickname").value=(sessionStorage.getItem("pgh_chat_nickname")||"").slice(0,22);}catch{}
void init();
})();