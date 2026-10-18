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
      // Chat and contact forms must never be readable from advertiser scripts.
      if(document.body?.dataset?.paktvBannerOnly==="yes")
        frame.setAttribute("sandbox","allow-scripts allow-popups");
      frame.style.width="728px";
      frame.style.height="100px";
      frame.style.border="0";
      frame.style.display="block";
      // This is a normal same-site document, not an opaque-origin srcdoc.
      // The official Adsterra snippet is parser-loaded in ad-banner.html.
      frame.src="./ad-banner.html";
      bannerSlot.appendChild(frame);
    }
    if(nativeSection && nativeSlot && document.body?.dataset?.paktvBannerOnly!=="yes"){
      nativeSection.hidden=false;
      nativeSlot.replaceChildren();
      // Native ads target this exact container ID; it must exist before
      // the asynchronously loaded Adsterra invoke.js executes.
      const target=document.createElement("div");
      target.id="container-f2f16d24ca9a3049cd4688257eb5b256";
      nativeSlot.appendChild(target);
      const script=document.createElement("script");
      script.async=true;
      script.setAttribute("data-cfasync","false");
      script.src="https://pl31906516.profitableratecpmnetwork.com/f2f16d24ca9a3049cd4688257eb5b256/invoke.js";
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
    // Do not load the popunder/direct-navigation script: it can take
    // visitors away from the site without an intentional ad click.
    // Keep the separate Social Bar optional and delay it for 20 minutes
    // from the start of this tab's browsing session.
    const WAIT=20*60*1000, KEY="pgh_extra_ads_session_start";
    let start=Date.now();
    try{
      const stored=Number(sessionStorage.getItem(KEY));
      if(Number.isFinite(stored)&&stored>0&&stored<=Date.now())start=stored;
      else sessionStorage.setItem(KEY,String(start));
    }catch{}
    function loadSocial(){
      if(document.querySelector('script[data-adsterra-social]'))return;
      // Recheck latest consent before loading after a long-running timer.
      const current=choice();
      if(GPC||!current?.extra||document.body?.dataset?.paktvExtraAds==="no"||
        document.body?.dataset?.paktvBannerOnly==="yes")return;
      const social=document.createElement("script");
      social.async=true;
      social.src="https://pl31906518.profitableratecpmnetwork.com/ff/fa/b4/fffab493e7b49c6ce9105c26081329de.js";
      social.setAttribute("data-adsterra-social","true");
      document.body.appendChild(social);
    }
    const remaining=Math.max(0,WAIT-(Date.now()-start));
    if(remaining)window.setTimeout(loadSocial,remaining);
    else loadSocial();
  }

  // A single optional 160x600 placement follows the active video player or DJ.
  // Never create it without display-ad consent; close/removal unloads its iframe.
  function installSideAd(){
    if(document.body?.dataset?.paktvBannerOnly==="yes")return;
    const css=document.createElement("style");
    css.textContent=`
      .paktv-side-ad{position:fixed;z-index:105;width:160px;height:626px;
        display:flex;flex-direction:column;align-items:center;gap:6px;
        pointer-events:auto}
      .paktv-side-ad span{font:600 10px system-ui,sans-serif;letter-spacing:.1em;
        color:#d9dfe4;text-transform:uppercase;text-shadow:0 1px 5px #000}
      .paktv-side-ad iframe{display:block;width:160px;height:600px;border:0;background:transparent}
      .paktv-side-ad[data-location="player"]{right:12px;top:50%;transform:translateY(-50%)}
      .paktv-side-ad[data-location="dj"]{right:238px;bottom:18px}
      .paktv-side-ad[data-location="music"]{right:12px;top:50%;transform:translateY(-50%)}
      @media(max-width:1390px){.paktv-side-ad[data-location="player"]{display:none}}
      @media(max-width:1150px){.paktv-side-ad[data-location="music"]{display:none}}
      @media(max-width:680px){.paktv-side-ad[data-location="dj"]{display:none}}
    `;
    document.head.append(css);
    let ad=null,place="",musicPlaying=false;
    document.addEventListener("paktv:music-video-play",()=>{musicPlaying=true;sync();});
    document.addEventListener("paktv:radio-play",()=>{musicPlaying=false;sync();});
    function sync(){
      const player=document.getElementById("playerOverlay");
      const playerOpen=!!player&&!player.hidden;
      const dj=document.querySelector(".classic-dj-float");
      const musicPlayer=document.getElementById("musicPlayer");
      const hasMusic=!!musicPlayer?.querySelector("iframe");
      const target=playerOpen?"player":dj?"dj":musicPlaying&&hasMusic?"music":"";
      if(target===place&&ad?.isConnected)return;
      if(ad){ad.remove();ad=null;}
      place=target;
      if(!target)return;
      ad=document.createElement("aside");
      ad.className="paktv-side-ad";ad.dataset.location=target;
      ad.setAttribute("aria-label","Sponsored advertisement");
      const label=document.createElement("span");label.textContent="Advertisement";
      const frame=document.createElement("iframe");
      frame.title="160 by 600 sponsored advertisement";
      frame.loading="lazy";frame.referrerPolicy="strict-origin-when-cross-origin";
      frame.setAttribute("scrolling","no");
      frame.src="./ad-side.html";
      ad.append(label,frame);document.body.append(ad);
    }
    const observer=new MutationObserver(sync);
    observer.observe(document.body,{childList:true,subtree:false,attributes:true,attributeFilter:["hidden"]});
    const player=document.getElementById("playerOverlay");
    if(player)observer.observe(player,{attributes:true,attributeFilter:["hidden"]});
    sync();
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
  function standaloneAdSlots(){
    // Main TV pages already include these slots. Other adult-oriented static
    // pages opt in explicitly using data-paktv-auto-ads="yes" on their body.
    if(document.body?.dataset?.paktvAutoAds!=="yes" ||
       document.getElementById("paktvBannerSection"))return;
    const main=document.querySelector("main");
    if(!main||!main.parentNode)return;
    function section(id,label,slotId,isTop){
      const node=document.createElement("section");
      node.id=id;node.className="ad-placement "+(isTop?"ad-placement-top":"ad-placement-bottom");
      node.setAttribute("aria-label",label);
      node.hidden=true;
      const caption=document.createElement("span");caption.className="ad-label";
      caption.textContent=isTop?"Advertisement":"Sponsored advertisement";
      const frame=document.createElement("div");
      frame.className=isTop?"ad-banner-scroll":"ad-native-slot";
      const slot=document.createElement("div");slot.id=slotId;
      if(isTop)slot.className="ad-banner-fixed";
      frame.appendChild(slot);node.append(caption,frame);
      return node;
    }
    main.parentNode.insertBefore(section("paktvBannerSection","Advertisement","paktvBannerSlot",true),main);
    main.parentNode.insertBefore(section("paktvNativeSection","Sponsored content","paktvNativeSlot",false),main.nextSibling);
  }
  function init(){
    // No advertising manager, tracking or optional ad scripts on children's pages.
    const name=String(window.location?.pathname||"").split("/").pop();
    if(/^(kids|waggle-play|waggle-workshop)\.html$/i.test(name))return;
    standaloneAdSlots();
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
    if(!GPC&&saved?.ads){loadDisplayAds();installSideAd();}
    if(!GPC&&saved?.extra&&document.body?.dataset?.paktvExtraAds!=="no"&&
       document.body?.dataset?.paktvBannerOnly!=="yes")loadExtraAds();
    if(!GPC&&saved?.googleAds&&document.body?.dataset?.paktvBannerOnly!=="yes")loadGoogleAds();
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();