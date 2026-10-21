const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const code = fs.readFileSync("cookie-consent.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");
const banner = fs.readFileSync("ad-banner.html", "utf8");
assert(!/<script[^>]+src=["']https:\/\/(?:pl3179369|www\.highrevenueformat)/i.test(html),
       "Do not include vendor script tags directly on the site before consent");
assert(banner.includes("496d9513280ec1abea29f69a25c35fa8"));
assert(banner.includes("highrevenueformat.com"));
assert(html.includes('name="google-adsense-account" content="ca-pub-7935805760564580"'));
assert(!html.includes('<script async src="https://pagead2.googlesyndication.com'),"Google script must remain consent-gated");

function run(choice, globalPrivacyControl=false) {
  const nodes = {}, all = [];
  function element(tag="div",id="") {
    const node = {
      tag,id,hidden:true,children:[],style:{},attributes:{},listeners:{},
      appendChild(child){this.children.push(child);return child},
      append(...children){this.children.push(...children)},
      replaceChildren(...children){this.children=children},
      setAttribute(key,value){this.attributes[key]=value},
      addEventListener(type,callback){this.listeners[type]=callback},
      querySelector(){return null}, focus(){},
    };
    all.push(node);
    return node;
  }
  for(const id of ["paktvCookieBanner","privacyBackdrop","privacyDialog",
    "privacyAdsCheck","privacyExtraCheck","privacyGoogleCheck","privacyGPC","privacyReject",
    "privacyAccept","privacyCustomize","privacyModalReject","privacySave",
    "privacyClose","paktvBannerSection","paktvNativeSection",
    "paktvBannerSlot","paktvNativeSlot"]) nodes[id]=element("div",id);
  const document = {
    readyState:"complete",activeElement:null,body:element("body"),head:element("head"),
    querySelector:()=>null,
    addEventListener(){},
    createElement:tag=>element(tag),
    getElementById:id=>nodes[id],
    querySelectorAll:()=>[]
  };
  const localStorage = {
    getItem:()=>choice===null?null:JSON.stringify({
      version:2,date:new Date().toISOString(),ads:choice.ads,extra:choice.extra,googleAds:choice.googleAds}),
    setItem(){}
  };
  const timers=[];
  const window = { location:{reload(){}},setTimeout:(fn,delay)=>{timers.push({fn,delay});return timers.length} };
  const sessionStorage = {getItem:()=>null,setItem(){} };
  class MutationObserver { observe(){} disconnect(){} }

  vm.runInNewContext(code, {document,localStorage,sessionStorage,MutationObserver,navigator:{globalPrivacyControl},window},
    {timeout:3000,filename:"cookie-consent.js"});
  return {
    adScripts:all.filter(el=>el.tag==="script").map(el=>el.src).filter(Boolean),
    bannerFrames:all.filter(el=>el.tag==="iframe").map(el=>el.src).filter(Boolean),
    banner:!nodes.paktvBannerSection.hidden,
    native:!nodes.paktvNativeSection.hidden,
    consent:!nodes.paktvCookieBanner.hidden,
    timers,
    target:all.some(el=>el.id==="container-f2f16d24ca9a3049cd4688257eb5b256")
  };
}
let first=run(null);
assert.equal(first.adScripts.length,0);
assert.equal(first.bannerFrames.length,0);
assert(first.consent);
let refused=run({ads:false,extra:false});
assert.equal(refused.adScripts.length,0);
assert.equal(refused.bannerFrames.length,0);
assert(!refused.native);
let display=run({ads:true,extra:false});
assert.equal(display.adScripts.length,1);
assert(display.adScripts[0].includes("pl31906516.profitableratecpmnetwork.com"));
assert.deepEqual(display.bannerFrames,["./ad-banner.html"]);
assert(display.native&&display.banner&&display.target);
let googleOnly=run({ads:false,extra:false,googleAds:true});
assert.equal(googleOnly.adScripts.length,1);
assert(googleOnly.adScripts[0].includes("pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7935805760564580"));
assert.equal(googleOnly.bannerFrames.length,0);
assert(!googleOnly.native);
let all=run({ads:true,extra:true});
assert.equal(all.adScripts.length,1, "Social Bar is delayed, and redirect scripts must not load");
assert.equal(all.timers.length,1);
assert(all.timers[0].delay > 0 && all.timers[0].delay <= 20*60*1000);
let gpc=run({ads:true,extra:true,googleAds:true},true);
assert.equal(gpc.adScripts.length,0);
assert.equal(gpc.bannerFrames.length,0);
console.log("Consent ad loader: six scenarios passed, including opt-in Google AdSense");
