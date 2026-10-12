const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const code = fs.readFileSync("cookie-consent.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");
const banner = fs.readFileSync("ad-banner.html", "utf8");
assert(!/<script[^>]+src=["']https:\/\/(?:pl3179369|www\.highrevenueformat)/i.test(html),
       "Do not include vendor script tags directly on the site before consent");
assert(banner.includes("ac85365b8166d90133c08c7e2e7eccec"));
assert(banner.includes("highrevenueformat.com"));

function run(choice, globalPrivacyControl=false) {
  const nodes = {}, all = [];
  function element(tag="div",id="") {
    const node = {
      tag,id,hidden:true,children:[],style:{},attributes:{},listeners:{},
      appendChild(child){this.children.push(child);return child},
      replaceChildren(...children){this.children=children},
      setAttribute(key,value){this.attributes[key]=value},
      addEventListener(type,callback){this.listeners[type]=callback},
      querySelector(){return null}, focus(){},
    };
    all.push(node);
    return node;
  }
  for(const id of ["paktvCookieBanner","privacyBackdrop","privacyDialog",
    "privacyAdsCheck","privacyExtraCheck","privacyGPC","privacyReject",
    "privacyAccept","privacyCustomize","privacyModalReject","privacySave",
    "privacyClose","paktvBannerSection","paktvNativeSection",
    "paktvBannerSlot","paktvNativeSlot"]) nodes[id]=element("div",id);
  const document = {
    readyState:"complete",activeElement:null,body:element("body"),
    createElement:tag=>element(tag),
    getElementById:id=>nodes[id],
    querySelectorAll:()=>[]
  };
  const localStorage = {
    getItem:()=>choice===null?null:JSON.stringify({
      version:1,date:new Date().toISOString(),ads:choice.ads,extra:choice.extra}),
    setItem(){}
  };
  const window = { location:{reload(){}} };
  vm.runInNewContext(code, {document,localStorage,navigator:{globalPrivacyControl},window},
    {timeout:3000,filename:"cookie-consent.js"});
  return {
    adScripts:all.filter(el=>el.tag==="script").map(el=>el.src).filter(Boolean),
    bannerFrames:all.filter(el=>el.tag==="iframe").map(el=>el.src).filter(Boolean),
    banner:!nodes.paktvBannerSection.hidden,
    native:!nodes.paktvNativeSection.hidden,
    consent:!nodes.paktvCookieBanner.hidden,
    target:all.some(el=>el.id==="container-8d58a68f4a6bcd33f948f07d9c5d0c85")
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
assert(display.adScripts[0].includes("pl31793698.profitableratecpmnetwork.com"));
assert.deepEqual(display.bannerFrames,["./ad-banner.html"]);
assert(display.native&&display.banner&&display.target);
let all=run({ads:true,extra:true});
assert.equal(all.adScripts.length,2);
assert(all.adScripts.some(x=>x.includes("pl31793699.profitableratecpmnetwork.com")));
let gpc=run({ads:true,extra:true},true);
assert.equal(gpc.adScripts.length,0);
assert.equal(gpc.bannerFrames.length,0);
console.log("Consent ad loader: five scenarios passed");
