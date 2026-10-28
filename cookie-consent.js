/* PakTV Ghar — consent-gated Google AdSense Auto ads only.
   No advertising network is requested until a visitor explicitly opts in.
   The website's local choice is NOT a Google-certified IAB TCF CMP. Configure
   a Google-certified CMP in AdSense Privacy & messaging for eligible regions. */
(() => {
  "use strict";
  const KEY="pgh_consent_v1";
  const VERSION=3; // Reset previously saved old-network consent and request fresh Google-only choice.
  const AGE=180*24*60*60*1000;
  const CLIENT="ca-pub-7935805760564580";
  const GPC=navigator.globalPrivacyControl===true;
  function choice(){
    try{
      const saved=JSON.parse(localStorage.getItem(KEY)||"null");
      if(!saved||saved.version!==VERSION||!saved.date||
         !Number.isFinite(Date.parse(saved.date))||
         Date.now()-Date.parse(saved.date)>AGE||
         Date.parse(saved.date)>Date.now()+60000)return null;
      return {googleAds:saved.googleAds===true};
    }catch{return null}
  }
  function save(allow){
    try{localStorage.setItem(KEY,JSON.stringify({
      version:VERSION,date:new Date().toISOString(),googleAds:!GPC&&!!allow
    }))}catch{}
    // A reload unloads previously inserted Google advertising when consent is withdrawn.
    window.location.reload();
  }
  function loadGoogleAds(){
    if(document.querySelector('script[data-paktv-adsense]'))return;
    const script=document.createElement("script");
    script.async=true;
    script.crossOrigin="anonymous";
    script.setAttribute("data-paktv-adsense","true");
    script.src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client="+CLIENT;
    document.head.appendChild(script);
  }
  function init(){
    // No advertising manager, tracker or optional ad scripts on children's pages.
    const name=String(window.location?.pathname||"").split("/").pop();
    if(/^(kids|waggle-play|waggle-workshop)\.html$/i.test(name))return;
    const saved=choice();
    const root=document.createElement("div");
    root.innerHTML=[
      '<section id="paktvCookieBanner" class="privacy-banner" aria-label="Cookie and advertising choices" hidden>',
      '<div class="privacy-banner-inner"><div class="privacy-message"><strong>Privacy &amp; Cookie Choices</strong>',
      '<p>PakTV Ghar uses essential local preferences. With your permission, Google AdSense may show advertising and use cookies or device information. Ads are optional; you can watch shows without accepting. <a href="./privacy.html">Privacy &amp; Cookies Policy</a>.</p>',
      '</div><div class="privacy-buttons">',
      '<button class="privacy-btn privacy-secondary" id="privacyReject" type="button">Reject optional</button>',
      '<button class="privacy-btn privacy-primary" id="privacyAccept" type="button">Accept Google ads</button>',
      '<button class="privacy-btn privacy-outline" id="privacyCustomize" type="button">Choose settings</button>',
      '</div></div></section>',
      '<div id="privacyBackdrop" class="privacy-dialog-backdrop" hidden><section id="privacyDialog" class="privacy-dialog" tabindex="-1" role="dialog" aria-modal="true" aria-labelledby="privacyDialogTitle">',
      '<div class="privacy-dialog-head"><h2 id="privacyDialogTitle">Your privacy settings</h2><button class="privacy-close" id="privacyClose" type="button" aria-label="Close settings">✕</button></div>',
      '<p>Advertising is optional. Google AdSense Auto ads may use cookies, device identifiers and measurement technology. This choice is separate from any legally required consent requested by a Google-certified consent platform.</p>',
      '<div class="privacy-choice"><div><strong>Essential local preferences</strong><small>Settings you choose to save, such as favourites and language.</small></div><span class="privacy-required">Always on</span></div>',
      '<label class="privacy-choice" for="privacyGoogleCheck"><div><strong>Google AdSense ads</strong><small>Allow Google and its advertising partners to load Auto ads. You can withdraw permission any time.</small></div><input id="privacyGoogleCheck" type="checkbox" aria-label="Allow Google AdSense advertising"></label>',
      '<p class="privacy-gpc-note" id="privacyGPC" hidden>Your browser has Global Privacy Control enabled. Optional advertising stays off.</p>',
      '<p class="privacy-fine">Embedded YouTube videos and external links are separate from advertising consent. See the <a href="./privacy.html">privacy policy</a>.</p>',
      '<div class="privacy-dialog-actions"><button class="privacy-btn privacy-secondary" id="privacyModalReject" type="button">Reject optional</button>',
      '<button class="privacy-btn privacy-primary" id="privacySave" type="button">Save my choice</button></div></section></div>'
    ].join("");
    document.body.appendChild(root);
    const get=id=>document.getElementById(id);
    const banner=get("paktvCookieBanner"),backdrop=get("privacyBackdrop"),dialog=get("privacyDialog");
    const googleAds=get("privacyGoogleCheck");
    let previous=null;
    function open(){
      previous=document.activeElement;
      googleAds.checked=!GPC&&!!saved?.googleAds;
      googleAds.disabled=GPC;
      get("privacyGPC").hidden=!GPC;
      backdrop.hidden=false;
      document.body.classList.add("privacy-modal-open");
      dialog.focus();
    }
    function close(){
      backdrop.hidden=true;
      document.body.classList.remove("privacy-modal-open");
      if(previous&&typeof previous.focus==="function")previous.focus();
    }
    get("privacyReject").addEventListener("click",()=>save(false));
    get("privacyAccept").addEventListener("click",()=>save(true));
    get("privacyCustomize").addEventListener("click",open);
    get("privacyModalReject").addEventListener("click",()=>save(false));
    get("privacySave").addEventListener("click",()=>save(googleAds.checked));
    get("privacyClose").addEventListener("click",close);
    backdrop.addEventListener("click",event=>{if(event.target===backdrop)close()});
    dialog.addEventListener("keydown",event=>{
      if(event.key==="Escape"){close();return}
      if(event.key!=="Tab")return;
      const focusable=[...dialog.querySelectorAll("button:not([disabled]),input:not([disabled]),a[href]")];
      const first=focusable[0],last=focusable[focusable.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
    });
    document.querySelectorAll("[data-privacy-settings]").forEach(x=>x.addEventListener("click",open));
    if(!saved)banner.hidden=false;
    if(!GPC&&saved?.googleAds)loadGoogleAds();
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();
