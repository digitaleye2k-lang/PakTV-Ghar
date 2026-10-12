/* Read-only visitor totals and optional individual visit opt-in.
   No IP/country lookup occurs before the visitor clicks Count my visit. */
(()=>{
 "use strict";
 const cfg=window.PAKTV_COMMUNITY_CONFIG||{};
 const ready=/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(cfg.supabaseUrl||"") &&
    typeof cfg.publishableKey==="string"&&cfg.publishableKey.length>20;
 const el=id=>document.getElementById(id);
 const api=(cfg.supabaseUrl||"").replace(/\/$/,"");
 const countryNames=typeof Intl.DisplayNames==="function"?
    new Intl.DisplayNames(["en"],{type:"region"}):null;
 function country(code){
   return typeof code==="string"&&/^[A-Z]{2}$/.test(code)&&code!=="ZZ"?
    (countryNames?.of(code)||code):"Country unknown";
 }
 async function showTotals(){
   if(!ready)return;
   const count=el("homeVisitCount"),top=el("homeCountryTop");
   if(!count||!top)return;
   try{
     const response=await fetch(api+"/rest/v1/rpc/pgh_visit_summary",{
       method:"POST",headers:{"Content-Type":"application/json","apikey":cfg.publishableKey},
       body:"{}",cache:"no-store",signal:AbortSignal.timeout(6000)
     });
     if(!response.ok)throw Error("Stats unavailable");
     const stats=await response.json();
     count.textContent=Number(stats.visits||0).toLocaleString();
     top.textContent=stats.countries?.length?
       country(stats.countries[0].country)+" leads this month":"Country rankings coming soon";
   }catch{
     count.textContent="—";top.textContent="Statistics temporarily unavailable";
   }
 }
 async function recordVisit(){
   if(!ready)return;
   const button=el("homeCountVisit"),msg=el("homeVisitStatus");
   if(!button||!msg)return;
   // The visit is not inferred from opening this page: explicit consent only.
   if(!window.confirm("Count your visit in PakTV Ghar's country statistics? We will temporarily process your IP address and browser details to count an approximate daily visit. Country lookup may involve an external IP-to-country provider. Your IP is not displayed publicly."))return;
   button.disabled=true;msg.textContent="Counting your optional visit…";
   try{
     const response=await fetch(api+"/functions/v1/"+encodeURIComponent(cfg.analyticsFunction||"community-visit"),{
       method:"POST",headers:{"Content-Type":"application/json","apikey":cfg.publishableKey},
       body:"{}",cache:"no-store",signal:AbortSignal.timeout(8500)
     });
     if(!response.ok)throw Error("Count unavailable");
     msg.textContent="Thanks! Your visit was counted approximately once for today.";
     await showTotals();
   }catch{msg.textContent="The visitor counter is temporarily unavailable.";}
   finally{button.disabled=false;}
 }
 function initialize(){
   const button=el("homeCountVisit");
   if(!button)return;
   button.disabled=!ready;
   if(ready)void showTotals();
   else{
     const country=el("homeCountryTop");
     if(country)country.textContent="Visitor dashboard being configured";
   }
 }
 // Homepage is rendered by a static client-side router; reattach when returning.
 document.addEventListener("click",event=>{
   if(event.target.closest("#homeCountVisit"))void recordVisit();
 });
 window.addEventListener("hashchange",()=>setTimeout(initialize,0));
 initialize();
})();