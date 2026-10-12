/* Consent-first PakTV Ghar ad manager. No ad network requests before opt-in. */
(() => {
  "use strict";
  const KEY = "pgh_consent_v1";
  const VERSION = 1;
  const AGE = 180 * 24 * 60 * 60 * 1000;
  const GPC = navigator.globalPrivacyControl === true;
  function choice() {
    try {
      const v=JSON.parse(localStorage.getItem(KEY)||"null");
      if(!v||v.version!==VERSION||!v.date||!Number.isFinite(Date.parse(v.date))||
         Date.now()-Date.parse(v.date)>AGE||Date.parse(v.date)>Date.now()+60000)return null;
      return {ads:v.ads===true,extra:v.extra===true};
    } catch{return null;}
  }
  function save(ads,extra) {
    try {
      localStorage.setItem(KEY,JSON.stringify({version:VERSION,date:new Date().toISOString(),
        ads:!GPC&&!!ads,extra:!GPC&&!!extra}));
    }catch{}
    window.location.reload(); // Removes previously loaded ad frames when withdrawing.
  }
  function mountFrame(host,markup,height,wide) {
    if(!host)return;
    const iframe=document.createElement("iframe");
    iframe.title="Third-party sponsored advertisement";
    iframe.className="privacy-ad-frame";
    iframe.loading="lazy";
    iframe.referrerPolicy="strict-origin-when-cross-origin";
    iframe.setAttribute("sandbox","allow-scripts allow-popups");
    iframe.style.width=wide?"468px":"100%";
    iframe.style.maxWidth=wide?"none":"100%";
    iframe.style.height=height+"px";
    iframe.style.border="0";
    iframe.srcdoc='<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;overflow:hidden;background:transparent">'+markup+'</body></html>';
    host.replaceChildren(iframe);
  }
  function loadDisplayAds(){
    const top=document.getElementById("paktvBannerSection");
    const bottom=document.getElementById("paktvNativeSection");
    if(top)top.hidden=false;
    if(bottom)bottom.hidden=false;
    const banner='<script>var atOptions={key:"ac85365b8166d90133c08c7e2e7eccec",format:"iframe",height:60,width:468,params:{}};<\/script>'+
      '<script src="https://www.highrevenueformat.com/ac85365b8166d90133c08c7e2e7eccec/invoke.js"><\/script>';
    const native='<script async="async" data-cfasync="false" src="https://pl31793698.profitableratecpmnetwork.com/8d58a68f4a6bcd33f948f07d9c5d0c85/invoke.js"><\/script>'+
      '<div id="container-8d58a68f4a6bcd33f948f07d9c5d0c85"></div>';
    mountFrame(document.getElementById("paktvBannerSlot"),banner,66,true);
    mountFrame(document.getElementById("paktvNativeSlot"),native,260,false);
  }
  function loadExtraAds(){
    const host=document.createElement("div");
    host.className="privacy-extra-ad";
    host.setAttribute("aria-hidden","true");
    document.body.appendChild(host);
    mountFrame(host,'<script src="https://pl31793699.profitableratecpmnetwork.com/9e/d2/5b/9ed25bbb75a6ead1d017f33f41e1dc2d.js"><\/script>',1,false);
  }
  function init(){
    const saved=choice();
    const root=document.createElement("div");
    root.innerHTML=[
      '<section id="paktvCookieBanner" class="privacy-banner" aria-label="Cookie and advertising choices" hidden>',
      '<div class="privacy-banner-inner"><div class="privacy-message"><strong>Privacy &amp; Cookie Choices</strong>',
      '<p>PakTV Ghar remembers your settings. With permission, third-party advertising providers (Adsterra) may use cookies and device data. Advertising is optional and the shows remain available if you refuse. <a href="./privacy.html">Privacy &amp; Cookies Policy</a>.</p>',
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
      '<label class="privacy-choice" for="privacyExtraCheck"><div><strong>Additional advertising script</strong><small>Separate optional advertising code that may display promotions or open additional advertising windows.</small></div><input id="privacyExtraCheck" type="checkbox" aria-label="Allow additional advertising script"></label>',
      '<p class="privacy-gpc-note" id="privacyGPC" hidden>Your browser has Global Privacy Control enabled. Optional advertising stays off.</p>',
      '<p class="privacy-fine">Playing embedded YouTube videos may contact YouTube; this is separate from advertising choices. Read the <a href="./privacy.html">full privacy policy</a>.</p>',
      '<div class="privacy-dialog-actions"><button class="privacy-btn privacy-secondary" id="privacyModalReject" type="button">Reject optional</button>',
      '<button class="privacy-btn privacy-primary" id="privacySave" type="button">Save my choices</button></div></section></div>'
    ].join("");
    document.body.appendChild(root);
    const get=id=>document.getElementById(id);
    const banner=get("paktvCookieBanner"),backdrop=get("privacyBackdrop"),dialog=get("privacyDialog");
    const ads=get("privacyAdsCheck"),extra=get("privacyExtraCheck");
    let previous=null;
    function open(){
      previous=document.activeElement;
      ads.checked=!GPC&&!!saved?.ads;
      extra.checked=!GPC&&!!saved?.extra;
      ads.disabled=GPC;extra.disabled=GPC;
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
    get("privacyReject").addEventListener("click",()=>save(false,false));
    get("privacyAccept").addEventListener("click",()=>save(true,true));
    get("privacyCustomize").addEventListener("click",open);
    get("privacyModalReject").addEventListener("click",()=>save(false,false));
    get("privacySave").addEventListener("click",()=>save(ads.checked,extra.checked));
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
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();