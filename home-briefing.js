/* PakTV Ghar homepage briefing + opt-in compact Supabase community chat. */
(()=>{
"use strict";
const $ = id => document.getElementById(id);
const state={data:null,loading:false,lastFetch:0,tab:"pakistan",newsLanguage:"en",chatOpen:false,room:"general",
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
          <div class="brief-lang-options" role="group" aria-label="Headline language">
            <button type="button" id="briefEnglish" aria-pressed="true">English</button>
            <button type="button" id="briefUrdu" aria-pressed="false" lang="ur">اردو</button>
          </div></div>
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
          <p class="brief-attribution"><a href="https://dps.psx.com.pk/indices" target="_blank" rel="noopener noreferrer">Pakistan Stock Exchange: official KSE-100 ↗</a><br>Other quotes: Yahoo Finance. Delayed data; not investment advice.</p>
        </section>
        <section class="brief-panel brief-sports-panel" aria-labelledby="briefSportsTitle">
          <div class="brief-topline"><h3 id="briefSportsTitle">🏏 Pakistan sports scores</h3><span class="brief-source">Cricket</span></div>
          <div id="briefSports" aria-live="polite"><div class="brief-empty">Checking cricket scores…</div></div>
          <p class="brief-attribution"><a href="https://www.espncricinfo.com/live-cricket-score" target="_blank" rel="noopener noreferrer">View current scores at ESPNcricinfo ↗</a><br>Third-party score snapshots; checked approximately every 3 hours, not ball-by-ball live.</p>
        </section>
      </div>
    </div>`;
  $("briefTabPakistan").addEventListener("click",()=>switchTab("pakistan"));
  $("briefTabWorld").addEventListener("click",()=>switchTab("world"));
  $("briefEnglish").addEventListener("click",()=>switchLanguage("en"));
  $("briefUrdu").addEventListener("click",()=>switchLanguage("ur"));
  renderBriefing();
}
function switchTab(tab){
  state.tab=tab;
  $("briefTabPakistan")?.setAttribute("aria-selected",String(tab==="pakistan"));
  $("briefTabWorld")?.setAttribute("aria-selected",String(tab==="world"));
  renderNews();
}
function switchLanguage(language){
  if(!["en","ur"].includes(language))return;
  state.newsLanguage=language;
  try{sessionStorage.setItem("paktv_headline_lang",language);}catch{}
  renderNews();
}
function renderNews(){
  const host=$("briefNewsList");if(!host)return;
  host.replaceChildren();
  const ur=state.newsLanguage==="ur";
  host.lang=ur?"ur":"en";host.dir=ur?"rtl":"ltr";
  $("briefEnglish")?.setAttribute("aria-pressed",String(!ur));
  $("briefUrdu")?.setAttribute("aria-pressed",String(ur));
  const news=state.data?.[ur?"newsUrdu":"news"]?.[state.tab];
  if(!news || !isFresh(news.updatedAt,36) || !Array.isArray(news.items)||!news.items.length){
    host.append(node("div","brief-empty",ur?"اردو خبریں ابھی دستیاب نہیں۔ اصل خبروں کے لیے نیوز ویب سائٹ ملاحظہ کریں۔":"Headlines are temporarily unavailable. Please use the original news sources for current updates."));
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
  else host.append(node("div","brief-empty",ur?"اس فیڈ میں تازہ سرخیاں دستیاب نہیں۔":"No recent headlines available in this feed."));
  setNote("briefNewsCredit",(ur?"اردو خبروں کا ذریعہ: Google News RSS · ":"Source: Google News RSS · Last fetched ")+shortDate(news.updatedAt)+(ur?" · مکمل خبر کے لیے عنوان کھولیں۔":". Open articles for full coverage."));
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
function renderSports(){
  const host=$("briefSports");if(!host)return;host.replaceChildren();
  const data=state.data?.sports;
  if(!data||!isFresh(data.updatedAt,8)||!Array.isArray(data.matches)||!data.matches.length){
    host.append(node("div","brief-empty","No verified Pakistan match scores are available from the feed right now. Open the source for current results."));
    return;
  }
  for(const match of data.matches.slice(0,5)){
    const row=node("div","brief-score-match");
    row.append(node("div","brief-score-series",match.series||"Pakistan cricket"));
    row.append(node("div","brief-score-title",match.name||"Cricket match"));
    if(Array.isArray(match.teams)){
      const teams=node("div","brief-score-teams");
      for(const team of match.teams.slice(0,2)){
        const line=node("div","brief-score-team");
        line.append(node("span","",team.name||"Team"),
          node("strong","",team.score||"Score pending"));
        teams.append(line);
      }
      if(teams.children.length)row.append(teams);
    }
    const meta=node("div","brief-score-meta",(match.status||"Fixture")+" · "+shortDate(match.startAt));
    row.append(meta,textLink(match.url||data.url||"https://www.espncricinfo.com/live-cricket-score","Full scorecard ↗"));
    host.append(row);
  }
}
function renderBriefing(){
  if(!$("homeBriefing"))return;
  renderNews();renderWeather();renderMarkets();renderSports();
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
try{const saved=sessionStorage.getItem("paktv_headline_lang");if(saved==="ur")state.newsLanguage="ur";}catch{}
document.addEventListener("paktv:paint",onPagePaint);
onPagePaint();
})();
