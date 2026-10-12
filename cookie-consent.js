/* Consent-first PakTV Ghar ad manager. No ad network requests before opt-in. */
(() => {
  "use strict";
  const KEY = "pgh_consent_v1";
  const VERSION = 2; // New Google advertising vendor requires fresh consent.
  const AGE = 180 * 24 * 60 * 60 * 1000;
  const GPC = navigator.globalPrivacyControl === true;
  function choice() {
    try {
      const v=JSON.parse(localStorage.getItem(KEY)||"null");
      if(!v||v.version!==VERSION||!v.date||!Number.isFinite(Date.parse(v.date))||
         Date.now()-Date.parse(v.date)>AGE||Date.parse(v.date)>Date.now()+60000)return null;
      return {ads:v.ads===true,extra:v.extra===true,googleAds:v.googleAds===true};
    } catch{return null;}
  }
  function save(ads,extra,googleAds) {
    try {
      localStorage.setItem(KEY,JSON.stringify({version:VERSION,date:new Date().toISOString(),
        ads:!GPC&&!!ads,extra:!GPC&&!!extra,googleAds:!GPC&&!!googleAds}));
    }catch{}
    window.location.reload(); // Removes previously loaded ad frames when withdrawing.
  }
  // Adsterra's standard snippets expect a normal browser document.
  // Never fetch or execute them before a visitor has opted in.
  function loadDisplayAds(){
    const bannerSection=document.getElementById("paktvBannerSection");
    const nativeSection=document.getElementById("paktvNativeSection");
    const bannerSlot=document.getElementById("paktvBannerSlot");
    const nativeSlot=document.getElementById("paktvNativeSlot");
    if(bannerSection && bannerSlot){
      bannerSection.hidden=false;
      bannerSlot.replaceChildren();
      const frame=document.createElement("iframe");
      frame.title="Sponsored banner — external advertising network";
      frame.className="privacy-ad-frame";
      frame.setAttribute("scrolling","no");
      frame.referrerPolicy="strict-origin-when-cross-origin";
      frame.style.width="468px";
      frame.style.height="68px";
      frame.style.border="0";
      frame.style.display="block";
      // This is a normal same-site document, not an opaque-origin srcdoc.
      // The official Adsterra snippet is parser-loaded in ad-banner.html.
      frame.src="./ad-banner.html";
      bannerSlot.appendChild(frame);
    }
    if(nativeSection && nativeSlot){
      nativeSection.hidden=false;
      nativeSlot.replaceChildren();
      // Native ads target this exact container ID; it must exist before
      // the asynchronously loaded Adsterra invoke.js executes.
      const target=document.createElement("div");
      target.id="container-8d58a68f4a6bcd33f948f07d9c5d0c85";
      nativeSlot.appendChild(target);
      const script=document.createElement("script");
      script.async=true;
      script.setAttribute("data-cfasync","false");
      script.src="https://pl31793698.profitableratecpmnetwork.com/8d58a68f4a6bcd33f948f07d9c5d0c85/invoke.js";
      script.onerror=()=>{
        // Network blocking or a rejected script is not a consent failure.
        if(!nativeSlot.querySelector(".ad-load-note")){
          const note=document.createElement("small");
          note.className="ad-load-note";
          note.textContent="This advertiser could not load (it may be blocked by your browser).";
          nativeSlot.appendChild(note);
        }
      };
      nativeSlot.appendChild(script);
    }
  }
  function loadExtraAds(){
    // The original separate ad script (often a click/popunder format) needs
    // access to normal page events, not a hidden 1px sandboxed iframe.
    // Only insert it for visitors who explicitly enabled this category.
    const script=document.createElement("script");
    script.async=true;
    script.src="https://pl31793699.profitableratecpmnetwork.com/9e/d2/5b/9ed25bbb75a6ead1d017f33f41e1dc2d.js";
    script.setAttribute("data-adsterra-extra","true");
    document.body.appendChild(script);
  }
  function loadGoogleAds(){
    // Google AdSense Auto ads: insert the exact publisher script only after
    // explicit Google advertising consent. The static publisher meta tag in
    // index.html is for site identification and does not load Google Ads.
    if(document.querySelector('script[data-paktv-adsense]'))return;
    const script=document.createElement("script");
    script.async=true;
    script.crossOrigin="anonymous";
    script.setAttribute("data-paktv-adsense","true");
    script.src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7935805760564580";
    document.head.appendChild(script);
  }
  function init(){
    const saved=choice();
    const root=document.createElement("div");
    root.innerHTML=[
      '<section id="paktvCookieBanner" class="privacy-banner" aria-label="Cookie and advertising choices" hidden>',
      '<div class="privacy-banner-inner"><div class="privacy-message"><strong>Privacy &amp; Cookie Choices</strong>',
      '<p>PakTV Ghar remembers your settings. With your permission, Google AdSense and Adsterra may use cookies or device data for advertising; some extra Adsterra promotions may open windows. All advertising is optional. You can browse movies and shows without it. <a href="./privacy.html">Privacy &amp; Cookies Policy</a>.</p>',
      '</div><div class="privacy-buttons">',
      '<button class="privacy-btn privacy-secondary" id="privacyReject" type="button">Reject optional</button>',
      '<button class="privacy-btn privacy-primary" id="privacyAccept" type="button">Accept all</button>',
      '<button class="privacy-btn privacy-outline" id="privacyCustomize" type="button">Choose settings</button>',
      '</div></div></section>',
      '<div id="privacyBackdrop" class="privacy-dialog-backdrop" hidden><section id="privacyDialog" class="privacy-dialog" tabindex="-1" role="dialog" aria-modal="true" aria-labelledby="privacyDialogTitle">',
      '<div class="privacy-dialog-head"><h2 id="privacyDialogTitle">Your privacy settings</h2><button class="privacy-close" id="privacyClose" type="button" aria-label="Close settings">✕</button></div>',
      '<p>Choose which optional advertising services this website can load. Neither option is required to watch programmes. Change your mind using Cookie settings in the footer.</p>',
      '<div class="privacy-choice"><div><strong>Essential local preferences</strong><small>Consent choice, and preferences you choose to save, such as favourites and language.</small></div><span class="privacy-required">Always on</span></div>',
      '<label class="privacy-choice" for="privacyAdsCheck"><div><strong>Display advertising</strong><small>Adsterra native and banner ads. Providers may use cookies and device information.</small></div><input id="privacyAdsCheck" type="checkbox" aria-label="Allow display advertising"></label>',
      '<label class="privacy-choice" for="privacyGoogleCheck"><div><strong>Google AdSense advertising</strong><small>Optional Google Auto ads. Google and its advertising partners may use cookies, identifiers and device information. Requires additional certified consent controls for personalised ads in some regions.</small></div><input id="privacyGoogleCheck" type="checkbox" aria-label="Allow Google AdSense advertising"></label>',
      '<label class="privacy-choice" for="privacyExtraCheck"><div><strong>Additional advertising script</strong><small>Separate optional advertising code that may display promotions or open additional advertising windows.</small></div><input id="privacyExtraCheck" type="checkbox" aria-label="Allow additional advertising script"></label>',
      '<p class="privacy-gpc-note" id="privacyGPC" hidden>Your browser has Global Privacy Control enabled. Optional advertising stays off.</p>',
      '<p class="privacy-fine">Playing embedded YouTube videos may contact YouTube; this is separate from advertising choices. Read the <a href="./privacy.html">full privacy policy</a>.</p>',
      '<div class="privacy-dialog-actions"><button class="privacy-btn privacy-secondary" id="privacyModalReject" type="button">Reject optional</button>',
      '<button class="privacy-btn privacy-primary" id="privacySave" type="button">Save my choices</button></div></section></div>'
    ].join("");
    document.body.appendChild(root);
    const get=id=>document.getElementById(id);
    const banner=get("paktvCookieBanner"),backdrop=get("privacyBackdrop"),dialog=get("privacyDialog");
    const ads=get("privacyAdsCheck"),extra=get("privacyExtraCheck"),googleAds=get("privacyGoogleCheck");
    let previous=null;
    function open(){
      previous=document.activeElement;
      ads.checked=!GPC&&!!saved?.ads;
      extra.checked=!GPC&&!!saved?.extra;
      googleAds.checked=!GPC&&!!saved?.googleAds;
      ads.disabled=GPC;extra.disabled=GPC;googleAds.disabled=GPC;
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
    get("privacyReject").addEventListener("click",()=>save(false,false,false));
    get("privacyAccept").addEventListener("click",()=>save(true,true,true));
    get("privacyCustomize").addEventListener("click",open);
    get("privacyModalReject").addEventListener("click",()=>save(false,false));
    get("privacySave").addEventListener("click",()=>save(ads.checked,extra.checked,googleAds.checked));
    get("privacyClose").addEventListener("click",close);
    backdrop.addEventListener("click",event=>{if(event.target===backdrop)close();});
    dialog.addEventListener("keydown",event=>{
      if(event.key==="Escape"){close();return;}
      if(event.key!=="Tab")return;
      const focusable=[...dialog.querySelectorAll("button:not([disabled]),input:not([disabled]),a[href]")];
      const first=focusable[0],last=focusable[focusable.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    });
    document.querySelectorAll("[data-privacy-settings]").forEach(x=>x.addEventListener("click",open));
    if(!saved)banner.hidden=false;
    if(!GPC&&saved?.ads)loadDisplayAds();
    if(!GPC&&saved?.extra)loadExtraAds();
    if(!GPC&&saved?.googleAds)loadGoogleAds();
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();