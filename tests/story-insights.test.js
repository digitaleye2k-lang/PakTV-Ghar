const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");

const app=fs.readFileSync("site-app.js","utf8");
const from=app.indexOf("function autoStoryNotes(");
const to=app.indexOf("function storyInsightMarkup(",from);
assert(from>=0&&to>from,"Story summary function must exist");
const scope={pickVideo:()=>null};
vm.runInNewContext(app.slice(from,to)+"\nthis.story=autoStoryNotes;",scope,
  {filename:"site-story-extract.js",timeout:3000});
const summary=scope.story;

let out=summary({
 id:"2FKJLBp20OI",category:"dramas",title:"Aangan Episode 04 - Highlight",
 channel:"HUM TV",durationSeconds:300,
 description:"Thanks for watching Har Pal Geo. Please click here to Subscribe.\nA family discovers a long-kept secret before a wedding."
});
assert(out.summary.includes("long-kept secret"),"A real publisher synopsis should appear");
assert(!/subscribe|thanks for watching/i.test(out.summary),"Promotional language must be removed");
assert(/shorter scene|highlight/i.test(out.review),"Short highlights need a relevant viewing guide");
out=summary({
 id:"2FKJLBp20OI",category:"movies",title:"Pakistani Movie - Full Film",
 channel:"Official Movies",durationSeconds:7200,
 description:"Subscribe to our channel! Follow us on social media."
});
assert(out.summary.includes("does not currently include a verified story synopsis"),
  "Do not invent the plot when only promotions are available");
assert(out.review.includes("2h"),"Movie guidance should use its listed runtime");
assert(!/amazing acting|five stars|masterpiece/i.test(out.review),
  "Do not fabricate a watched critical review");
console.log("Automated story synopsis and watch guide: publisher, promo and fallback checks passed");
