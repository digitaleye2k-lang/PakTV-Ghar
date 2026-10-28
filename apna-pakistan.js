/* Apna Pakistan — local cultural guides, celebration dates and a family quiz. */
(()=>{"use strict";
const festivals=[
{id:"pakistan-day",title:"Pakistan Day",emoji:"🇵🇰",category:"national",date:"23 March · every year",dateRule:"march23",colors:["#12674f","#489d7b"],summary:"A national day to reflect on Pakistan's history and the Lahore Resolution of 1940.",details:"Pakistan Day is marked on 23 March. Families and communities may follow commemorations, enjoy patriotic songs and talk about the country's history.",ideas:["Explore Pakistan's history through family stories and photographs.","Make a traditional breakfast and watch official celebrations together.","Visit Yaadein for a nostalgic look at Pakistani television."],link:"./yaadein.html",linkTitle:"Explore Yaadein"},
{id:"independence",title:"Independence Day",emoji:"🎆",category:"national",date:"14 August · every year",dateRule:"aug14",colors:["#0c7046","#54a86e"],summary:"A day of green-and-white flags, family gatherings and pride in Pakistan's many voices.",details:"Pakistan celebrates Independence Day on 14 August. Streets, homes and public spaces may be decorated in green and white, with music and cultural programmes.",ideas:["Put together a green-and-white family gathering.","Listen to patriotic music and share stories from older generations.","Celebrate with a regional dish or family favourite."],link:"./desi-zaika.html",linkTitle:"Cook a celebratory meal"},
{id:"iqbal",title:"Allama Iqbal Day",emoji:"📚",category:"national",date:"9 November · every year",dateRule:"nov9",colors:["#3e6546","#9e8c5a"],summary:"Remember the poetry and ideas of Allama Muhammad Iqbal.",details:"Observed on 9 November, Iqbal Day invites people to explore poetry, language, literature and Pakistan's intellectual heritage.",ideas:["Read an age-appropriate Iqbal poem together.","Ask family which Urdu or regional-language poems they remember.","Host a little poetry evening with chai."],link:"./gupshup.html",linkTitle:"Talk literature in GUPSHUP"},
{id:"quaid",title:"Quaid-e-Azam Day",emoji:"📜",category:"national",date:"25 December · every year",dateRule:"dec25",colors:["#316756","#73894c"],summary:"Remember Muhammad Ali Jinnah and the founding of Pakistan.",details:"Quaid-e-Azam Day falls on 25 December, which is also Christmas Day. The day provides an opportunity to learn about the country's founding and reflect on history.",ideas:["Explore photographs, timelines and family memories from early Pakistan.","Talk about the diverse communities that make Pakistan home.","Enjoy a quiet family reading or documentary evening."],link:"./yaadein.html",linkTitle:"Explore historic memories"},
{id:"ramadan",title:"Ramadan",emoji:"🌙",category:"family",date:"Lunar calendar · dates vary",colors:["#326154","#94704b"],summary:"A month of fasting, reflection and community for Muslims, often filled with family iftars.",details:"During Ramadan, many Muslim households gather for iftar and sehri, share food and support neighbours. Practices differ between families and communities.",ideas:["Prepare a traditional iftar with dates, fruit chaat or pakoras.","Share food with neighbours or support a local charity.","Ask older relatives about the Ramadan traditions they grew up with."],link:"./desi-zaika.html",linkTitle:"Find iftar recipes"},
{id:"eid-fitr",title:"Eid-ul-Fitr",emoji:"🌟",category:"family",date:"After Ramadan · moon sighting",colors:["#246850","#ac8d4e"],summary:"A celebration of togetherness, generosity, new clothes and sweet family treats.",details:"Eid-ul-Fitr marks the end of Ramadan. Visits, greetings, prayers and family meals are central to many celebrations; customs differ from home to home.",ideas:["Make sheer khurma, seviyan or another favourite dessert.","Exchange Eid greetings with loved ones near and far.","Capture a family photograph to add to your personal Yaadein diary."],link:"./desi-zaika.html",linkTitle:"Explore Eid sweets"},
{id:"eid-adha",title:"Eid-ul-Adha",emoji:"🕌",category:"family",date:"Lunar calendar · moon sighting",colors:["#315d66","#827247"],summary:"A festival of faith, generosity, family meals and sharing with others.",details:"Eid-ul-Adha is celebrated by Muslims worldwide. Prayer, charity and sharing food with relatives and people in need are important aspects for many families.",ideas:["Cook a favourite family meat or vegetable dish.","Share food with neighbours and relatives.","Talk about the importance of generosity and care for others."],link:"./desi-zaika.html",linkTitle:"Explore family recipes"},
{id:"christmas",title:"Christmas in Pakistan",emoji:"🎄",category:"family",date:"25 December · every year",dateRule:"dec25",colors:["#42644b","#974e4e"],summary:"Christian families and communities celebrate with worship, music, visits and meals.",details:"Christmas is celebrated by Pakistani Christian communities on 25 December. Church services, carols, decorations and family gatherings are among the traditions.",ideas:["Learn about festive foods and celebrations across different communities.","Share seasonal greetings with friends and neighbours.","Listen to family memories about winter celebrations."],link:"./gupshup.html",linkTitle:"Share a celebration story"},
{id:"sindhi-culture",title:"Sindhi Culture Day",emoji:"🧣",category:"culture",date:"First Sunday of December",dateRule:"sindhiDec",colors:["#925143","#c18c53"],summary:"A joyful celebration of Sindhi language, Ajrak patterns, the Sindhi topi and folk arts.",details:"Sindhi Culture Day is widely marked on the first Sunday of December. Traditional clothing, music and Ajrak reflect pride in Sindh's heritage.",ideas:["Discover the shapes and colours of Ajrak textiles.","Listen to Sindhi poetry and folk music.","Cook Sindhi biryani or sai bhaji with Daadi."],link:"./desi-zaika.html",linkTitle:"Try Sindhi recipes"},
{id:"punjab-spring",title:"Punjab's Spring Traditions",emoji:"🪁",category:"culture",date:"Spring · regional dates vary",colors:["#796348","#b18c4f"],summary:"Seasonal colour, folk songs, dhol beats and farming traditions across Punjab.",details:"Spring has long been celebrated through song, colour and community events in Punjab. Kite traditions and any organised events are subject to local rules and safety restrictions.",ideas:["Listen to Punjabi folk songs and dhol rhythms.","Taste sarson ka saag with makki ki roti.","Enjoy spring flowers, crafts and family gatherings."],link:"./desi-zaika.html",linkTitle:"Discover Punjabi dishes"},
{id:"balochi-culture",title:"Balochi Heritage",emoji:"🧵",category:"culture",date:"Cultural gatherings · dates vary",colors:["#88523d","#b18457"],summary:"Celebrate hand embroidery, hospitality, storytelling and Balochi musical traditions.",details:"Balochistan's diverse communities are known for rich textile craftsmanship, regional music and storytelling. Cultural days and performances celebrate these living traditions.",ideas:["Look closely at patterns in Balochi embroidery.","Explore the history of sajji and other local foods.","Learn about traditional instruments and oral storytelling."],link:"./desi-zaika.html",linkTitle:"Try Balochi sajji"},
{id:"kalash",title:"Kalash Spring Festivals",emoji:"🌸",category:"culture",date:"Spring · local calendars vary",colors:["#326c59","#b69056"],summary:"Seasonal celebrations of the Kalash communities of Chitral.",details:"The Kalash valleys have distinctive seasonal festivals that include gatherings, music and dance. Traditions belong to the communities who maintain them; visitors should respect local customs.",ideas:["Read about the Kalash valleys and their cultural heritage.","Learn why protecting local languages and traditions matters.","Discover mountain-region music and crafts."],link:"./music.html",linkTitle:"Explore music"},
{id:"shandur",title:"Shandur Polo Festival",emoji:"🏇",category:"culture",date:"Summer · schedule varies",colors:["#3f6380","#50886f"],summary:"Mountain landscapes, polo and community traditions from northern Pakistan.",details:"The Shandur polo gathering has become well known for its high-altitude setting. The timing and programme can vary, so always check organisers for current dates.",ideas:["Learn about the northern regions and their landscapes.","Explore traditional music from mountain communities.","Watch publicly available cultural coverage from original broadcasters."],link:"./sports.html",linkTitle:"Explore Pakistani sports"},
{id:"vaisakhi",title:"Vaisakhi Traditions",emoji:"🌾",category:"culture",date:"April · regional observances",colors:["#78643c","#6e8950"],summary:"Harvest-season traditions and Sikh religious celebrations with deep roots in Punjab.",details:"Vaisakhi is meaningful for Sikh communities and is also connected with seasonal Punjabi harvest traditions. Observances reflect the region's diverse history.",ideas:["Explore Punjab's agricultural and cultural heritage.","Learn about the significance of historic gurdwaras.","Share stories about springtime family gatherings."],link:"./gupshup.html",linkTitle:"Share your memories"}
];
const regions=[
{id:"sindh",name:"Sindh",emoji:"🧣",label:"Ajrak · Poetry · Crafts",colors:["#7a4f3c","#b77a4a"],intro:"Ajrak, the Sindhi topi, Sufi poetry, storytelling and rich handicrafts.",detail:"Sindh's cultural traditions include Ajrak block-printed textiles, the Sindhi topi, poetry associated with Shah Abdul Latif Bhittai and a love of music and hospitality.",ideas:["Discover Ajrak craft traditions.","Try Sindhi biryani and sai bhaji.","Listen to Sindhi folk and Sufi music."]},
{id:"punjab",name:"Punjab",emoji:"🥁",label:"Dhol · Phulkari · Food",colors:["#466a42","#b3934d"],intro:"Punjabi folk rhythms, embroidery, lively gatherings and legendary hospitality.",detail:"Punjab brings together many forms of Punjabi folk music, dhol rhythms, traditional phulkari embroidery, poetry and beloved dishes such as saag and makki roti.",ideas:["Explore Punjabi folk music and poetry.","Cook saag, halwa or Lahori channay.","Learn about phulkari embroidery."]},
{id:"kpk",name:"Khyber Pakhtunkhwa",emoji:"⛰️",label:"Attan · Chapli Kebab · Crafts",colors:["#37646b","#759082"],intro:"Pashtun hospitality, traditional dance, woodwork and regional foods.",detail:"Khyber Pakhtunkhwa includes many communities and languages. Pashtun Attan dance, intricate craftwork, mountain landscapes and chapli kebab are among its well-known cultural touchpoints.",ideas:["Discover the Attan dance tradition.","Try chapli kebabs and regional bread.","Explore regional craft and language traditions."]},
{id:"balochistan",name:"Balochistan",emoji:"🧵",label:"Embroidery · Sajji · Heritage",colors:["#805640","#b08a56"],intro:"Distinctive embroidery, oral traditions, music and warm hospitality.",detail:"Balochistan contains many diverse communities. Hand embroidery, storytelling, regional languages and foods such as sajji are a vibrant part of its heritage.",ideas:["Look at traditional embroidery patterns.","Learn about Balochi and Brahui cultural expression.","Make a home-style sajji recipe."]},
{id:"gilgit",name:"Gilgit-Baltistan",emoji:"🏔️",label:"Mountains · Music · Polo",colors:["#336c76","#6b9a89"],intro:"Mountain hospitality, regional languages, festivals and musical heritage.",detail:"Gilgit-Baltistan's many valleys share traditions of music, crafts, polo and community celebrations, with distinct languages and customs across the region.",ideas:["Explore the Shandur polo tradition.","Learn about traditional woollen crafts.","Discover food and music from mountain valleys."]},
{id:"kashmir",name:"Kashmir",emoji:"🍵",label:"Crafts · Poetry · Chai",colors:["#3b6b5c","#8e8060"],intro:"A heritage of craftsmanship, regional music, beautiful textiles and tea traditions.",detail:"Kashmir's cultural heritage includes textile craftsmanship, poetry, regional food and special tea traditions such as Kashmiri chai. Practices vary across areas and communities.",ideas:["Make Kashmiri pink chai.","Explore shawl and woodcraft traditions.","Listen to local poetry and music."]}
];
const quiz=[
{question:"When is Pakistan's Independence Day?",answers:["23 March","14 August","25 December","9 November"],correct:1,why:"Pakistan celebrates Independence Day on 14 August."},
{question:"Which patterned textile is especially associated with Sindh?",answers:["Ajrak","Phulkari","Kashmiri shawl","Denim"],correct:0,why:"Ajrak is a distinctive block-printed textile associated with Sindhi heritage."},
{question:"Which dish is closely associated with the Peshawar region?",answers:["Chapli kebab","Sushi","Pizza","Pasta"],correct:0,why:"Chapli kebab is a well-known dish associated with Peshawar and the wider region."},
{question:"Which Pakistani national day falls on 23 March?",answers:["Pakistan Day","Independence Day","Iqbal Day","Christmas"],correct:0,why:"Pakistan Day is observed on 23 March."}
];
const $=id=>document.getElementById(id),eventsHost=$("apnaEvents"),regionsHost=$("apnaRegions"),modal=$("apnaModal"),modalBox=$("apnaModalContents");
const categoryNames={national:"🇵🇰 NATIONAL",family:"🌙 FAMILY & FAITH",culture:"🎨 CULTURE"};
let filter="all",lastFocused=null,quizIndex=0,score=0,answered=false;
function node(tag,content,className){const el=document.createElement(tag);if(content!==undefined)el.textContent=content;if(className)el.className=className;return el}
function showModal(item,isRegion=false){
  lastFocused=document.activeElement;modalBox.replaceChildren();
  modalBox.append(node("span",item.emoji,"apna-dialog-icon"),node("span",isRegion?"OUR REGIONAL HERITAGE":categoryNames[item.category],"apna-eyebrow"));
  const heading=node("h2",item.title||item.name);heading.id="apnaModalTitle";modalBox.append(heading,node("p",item.detail||item.details));
  if(!isRegion&&item.date)modalBox.append(node("p","📅 "+item.date));
  modalBox.append(node("h3","Explore this tradition"));
  const ul=document.createElement("ul");for(const idea of item.ideas||[])ul.append(node("li",idea));modalBox.append(ul);
  const link=node("a",isRegion?"🍛 Explore Pakistani food & music →":item.linkTitle+" →","apna-cta");
  link.href=isRegion?"./desi-zaika.html":item.link;modalBox.append(link);
  modal.hidden=false;document.body.style.overflow="hidden";$("apnaModalClose").focus();
}
function closeModal(){modal.hidden=true;document.body.style.overflow="";lastFocused?.focus()}
function renderEvents(){
  eventsHost.replaceChildren();const visible=festivals.filter(f=>filter==="all"||f.category===filter);
  for(const f of visible){
    const card=node("article",undefined,"apna-event");
    const banner=node("div",undefined,"apna-event-visual");banner.style.setProperty("--ev1",f.colors[0]);banner.style.setProperty("--ev2",f.colors[1]);banner.append(node("span",f.emoji,"apna-event-emoji"));
    const body=node("div",undefined,"apna-event-body");body.append(node("span",categoryNames[f.category]+" · "+f.date,"apna-event-meta"),node("h3",f.title),node("p",f.summary));
    const button=node("button","Discover the story →");button.type="button";button.addEventListener("click",()=>showModal(f));body.append(button);card.append(banner,body);eventsHost.append(card);
  }
  $("apnaResult").textContent=visible.length+" celebrations and cultural traditions to explore.";
}
function renderRegions(){for(const r of regions){
  const card=node("article",undefined,"apna-region"),top=node("div",undefined,"apna-region-top");
  top.style.setProperty("--r1",r.colors[0]);top.style.setProperty("--r2",r.colors[1]);
  top.append(node("span",r.emoji),node("small",r.label));
  const body=node("div",undefined,"apna-region-body");body.append(node("h3",r.name),node("p",r.intro));
  const button=node("button","Discover "+r.name+" →");button.type="button";button.addEventListener("click",()=>showModal(r,true));
  body.append(button);card.append(top,body);regionsHost.append(card);
}}
function updateUpcoming(){
  // Use Pakistan's calendar day; only fixed Gregorian dates are counted down.
  const parts=new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Karachi",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date());
  const getPart=name=>Number(parts.find(p=>p.type===name)?.value||0);
  const y=getPart("year"),now=Date.UTC(y,getPart("month")-1,getPart("day"));
  function firstSunday(year){const first=new Date(Date.UTC(year,11,1));return 1+(7-first.getUTCDay())%7}
  const upcoming=[];
  for(const year of [y,y+1])for(const f of festivals){
    let month,day;
    if(f.dateRule==="march23"){month=3;day=23}
    else if(f.dateRule==="aug14"){month=8;day=14}
    else if(f.dateRule==="nov9"){month=11;day=9}
    else if(f.dateRule==="dec25"){month=12;day=25}
    else if(f.dateRule==="sindhiDec"){month=12;day=firstSunday(year)}
    else continue;
    const stamp=Date.UTC(year,month-1,day);
    if(stamp>=now)upcoming.push({f,stamp,year,month,day});
  }
  upcoming.sort((a,b)=>a.stamp-b.stamp);
  const item=upcoming[0];if(!item)return;
  const days=Math.max(0,Math.round((item.stamp-now)/86400000));
  $("apnaNextName").textContent=item.f.title;
  $("apnaNextDate").textContent=new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"long",year:"numeric",timeZone:"UTC"}).format(new Date(item.stamp))+" · Pakistan calendar";
  $("apnaNextCountdown").textContent=days===0?"Today in Pakistan":days===1?"Tomorrow in Pakistan":days+" days to go";
  $("apnaNextLink").addEventListener("click",e=>{e.preventDefault();showModal(item.f)});
}
function renderQuiz(){
  answered=false;const q=quiz[quizIndex];$("apnaQuizStep").textContent="Question "+(quizIndex+1)+" of "+quiz.length;
  $("apnaQuizQuestion").textContent=q.question;$("apnaQuizFeedback").textContent="";
  const host=$("apnaQuizChoices");host.replaceChildren();$("apnaQuizNext").hidden=true;
  for(const [i,answer] of q.answers.entries()){
    const button=node("button",answer);button.type="button";button.addEventListener("click",()=>{
      if(answered)return;answered=true;
      if(i===q.correct)score++;
      for(const item of host.children){item.disabled=true;item.setAttribute("aria-pressed",String(item===button))}
      $("apnaQuizFeedback").textContent=(i===q.correct?"✅ Correct! ":"💡 Good try! ")+q.why;
      $("apnaQuizNext").hidden=false;$("apnaQuizNext").textContent=quizIndex===quiz.length-1?"See my results →":"Next question →";
    });host.append(button);
  }
}
$("apnaQuizNext").addEventListener("click",()=>{
  if(quizIndex===quiz.length-1){
    $("apnaQuizStep").textContent="QUIZ COMPLETE";$("apnaQuizQuestion").textContent="Shabaash! You scored "+score+" out of "+quiz.length+" 🎉";
    $("apnaQuizChoices").replaceChildren();$("apnaQuizFeedback").textContent="A little more of Pakistan to discover every day.";
    const restart=node("button","🔁 Play again");restart.type="button";restart.addEventListener("click",()=>{quizIndex=0;score=0;renderQuiz()});$("apnaQuizChoices").append(restart);$("apnaQuizNext").hidden=true;return;
  }quizIndex++;renderQuiz();
});
document.querySelectorAll("[data-apna-filter]").forEach(button=>button.addEventListener("click",()=>{
  filter=button.dataset.apnaFilter;
  document.querySelectorAll("[data-apna-filter]").forEach(b=>b.setAttribute("aria-pressed",String(b===button)));
  renderEvents();
}));
$("apnaModalClose").addEventListener("click",closeModal);modal.querySelector("[data-apna-close]").addEventListener("click",closeModal);
document.addEventListener("keydown",e=>{
  if(modal.hidden)return;
  if(e.key==="Escape"){closeModal();return}
  if(e.key!=="Tab")return;
  const focusable=[...modal.querySelectorAll("button:not([disabled]),a[href]")].filter(el=>!el.hidden);
  if(!focusable.length)return;const first=focusable[0],last=focusable[focusable.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
});
renderEvents();renderRegions();updateUpcoming();renderQuiz();
})();
