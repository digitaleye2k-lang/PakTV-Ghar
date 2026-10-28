const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const consent=fs.readFileSync("cookie-consent.js","utf8");
const home=fs.readFileSync("index.html","utf8");
assert(home.includes('name="google-adsense-account" content="ca-pub-7935805760564580"'));
assert(!fs.existsSync("ad-banner.html")&&!fs.existsSync("ad-side.html"),"Former Adsterra iframe documents must be removed");
assert(!/profitableratecpmnetwork|highrevenueformat|adsterra/i.test(consent),"Old ad network is not allowed in consent script");
assert(!/paktvBannerSection|paktvNativeSection|sponsored-link/i.test(home),"Former ad slots must be gone");
assert(!home.includes('<script async src="https://pagead2.googlesyndication.com'),"AdSense must be consent-gated");
function run(saved=null,gpc=false,page="/index.html"){
 const all=[],nodes={},writes=[];
 function element(tag="div",id=""){
  const node={tag,id,hidden:true,checked:false,disabled:false,children:[],style:{},listeners:{},
    classList:{add(){},remove(){}},
    setAttribute(key,val){this[key]=val},
    appendChild(child){this.children.push(child);return child},
    append(...children){this.children.push(...children)},
    replaceChildren(...children){this.children=children},
    addEventListener(type,fn){this.listeners[type]=fn},
    querySelectorAll(){return []},querySelector(){return null},focus(){}};
  all.push(node);return node;
 }
 for(const id of ["paktvCookieBanner","privacyBackdrop","privacyDialog","privacyGoogleCheck",
  "privacyGPC","privacyReject","privacyAccept","privacyCustomize",
  "privacyModalReject","privacySave","privacyClose"])nodes[id]=element("div",id);
 const document={readyState:"complete",activeElement:null,body:element("body"),head:element("head"),
   querySelector:()=>null,querySelectorAll:()=>[],createElement:t=>element(t),getElementById:id=>nodes[id],addEventListener(){}};
 const storage={getItem:()=>saved?JSON.stringify({...saved,date:new Date().toISOString()}):null,
   setItem:(k,v)=>writes.push({key:k,value:JSON.parse(v)})};
 let reloads=0;
 const window={location:{pathname:page,reload(){reloads++}}};
 vm.runInNewContext(consent,{document,window,localStorage:storage,navigator:{globalPrivacyControl:gpc}},
  {timeout:3000,filename:"cookie-consent.js"});
 return {nodes,all,writes,reloads:()=>reloads,scripts:all.filter(n=>n.tag==="script").map(n=>n.src).filter(Boolean)};
}
const first=run();
assert.equal(first.scripts.length,0);
assert.equal(first.nodes.paktvCookieBanner.hidden,false);
const rejected=run({version:3,googleAds:false});
assert.equal(rejected.scripts.length,0);
assert.equal(rejected.nodes.paktvCookieBanner.hidden,true);
const accepted=run({version:3,googleAds:true});
assert.equal(accepted.scripts.length,1);
assert.equal(accepted.scripts[0],"https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7935805760564580");
assert.equal(accepted.nodes.paktvCookieBanner.hidden,true);
const old=run({version:2,ads:true,extra:true,googleAds:true});
assert.equal(old.scripts.length,0,"Old consent must not authorize a new ad provider setup");
assert.equal(old.nodes.paktvCookieBanner.hidden,false);
const gpc=run({version:3,googleAds:true},true);
assert.equal(gpc.scripts.length,0);
const kids=run({version:3,googleAds:true},false,"/kids.html");
assert.equal(kids.scripts.length,0);
const clicking=run();
clicking.nodes.privacyAccept.listeners.click();
assert.equal(clicking.writes[0].value.googleAds,true);
assert.equal(clicking.writes[0].value.version,3);
assert.equal(clicking.reloads(),1);
const withdrawing=run({version:3,googleAds:true});
withdrawing.nodes.privacyReject.listeners.click();
assert.equal(withdrawing.writes[0].value.googleAds,false);
assert.equal(withdrawing.reloads(),1);
console.log("Google AdSense consent loader: eight scenarios passed; no Adsterra scripts or slots");
