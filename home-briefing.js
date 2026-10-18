/* PakTV Ghar homepage briefing + opt-in compact Supabase community chat. */
(()=>{
"use strict";
const $ = id => document.getElementById(id);
const state={data:null,loading:false,lastFetch:0,tab:"pakistan",chatOpen:false,room:"general",
  client:null,chatLoading:false,chatTimer:null,chatError:""};
const rooms=new Set(["general","dramas","movies","comedy","politics","youtubers"]);
const cfg=window.PAKTV_COMMUNITY_CONFIG||{};
const supabaseReady=/^https:\/\/[a-z0-9-]+[.]supabase[.]co\/?$/.test(cfg.supabaseUrl||"") &&
  /^sb_publishable_[a-zA-Z0-9_-]{12,}$/.test(cfg.publishableKey||"");
function node(tag,cls,content){
  const el=document.createElement(tag);
  if(cls)el.className=cls;
  if(content!==undefined)el.textContent=String(content);
  return el;
}
function isFresh(ts,hours){
  const n=Date.parse(ts||"");
  return Number.isFinite(n) && n<=Date.now()+300000 && Date.now()-n<hours*3600000;
}
function shortDate(ts){
  if(!ts||!Number.isFinite(Date.parse(ts)))return "Time unavailable";
  return new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"short",hour:"2-digit",
    minute:"2-digit",timeZone:"Europe/London",timeZoneName:"short"}).format(new Date(ts));
}
function textLink(url,title){
  try{
    const u=new URL(url);
    if(u.protocol!=="https:")throw Error("Unsafe URL");
    const a=node("a","",title);a.href=u.href;a.target="_blank";
    a.rel="noopener noreferrer";return a;
  }catch{return node("span","",title);}
}
function setNote(id,value){const el=$(id);if(el)el.textContent=value;}
function makeLayout(){
  const root=$("homeBriefing");
  if(!root)return;
  root.innerHTML=`
    <header class="brief-header"><div><span class="brief-kicker">THE DAILY BRIEF</span>
      <h2>Pakistan &amp; the world, at a glance</h2>
      <p class="brief-intro">Headlines, Pakistan weather forecasts and delayed market indices.</p></div>
      <span class="brief-freshness" id="briefUpdated">Checking sources…</span></header>
    <div class="brief-grid">
      <section class="brief-panel" aria-labelledby="briefNewsTitle">
        <div class="brief-topline"><h3 id="briefNewsTitle">Latest headlines</h3>
          <span class="brief-source">Linked to original reporting</span></div>
        <div class="brief-news-tabs" role="tablist" aria-label="News region">
          <button type="button" id="briefTabPakistan" role="tab" aria-selected="true" aria-controls="briefNewsList">Pakistan</button>
          <button type="button" id="briefTabWorld" role="tab" aria-selected="false" aria-controls="briefNewsList">Around the world</button>
        </div>
        <div id="briefNewsList" aria-live="polite"><div class="brief-empty">Checking the latest news feed…</div></div>
        <p class="brief-attribution" id="briefNewsCredit">News headlines sourced from Google News RSS; click to read the report.</p>
      </section>
      <div class="brief-side">
        <section class="brief-panel" aria-labelledby="briefWeatherTitle">
          <div class="brief-topline"><h3 id="briefWeatherTitle">Pakistan weather</h3><span class="brief-source">Forecast</span></div>
          <div id="briefWeather" class="brief-weather-cities"><div class="brief-empty">Checking forecasts…</div></div>
          <p class="brief-attribution" id="briefWeatherCredit">Forecast: <a href="https://www.met.no/en" target="_blank" rel="noopener noreferrer">MET Norway</a> (CC BY 4.0).</p>
        </section>
        <section class="brief-panel" aria-labelledby="briefMarketsTitle">
          <div class="brief-topline"><h3 id="briefMarketsTitle">Stock markets</h3><span class="brief-source">Delayed quotes</span></div>
          <div id="briefMarkets" aria-live="polite"><div class="brief-empty">Checking market data…</div></div>
          <p class="brief-attribution">Sources: Yahoo Finance. Market figures may be delayed; not investment advice.</p>
        </section>
      </div>
    </div>`;
  $("briefTabPakistan").addEventListener("click",()=>switchTab("pakistan"));
  $("briefTabWorld").addEventListener("click",()=>switchTab("world"));
  renderBriefing();
}
function switchTab(tab){
  state.tab=tab;
  $("briefTabPakistan")?.setAttribute("aria-selected",String(tab==="pakistan"));
  $("briefTabWorld")?.setAttribute("aria-selected",String(tab==="world"));
  renderNews();
}
function renderNews(){
  const host=$("briefNewsList");if(!host)return;
  host.replaceChildren();
  const news=state.data?.news?.[state.tab];
  if(!news || !isFresh(news.updatedAt,36) || !Array.isArray(news.items)||!news.items.length){
    host.append(node("div","brief-empty","Headlines are temporarily unavailable. Please use the original news sources for current updates."));
    return;
  }
  const list=node("ul","brief-news-feed");
  for(const item of news.items.slice(0,8)){
    if(!isFresh(item.published,50))continue;
    const li=node("li","brief-news-item");
    li.append(textLink(item.url,item.title));
    const meta=node("div","brief-news-meta");
    meta.append(node("span","",item.source||"News publisher"),
      node("span","dot","·"),node("span","",shortDate(item.published)));
    li.append(meta);list.append(li);
  }
  if(list.children.length)host.append(list);
  else host.append(node("div","brief-empty","No recent headlines available in this feed."));
  setNote("briefNewsCredit","Source: Google News RSS · Last fetched "+shortDate(news.updatedAt)+". Open articles for full coverage.");
}
function renderWeather(){
  const host=$("briefWeather");if(!host)return;host.replaceChildren();
  const obj=state.data?.weather;
  if(!obj || !isFresh(obj.updatedAt,12) || !Array.isArray(obj.cities) || !obj.cities.length){
    host.append(node("div","brief-empty","Weather forecasts are temporarily unavailable. Check MET Norway for updates."));
    return;
  }
  for(const item of obj.cities){
    if(!Number.isFinite(Number(item.temperatureC)))continue;
    const card=node("div","brief-weather-city");
    card.append(node("div","brief-weather-name",item.city||"Pakistan"),
      node("div","brief-weather-temp",Math.round(Number(item.temperatureC))+"°C"));
    const weather=String(item.symbol||"").replace(/_day|_night|_polartwilight/g,"").replace(/_/g," ");
    card.append(node("div","brief-weather-desc",weather+" · Wind "+item.windMs+" m/s · Humidity "+item.humidity+"%"));
    host.append(card);
  }
  setNote("briefWeatherCredit","Forecast by MET Norway (CC BY 4.0) · Updated "+shortDate(obj.updatedAt));
  const attr=$("briefWeatherCredit");
  if(attr)attr.append(" · ",textLink("https://www.met.no/en","Source"));
}
function renderMarkets(){
  const host=$("briefMarkets");if(!host)return;host.replaceChildren();
  const obj=state.data?.markets;
  if(!obj || !isFresh(obj.updatedAt,168) || !Array.isArray(obj.quotes)||!obj.quotes.length){
    host.append(node("div","brief-empty","Market quotes aren't available right now. Values are never estimated."));
    return;
  }
  for(const item of obj.quotes){
    if(!isFresh(item.marketTime,168)||!Number.isFinite(item.value))continue;
    const row=node("div","brief-market-row");
    const left=node("div");
    left.append(textLink(item.url,item.name));
    left.append(node("span","brief-market-region",item.region+" · "+shortDate(item.marketTime)));
    const right=node("div","brief-market-values");
    right.append(node("span","brief-market-number",Number(item.value).toLocaleString("en-GB",{maximumFractionDigits:2})));
    const delta=Number(item.changePercent);
    right.append(node("span","brief-market-delta "+(delta>0?"up":delta<0?"down":""),
      item.changePercent===null?"Change unavailable":(delta>0?"+":"")+delta.toFixed(2)+"%"));
    row.append(left,right);host.append(row);
  }
  if(!host.children.length)host.append(node("div","brief-empty","Market data is stale or unavailable."));
}
function renderBriefing(){
  if(!$("homeBriefing"))return;
  renderNews();renderWeather();renderMarkets();
  setNote("briefUpdated",state.data?.generatedAt?
    "Checked "+shortDate(state.data.generatedAt):"Sources update automatically");
}
async function fetchBriefing(){
  if(state.loading||Date.now()-state.lastFetch<15*60*1000)return;
  state.loading=true;state.lastFetch=Date.now();
  try{
    const response=await fetch("./data/briefing.json?ts="+Date.now(),{
      cache:"no-store",signal:AbortSignal.timeout(11000)});
    if(!response.ok)throw Error("Briefing unavailable");
    const data=await response.json();
    if(!data || typeof data!=="object" || !data.news)throw Error("Bad briefing");
    state.data=data;
  }catch{state.data=null;}
  finally{state.loading=false;renderBriefing();}
}
function onPagePaint(){
  if(!$("homeBriefing"))return;
  makeLayout();void fetchBriefing();
}
/* Mini chat: reuses the existing community RPCs; no guest sign-in until posting. */
function chatStatus(message){const el=$("pghMiniStatus");if(el)el.textContent=message;}
function setChatOpen(open){
  state.chatOpen=Boolean(open);
  const box=$("pghMiniDrawer"),tab=$("pghMiniToggle");
  if(!box||!tab)return;
  box.hidden=!state.chatOpen;tab.setAttribute("aria-expanded",String(state.chatOpen));
  tab.textContent=state.chatOpen?"💬 Chat open":"💬 Community chat";
  if(state.chatOpen){
    void loadMiniChat();
    clearInterval(state.chatTimer);
    state.chatTimer=setInterval(()=>{if(!document.hidden)void loadMiniMessages();},30000);
    $("pghMiniClose")?.focus();
  }else{
    clearInterval(state.chatTimer);state.chatTimer=null;tab.focus();
  }
}
async function loadMiniChat(){
  if(!supabaseReady){chatStatus("Chat is not configured. Open the Community page for details.");return;}
  try{
    if(!state.client){
      if(!window.supabase?.createClient){
        await new Promise((resolve,reject)=>{
          const existing=document.querySelector('script[data-pgh-supabase]');
          if(existing){existing.addEventListener("load",resolve,{once:true});existing.addEventListener("error",reject,{once:true});return;}
          const script=document.createElement("script");
          script.dataset.pghSupabase="1";
          script.src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";
          script.onload=resolve;script.onerror=reject;document.head.append(script);
        });
      }
      if(!window.supabase?.createClient)throw Error("Library not loaded");
      state.client=window.supabase.createClient(cfg.supabaseUrl,cfg.publishableKey,
        {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
    }
    $("pghMiniSend").disabled=false;
    await loadMiniMessages();
  }catch{chatStatus("Chat is temporarily unavailable. Try the full Community page.");}
}
async function loadMiniMessages(){
  if(!state.client||state.chatLoading||!state.chatOpen)return;
  state.chatLoading=true;
  try{
    const {data,error}=await state.client.rpc("pgh_public_messages",{p_topic:state.room,p_limit:20});
    if(error)throw error;
    const host=$("pghMiniMessages");host.replaceChildren();
    for(const msg of (data||[]).slice().reverse()){
      const el=node("article","pgh-mini-msg");
      el.append(node("strong","",msg.nickname));
      el.append(node("p","",msg.body));
      const time=node("time","",shortDate(msg.created_at));time.dateTime=msg.created_at;
      el.append(time);host.append(el);
    }
    if(!host.children.length)host.append(node("div","brief-empty","No messages yet. Start a friendly discussion."));
    host.scrollTop=host.scrollHeight;
    chatStatus("Please be respectful. Report problems in the full Community chat.");
  }catch{chatStatus("Could not load messages. Try again shortly.");}
  finally{state.chatLoading=false;}
}
async function sendMiniMessage(event){
  event.preventDefault();
  if(!state.client)return;
  const nickname=$("pghMiniName").value.trim(),body=$("pghMiniBody").value.trim();
  if(nickname.length<2||nickname.length>22||body.length<2||body.length>450){
    chatStatus("Nickname must be 2–22 characters; message 2–450 characters.");return;
  }
  const button=$("pghMiniSend");button.disabled=true;chatStatus("Posting…");
  try{
    const {data,error}=await state.client.auth.getSession();if(error)throw error;
    if(!data?.session?.access_token){
      const created=await state.client.auth.signInAnonymously();
      if(created.error)throw created.error;
    }
    const result=await state.client.rpc("pgh_post_message",
      {p_topic:state.room,p_nickname:nickname,p_body:body});
    if(result.error)throw result.error;
    $("pghMiniBody").value="";
    try{sessionStorage.setItem("pgh_chat_nickname",nickname);}catch{}
    await loadMiniMessages();chatStatus("Message posted.");
  }catch(error){
    const msg=String(error?.message||"");
    chatStatus(/limit|20 seconds/i.test(msg)?"Please wait before posting again.":
      /safety|filter/i.test(msg)?"Message blocked by the safety filter. Please rewrite it.":
      "Unable to post. Check anonymous sign-in or use full Community.");
  }finally{button.disabled=false;}
}
function initChat(){
  if(!$("pghMiniToggle"))return;
  $("pghMiniToggle").addEventListener("click",()=>setChatOpen(!state.chatOpen));
  $("pghMiniClose").addEventListener("click",()=>setChatOpen(false));
  $("pghMiniRoom").addEventListener("change",e=>{
    if(rooms.has(e.target.value)){state.room=e.target.value;void loadMiniMessages();}
  });
  $("pghMiniForm").addEventListener("submit",sendMiniMessage);
  document.addEventListener("keydown",e=>{
    if(e.key==="Escape"&&state.chatOpen)setChatOpen(false);
  });
  try{$("pghMiniName").value=(sessionStorage.getItem("pgh_chat_nickname")||"").slice(0,22);}catch{}
}
document.addEventListener("paktv:paint",onPagePaint);
initChat();
onPagePaint();
})();
