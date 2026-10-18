
/* PakTV Ghar — a family-friendly client for official YouTube uploads.
   No copyrighted video is hosted here. Favourites are stored only on this device. */
(() => {
'use strict';
const CHANNELS = [
 {id:'waggleworkshop',name:'The Waggle Workshop',handle:'TheWaggleWorkshop',category:'waggle',genre:'Kids learning, games & Professor Pip',initials:'WW',colors:['#22ad7c','#f3b647'],description:'Professor Pip adventures, letters, numbers, colours, animals and learning videos for children.'},
 {id:'aryfilms',name:'ARY Films',handle:'ARYFilms',category:'movies',genre:'Pakistani films & TV movies',initials:'ARY',colors:['#e87166','#863444'],description:'Full-length films and movie-length editions uploaded by ARY Films.'},
 {id:'drmmovies',name:'Pakistani Movies by DRM',handle:'pakistani_movies',category:'movies',genre:'Pakistani films & TV movies',initials:'DRM',colors:['#c8a87b','#74536b'],description:'Pakistani feature films and full-length TV films from this movie publisher channel.'},
 {id:'hum',name:'HUM TV',handle:'HUMTV',category:'dramas',initials:'HUM',colors:['#ba779f','#6145ad'],description:'Full Pakistani dramas, classic serials and popular episodes.',featured:true},
 {id:'arydigital',name:'ARY Digital',handle:'ARYDigitalasia',category:'dramas',initials:'ARY',colors:['#dca369','#ae5d48'],description:'Drama serials, complete episodes and family entertainment.',featured:true},
 {id:'harpalgeo',name:'Har Pal Geo',handle:'HarPalGeoOfficial',category:'dramas',initials:'GEO',colors:['#6c7bda','#42529c'],description:'Geo Entertainment dramas and full episodes.',featured:true},
 {id:'expressent',name:'Express TV',handle:'expressentertainment',category:'dramas',initials:'EX',colors:['#ed6b67','#963849'],description:'Express Entertainment dramas, family serials and YouTube episodes.'},
 {id:'greentv',name:'Green Entertainment',handle:'GreenEntertainmentTV',category:'dramas',initials:'GRN',colors:['#72b9a1','#225f52'],description:'Original Pakistani drama serials, including Kabli Pulao, Gentleman and Jeevan Nagar.'},
 {id:'ptvhome',name:'PTV Home',handle:'PTVHomeEntertainment',category:'dramas',initials:'PTV',colors:['#8cbd78','#276c49'],description:'PTV drama classics and family programming from Pakistan Television.'},
 {id:'ptvnews',name:'PTV News',handle:'PTVNewsOfficial',category:'news',initials:'PTV',colors:['#5da5c0','#195475'],description:'Pakistan Television news, headlines and current affairs.'},
 {id:'aajnews',name:'Aaj TV Official',handle:'aajtvofficial',category:'news',initials:'AAJ',colors:['#d87468','#8a353b'],description:'Aaj News headlines, interviews and talk programmes.'},
 {id:'aajent',name:'Aaj Entertainment',handle:'aajentertainment',category:'dramas',initials:'AAJ',colors:['#c59a78','#805478'],description:'Pakistani entertainment and television programmes from Aaj.'},
 {id:'geonews',name:'Geo News',handle:'geonews',category:'news',initials:'GEO',colors:['#e48f4a','#af5241'],description:'News updates, current affairs and Capital Talk.'},
 {id:'arynews',name:'ARY News',handle:'ArynewsTvofficial',category:'news',initials:'ARY',colors:['#d86c63','#90294a'],description:'Headlines, breaking news and Off The Record.'},
 {id:'samaa',name:'SAMAA TV',handle:'SAMAATV',category:'news',initials:'S',colors:['#7cb3ce','#3f6799'],description:'Pakistan headlines, interviews and political reporting.'},
 {id:'dunya',name:'Dunya News',handle:'dunyanews',category:'news',initials:'DN',colors:['#ae84d2','#5d55a0'],description:'Current affairs, news bulletins and analysis.'},
 {id:'expressnews',name:'Express News',handle:'expressnewspk',category:'news',initials:'EN',colors:['#c45e60','#6a344d'],description:'News bulletins, politics and national headlines.'},
 {id:'dawnnews',name:'Dawn News',handle:'dawnnewspakistan',category:'news',initials:'DN',colors:['#4b86ac','#344b7c'],description:'News reports and Pakistan current affairs.'},
 {id:'imranriaz',name:'Imran Riaz Khan',handle:'ImranRiazKhan',category:'vloggers',initials:'IR',colors:['#7e9ab9','#385d7e'],description:'Independent reporting and political commentary.'},
 {id:'sabir',name:'Sabir Shakir',handle:'sabirshakirpk',category:'vloggers',initials:'SS',colors:['#cb9265','#915d5c'],description:'Politics, analysis and commentary from Pakistan.'},
 {id:'matiullah',name:'Matiullah Jan MJtv',handle:'MatiullahJanMJtv',category:'vloggers',initials:'MJ',colors:['#5faaa1','#356f7a'],description:'Independent journalism and current affairs.'},
 {id:'asadtoor',name:'Asad Toor',handle:'AsadToorUncensored',category:'vloggers',initials:'AT',colors:['#8b82bb','#5f5088'],description:'Political reporting, interviews and analysis.'},
 {id:'siddique',name:'Siddique Jaan',handle:'SiddiqueJaan1',category:'vloggers',initials:'SJ',colors:['#8eab6b','#507d67'],description:'Politics, court reporting and public affairs.'},
 {id:'pakexperience',name:'The Pakistan Experience',handle:'ThePakistanExperience',category:'vloggers',initials:'TPE',colors:['#8a9dbb','#3e628e'],description:'Long-form discussions on society and politics.'},
 {id:'junaid',name:'Junaid Akram',handle:'JunaidAkram',category:'vloggers',initials:'JA',colors:['#7eae8b','#3b7167'],description:'Pakistani life, culture and conversations.'},
 {id:'mooroo',name:'Mooroo (Taimoor Salahuddin)',handle:'mooroosicity',category:'vloggers',genre:'Lifestyle & vlogs',initials:'MO',colors:['#9b88b6','#536488'],description:'Pakistani creator documentaries, comedy sketches and vlogs.'},
 {id:'ducky',name:'Ducky Bhai',handle:'duckybhai',category:'vloggers',genre:'Lifestyle & vlogs',initials:'DB',colors:['#ce9276','#82466c'],description:'Pakistani creator vlogs and entertainment.'},
 {id:'rhs',name:'Rana Hamza Saif (RHS)',handle:'ranahamzasaifrhs',category:'vloggers',genre:'Food & travel',initials:'RHS',colors:['#f4ac78','#9a6241'],description:'Food discoveries, travel and experiences.'},
 {id:'villagefood',name:'Village Food Secrets',handle:'villagefoodsecrets',category:'vloggers',genre:'Food & recipes',initials:'VFS',colors:['#91b77e','#557d4b'],description:'Village food and Pakistani cooking.'},
 {id:'streetfoodpk',name:'Street Food PK',handle:'streetfoodpk',category:'vloggers',genre:'Food & travel',initials:'SF',colors:['#bf8061','#975835'],description:'Pakistani street food and food travel.'},
 {id:'foodfusion',name:'Food Fusion',handle:'FoodfusionPk',category:'vloggers',genre:'Food & recipes',initials:'FF',colors:['#e6a14b','#9f6c38'],description:'Pakistani recipes and food ideas.'},
 {id:'maaz',name:'Maaz Safder',handle:'MaazSafderWorld',category:'vloggers',genre:'Lifestyle & vlogs',initials:'MS',colors:['#8ba3e1','#425f9a'],description:'Family, lifestyle and daily vlogs.'},
 {id:'irfanjunejo',name:'Irfan Junejo',handle:'irfanjunejo',category:'vloggers',genre:'Travel & lifestyle',initials:'IJ',colors:['#a1a9b6','#606779'],description:'Storytelling, travel and documentary-style videos.'},
 {id:'wildlens',name:'WildLens by Abrar',handle:'WildLensByAbrar',category:'vloggers',genre:'Travel & lifestyle',initials:'WL',colors:['#9abf87','#597b6c'],description:'Road trips and travel around Pakistan and beyond.'},
 {id:'kunfoods',name:'Kun Foods',handle:'KunFoods',category:'vloggers',genre:'Food & recipes',initials:'KF',colors:['#dfa46a','#92564c'],description:'Pakistani cooking and recipes.'},
 {id:'kitchenamna',name:'Kitchen with Amna',handle:'KitchenWithAmna',category:'vloggers',genre:'Food & recipes',initials:'KA',colors:['#cb8dba','#784a8d'],description:'Cooking and recipes.'},
 {id:'ruby',name:'Ruby Ka Kitchen',handle:'RubyKaKitchen',category:'vloggers',genre:'Food & recipes',initials:'RK',colors:['#bc8e68','#6f6956'],description:'Home cooking and recipes.'},
 {id:'ijazfood',name:'Ijaz Ansari Food Secrets',handle:'IjazAnsariFoodSecrets',category:'vloggers',genre:'Food & recipes',initials:'IA',colors:['#c7af78','#747d4e'],description:'Pakistani food and recipes.'},
 {id:'p4pakao',name:'P 4 Pakao',handle:'p4pakaoofficial',category:'comedy',genre:'Comedy & satire',initials:'P4',colors:['#c698a4','#744e73'],description:'Nadir Ali’s comedy and entertainment channel.'},
 {id:'hasbehaal',name:'Hasb-e-Haal Official',handle:'hasbehaalofficial',category:'comedy',genre:'Comedy & satire',initials:'HB',colors:['#d6a36b','#8b5f4f'],description:'Pakistani satirical comedy episodes.'},
 {id:'geohasna',name:'Hasna Mana Hai',handle:'GeoHasnaManaHai',category:'comedy',genre:'Comedy & satire',initials:'HM',colors:['#bd85bb','#6b508c'],description:'Comedy, interviews and entertainment.'},
 {id:'geoclassics',name:'Geo Classics',handle:'GeoNewsClassics',category:'comedy',genre:'Comedy & satire',initials:'GC',colors:['#5f93ac','#42567c'],description:'Archive and classic Pakistani comedy clips.'},
 {id:'humcomedy',name:'HUM TV Comedy',handle:'HUMTVComedy',category:'comedy',genre:'Comedy & satire',initials:'HC',colors:['#cd8aad','#755e9b'],description:'Pakistani TV comedy channel.'},
 {id:'mazaaqraat',name:'Mazaaq Raat',handle:'MazaaqRaatOfficial',category:'comedy',genre:'Comedy & satire',initials:'MR',colors:['#94a2d6','#4a578a'],description:'Comedy interviews and satire.'},
 {id:'pcb',name:'Pakistan Cricket Board',handle:'PakistanCricket',category:'sports',genre:'Cricket board & highlights',initials:'PCB',colors:['#2d9f72','#174a3d'],description:'Pakistan Cricket Board interviews, match clips and official team updates.'},
 {id:'psl',name:'Pakistan Super League',handle:'pakistansuperleagueofficial',category:'sports',genre:'Cricket league & highlights',initials:'PSL',colors:['#44b576','#246c52'],description:'Pakistan Super League match recaps and tournament coverage.'},
 {id:'asports',name:'A Sports',handle:'asportspk',category:'sports',genre:'Sports TV & news',initials:'AS',colors:['#38b5a5','#165c65'],description:'Pakistani sports broadcaster covering cricket, football and more.'},
 {id:'ptvsports',name:'PTV SPORTS OFFICIAL',handle:'ptvsportsofficialpk',category:'sports',genre:'Sports TV & news',initials:'PTV',colors:['#65af90','#265f53'],description:'PTV Sports reports, sports analysis and event coverage.'},
 {id:'cricketpk',name:'Cricket Pakistan',handle:'CricketPakistanPK',category:'sports',genre:'Sports analysis & creators',initials:'CP',colors:['#dfb36d','#97733e'],description:'Cricket news and interviews from Express Media Group.'},
 {id:'wasay',name:'Wasay Habib',handle:'wasayhabib',category:'sports',genre:'Sports analysis & creators',initials:'WH',colors:['#66b6a9','#3a7775'],description:'Pakistani cricket creator with tactical analysis and match discussions.'},
 {id:'kidsland',name:'Kids Land',handle:'kidslandofficial',category:'kids',genre:'Cartoons & stories',initials:'KL',colors:['#64c99a','#286f57'],description:'Pakistani Urdu cartoons, stories and animated adventures.'},
 {id:'kidsmadani',name:'Kids Madani Channel',handle:'kidsmadanichannel',category:'kids',genre:'Learning & values',initials:'KM',colors:['#64c99a','#286f57'],description:'Urdu animated learning, rhymes and stories.'},
 {id:'salamkids',name:'Salam Kids TV',handle:'salamkidstvofficial',category:'kids',genre:'Rhymes & poems',initials:'SK',colors:['#64c99a','#286f57'],description:'Urdu songs, rhymes and educational stories.'},
 {id:'urdukidsstudio',name:'Urdu Kids Studio',handle:'urdukidsstudio',category:'kids',genre:'Rhymes & poems',initials:'UK',colors:['#64c99a','#286f57'],description:'Urdu poems and learning videos for children.'},
 {id:'shirazi',name:'Shirazi Village Vlogs',handle:'shirazi786',category:'kids',genre:'Family vlogs',initials:'SV',colors:['#64c99a','#286f57'],description:'Village-life family adventures from Pakistan.'},
 {id:'haimparishay',name:'Haim & Parishay Khan',handle:'HaimParishayKhan',category:'kids',genre:'Kids creators',initials:'HP',colors:['#64c99a','#286f57'],description:'Parent-managed Pakistani kids and family creator channel.'},
];
const SHOWS = [
 {id:'capital',name:'Capital Talk',category:'talk',channel:'Geo News',channelId:'geonews',query:'Capital Talk Hamid Mir Geo News full show',description:'Political discussions and interviews.',icon:'🎙️'},
 {id:'offtherecord',name:'Off The Record',category:'talk',channel:'ARY News',channelId:'arynews',query:'Off The Record Kashif Abbasi ARY News full show',description:'Current affairs and political debate.',icon:'🎤'},
 {id:'shahzeb',name:'Aaj Shahzeb Khanzada Kay Sath',category:'talk',channel:'Geo News',channelId:'geonews',query:'Aaj Shahzeb Khanzada Kay Sath Geo News latest',description:'Evening news and political analysis.',icon:'📺'},
 {id:'hasna',name:'Hasna Mana Hai',category:'talk',channel:'Geo News',channelId:'geonews',query:'Hasna Mana Hai Tabish Hashmi official full episode',description:'Humour, guests and interviews.',icon:'😄'},
 {id:'kal',name:'Kal Tak',category:'talk',channel:'Express News',channelId:'expressnews',query:'Kal Tak Javed Chaudhry Express News latest full',description:'Political interviews and analysis.',icon:'🎙️'},
 {id:'dunya',name:'On The Front',category:'talk',channel:'Dunya News',channelId:'dunya',query:'On The Front Kamran Shahid Dunya News full episode',description:'News debate and political conversation.',icon:'🗣️'}
];
const SEED_VIDEOS = [
 {id:'rUKxY6_eujE',title:'Kabhi Main Kabhi Tum — Episode 1',channel:'ARY Digital',channelId:'arydigital',category:'dramas',date:'Full episode · 2024',source:'Curated from the broadcaster',description:'Fahad Mustafa and Hania Aamir. Start from episode one.'},
 {id:'8vmGceEQ5jE',title:'Meem Se Mohabbat — Episode 1',channel:'HUM TV',channelId:'hum',category:'dramas',date:'Full episode · 2024',source:'Official upload',description:'Ahad Raza Mir and Dananeer Mobeen.'},
 {id:'j1j91RAoM8Y',title:'Ishq Murshid — Episode 1',channel:'HUM TV',channelId:'hum',category:'dramas',date:'Full episode · 2023',source:'Official upload',description:'Bilal Abbas Khan and Durefishan Saleem.'},
 {id:'wykbxHM2Ch4',title:'Tere Bin — Episode 1',channel:'Har Pal Geo',channelId:'harpalgeo',category:'dramas',date:'Full episode · 2022',source:'Official upload',description:'Wahaj Ali and Yumna Zaidi.'},
 {id:'Mx0L1WsHrk0',title:'Suno Chanda — Episode 1',channel:'HUM Comedy',channelId:'hum',category:'dramas',date:'Full episode · Official HUM affiliate',source:'Official affiliate upload',description:'Comedy-drama with Iqra Aziz and Farhan Saeed.'},
 {id:'iG7w18qsahY',title:'Geo News — 24/7 News Stream',channel:'Geo News',channelId:'geonews',category:'news',date:'Official stream · availability can change',source:'Official stream',description:'Pakistan headlines, politics and current affairs, on the original Geo News channel.'},
 {id:'vYTfRrA0rBw',title:'ARY News — 24/7 News Stream',channel:'ARY News',channelId:'arynews',category:'news',date:'Official stream · availability can change',source:'Official stream',description:'Headlines, talk shows and breaking news from ARY News.'},
 {id:'nKlKTKrASXk',title:'Dunya News — News Stream',channel:'Dunya News',channelId:'dunya',category:'news',date:'Official stream · availability can change',source:'Official stream',description:'News, political discussion and Pakistan coverage from Dunya News.'}
];
const LIBRARY = window.PAKTV_CATALOG || [];
const EXTRA_PROGRAMMES=[
 {id:'dunya-think-tank',name:'Think Tank',network:'dunya',type:'talk',status:'library'},
 {id:'dunya-nuqta-e-nazar',name:'Nuqta-e-Nazar',network:'dunya',type:'talk',status:'library'},
 {id:'dunya-kamran-khan',name:'Dunya Kamran Khan Kay Sath',network:'dunya',type:'talk',status:'library'},
 {id:'geonews-aapas-ki-baat',name:'Aapas Ki Baat',network:'geonews',type:'talk',status:'archive'},
 {id:'arynews-power-play',name:'Power Play',network:'arynews',type:'talk',status:'archive'},
 {id:'geonews-report-card',name:'Report Card',network:'geonews',type:'talk',status:'library'},
 {id:'geonews-jirga',name:'Jirga',network:'geonews',type:'talk',status:'library'},
 {id:'samaa-red-line',name:'Redline with Talat Hussain',network:'samaa',type:'talk',status:'library'},
 {id:'samaa-nadeem-malik-live',name:'Nadeem Malik Live',network:'samaa',type:'talk',status:'library'},
 {id:'aajnews-spotlight',name:'Spotlight with Munizae Jahangir',network:'aajnews',type:'talk',status:'library'},
 {id:'greentv-kabli-pulao',name:'Kabli Pulao',network:'greentv',type:'drama',status:'library'},
 {id:'greentv-gentleman',name:'Gentleman',network:'greentv',type:'drama',status:'library'},
 {id:'greentv-jeevan-nagar',name:'Jeevan Nagar',network:'greentv',type:'drama',status:'library'},
 {id:'greentv-jindo',name:'Jindo',network:'greentv',type:'drama',status:'library'},
 {id:'greentv-standup-girl',name:'Standup Girl',network:'greentv',type:'drama',status:'library'},
 {id:'greentv-iqtidar',name:'Iqtidar',network:'greentv',type:'drama',status:'library'},
 {id:'greentv-faraar',name:'Faraar',network:'greentv',type:'drama',status:'library'},
 {id:'greentv-laaj',name:'Laaj',network:'greentv',type:'drama',status:'library'},
 {id:'greentv-intekhab',name:'Intekhab',network:'greentv',type:'drama',status:'library'},
 {id:'greentv-humnava',name:'Humnava',network:'greentv',type:'drama',status:'library'},
 {id:'greentv-maa',name:'Maa',network:'greentv',type:'drama',status:'library'},
 {id:'greentv-nizaam',name:'Nizaam',network:'greentv',type:'drama',status:'library'},
 {id:'ptvhome-dhoop-kinare',name:'Dhoop Kinare',network:'ptvhome',type:'drama',status:'archive'},
 {id:'ptvhome-tanhaiyaan',name:'Tanhaiyaan',network:'ptvhome',type:'drama',status:'archive'},
 {id:'ptvhome-ankahi',name:'Ankahi',network:'ptvhome',type:'drama',status:'archive'},
 {id:'ptvhome-alpha-bravo-charlie',name:'Alpha Bravo Charlie',network:'ptvhome',type:'drama',status:'archive'},
 {id:'ptvhome-waris',name:'Waris',network:'ptvhome',type:'drama',status:'archive'},
 {id:'expressent-bhanwar',name:'Bhanwar',network:'expressent',type:'drama',status:'archive'},
 {id:'expressent-muthi-bhar-chahat',name:'Muthi Bhar Chahat',network:'expressent',type:'drama',status:'archive'},
 {id:'ptvnews-current-affairs',name:'PTV News Current Affairs',network:'ptvnews',type:'talk',status:'library'},
 {id:'samaa-naeem-bukhari',name:'Samaa News Analysis',network:'samaa',type:'talk',status:'library'},
 {id:'arynews-the-reporters',name:'The Reporters',network:'arynews',type:'talk',status:'library'},
 {id:'arynews-11th-hour',name:'11th Hour',network:'arynews',type:'talk',status:'library'},
 {id:'arynews-off-the-record',name:'Off The Record',network:'arynews',type:'talk',status:'library'},
 {id:'geonews-capital-talk',name:'Capital Talk',network:'geonews',type:'talk',status:'library'},
 {id:'geonews-aaj-shahzeb',name:'Aaj Shahzeb Khanzada Kay Sath',network:'geonews',type:'talk',status:'library'},
 {id:'dunya-on-the-front',name:'On The Front',network:'dunya',type:'talk',status:'library'},
 {id:'expressnews-kal-tak',name:'Kal Tak',network:'expressnews',type:'talk',status:'library'},
 {id:'dunya-hasb-e-haal',name:'Hasb-e-Haal',network:'dunya',type:'satire',status:'library'},
 {id:'geonews-khabarnaak',name:'Khabarnaak',network:'geonews',type:'satire',status:'library'},
 {id:'dunya-khabardar',name:'Khabardar',network:'dunya',type:'satire',status:'library'},
 {id:'geohasna-full-shows',name:'Hasna Mana Hai',network:'geohasna',type:'comedy',status:'library'},
 {id:'geoclassics-khabarnaak-classics',name:'Khabarnaak Classics',network:'geonews',type:'satire',status:'archive'},
 {id:'p4pakao-comedy',name:'P 4 Pakao',network:'p4pakao',type:'comedy',status:'library'},
 {id:'hasbehaal-special',name:'Hasb-e-Haal Specials',network:'hasbehaal',type:'satire',status:'library'},
 {id:'geohasna-interviews',name:'Hasna Mana Hai: Interviews',network:'geohasna',type:'comedy',status:'library'}
];
for(const programme of EXTRA_PROGRAMMES)if(!LIBRARY.some(s=>s.id===programme.id))LIBRARY.push(programme);
const NAV = [
 {id:'home',icon:'⌂',en:'Home',ur:'ہوم'},
 {id:'today',icon:'📅',en:'On Today',ur:'آج ٹی وی پر'},
 {id:'dramas',icon:'🎬',en:'Dramas',ur:'ڈرامے'},
 {id:'movies',icon:'🎞️',en:'Movies',ur:'فلمیں'},
 {id:'comedy',icon:'😄',en:'Comedy & Satire',ur:'مزاح'},
 {id:'news',icon:'📡',en:'News',ur:'خبریں'},
 {id:'sports',icon:'🏏',en:'Sports',ur:'کھیل'},
 {id:'kids',icon:'🌈',en:'Kids',ur:'بچے',href:'./kids.html'},
 {id:'games',icon:'🎮',en:'Games',ur:'گیمز',href:'https://retroworld.eu.cc/',external:true}, 
 {id:'talk',icon:'🎙️',en:'Talk Shows',ur:'ٹاک شوز'},
 {id:'vloggers',icon:'📹',en:'YouTubers',ur:'یوٹیوبرز'},
 {id:'archive',icon:'🗓️',en:'Video Archive',ur:'پرانے ویڈیوز'},
 {id:'favourites',icon:'♡',en:'Favourites',ur:'پسندیدہ'},
 {id:'gupshup',icon:'☕',en:'GUPSHUP',ur:'گپ شپ',href:'./gupshup.html'},
 {id:'contact',icon:'✉️',en:'Contact Us',ur:'رابطہ',href:'./community.html#contact'}
];
const CATEGORY_LABELS={dramas:'Pakistani Dramas',movies:'Pakistani Movies',comedy:'Comedy & Political Satire',news:'News & Headlines',sports:'Pakistani Sports & Cricket',talk:'Political Talk Shows',vloggers:'Pakistani YouTubers'};
const el=id=>document.getElementById(id);
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeGet=(key,fallback)=>{try{const x=JSON.parse(localStorage.getItem(key));return x??fallback}catch{return fallback}};
const safeSet=(key,x)=>{try{localStorage.setItem(key,JSON.stringify(x))}catch{}};
const state={page:'home',query:'',language:safeGet('pgh_lang','en'),favoriteVideos:safeGet('pgh_video_favs',[]),savedVideoData:safeGet('pgh_video_data',{}),favoriteChannels:safeGet('pgh_channel_favs',[]),favoriteShows:safeGet('pgh_show_favs',[]),libraryFilter:'featured',networkFilter:'all',visibleShows:30,schedule:null,scheduleLoading:true,showMeta:{},showMetaLoaded:false,episodeList:[],episodeLoading:false,episodeLoadedFor:'',episodePage:0,history:safeGet('pgh_history',[]),currentVideo:null,backend:false,apiMode:'',feed:[],archiveVideos:[],archiveLoaded:false,archiveError:false,archivePeriod:'all',archiveCategory:'all',archiveChannel:'all',archiveGenre:'all',creatorGenre:'all',movieSearch:'',archiveDate:'',archiveQuery:'',archiveLimit:30,visibleVideos:24,feedTried:false,feedLoading:false,searchResults:[],searchLoading:false,searchMode:'',searchMessage:'',searchRequest:0,ytPlayer:null,ytLoaded:false,searchTimer:null,toastTimer:null};
const videoURL=id=>`https://www.youtube.com/watch?v=${encodeURIComponent(id)}`;
const channelURL=c=>`https://www.youtube.com/@${encodeURIComponent(c.handle)}`;
const thumb=id=>`https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`;
const fromChannel=id=>CHANNELS.find(c=>c.id===id);
const catVideos=cat=>uniqueVideos([...state.archiveVideos,...state.feed,...SEED_VIDEOS].filter(v=>!cat||v.category===cat)).sort((a,b)=>(b.published||b.date||'').localeCompare(a.published||a.date||''));
function uniqueVideos(arr){const seen=new Set();return arr.filter(v=>{if(!/^[\w-]{11}$/.test(v.id||'')||seen.has(v.id))return false;seen.add(v.id);return true})}
const PAGE_FILES={home:'./index.html',today:'./today.html',dramas:'./dramas.html',
 movies:'./movies.html',comedy:'./comedy.html',news:'./news.html',sports:'./sports.html',
 talk:'./talk.html',vloggers:'./vloggers.html',archive:'./archive.html',
 favourites:'./favourites.html',search:'./search.html'};
function routeURL(page){return PAGE_FILES[page]||'./index.html'}
function locationPage(){
 const filename=location.pathname.split('/').pop().toLowerCase();
 if(filename==='show.html')return 'show';
 for(const [name,file] of Object.entries(PAGE_FILES))
   if(file.slice(2)===filename&&name!=='home')return name;
 const hash=location.hash.slice(1);
 if(hash.startsWith('show-')&&LIBRARY.some(show=>show.id===hash.slice(5)))return 'show';
 return Object.hasOwn(PAGE_FILES,hash)?hash:'home';
}
function navTo(page){
 if(!Object.hasOwn(PAGE_FILES,page))return;
 if(state.page===page&&!location.hash){window.scrollTo({top:0,behavior:'smooth'});return;}
 window.location.assign(routeURL(page));
}
function navMarkup(item,mobile=false){const active=state.page===item.id;const label=state.language==='ur'?item.ur:item.en;if(item.href){const ext=item.external?' target="_blank" rel="noopener noreferrer"':'';return mobile?`<a href="${escapeHTML(item.href)}"${ext}><span class="nav-icon">${item.icon}</span><span>${escapeHTML(label)}</span></a>`:`<a class="nav-item community-nav-link" href="${escapeHTML(item.href)}"${ext}><span class="nav-icon">${item.icon}</span><span>${escapeHTML(label)}</span></a>`}return mobile?`<a href="${routeURL(item.id)}" class="${active?'active':''}" aria-current="${active?'page':'false'}"><span class="nav-icon">${item.icon}</span><span>${escapeHTML(label)}</span></a>`:`<button class="nav-item ${active?'active':''}" type="button" data-nav="${item.id}" aria-current="${active?'page':'false'}"><span class="nav-icon">${item.icon}</span><span>${escapeHTML(label)}</span>${item.id==='favourites'&&state.favoriteChannels.length+state.favoriteVideos.length?`<span class="count">${state.favoriteChannels.length+state.favoriteVideos.length}</span>`:''}</button>`}
function renderNav(){el('sideNav').innerHTML=NAV.map(n=>navMarkup(n)).join('');el('mobileNav').innerHTML=NAV.map(n=>navMarkup(n,true)).join('')}
function sectionHead(title,sub='',all='',label='See all →'){return `<div class="section-head"><div><h2>${escapeHTML(title)}</h2>${sub?`<p class="subtitle">${escapeHTML(sub)}</p>`:''}</div>${all?`<button class="text-link" type="button" data-nav="${all}">${escapeHTML(label)}</button>`:''}</div>`}
function videoCard(v){const saved=state.favoriteVideos.includes(v.id);return `<article class="video-card"><div class="video-thumb"><a href="${videoURL(v.id)}" data-video="${escapeHTML(v.id)}" aria-label="Watch ${escapeHTML(v.title)} here"><img src="${thumb(v.id)}" alt="" loading="lazy" onerror="this.style.opacity='.15'"><span class="thumb-play" aria-hidden="true">▶</span><span class="source-tag">${escapeHTML(v.channel)}</span></a></div><div class="video-body"><h3>${escapeHTML(v.title)}</h3><div class="video-meta"><span>${escapeHTML(v.date||'Watch now')}</span><button type="button" data-video-fav="${escapeHTML(v.id)}" class="${saved?'saved':''}" title="${saved?'Remove favourite':'Add favourite'}" aria-label="${saved?'Remove from':'Add to'} favourites">${saved?'♥':'♡'}</button></div></div></article>`}
function channelCard(c){const fav=state.favoriteChannels.includes(c.id);return `<article class="channel-card"><div class="channel-top"><div class="channel-avatar" style="--avatar-bg:linear-gradient(135deg,${c.colors[0]},${c.colors[1]})">${escapeHTML(c.initials)}</div><div><h3>${escapeHTML(c.name)}</h3><span>Official YouTube source</span></div></div><p class="channel-desc">${escapeHTML(c.description)}</p><div class="channel-actions"><button class="small-button accent" type="button" data-channel="${c.id}">▶ Videos</button><a class="small-button" href="${channelURL(c)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${escapeHTML(c.name)} on YouTube">↗ YouTube</a><button type="button" class="small-button pin ${fav?'saved':''}" data-channel-fav="${c.id}" title="${fav?'Unpin channel':'Pin favourite channel'}" aria-label="${fav?'Unpin':'Pin'} ${escapeHTML(c.name)}">${fav?'♥':'♡'}</button></div></article>`}
function showCard(show){const channel=fromChannel(show.channelId);return `<article class="channel-card"><div class="channel-top"><div class="channel-avatar" style="--avatar-bg:linear-gradient(135deg,#ae7a67,#595491)">${show.icon}</div><div><h3>${escapeHTML(show.name)}</h3><span>${escapeHTML(show.channel)}</span></div></div><p class="channel-desc">${escapeHTML(show.description)}</p><div class="channel-actions"><button class="small-button accent" data-show="${show.id}" type="button">⌕ Find episodes</button>${channel?`<a class="small-button" href="${channelURL(channel)}" target="_blank" rel="noopener noreferrer">↗ Channel</a>`:''}</div></article>`}
// Featured drama carousel uses artwork already indexed from official TV sources.
// The current slide is changed without repainting the rest of the site.
const SPOTLIGHT_IDS=[
  'hum-khushi','arydigital-izzat','harpalgeo-mohabbat',
  'arydigital-rutba','harpalgeo-nashtar','hum-aangan',
  'arydigital-main-tera','hum-hurmat'
];
const SPOTLIGHT_INTERVAL=7500;
let spotlightIndex=0;
let spotlightTimer=null;
let spotlightPaused=false;
let spotlightHovered=false;
let spotlightFocused=false;
const spotlightReducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
function spotlightChoices(){
  const found=SPOTLIGHT_IDS.map(id=>LIBRARY.find(show=>show.id===id))
    .filter(show=>show&&typeof state.showMeta[show.id]?.poster==='string'&&
      /^https:\/\//.test(state.showMeta[show.id].poster));
  // Include other genuinely illustrated serials if our spotlight choices rotate.
  const extra=LIBRARY.filter(show=>show.type==='drama'&&
    state.showMeta[show.id]?.poster&&/^https:\/\//.test(state.showMeta[show.id].poster));
  const used=new Set();
  const choices=[...found,...extra].filter(show=>!used.has(show.id)&&used.add(show.id));
  return choices.slice(0,6);
}
function spotlightFallback(){
  const seed=SEED_VIDEOS.find(v=>v.category==='dramas')||SEED_VIDEOS[0];
  return '<div class="spotlight-slide is-active" aria-hidden="false">'+
    '<div class="spotlight-art"><img class="spotlight-backdrop" src="'+escapeHTML(thumb(seed.id))+'" alt="" fetchpriority="high">'+
    '<img class="spotlight-feature-art" src="'+escapeHTML(thumb(seed.id))+'" alt="" loading="eager"></div>'+
    '<div class="spotlight-shade"></div><div class="spotlight-slide-inner">'+
    '<span class="spotlight-kicker"><span>✦ PAKTV GHAR</span> YOUR PAKISTANI TV HOME</span>'+
    '<h1>Every story.<br>One beautiful place.</h1>'+
    '<p class="spotlight-description">Dramas, current affairs, comedy and Pakistani creators. Find your next favourite from the original publishers.</p>'+
    '<div class="spotlight-buttons"><button class="btn-primary" type="button" data-nav="dramas">▶ Explore dramas</button>'+
    '<button class="btn-secondary" type="button" data-nav="archive">▦ Explore archive</button></div>'+
    '</div></div>';
}
function hero(){
  const choices=spotlightChoices();
  spotlightIndex=choices.length?spotlightIndex%choices.length:0;
  const slideMarkup=choices.length?choices.map((show,i)=>{
    const meta=state.showMeta[show.id]||{};
    const active=i===spotlightIndex;
    const latest=meta.latestUpload?.number;
    const label=show.status==='airing'?'Currently featured':show.status==='archive'?'From the classics':'Pakistani drama';
    const background=meta.poster;
    return '<article class="spotlight-slide'+(active?' is-active':'')+'" data-spotlight-slide="'+i+'" '+
      'aria-hidden="'+(!active)+'"'+(active?'':' inert')+'>'+
      '<div class="spotlight-art"><img class="spotlight-backdrop" src="'+escapeHTML(background)+'" alt="" '+
      (i===0?'fetchpriority="high" loading="eager"':'loading="lazy"')+
      ' decoding="async" referrerpolicy="no-referrer" onerror="this.style.opacity=0">'+
      '<img class="spotlight-feature-art" src="'+escapeHTML(background)+'" alt="" '+
      (i===0?'loading="eager"':'loading="lazy"')+
      ' decoding="async" referrerpolicy="no-referrer" onerror="this.style.display=\'none\'"></div>'+
      '<div class="spotlight-shade"></div><div class="spotlight-slide-inner">'+
      '<span class="spotlight-kicker"><span>✦ FEATURED DRAMA</span> '+escapeHTML(label)+'</span>'+
      '<h1>'+escapeHTML(show.name)+'</h1>'+
      '<div class="spotlight-meta"><span>'+escapeHTML(networkName[show.network]||show.network)+'</span>'+
      '<span>Official publisher links</span>'+
      (latest?'<span>Indexed episode '+escapeHTML(latest)+'</span>':'')+'</div>'+
      '<p class="spotlight-description">Step into the world of '+escapeHTML(show.name)+
      '. Discover available episodes, explore the original broadcaster, and save this Pakistani drama to your favourites.</p>'+
      '<div class="spotlight-buttons"><button class="btn-primary" type="button" data-series="'+escapeHTML(show.id)+'">▶ Browse episodes</button>'+
      '<button class="btn-secondary" type="button" data-nav="dramas">View all dramas →</button></div>'+
      '</div></article>';
  }).join(''):spotlightFallback();
  const count=choices.length;
  return '<section class="spotlight-section" aria-label="Featured Pakistani drama slideshow">'+
    '<div class="spotlight-topline"><span class="spotlight-title">PakTV Ghar · The Spotlight</span>'+
    '<span class="spotlight-channel-count">HUM · ARY · GEO · GREEN · PTV</span></div>'+
    '<div id="spotlightCarousel" class="spotlight-stage'+(spotlightPaused||spotlightReducedMotion.matches?' is-paused':'')+
    '" aria-roledescription="carousel" aria-label="Featured Pakistani dramas" tabindex="0">'+
    '<div class="spotlight-glimmer" aria-hidden="true"></div>'+slideMarkup+
    '<div class="spotlight-sheen" aria-hidden="true"></div>'+
    (count>1?'<div class="spotlight-controls"><div class="spotlight-control-left">'+
     '<span class="spotlight-counter" aria-label="Slide number"><strong data-spotlight-count>'+(spotlightIndex+1)+
     '</strong> / '+count+'</span><div class="spotlight-dots" aria-label="Choose featured drama">'+
     choices.map((show,i)=>'<button class="spotlight-dot'+(i===spotlightIndex?' is-active':'')+
        '" type="button" data-spotlight-index="'+i+'" aria-label="Show '+escapeHTML(show.name)+
        '" aria-pressed="'+(i===spotlightIndex)+'"></button>').join('')+
     '</div></div><div class="spotlight-buttons-right">'+
     '<button class="spotlight-nav" type="button" data-spotlight-move="-1" aria-label="Previous drama">‹</button>'+
     '<button class="spotlight-pause" type="button" data-spotlight-pause aria-label="'+(spotlightPaused?'Play slideshow':'Pause slideshow')+
     '" aria-pressed="'+spotlightPaused+'">'+(spotlightPaused?'▶':'Ⅱ')+'</button>'+
     '<button class="spotlight-nav" type="button" data-spotlight-move="1" aria-label="Next drama">›</button>'+
     '</div></div>':'')+'</div>'+
    (count>1?'<div class="spotlight-mini-track" role="group" aria-label="Featured drama previews">'+
      choices.map((show,i)=>'<button type="button" class="spotlight-mini'+(i===spotlightIndex?' is-active':'')+
      '" data-spotlight-index="'+i+'" aria-pressed="'+(i===spotlightIndex)+'" aria-label="Show '+escapeHTML(show.name)+'">'+
      '<img src="'+escapeHTML(state.showMeta[show.id].poster)+'" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">'+
      '<span><strong>'+escapeHTML(show.name)+'</strong><small>'+escapeHTML(networkName[show.network]||show.network)+'</small></span></button>').join('')+
      '</div>':'')+'</section>';
}
function updateSpotlight(index){
  const hero=document.getElementById('spotlightCarousel');
  if(!hero)return;
  const slides=Array.from(hero.querySelectorAll('[data-spotlight-slide]'));
  if(slides.length<2)return;
  spotlightIndex=(Number(index)%slides.length+slides.length)%slides.length;
  slides.forEach((slide,i)=>{
    const active=i===spotlightIndex;
    slide.classList.toggle('is-active',active);
    slide.setAttribute('aria-hidden',String(!active));
    slide.inert=!active;
  });
  document.querySelectorAll('[data-spotlight-index]').forEach(dot=>{
    const active=Number(dot.dataset.spotlightIndex)===spotlightIndex;
    dot.classList.toggle('is-active',active);
    dot.setAttribute('aria-pressed',String(active));
  });
  const count=hero.querySelector('[data-spotlight-count]');
  if(count)count.textContent=String(spotlightIndex+1);
  updateSpotlightTimer();
}
function updateSpotlightTimer(){
  clearTimeout(spotlightTimer);
  spotlightTimer=null;
  const carousel=document.getElementById('spotlightCarousel');
  if(!carousel||state.page!=='home')return;
  const stop=spotlightPaused||spotlightHovered||spotlightFocused||
    spotlightReducedMotion.matches||document.hidden;
  carousel.classList.toggle('is-paused',stop);
  if(stop||carousel.querySelectorAll('[data-spotlight-slide]').length<2)return;
  spotlightTimer=setTimeout(()=>updateSpotlight(spotlightIndex+1),SPOTLIGHT_INTERVAL);
}
function initSpotlightEvents(){
  document.addEventListener('click',event=>{
    const index=event.target.closest('[data-spotlight-index]');
    if(index){updateSpotlight(Number(index.dataset.spotlightIndex));return;}
    const advance=event.target.closest('[data-spotlight-move]');
    if(advance){updateSpotlight(spotlightIndex+Number(advance.dataset.spotlightMove));return;}
    const pause=event.target.closest('[data-spotlight-pause]');
    if(pause){
      spotlightPaused=!spotlightPaused;
      pause.textContent=spotlightPaused?'▶':'Ⅱ';
      pause.setAttribute('aria-label',spotlightPaused?'Play slideshow':'Pause slideshow');
      pause.setAttribute('aria-pressed',String(spotlightPaused));
      updateSpotlightTimer();
    }
  });
  document.addEventListener('keydown',event=>{
    if(event.target.closest('#spotlightCarousel')&&
       (event.key==='ArrowLeft'||event.key==='ArrowRight')){
      event.preventDefault();
      updateSpotlight(spotlightIndex+(event.key==='ArrowRight'?1:-1));
    }
  });
  document.addEventListener('pointerover',event=>{
    const panel=event.target.closest('#spotlightCarousel');
    if(panel&&event.pointerType==='mouse'&&!panel.contains(event.relatedTarget)){
      spotlightHovered=true;updateSpotlightTimer();
    }
  });
  document.addEventListener('pointerout',event=>{
    const panel=event.target.closest('#spotlightCarousel');
    if(panel&&event.pointerType==='mouse'&&!panel.contains(event.relatedTarget)){
      spotlightHovered=false;updateSpotlightTimer();
    }
  });
  document.addEventListener('focusin',event=>{
    if(event.target.closest('#spotlightCarousel')){spotlightFocused=true;updateSpotlightTimer();}
  });
  document.addEventListener('focusout',event=>{
    const panel=event.target.closest('#spotlightCarousel');
    if(panel&&!panel.contains(event.relatedTarget)){spotlightFocused=false;updateSpotlightTimer();}
  });
  document.addEventListener('visibilitychange',updateSpotlightTimer);
  spotlightReducedMotion.addEventListener?.('change',updateSpotlightTimer);
}
function cinemaHeading(title,subtitle,link,label){
  return '<div class="cinema-heading"><div><h2>'+escapeHTML(title)+'</h2>'+
    (subtitle?'<p>'+escapeHTML(subtitle)+'</p>':'')+'</div>'+
    '<div class="cinema-rail-actions"><button type="button" class="cinema-arrow" data-rail-scroll="-1" aria-label="Scroll '+escapeHTML(title)+' left">‹</button>'+
    '<button type="button" class="cinema-arrow" data-rail-scroll="1" aria-label="Scroll '+escapeHTML(title)+' right">›</button>'+
    (link?'<a href="'+escapeHTML(routeURL(link))+'">'+escapeHTML(label||'See all →')+'</a>':'')+'</div></div>';
}
function cinemaVideoRail(title,subtitle,videos,link){
  if(!videos.length)return '';
  return '<section class="cinema-row">'+cinemaHeading(title,subtitle,link)+
    '<div class="cinema-video-rail" aria-label="'+escapeHTML(title)+'">'+
    videos.map(videoCard).join('')+'</div></section>';
}
function cinemaPosterRail(title,subtitle,shows,link){
  if(!shows.length)return '';
  return '<section class="cinema-row">'+cinemaHeading(title,subtitle,link)+
    '<div class="cinema-poster-rail" aria-label="'+escapeHTML(title)+'">'+
    shows.map(seriesCard).join('')+'</div></section>';
}
function cinemaChannelRail(title,subtitle,channels,link){
  if(!channels.length)return '';
  return '<section class="cinema-row">'+cinemaHeading(title,subtitle,link)+
    '<div class="cinema-channel-rail" aria-label="'+escapeHTML(title)+'">'+
    channels.map(channelCard).join('')+'</div></section>';
}
function balancedRecent(items,limit=8){
  const all=uniqueVideos(items).sort((a,b)=>(b.published||b.date||'').localeCompare(a.published||a.date||''));
  const used={};const chosen=[];
  for(const v of all){
    const ch=v.channelId||v.channel||'other';
    if((used[ch]||0)>=2)continue;
    chosen.push(v);used[ch]=(used[ch]||0)+1;
    if(chosen.length>=limit)return chosen;
  }
  for(const v of all){
    if(!chosen.includes(v))chosen.push(v);
    if(chosen.length>=limit)break;
  }
  return chosen;
}
function renderHome(){
  const fresh=balancedRecent([...state.archiveVideos,...state.feed],12);
  const recent=new Map([...state.archiveVideos,...state.feed].map(v=>[v.id,v]));
  const drama=LIBRARY.filter(x=>x.type==='drama');
  const highlights=[...drama.filter(s=>s.status==='airing'&&state.showMeta[s.id]?.poster),
    ...drama.filter(s=>['airing','recent','upcoming'].includes(s.status))];
  const posterIds=new Set();
  const spotlight=highlights.filter(x=>!posterIds.has(x.id)&&posterIds.add(x.id)).slice(0,16);
  const moreNetworks=drama.filter(s=>['greentv','ptvhome','expressent'].includes(s.network)).slice(0,18);
  const watchAgain=state.history.map(id=>recent.get(id)||SEED_VIDEOS.find(v=>v.id===id)||state.savedVideoData[id]).filter(Boolean).slice(0,12);
  const broadcasterOrder=['greentv','ptvhome','expressent','hum','arydigital','harpalgeo','aajent','samaa','ptvnews','aajnews','geonews','arynews','dunya','expressnews'];
  const broadcasters=broadcasterOrder.map(id=>CHANNELS.find(x=>x.id===id)).filter(Boolean);
  const creatorVideos=balancedRecent([...state.archiveVideos,...state.feed].filter(v=>v.category==='vloggers'),10);
  const talkVideos=balancedRecent([...state.archiveVideos,...state.feed].filter(v=>v.category==='talk'||v.category==='comedy'),10);
  return '<div class="welcome-line"><span class="welcome">YOUR HOME FOR PAKISTANI ENTERTAINMENT</span>'+
    '<span class="urdu" lang="ur">پاکستانی ڈرامے، کامیڈی اور خبریں</span></div>'+hero()+
    '<div class="quick-grid cinema-quick">'+
    [['dramas','🎬','Dramas'],['movies','🎞️','Movies'],['archive','🗓️','Video archive'],['comedy','😄','Comedy'],['news','📡','News'],['sports','🏏','Sports'],['talk','🎙️','Talk shows'],['vloggers','📹','YouTubers'],['today','📅','TV today']].map(([id,icon,label])=>
      '<button type="button" class="quick-tile" data-nav="'+id+'"><span class="quick-emoji">'+icon+'</span><span class="quick-name">'+label+'</span></button>').join('')+
    '<a class="quick-tile community-home-tile" href="./kids.html"><span class="quick-emoji">🌈</span><span class="quick-name">Kids Corner</span></a>'+
    '<a class="quick-tile community-home-tile" href="./gupshup.html"><span class="quick-emoji">☕</span><span class="quick-name">GUPSHUP</span></a>'+
    '</div>'+
    '<div id="homeBriefing" class="home-briefing" aria-label="Latest news, Pakistan weather and world markets"></div>'+




    cinemaVideoRail('Movie night · Full-length films','Publisher films and movie-length TV editions from Pakistani YouTube sources.',movieVideos().slice(0,9),'movies')+
    cinemaPosterRail('Featured Pakistani dramas','Find your next binge from original broadcasters.',spotlight,'dramas')+
    '<section class="kids-home-promo"><div><span class="eyebrow">🌈 THE KIDS CORNER</span><h2>Pakistani kids videos, all in one happy place.</h2><p>Cartoons, Urdu rhymes, educational stories and family creators, organised for parents to explore together.</p><a href="./kids.html">Explore Kids Corner ↗</a></div><span class="kids-home-illustration" aria-hidden="true">🪁 🌈 📚</span></section>'+
    cinemaVideoRail('Kids Corner · Latest uploads','Parent-curated Pakistani cartoons, Urdu poems and family video channels.',balancedRecent([...state.archiveVideos,...state.feed].filter(v=>{
      if(v.category!=='kids'||typeof v.title!=='string')return false;
      const meaningful=v.title.replace(/#[a-z0-9_]+/gi,'').replace(/[^a-zA-ZÀ-ÿ\u0600-\u06ff ]/g,'').trim();
      return meaningful.length>=9&&meaningful.split(/\s+/).length>=2
        &&!/\b(?:scam|fraud|tragedy|murder|crime|violence|politics|adult|hate|terror|breaking news)\b/i.test(v.title);
    }),10),'archive')+
    cinemaVideoRail('Pakistani sports · Cricket & more','New videos from sports broadcasters, PSL and Pakistani cricket creators.',balancedRecent([...state.archiveVideos,...state.feed].filter(v=>v.category==='sports'),10),'sports')+
    cinemaChannelRail('Explore Pakistan sports channels','Cricket boards, sports broadcasters and cricket analysts.',CHANNELS.filter(x=>x.category==='sports').slice(0,7),'sports')+
    cinemaVideoRail('Freshly uploaded','New videos from multiple Pakistani channels.',fresh,'archive')+
    cinemaChannelRail('Discover broadcasters','Now including Green Entertainment, PTV Home, Express TV and SAMAA.',broadcasters,'dramas')+
    (watchAgain.length?cinemaVideoRail('Continue exploring','Your recently opened videos.',watchAgain,'favourites'):'')+
    cinemaVideoRail('Political shows & comedy','Interviews, political debate, comedy and current affairs.',talkVideos,'talk')+
    cinemaVideoRail('Pakistani YouTubers','Creators, food, travel and new perspectives.',creatorVideos,'vloggers')+
    cinemaVideoRail('Drama classics','Popular starting points on broadcasters’ original channels.',SEED_VIDEOS.filter(x=>x.category==='dramas'), 'dramas')+
    cinemaVideoRail('News streams','Broadcasters control each live stream’s availability.',SEED_VIDEOS.filter(x=>x.category==='news'),'news')+
    renderInfo();
}
function feedSection(vids){if(vids.length)return `<div class="media-grid">${vids.slice(0,8).map(videoCard).join('')}</div>`;return `<div class="notice-box" id="latestNotice"><span class="status-pill ${state.backend?'live':''}"><span class="mini-dot"></span>${state.feedLoading?'Fetching recent uploads…':state.backend?'Recent official uploads indexed':'Starter library available'}</span> &nbsp; ${state.feedLoading?'Loading videos from official channels.':state.backend?'Recent uploads are temporarily unavailable. You can still browse the channels below.':'New uploads appear after scheduled updates. Browse the official channels if listings are currently unavailable.'}</div>`}
function renderInfo(){return `<div class="notice-box">💡 <b>Watching from outside Pakistan?</b> YouTube decides which videos play in each country, and individual publishers can disable embeds. If an embedded player is unavailable, use <b>Open on YouTube</b>. For some region-restricted shows, you may consider using a VPN at your own discretion, but access is not guaranteed and local laws and platform terms still apply. <b>VPN use is entirely your responsibility:</b> PakTV Ghar does not provide or configure VPNs, control third-party restrictions, or take responsibility for how you use a VPN.</div>`}

const FEATURED_MOVIES=[
 {id:'htZXQ5wIxAg',title:'Sharpasand — Full Movie | Naumaan Ijaz · Hareem Farooq · Hira Mani | ARY Films',date:'2026-08-13'},
 {id:'qHaUmAGJl0s',title:'Neeli Zinda Hai — Full Movie | Urwa Hocane · Mohib Mirza | ARY Films',date:'2026-08-23'},
 {id:'rQlXffmfNVA',title:'Main Manto Nahi Hoon — Full Movie | Humayun Saeed · Sajal Aly | ARY Films',date:'2026-07-05'},
 {id:'XOTBrzyhZyo',title:'Kabhi Main Kabhi Tum — Full Movie Edition | Hania Aamir · Fahad Mustafa | ARY Films',date:'2026-06-07'}
].map(v=>({...v,channel:'ARY Films',channelId:'aryfilms',category:'movies',
  published:v.date+'T00:00:00Z',
  description:'Full-length edition shared on the verified ARY Films YouTube channel. May be an edited drama serial rather than a theatrical film.'}));
const FEATURED_MOVIE=FEATURED_MOVIES[0];
function movieVideos(){
  // Include only full-length titles from the checked publishers; never mix
  // in trailers, music tracks, short clips or arbitrary reuploads.
  const verified=uniqueVideos([...state.archiveVideos,...state.feed].filter(v=>
    v.category==='movies'&&Number(v.durationSeconds)>=3600&&
    v.embeddable!==false&&v.availableGB!==false));
  return uniqueVideos([...verified,...FEATURED_MOVIES]).sort((a,b)=>
    (b.published||b.date||'').localeCompare(a.published||a.date||''));
}
function renderMovies(){
  const all=movieVideos();
  const candidates=all.filter(v=>state.movieSearch.trim()===''||
    (v.title+' '+v.channel).toLocaleLowerCase().includes(state.movieSearch.trim().toLocaleLowerCase()));
  const movieChannels=CHANNELS.filter(c=>c.category==='movies');
  const movieCards=candidates.slice(0,state.visibleVideos);
  return '<section class="movie-page">'+
    '<div class="movie-feature"><img class="movie-feature-backdrop" id="movieHeroBackdrop" src="./assets/movie-headline-1.webp" data-fallback="'+thumb(FEATURED_MOVIE.id)+'" alt="" loading="eager" onerror="this.onerror=null;this.src=this.dataset.fallback"><div class="movie-feature-scrim"></div><div class="movie-feature-content">'+
    '<div class="movie-feature-kicker">🎞️ THE PAKTV FILM CLUB</div>'+
    '<h1>Pakistani <em>Movies</em> Night</h1>'+
    '<p>Enjoy full-length films and movie-length television stories shared on their publisher’s YouTube channels. No subscriptions from PakTV Ghar.</p>'+
    '<div class="movie-feature-tags"><span>Free-to-view on YouTube</span><span>Full-length titles</span><span>Original uploads</span></div>'+
    '<div class="movie-feature-actions"><button class="btn-primary" type="button" data-video="'+FEATURED_MOVIE.id+'">▶ Watch featured film</button>'+
    '<a class="btn-secondary" href="https://www.youtube.com/channel/UC2PYniNHljOED9xNaMpiMiQ/videos" target="_blank" rel="noopener noreferrer">↗ ARY Films on YouTube</a></div>'+
    '</div><div class="movie-headline-controls" role="group" aria-label="Featured movie images">'+
    '<button type="button" data-movie-slide="previous" aria-label="Previous movie image">‹</button>'+
    '<button type="button" data-movie-slide="0" aria-label="Movie image one" aria-pressed="true">1</button>'+
    '<button type="button" data-movie-slide="1" aria-label="Movie image two" aria-pressed="false">2</button>'+
    '<button type="button" data-movie-slide="2" aria-label="Movie image three" aria-pressed="false">3</button>'+
    '<button type="button" data-movie-slide="next" aria-label="Next movie image">›</button></div></div>'+
    '<div class="movie-info-strip"><span>🎬 Film and television movie editions</span><span>🔗 Videos stay on YouTube</span><span>🌍 Country availability may vary</span></div>'+
    cinemaHeading('Full movies on YouTube','Checked full-length uploads from film publisher channels. New titles are indexed over time.','archive','Video archive →')+
    '<label class="movie-search-label" for="movieSearch">Find a movie <input type="search" id="movieSearch" value="'+escapeHTML(state.movieSearch)+
    '" placeholder="Search title or film channel" autocomplete="off"></label>'+
    '<div class="movie-count">'+candidates.length+' film'+(candidates.length===1?'':'s')+
    ' available in this directory. Some film-length uploads are edited editions of TV serials, not cinema releases.</div>'+
    (movieCards.length?'<div class="movie-grid">'+movieCards.map(videoCard).join('')+'</div>':
      '<div class="empty-state"><h3>No films match that title yet</h3><p>Try another name or browse the publisher channels below.</p></div>')+
    (candidates.length>state.visibleVideos?'<div class="load-more"><button class="btn-secondary" type="button" data-video-more>Show more movies ↓</button></div>':'')+
    cinemaHeading('Explore Pakistani film channels','Publisher-uploaded films, specials and classic titles.')+
    '<div class="channel-grid movie-channels">'+movieChannels.map(channelCard).join('')+'</div>'+
    '<p class="movie-copyright-note">PakTV Ghar only links to public videos on their original YouTube channels; it does not host movies. Not every YouTube upload is licensed for every country, and publisher labels such as “Full Movie” can include movie-length drama compilations.</p>'+
    '</section>';
}

function renderCategory(cat){
if(cat==='dramas'||cat==='comedy')return renderLibrary(cat);
const name=CATEGORY_LABELS[cat];const labels={news:'Headlines and current affairs directly from Pakistan.',sports:'Cricket, football, hockey, PSL highlights, Pakistani sports broadcasters and cricket creators. Videos refresh from publisher channels.',talk:'Political debate, interviews and evening shows.',vloggers:'Explore family vlogs, food bloggers, travel creators, journalists and Pakistani YouTube channels.'};
const catChannels=CHANNELS.filter(c=>c.category===cat&&(cat!=='vloggers'||state.creatorGenre==='all'||(c.genre||'News & commentary')===state.creatorGenre));
const recent=catVideos(cat).filter(v=>cat!=='vloggers'||state.creatorGenre==='all'||v.genre===state.creatorGenre);
const creators=['all','Food & recipes','Food & travel','Lifestyle & vlogs','Travel & lifestyle','News & commentary','Interviews & commentary'];
return `<div class="page-title"><span class="eyebrow">YOUR PAKISTANI TV</span><h1>${escapeHTML(name)}</h1><p>${escapeHTML(labels[cat]||'Watch official publisher videos.')}</p></div>
${cat==='vloggers'?'<div class="creator-genres" role="group" aria-label="YouTuber genres">'+creators.map(g=>'<button type="button" class="chip '+(state.creatorGenre===g?'active':'')+'" data-creator-genre="'+escapeHTML(g)+'">'+escapeHTML(g==='all'?'All creators':g)+'</button>').join('')+'</div>':''}
${cat==='sports'?'<div class="notice-box">🏏 Pakistan sports updates are sourced from broadcasters, cricket organisations and sports analysts on YouTube. New uploads appear after scheduled checks; video and regional playback depend on each publisher.</div>':''}
${cat==='sports'?`${sectionHead('Sports broadcasters & official cricket channels','Pakistan cricket, PSL, sports news and match coverage.')}<div class="channel-grid">${catChannels.filter(c=>c.genre!=='Sports analysis & creators').map(channelCard).join('')}</div>${sectionHead('Sports creators & analysts','Cricket commentary and independent match analysis.')}<div class="channel-grid">${catChannels.filter(c=>c.genre==='Sports analysis & creators').map(channelCard).join('')}</div>`:''}
${cat==='talk'?`${sectionHead('Explore programmes','Open any programme to browse available episodes.')}<div class="series-grid">${LIBRARY.filter(s=>s.type==='talk').map(seriesCard).join('')}</div>`:''}
${recent.length?`${sectionHead('Recent videos','Watch here, or open the original YouTube source.')}<div class="media-grid">${recent.slice(0,state.visibleVideos).map(videoCard).join('')}</div>${recent.length>state.visibleVideos?'<div class="load-more"><button type="button" class="btn-secondary" data-video-more>Show more uploads ('+(recent.length-state.visibleVideos)+' remaining) ↓</button></div>':''}`:''}
${cat==='sports'?'':`${sectionHead('YouTube channels','Browse and save channels, or open their uploaded videos.')}<div class="channel-grid">${(cat==='talk'?CHANNELS.filter(c=>c.category==='news'):catChannels).map(channelCard).join('')}</div>`}`}

function archiveDateUTC(offset=0){
  const d=new Date();d.setUTCHours(12,0,0,0);d.setUTCDate(d.getUTCDate()+offset);
  return d.toISOString().slice(0,10);
}
function archiveMatches(v){
  const day=v.date||((v.published||'').slice(0,10));
  const period=state.archivePeriod,now=archiveDateUTC(),yesterday=archiveDateUTC(-1);
  if(period==='today'&&day!==now)return false;
  if(period==='yesterday'&&day!==yesterday)return false;
  if(period==='week'&&(!day||day<archiveDateUTC(-7)))return false;
  if(period==='month'&&(!day||day<archiveDateUTC(-30)))return false;
  if(period==='older'&&(!day||day>=archiveDateUTC(-30)))return false;
  if(period==='date'&&(!state.archiveDate||day!==state.archiveDate))return false;
  if(state.archiveCategory!=='all'&&v.category!==state.archiveCategory)return false;
  if(state.archiveChannel!=='all'&&v.channelId!==state.archiveChannel)return false;
  if(state.archiveGenre!=='all'&&v.genre!==state.archiveGenre)return false;
  if(state.archiveQuery&&!(((v.title||'')+' '+(v.channel||'')).toLowerCase().includes(state.archiveQuery.toLowerCase())))return false;
  return true;
}
function renderArchive(){
  const all=uniqueVideos([...state.archiveVideos,...state.feed.filter(v=>/^\d{4}-\d{2}-\d{2}$/.test(v.date||''))]);
  const matched=all.filter(archiveMatches).sort((a,b)=>(b.published||b.date||'').localeCompare(a.published||a.date||''));
  const availableChannels=CHANNELS.filter(c=>all.some(v=>v.channelId===c.id));
  const availableGenres=[...new Set(all.map(v=>v.genre).filter(Boolean))].sort();
  const periods=[['all','All dates'],['today','Today'],['yesterday','Yesterday'],['week','Last 7 days'],['month','Last 30 days'],['older','Older videos'],['date','Choose date']];
  return '<div class="page-title"><span class="eyebrow">EXPLORE THE VIDEO ARCHIVE</span>'+
    '<h1>Yesterday &amp; older Pakistani videos</h1>'+
    '<p>Browse saved uploads from news, political discussions, comedy and YouTubers. Select a date, topic or channel. Video dates are shown in UTC. New channels are indexed gradually.</p></div>'+
    '<div class="archive-toolbar"><div class="chips" role="group" aria-label="Video age">'+
    periods.map(([id,label])=>'<button type="button" class="chip '+(state.archivePeriod===id?'active':'')+'" data-archive-period="'+id+'">'+label+'</button>').join('')+'</div>'+
    (state.archivePeriod==='date'?'<label class="archive-field">Upload date (UTC)<input id="archiveDay" type="date" value="'+escapeHTML(state.archiveDate||archiveDateUTC(-1))+'" max="'+archiveDateUTC()+'"></label>':'')+
    '<div class="archive-filters">'+
    '<label class="archive-field">Topic<select id="archiveTopic">'+
    [['all','All topics'],['news','News'],['talk','Political shows'],['comedy','Comedy'],['vloggers','YouTubers'],['dramas','Dramas'],['movies','Full movies']].map(([value,label])=>'<option value="'+value+'"'+(value===state.archiveCategory?' selected':'')+'>'+label+'</option>').join('')+
    '</select></label><label class="archive-field">Channel<select id="archiveChannel">'+
    '<option value="all">All channels</option>'+availableChannels.map(c=>'<option value="'+escapeHTML(c.id)+'"'+(state.archiveChannel===c.id?' selected':'')+'>'+escapeHTML(c.name)+'</option>').join('')+
    '</select></label><label class="archive-field">Creator topic<select id="archiveGenre"><option value="all">All creator topics</option>'+
    availableGenres.map(g=>'<option value="'+escapeHTML(g)+'"'+(g===state.archiveGenre?' selected':'')+'>'+escapeHTML(g)+'</option>').join('')+
    '</select></label><label class="archive-field">Find in archive<input id="archiveSearch" type="search" value="'+escapeHTML(state.archiveQuery)+'" placeholder="Search titles or channels"></label></div></div>'+
    '<p class="archive-count"><b>'+matched.length+'</b> indexed videos match these filters. '+all.length+' total cached videos so far.</p>'+
    (matched.length?'<div class="media-grid">'+matched.slice(0,state.archiveLimit).map(videoCard).join('')+'</div>':
      '<div class="notice-box">'+(state.archiveLoaded?
        'No videos indexed for this selection yet. Choose All dates, browse another channel, or return after the next scheduled update.':
        'Loading the video archive. Existing recent videos remain available.')+'</div>')+
    (matched.length>state.archiveLimit?'<div class="load-more"><button class="btn-secondary" type="button" data-archive-more>Show more videos ('+(matched.length-state.archiveLimit)+' remaining) ↓</button></div>':'')+
    renderInfo();
}

function renderFavourites(){const ch=CHANNELS.filter(c=>state.favoriteChannels.includes(c.id));const starred=LIBRARY.filter(s=>state.favoriteShows.includes(s.id));const videos=uniqueVideos([...state.archiveVideos,...SEED_VIDEOS,...state.feed,...state.searchResults,...Object.values(state.savedVideoData)]).filter(v=>state.favoriteVideos.includes(v.id));return `<div class="page-title"><span class="eyebrow">JUST FOR YOU</span><h1>♡ My Favourites</h1><p>Saved on this device. Your favourite channels are always just one tap away.</p></div>${!ch.length&&!state.favoriteVideos.length&&!starred.length?`<div class="empty-state" style="margin-top:24px"><div class="empty-emoji">💛</div><h3>No favourites yet</h3><p>Tap the heart on any video or channel to make it easy to find next time.</p><button class="btn-primary" data-nav="home" type="button">Discover videos</button></div>`:''}${starred.length?`${sectionHead('Saved programmes','Pick a series and choose an episode.')}<div class="series-grid">${starred.map(seriesCard).join('')}</div>`:''}${ch.length?`${sectionHead('Saved channels','Your easy-access channel list.')}<div class="channel-grid">${ch.map(channelCard).join('')}</div>`:''}${state.favoriteVideos.length?`${sectionHead('Saved videos','Videos you wanted to watch again.')} ${videos.length?`<div class="media-grid">${videos.map(videoCard).join('')}</div>`:`<div class="notice-box">Some saved videos are from a past search. Search for them again to reload their details.</div>`}`:''}`}
function searchYouTube(q){return `https://www.youtube.com/results?search_query=${encodeURIComponent(q+' Pakistani official')}`}
function renderSearch(){const q=state.query.trim();const lower=q.toLocaleLowerCase();const videos=uniqueVideos([...state.searchResults,...state.archiveVideos,...state.feed,...SEED_VIDEOS]).filter(v=>!lower||`${v.title} ${v.channel} ${v.description||''}`.toLocaleLowerCase().includes(lower));const channels=CHANNELS.filter(c=>!lower||`${c.name} ${c.description}`.toLocaleLowerCase().includes(lower));const catalogue=LIBRARY.filter(s=>!lower||`${s.name} ${s.network} ${(s.aliases||[]).join(' ')}`.toLocaleLowerCase().includes(lower));const shows=SHOWS.filter(s=>!lower||`${s.name} ${s.channel} ${s.description}`.toLocaleLowerCase().includes(lower));const any=videos.length+channels.length+shows.length+catalogue.length;return `<div class="page-title"><span class="eyebrow">FIND WHAT YOU LOVE</span><h1>Search ${q?`for “<span class="search-term">${escapeHTML(q)}</span>”`:'Pakistani TV'}</h1><p>Look for full drama episodes, talk shows, news, and Pakistani creators — English or Urdu.</p></div>
<div class="search-options"><span class="status-pill ${state.backend?'live':''}"><span class="mini-dot"></span>${state.searchLoading?'Searching…':state.backend?(state.apiMode==='youtube'?'YouTube search enabled':'Official channel feed search'):'Starter catalogue search'}</span>${state.searchLoading?'<span class="spinner"></span>':''}${q?`<a class="btn-secondary" href="${escapeHTML(searchYouTube(q))}" target="_blank" rel="noopener noreferrer">↗ Search all YouTube</a>`:''}</div>
${q?`<div class="result-banner">🔎 ${state.searchLoading?'Looking for videos...':`Showing matches from the catalogue${state.searchMode==='youtube'?' and YouTube':''}.`} ${state.searchMessage?`<span>${escapeHTML(state.searchMessage)}</span>`:''}</div>`:''}
${catalogue.length?`${sectionHead('Programmes & series',`${catalogue.length} shows found · choose a programme to browse episodes`)}<div class="series-grid">${catalogue.slice(0,60).map(seriesCard).join('')}</div>`:''}
${videos.length?`${sectionHead('Videos',`${videos.length} available result${videos.length===1?'':'s'}`)}<div class="media-grid">${videos.slice(0,40).map(videoCard).join('')}</div>`:''}
${shows.length?`${sectionHead('Political & TV shows','Search for a specific programme by name.')}<div class="channel-grid">${shows.map(showCard).join('')}</div>`:''}
${channels.length?`${sectionHead('Channels & YouTubers','Browse videos or open the publisher.')}<div class="channel-grid">${channels.map(channelCard).join('')}</div>`:''}
${q&&!any&&!state.searchLoading?`<div class="empty-state"><div class="empty-emoji">🔎</div><h3>No matching videos in this catalogue</h3><p>For a full YouTube search, use the button below. Or try a shorter search, like “Humsafar”, “Capital Talk” or “Geo”.</p><a class="btn-primary" href="${escapeHTML(searchYouTube(q))}" target="_blank" rel="noopener noreferrer">Search YouTube ↗</a></div>`:''}`}

/* Optional owner-supplied movie banner pictures. Until uploaded, show genuine
   publisher movie thumbnails as fallback rather than broken images. */
let movieHeadlineTimer=null;
function setupMovieHeadlines(){
  if(movieHeadlineTimer!==null){clearInterval(movieHeadlineTimer);movieHeadlineTimer=null;}
  const img=document.getElementById('movieHeroBackdrop');
  if(!img)return;
  const buttons=[...document.querySelectorAll('[data-movie-slide]')];
  const fallbackIds=movieVideos().slice(0,3).map(v=>v.id);
  while(fallbackIds.length<3)fallbackIds.push(FEATURED_MOVIE.id);
  let active=Math.floor(Math.random()*3);
  const show=(number)=>{
    active=((number%3)+3)%3;
    img.onerror=function(){this.onerror=null;this.src=thumb(fallbackIds[active]);};
    img.src='./assets/movie-headline-'+(active+1)+'.webp';
    for(const btn of buttons){
      const id=Number(btn.dataset.movieSlide);
      if(Number.isInteger(id))btn.setAttribute('aria-pressed',String(id===active));
    }
  };
  const manual=key=>{
    show(key==='previous'?active-1:key==='next'?active+1:Number(key));
    if(movieHeadlineTimer!==null)clearInterval(movieHeadlineTimer);
    if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      movieHeadlineTimer=setInterval(()=>show(active+1),7200);
  };
  for(const btn of buttons)btn.addEventListener('click',()=>manual(btn.dataset.movieSlide));
  show(active);
  if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    movieHeadlineTimer=setInterval(()=>show(active+1),7200);
}

function paint(){renderNav();el('mainContent').innerHTML=state.page==='home'?renderHome():state.page==='today'?renderToday():state.page==='show'?renderShowPage():state.page==='movies'?renderMovies():state.page==='archive'?renderArchive():state.page==='favourites'?renderFavourites():state.page==='search'?renderSearch():renderCategory(state.page);updateSpotlightTimer();setupMovieHeadlines();document.dispatchEvent(new Event('paktv:paint'));if(state.page==='search'){el('searchInput').value=state.query}document.documentElement.lang=state.language==='ur'?'ur':'en';const s=el('searchInput');s.placeholder=state.language==='ur'?'ڈرامے، خبریں، ٹاک شوز، یوٹیوبرز تلاش کریں...':'Search dramas, movies, videos & more...'}
function toast(message){el('toast').textContent=message;el('toast').classList.add('show');clearTimeout(state.toastTimer);state.toastTimer=setTimeout(()=>el('toast').classList.remove('show'),2200)}
function favVideo(id){const set=new Set(state.favoriteVideos);const v=pickVideo(id);if(set.has(id)){set.delete(id);delete state.savedVideoData[id]}else{set.add(id);if(v)state.savedVideoData[id]=v}state.favoriteVideos=[...set];safeSet('pgh_video_favs',state.favoriteVideos);safeSet('pgh_video_data',state.savedVideoData);toast(set.has(id)?'Video saved to favourites ♥':'Video removed from favourites');if(state.currentVideo?.id===id)el('playerFav').textContent=set.has(id)?'♥ Saved':'♡ Save';paint()}
function favChannel(id){const set=new Set(state.favoriteChannels);set.has(id)?set.delete(id):set.add(id);state.favoriteChannels=[...set];safeSet('pgh_channel_favs',state.favoriteChannels);toast(set.has(id)?'Channel added to favourites ♥':'Channel unpinned');paint()}
function pickVideo(id){return uniqueVideos([...state.searchResults,...state.archiveVideos,...state.feed,...FEATURED_MOVIES,...SEED_VIDEOS,...Object.values(state.savedVideoData)]).find(v=>v.id===id)}
let youtubeAPILoading=false;
function loadPlayerApi(){if(youtubeAPILoading||window.YT?.Player)return;youtubeAPILoading=true;const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.async=true;document.head.appendChild(script)}
window.onYouTubeIframeAPIReady=()=>{state.ytLoaded=true;if(state.currentVideo)installIframePlayer(state.currentVideo.id)};
function installIframePlayer(videoId){if(!window.YT?.Player||!state.currentVideo||state.currentVideo.id!==videoId)return;try{state.ytPlayer=new YT.Player('youtubeFrame',{events:{onError:(ev)=>{const box=el('playbackNotice');if(!state.currentVideo||state.currentVideo.id!==videoId)return;const error=Number(ev.data);let msg=error===101||error===150?'This publisher does not allow this video in embedded players.':error===153?'YouTube needs a normal website address to play this embed. Start PakTV Ghar through its included server, or open this video on YouTube.':error===100?'This video was removed or is private.':'YouTube could not play this video here. It might be restricted in your country, unavailable, or blocked from embedding.';box.textContent=msg+' Try “Open on YouTube” to view the original upload.';box.hidden=false},onStateChange:(ev)=>{if(ev.data===1&&state.currentVideo){state.history=[state.currentVideo.id,...state.history.filter(x=>x!==state.currentVideo.id)].slice(0,12);safeSet('pgh_history',state.history)}}}})}catch(e){console.warn('YouTube player setup:',e)}}
async function checkVideoAvailability(id){try{const resp=await fetch(`/api/check?video=${encodeURIComponent(id)}`,{signal:AbortSignal.timeout(5500)});if(!resp.ok)return;const d=await resp.json();if(!state.currentVideo||state.currentVideo.id!==id)return;if(d.restrictionMessage){el('playbackNotice').textContent=d.restrictionMessage;el('playbackNotice').hidden=false}}catch{}}
function watchVideo(v){state.currentVideo=v;state.history=[v.id,...state.history.filter(x=>x!==v.id)].slice(0,12);safeSet('pgh_history',state.history);el('playerTitle').textContent=v.title;el('playerSource').textContent=v.channel;el('playerSubtitle').textContent=v.description||'Watching from the original YouTube channel';el('openYouTube').href=videoURL(v.id);el('playerFav').textContent=state.favoriteVideos.includes(v.id)?'♥ Saved':'♡ Save';el('playbackNotice').hidden=true;el('playerOverlay').hidden=false;document.body.style.overflow='hidden';const box=el('videoBox');box.innerHTML='';const frame=document.createElement('iframe');frame.id='youtubeFrame';frame.src=`https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.id)}?autoplay=1&rel=0&enablejsapi=1&origin=${encodeURIComponent(window.location.origin||'')}`;frame.title=v.title;frame.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';box.appendChild(frame);loadPlayerApi();if(window.YT?.Player)installIframePlayer(v.id);el('closePlayer').focus()}
function closeVideo(){if(state.ytPlayer){try{state.ytPlayer.destroy()}catch{}state.ytPlayer=null}el('videoBox').innerHTML='';el('playerOverlay').hidden=true;document.body.style.overflow='';state.currentVideo=null}
function openChannelVideos(c){state.archiveChannel=c.id;state.archiveCategory='all';state.archivePeriod='all';state.archiveQuery='';state.archiveLimit=30;navTo('archive')}
function searchShow(show){state.query=show.name;el('searchInput').value=show.name;navTo('search');doSearch(show.query,show.channelId,true)}

async function loadArchive(){
  try{
    const resp=await fetch('./data/archive.json?t='+Date.now(),{signal:AbortSignal.timeout(24000)});
    if(!resp.ok)throw Error('Archive unavailable');
    const result=await resp.json();
    if(!Array.isArray(result?.videos))throw Error('Archive not valid');
    state.archiveVideos=uniqueVideos(result.videos);
    state.archiveError=false;
    state.archiveLoaded=true;
    if(state.page==='show'&&LIBRARY.find(s=>s.id===showId())?.type!=='drama')loadEpisodes(0);
    else if(['archive','home','movies','news','sports','talk','comedy','vloggers','favourites','search','show'].includes(state.page))paint();
  }catch{
    state.archiveLoaded=true;
    state.archiveError=true;
    if(state.page==='archive')paint();
  }
}

async function refreshFeeds(){if(state.feedLoading)return;state.feedLoading=true;try{const resp=await fetch('./data/videos.json?t='+Date.now(),{signal:AbortSignal.timeout(24000)});if(!resp.ok)throw Error('Offline');const data=await resp.json();state.feed=uniqueVideos(data.videos||[]);state.backend=true;state.apiMode=data.mode||'feeds';state.feedTried=true}catch{state.backend=false;state.feedTried=true}finally{state.feedLoading=false;paint()}}
async function doSearch(q,channelId='',isShow=false){
 q=String(q||'').trim();state.searchRequest++;state.searchLoading=false;
 const terms=q.toLocaleLowerCase().split(/\s+/).filter(Boolean);
 state.searchResults=uniqueVideos([...state.feed,...SEED_VIDEOS]).filter(v=>{
  const haystack=`${v.title} ${v.channel}`.toLocaleLowerCase();
  return terms.every(t=>haystack.includes(t))&&(!channelId||v.channelId===channelId);
 }).slice(0,60);
 state.searchMode='feeds';state.searchMessage='Matches in recently indexed uploads. For full archives, use Search all YouTube.';paint();
}
function changeSearch(input){state.query=input;clearTimeout(state.searchTimer);if(input.trim()){if(state.page!=='search')navTo('search');state.searchTimer=setTimeout(()=>doSearch(input),380)}else{state.searchResults=[];state.searchLoading=false;state.searchRequest++;if(state.page==='search')paint()}}
function bindEvents(){el('searchInput').addEventListener('input',e=>changeSearch(e.target.value));el('searchInput').addEventListener('keydown',e=>{if(e.key==='Escape'&&e.target.value){e.target.value='';changeSearch('')}});el('topFavourites').addEventListener('click',()=>navTo('favourites'));el('languageButton').addEventListener('click',()=>{state.language=state.language==='en'?'ur':'en';safeSet('pgh_lang',state.language);paint();toast(state.language==='ur'?'زبان تبدیل ہو گئی':'Language changed')});el('closePlayer').addEventListener('click',closeVideo);el('playerOverlay').addEventListener('click',e=>{if(e.target.closest('[data-close]'))closeVideo()});el('playerFav').addEventListener('click',()=>{if(state.currentVideo)favVideo(state.currentVideo.id)});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!el('playerOverlay').hidden)closeVideo();if(e.key==='/'&&document.activeElement?.tagName!=='INPUT'){e.preventDefault();el('searchInput').focus()}});document.addEventListener('click',e=>{const nav=e.target.closest('[data-nav]');if(nav){navTo(nav.dataset.nav);return}const vid=e.target.closest('[data-video]');if(vid){e.preventDefault();const v=pickVideo(vid.dataset.video);if(v)watchVideo(v);return}const vf=e.target.closest('[data-video-fav]');if(vf){favVideo(vf.dataset.videoFav);return}const cf=e.target.closest('[data-channel-fav]');if(cf){favChannel(cf.dataset.channelFav);return}const ch=e.target.closest('[data-channel]');if(ch){const c=fromChannel(ch.dataset.channel);if(c)openChannelVideos(c);return}const sh=e.target.closest('[data-show]');if(sh){const show=SHOWS.find(s=>s.id===sh.dataset.show);if(show)searchShow(show)}});window.addEventListener('hashchange',()=>{const hash=location.hash.slice(1);if(Object.hasOwn(PAGE_FILES,hash)){navTo(hash);return;}if(hash.startsWith('show-')){window.location.assign('./show.html?id='+encodeURIComponent(hash.slice(5)));return;}state.page=locationPage();paint();window.scrollTo(0,0)})}

// ── Expanded catalogue, verified episode picker, and Pakistan-time programme guide ──
const networkName={hum:'HUM TV',arydigital:'ARY Digital',harpalgeo:'Har Pal Geo',greentv:'Green Entertainment',ptvhome:'PTV Home',expressent:'Express TV',aajent:'Aaj Entertainment',ptvnews:'PTV News',aajnews:'Aaj TV',samaa:'SAMAA TV',dunya:'Dunya News',geonews:'Geo News',arynews:'ARY News',expressnews:'Express News',pakexperience:'The Pakistan Experience'};
const networkShort={hum:'HUM',arydigital:'ARY',harpalgeo:'GEO',greentv:'GREEN',ptvhome:'PTV',expressent:'EXPRESS',aajent:'AAJ',ptvnews:'PTV NEWS',aajnews:'AAJ',samaa:'SAMAA',dunya:'DUNYA',geonews:'GEO',arynews:'ARY',expressnews:'EXPRESS'};
const publisherSearch=(show,number)=>`https://www.youtube.com/results?search_query=${encodeURIComponent(show.name+' Episode '+(number||'')+' '+(networkName[show.network]||show.network)+' official full')}`;
const broadcasterLink=(show)=>show.officialUrl||(show.network==='hum'?'https://hum.tv/dramas/':show.network==='arydigital'?'https://arydigital.tv/drama/':show.network==='harpalgeo'?'https://harpalgeo.tv/videos':show.network==='greentv'?'https://greenentertainment.tv/drama':show.network==='ptvhome'?'https://www.youtube.com/@PTVHomeEntertainment':show.network==='expressent'?'https://www.youtube.com/@expressentertainment':'https://www.youtube.com/');
const showId=()=>new URLSearchParams(location.search).get('id')||decodeURIComponent(location.hash.slice(6));

function showDetails(s){
  const meta=state.showMeta[s.id]||{};
  const tv=meta.tvToday && meta.tvToday.date===pakistanDate() ? meta.tvToday : null;
  const fromSchedule=(state.schedule?.date===pakistanDate()?state.schedule.items||[]:[])
    .filter(x=>x.showId===s.id && Number.isInteger(x.episode) && x.episode>0)
    .reduce((best,x)=>!best||x.episode>best.number?{number:x.episode,time:x.time,source:x.sourceUrl}:best,null);
  return {meta, tv:tv||fromSchedule, upload:meta.latestUpload||null,
    listed:Number.isInteger(meta.latestPublisherEpisode)?meta.latestPublisherEpisode:null};
}
function showArtwork(s){
  const meta=showDetails(s).meta;
  const src=typeof meta.poster==='string'&&/^https:\/\//.test(meta.poster)?meta.poster:'';
  return src?'<img class="series-cover-image" src="'+escapeHTML(src)+'" alt="'+escapeHTML(s.name)+' official programme artwork" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">':'';
}
function showLatestLabel(s){
  const info=showDetails(s);
  if(info.upload?.number)return 'Latest indexed YouTube: Ep '+info.upload.number;
  if(info.tv?.number)return 'On TV today: Ep '+info.tv.number;
  if(info.listed)return 'Broadcaster lists: Ep '+info.listed;
  return 'Latest episode not confirmed';
}
function seriesCard(s){
  const fav=state.favoriteShows.includes(s.id);
  const icon=s.type==='satire'?'🎭':s.type==='comedy'?'😄':s.type==='talk'?'🎙️':s.type==='reality'?'✨':'🎬';
  const status=s.status==='upcoming'?'Coming soon':s.status==='airing'?'Featured':s.status==='recent'?'Recent':s.status==='library'?'Programme':'Archive';
  return '<article class="series-card">'+
    '<button class="series-main" type="button" data-series="'+escapeHTML(s.id)+'">'+
    '<div class="series-poster poster-'+escapeHTML(s.network)+'">'+
    '<span class="poster-identity" aria-hidden="true">'+escapeHTML(s.name)+'</span>'+
    '<span class="poster-icon" aria-hidden="true">'+icon+'</span>'+showArtwork(s)+
    '<span class="poster-network">'+escapeHTML(networkShort[s.network]||s.network.toUpperCase())+'</span></div>'+
    '<div class="series-desc"><span class="series-tag">'+escapeHTML(status)+' · '+escapeHTML(networkName[s.network]||s.network)+'</span>'+
    '<h3>'+escapeHTML(s.name)+'</h3>'+
    '<span class="series-latest">'+escapeHTML(showLatestLabel(s))+'</span>'+
    '<span class="series-action">Browse episodes →</span></div></button>'+
    '<button class="series-fav '+(fav?'saved':'')+'" type="button" data-series-fav="'+escapeHTML(s.id)+'" aria-label="'+(fav?'Remove':'Add')+' '+escapeHTML(s.name)+' favourite">'+(fav?'♥':'♡')+'</button></article>';
}

function renderLibrary(type){
  const isDrama=type==='dramas';
  const dramaNetworks=['hum','arydigital','harpalgeo','greentv','ptvhome','expressent'];
  const availableNetworks=isDrama?dramaNetworks.concat(['aajent']):['dunya','geonews','geohasna','p4pakao','hasbehaal','greentv'];
  if(state.networkFilter!=='all'&&!availableNetworks.includes(state.networkFilter))state.networkFilter='all';
  let base=LIBRARY.filter(s=>isDrama?s.type==='drama':s.type==='comedy'||s.type==='satire'||s.type==='reality');
  if(state.networkFilter!=='all')base=base.filter(s=>s.network===state.networkFilter);
  if(state.libraryFilter==='featured')base=base.filter(s=>isDrama?['airing','upcoming','recent'].includes(s.status):s.status!=='archive');
  if(state.libraryFilter==='classic')base=base.filter(s=>s.status==='archive'||s.status==='library');
  const count=base.length;
  const filters=[['all','All networks'],...availableNetworks.map(id=>[id,networkName[id]||id])];
  return '<div class="page-title"><span class="eyebrow">THE PAKTV COLLECTION</span><h1>'+ (isDrama?'Pakistani Drama Universe':'Comedy &amp; Political Satire')+
    '</h1><p>'+(isDrama?'Explore dramas from HUM, ARY, Geo, Green Entertainment, PTV Home and Express TV.':'Explore comedy, satire and interviews from Pakistani channels.')+
    ' Choose a show to explore verified uploads or search its original broadcaster.</p></div>'+
    '<div class="library-tools"><div class="chips" role="group" aria-label="Programme era">'+
    [['featured','Spotlight'],['classic','Classics & libraries'],['all','All shows']].map(([id,label])=>'<button type="button" class="chip '+(state.libraryFilter===id?'active':'')+'" data-era="'+id+'">'+label+'</button>').join('')+
    '</div><div class="chips" role="group" aria-label="Broadcaster">'+
    filters.map(([id,label])=>'<button type="button" class="chip '+(state.networkFilter===id?'active':'')+'" data-net="'+id+'">'+escapeHTML(label)+'</button>').join('')+
    '</div></div>'+sectionHead(count+' programmes','Official sources where available · episodes may vary by region')+
    '<div class="series-grid">'+base.slice(0,state.visibleShows).map(seriesCard).join('')+'</div>'+
    (count>state.visibleShows?'<div class="load-more"><button class="btn-secondary" type="button" data-more>Load more shows ('+(count-state.visibleShows)+' remaining) ↓</button></div>':'')+
    (!isDrama?sectionHead('Comedy uploads','Latest comedy videos and interviews.','archive','Browse archive →')+
     '<div class="media-grid">'+catVideos('comedy').slice(0,18).map(videoCard).join('')+'</div>':'')+
    renderInfo();
}
function nowInPakistan(){return new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Karachi',weekday:'long',day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date())}
function pakistanMinutes(){let p=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Karachi',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date());return p}
function pakistanDate(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Karachi',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()).replace(/\//g,'-')}
function scheduleCards(limit=0){
  const latest=state.schedule;
  const isToday=latest?.date===pakistanDate();
  if(!isToday||!Array.isArray(latest?.items)||!latest.items.length){
    const reason=state.scheduleLoading?'Loading today’s programme listings…':!latest?'The schedule file is not available yet.':!isToday?'The latest saved TV guide is for '+escapeHTML(latest.date||'an unknown date')+'; today’s update is pending.':'No verified TV slots were returned by the broadcaster websites.';
    return `<div class="notice-box">📺 ${reason} <a href="https://hum.tv/" target="_blank" rel="noopener">HUM TV</a> · <a href="https://arydigital.tv/schedule" target="_blank" rel="noopener">ARY schedule</a> · <a href="https://harpalgeo.tv/schedule" target="_blank" rel="noopener">Geo schedule</a></div>`;
  }
  let items=latest.items.filter(x=>/^\d{2}:\d{2}$/.test(x.time||''));
  const now=pakistanMinutes();
  if(limit){const next=items.filter(x=>x.time>=now);items=(next.length?next:items.slice(-limit)).slice(0,limit)}
  const header=limit?'':`<p class="schedule-note">All ${latest.items.length} saved broadcast slots for ${escapeHTML(latest.weekday||'today')} · Pakistan time (PKT). Programme schedules are not confirmed YouTube uploads.</p>`;
  return header+`<div class="schedule-grid">${items.map(x=>{
    const upcoming=x.time>=now;
    const show=LIBRARY.find(s=>s.id===x.showId);
    const info=show?showDetails(show):{meta:state.showMeta?.[x.showId]||{},upload:state.showMeta?.[x.showId]?.latestUpload||null};
    const sourcePoster=typeof info.meta.poster==='string'&&info.meta.poster.startsWith('https://')?info.meta.poster:'';
    const youtubeArtwork=/^[a-zA-Z0-9_-]{11}$/.test(info.upload?.id||'')?thumb(info.upload.id):'';
    const poster=sourcePoster||youtubeArtwork;
    const imageMarkup=poster?'<div class="schedule-artwork"><img src="'+escapeHTML(poster)+'" alt="'+escapeHTML(x.name)+' programme poster from official broadcaster or official YouTube upload" loading="lazy" referrerpolicy="no-referrer" onerror="this.onerror=null;'+(youtubeArtwork&&youtubeArtwork!==poster?'this.src=\''+youtubeArtwork+'\';':'this.style.display=\'none\';')+'"></div>':
      '<div class="schedule-artwork schedule-artwork-fallback" aria-hidden="true"><span>📺</span><small>'+escapeHTML(x.channel)+'</small></div>';
    const stateLabel=x.repeat===true?'Repeat broadcast':x.repeat===false?'New scheduled broadcast':upcoming?'Later today':'Broadcast slot';
    const search='https://www.youtube.com/results?search_query='+encodeURIComponent(x.name+' '+x.channel+' official full episode');
    const source=x.sourceLabel||'Broadcaster schedule';
    return `<article class="schedule-card">${imageMarkup}<span class="schedule-time">${escapeHTML(x.time)} <small>PKT</small></span><span class="schedule-channel">${escapeHTML(x.channel)}</span><h3>${escapeHTML(x.name)}</h3><p>${x.episode?'Episode '+escapeHTML(String(x.episode))+' · ':''}${escapeHTML(stateLabel)}</p><small class="schedule-source">${escapeHTML(source)}</small><div class="schedule-buttons">${show?`<button type="button" class="small-button accent" data-series="${escapeHTML(show.id)}">Choose episode</button>`:`<a class="small-button accent" target="_blank" rel="noopener noreferrer" href="${escapeHTML(search)}">Find episode ↗</a>`}<a class="small-button" href="${escapeHTML(x.sourceUrl||'https://hum.tv/') }" target="_blank" rel="noopener noreferrer">Check listing ↗</a></div></article>`;
  }).join('')}</div>`;
}
function scheduleLinks(){return `<div class="source-links"><a href="https://hum.tv/" target="_blank" rel="noopener noreferrer">HUM TV ↗</a><a href="https://arydigital.tv/schedule" target="_blank" rel="noopener noreferrer">ARY Digital ↗</a><a href="https://harpalgeo.tv/schedule" target="_blank" rel="noopener noreferrer">Har Pal Geo ↗</a></div>`}
function renderTodayMini(){return `${sectionHead('📅 Airing in Pakistan today',nowInPakistan()+' · programme schedule, not uploaded episodes','today','Full TV guide →')}${scheduleCards(6)}`}
function renderToday(){return `<div class="page-title"><span class="eyebrow">PAKISTAN STANDARD TIME · PKT</span><h1>📅 Today on Pakistani TV</h1><p>${escapeHTML(nowInPakistan())}. Latest broadcaster listings are checked automatically; backups are labelled when used.</p></div><div class="notice-box">📺 <b>Scheduled on TV ≠ uploaded to YouTube.</b> An episode only becomes playable once its publisher makes it available. All times below are Pakistan time, not UK time.</div>${scheduleCards()}${scheduleLinks()}${state.schedule?.errors?.length?`<div class="notice-box">Some source listings could not be loaded: ${escapeHTML(state.schedule.errors.join('; '))}. Check their official schedules directly.</div>`:''}`}

function showEpisodeFact(label,number,note,link){
  const value=number?'Episode '+number:'Not confirmed';
  return '<div class="latest-fact"><span>'+escapeHTML(label)+'</span><strong>'+escapeHTML(value)+'</strong><small>'+escapeHTML(note)+'</small>'+
    (link?'<small><a href="'+escapeHTML(link)+'" target="_blank" rel="noopener noreferrer">View original source ↗</a></small>':'')+'</div>';
}
function renderShowPage(){
  const show=LIBRARY.find(s=>s.id===showId());
  if(!show)return renderHome();
  const details=showDetails(show);
  const episodes=state.episodeLoadedFor===show.id?state.episodeList:[];
  const available=episodes.filter(e=>e.id||e.url);
  const maxIndexed=available.filter(e=>Number.isInteger(e.episode)).reduce((n,e)=>Math.max(n,e.episode),0);
  const lastUpload=details.upload?.number || maxIndexed || null;
  const currentHint=lastUpload||details.tv?.number||details.listed||'';
  // For a sourced number, offer an episode chooser up to that number.
  // These are search options only, never represented as verified video links.
  const episodeSearchControl=Number.isInteger(Number(currentHint)) && Number(currentHint)>0 && Number(currentHint)<=400?
    '<select id="episodeNumber" aria-label="Episode number to search on YouTube">'+
    Array.from({length:Number(currentHint)},(_,i)=>'<option value="'+(i+1)+'"'+
      (i+1===Number(currentHint)?' selected':'')+'>Episode '+(i+1)+' (search)</option>').join('')+
    '</select>':
    '<input id="episodeNumber" type="number" min="1" max="1200" step="1" inputmode="numeric" placeholder="e.g. 18"'+
    (currentHint?' value="'+escapeHTML(String(currentHint))+'"':'')+'>';
  const status=state.episodeLoading?'Looking up indexed publisher videos…':
    available.length?available.length+' directly indexed official items found':
    'No directly indexed full episodes found for this show yet';
  const network=networkName[show.network]||show.network;
  const latestWatch=details.upload?.id?'<a class="btn-primary" target="_blank" rel="noopener noreferrer" href="'+escapeHTML(videoURL(details.upload.id))+'">'+(details.upload.availableGB===false?'↗ Open on YouTube (UK restricted)': '▶ Latest indexed YouTube upload')+'</a>':'';
  const regionNote=details.upload?.availableGB===false?'YouTube metadata lists this video as unavailable in the UK.':details.upload?.embeddable===false?'The publisher has disabled embedding; use YouTube directly.':'This is from our limited official-channel video index; playback still depends on the publisher.';
  const header='<div class="show-cover"><div class="series-poster poster-'+escapeHTML(show.network)+'">'+
    '<span class="poster-identity">'+escapeHTML(show.name)+'</span>'+showArtwork(show)+
    '<span class="poster-network">'+escapeHTML(networkShort[show.network]||show.network.toUpperCase())+'</span></div>'+
    '<div class="page-title show-heading"><button class="back-link" type="button" data-nav="'+(show.type==='drama'?'dramas':'comedy')+'">← Browse programmes</button>'+
    '<span class="eyebrow">'+escapeHTML(network)+' · '+escapeHTML(show.type)+'</span><h1>'+escapeHTML(show.name)+'</h1>'+
    '<p>See the latest episode information we can verify, then choose a video or search for another episode.</p></div></div>';
  const statusCards='<div class="latest-facts" aria-label="Latest episode information">'+
    showEpisodeFact('Latest indexed official YouTube upload',lastUpload,
      regionNote,details.upload?.id?videoURL(details.upload.id):null)+
    showEpisodeFact('Listed on Pakistani TV today',details.tv?.number,
      details.tv?.number?'A TV slot for '+(details.tv.time||'today')+' PKT; not proof the episode is online.':'Not published in the TV listings we currently have.',details.tv?.source)+
    showEpisodeFact('Highest episode in broadcaster guide',details.listed,
      details.listed?'Based on the broadcaster programme page; not proof of an upload today.':'The broadcaster did not publish a machine-readable episode count.',details.meta.latestPublisherSource)+
    '</div>';
  const dropdown=available.length?
    '<label for="episodeSelect" class="episode-label">Available episodes in the indexed publisher feed</label>'+
    '<div class="episode-picker"><select id="episodeSelect" aria-label="Select an indexed episode">'+
    available.map((v,i)=>'<option value="'+i+'">'+escapeHTML((v.episode?'Episode '+v.episode:'Video')+(v.availableGB===false?' · UK restricted':v.embeddable===false?' · no embed':'')+' — '+v.title.slice(0,75))+'</option>').join('')+
    '</select><button type="button" class="btn-primary" data-play-selected>▶ Play selected</button></div>'+
    '<div class="episode-results">'+available.slice(0,36).map((e,i)=>'<div class="episode-row">'+
      '<strong>'+escapeHTML(e.episode?'EP '+e.episode:'VIDEO')+'</strong>'+
      '<span>'+escapeHTML(e.title)+'</span>'+
      (e.id?'<button class="small-button accent" type="button" data-episode="'+i+'">▶ Play</button>':
        '<a class="small-button accent" href="'+escapeHTML(e.url||'#')+'" target="_blank" rel="noopener noreferrer">↗ Official site</a>')+
    '</div>').join('')+'</div>':'';
  return header+
    '<div class="show-actions"><button class="btn-secondary" type="button" data-series-fav="'+escapeHTML(show.id)+'">'+
    (state.favoriteShows.includes(show.id)?'♥ Saved to favourites':'♡ Save programme')+'</button>'+
    '<a class="btn-secondary" target="_blank" rel="noopener noreferrer" href="'+escapeHTML(broadcasterLink(show))+'">Official broadcaster page ↗</a>'+
    '<a class="btn-secondary" target="_blank" rel="noopener noreferrer" href="'+escapeHTML(publisherSearch(show,''))+'">Search episodes on YouTube ↗</a>'+
    latestWatch+'</div>'+
    statusCards+
    '<section class="episode-panel"><h2>▶ Episodes &amp; availability</h2>'+
    '<p class="subtitle">'+escapeHTML(status)+'. Episode information updates automatically when official sources are reachable.</p>'+
    dropdown+
    '<div class="episode-finder"><h3>Find an episode by number</h3>'+
    '<p>There is <b>no assumed 300-episode limit</b>. Enter a number you want and search YouTube. Only the results above have confirmed indexed links.</p>'+
    '<div class="episode-picker"><label class="visually-hidden" for="episodeNumber">Episode number to search</label>'+
    episodeSearchControl+
    '<button class="btn-secondary" type="button" data-find-episode>🔎 Search that episode</button></div></div>'+
    '<div class="load-more"><button type="button" class="small-button" data-reload-episodes>↻ Refresh indexed episodes</button></div>'+
    '</section>'+renderInfo();
}

function favoriteShow(id){let s=LIBRARY.find(x=>x.id===id);if(!s)return;let set=new Set(state.favoriteShows);set.has(id)?set.delete(id):set.add(id);state.favoriteShows=[...set];safeSet('pgh_show_favs',state.favoriteShows);toast(set.has(id)?'Programme added to favourites ♥':'Programme removed');paint()}
function openSeries(id){if(!LIBRARY.some(s=>s.id===id))return;window.location.assign('./show.html?id='+encodeURIComponent(id));}
async function loadDiscovery(){try{const resp=await fetch('./data/discover.json?t='+Date.now(),{signal:AbortSignal.timeout(26000)});if(!resp.ok)return;const data=await resp.json();const known=new Set(LIBRARY.map(x=>x.id));let added=0;for(const show of data.shows||[]){if(typeof show.id!=='string'||typeof show.name!=='string'||known.has(show.id)||!['hum','arydigital','harpalgeo'].includes(show.network))continue;known.add(show.id);LIBRARY.push(show);added++}if(added&&(state.page==='home'||state.page==='dramas'||state.page==='search'||state.page==='comedy'))paint()}catch{}}

async function loadShowMetadata(){
 try{
  const resp=await fetch('./data/show-meta.json?t='+Date.now(),{signal:AbortSignal.timeout(20000)});
  if(!resp.ok)return;
  const data=await resp.json();
  if(!data||typeof data.shows!=='object'||Array.isArray(data.shows))return;
  state.showMeta=data.shows;
  state.showMetaLoaded=true;
  if(['home','dramas','comedy','show','favourites','search'].includes(state.page))paint();
 }catch{/* The programme directory still works without metadata. */}
}

async function loadSchedule(){state.scheduleLoading=true;try{const r=await fetch('./data/schedule.json?t='+Date.now(),{signal:AbortSignal.timeout(16000)});if(!r.ok)throw Error('Offline');const data=await r.json();state.schedule=data;state.backend=true}catch{state.schedule=null}finally{state.scheduleLoading=false;if(state.page==='home'||state.page==='today')paint()}}
async function loadEpisodes(page=0){
  const id=showId();const show=LIBRARY.find(s=>s.id===id);if(!show)return;
  state.episodeLoadedFor=id;state.episodeList=[];state.episodeLoading=true;state.episodePage=page;paint();
  let listing=[];
  try{
    const resp=await fetch('./data/episodes.json?t='+Date.now(),{signal:AbortSignal.timeout(18000)});
    if(resp.ok){const data=await resp.json();listing=Array.isArray(data[id]?.episodes)?data[id].episodes:[];}
  }catch{}
  if(show.type!=='drama'){
    // Political and comedy programme pages can use the same publisher archive
    // even if a drama-style episode number is not part of the title.
    const name=show.name.toLowerCase().replace(/[^a-z0-9]+/g,'');
    const fromArchive=state.archiveVideos.filter(v=>{
      const title=(v.title||'').toLowerCase().replace(/[^a-z0-9]+/g,'');
      const samePublisher=v.channelId===show.network||
        (show.network==='dunya'&&v.channelId==='hasbehaal'&&show.id.includes('hasb'))||
        (show.network==='geonews'&&v.channelId==='geohasna'&&show.name.toLowerCase().includes('hasna'));
      return samePublisher&&title.includes(name)&&name.length>4;
    }).slice(0,100).map(v=>({
      id:v.id,title:v.title,date:v.date,source:v.channel,
      embeddable:v.embeddable,availableGB:v.availableGB,episode:null
    }));
    const seen=new Set(listing.map(v=>v.id));
    for(const video of fromArchive)if(!seen.has(video.id)){seen.add(video.id);listing.push(video);}
  }
  if(showId()!==id)return;
  state.episodeList=listing;state.episodeLoading=false;paint();
}
function playIndexed(index){const item=state.episodeList[index];if(!item)return;if(item.id){if(item.availableGB===false||item.embeddable===false){window.open(videoURL(item.id),'_blank','noopener,noreferrer');toast(item.availableGB===false?'YouTube reports this upload may be blocked in the UK.':'Embedding disabled by publisher; opened YouTube.');return}const s=LIBRARY.find(x=>x.id===state.episodeLoadedFor);watchVideo({id:item.id,title:item.title,channel:item.source||networkName[s?.network]||'Official YouTube',channelId:s?.network,category:s?.type==='drama'?'dramas':'talk',date:item.date||'',description:'Found on the official channel or broadcaster website.'})}else if(item.url)window.open(item.url,'_blank','noopener,noreferrer')}
// Cinema rail arrows are accessible controls for desktop and keyboard users.
document.addEventListener('click',event=>{
  const button=event.target.closest('[data-rail-scroll]');
  if(!button)return;
  const track=button.closest('.cinema-row')?.querySelector('.cinema-video-rail,.cinema-poster-rail,.cinema-channel-rail');
  if(!track)return;
  const direction=Number(button.dataset.railScroll)>=0?1:-1;
  track.scrollBy({left:direction*Math.max(270,track.clientWidth*.8),
    behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
});
// Event delegation intentionally works after page re-renders.
document.addEventListener('click',e=>{
  const period=e.target.closest('[data-archive-period]');
  if(period){
    state.archivePeriod=period.dataset.archivePeriod;
    if(state.archivePeriod==='date'&&!state.archiveDate)state.archiveDate=archiveDateUTC(-1);
    state.archiveLimit=30;paint();return;
  }
  if(e.target.closest('[data-archive-more]')){
    state.archiveLimit+=30;paint();return;
  }
  const genre=e.target.closest('[data-creator-genre]');
  if(genre){state.creatorGenre=genre.dataset.creatorGenre;state.visibleVideos=24;paint();return;}
  if(e.target.closest('[data-video-more]')){state.visibleVideos+=24;paint();}
});
document.addEventListener('change',e=>{
  if(e.target.id==='archiveTopic'){state.archiveCategory=e.target.value;state.archiveLimit=30;paint();}
  if(e.target.id==='archiveChannel'){state.archiveChannel=e.target.value;state.archiveLimit=30;paint();}
  if(e.target.id==='archiveGenre'){state.archiveGenre=e.target.value;state.archiveLimit=30;paint();}
  if(e.target.id==='archiveDay'){state.archiveDate=e.target.value;state.archiveLimit=30;paint();}
  if(e.target.id==='archiveSearch'){state.archiveQuery=e.target.value.trim();state.archiveLimit=30;paint();}
});
document.addEventListener('click',e=>{const link=e.target.closest('[data-series]');if(link){openSeries(link.dataset.series);return}const fav=e.target.closest('[data-series-fav]');if(fav){favoriteShow(fav.dataset.seriesFav);return}const era=e.target.closest('[data-era]');if(era){state.libraryFilter=era.dataset.era;state.visibleShows=30;paint();return}const net=e.target.closest('[data-net]');if(net){state.networkFilter=net.dataset.net;state.visibleShows=30;paint();return}if(e.target.closest('[data-more]')){state.visibleShows+=30;paint();return}const play=e.target.closest('[data-episode]');if(play){playIndexed(Number(play.dataset.episode));return}if(e.target.closest('[data-play-selected]')){playIndexed(Number(el('episodeSelect')?.value||0));return}if(e.target.closest('[data-reload-episodes]')){loadEpisodes(0);return}if(e.target.closest('[data-find-episode]')){const show=LIBRARY.find(x=>x.id===showId());const input=el('episodeNumber');const number=Number(input?.value);if(show&&Number.isInteger(number)&&number>=1&&number<=1200)window.open(publisherSearch(show,number),'_blank','noopener,noreferrer');else toast('Enter a valid episode number from 1 to 1200.')}});
document.addEventListener('input',e=>{
  if(e.target.id!=='movieSearch')return;
  state.movieSearch=e.target.value;
  const movieList=document.querySelector('.movie-grid');
  const all=movieVideos().filter(v=>(v.title+' '+v.channel).toLocaleLowerCase().includes(state.movieSearch.toLocaleLowerCase()));
  if(movieList)movieList.innerHTML=all.slice(0,state.visibleVideos).map(videoCard).join('');
  const count=document.querySelector('.movie-count');
  if(count)count.textContent=all.length+' matching full-length '+(all.length===1?'video':'videos')+'.';
});
state.page=locationPage();bindEvents();initSpotlightEvents();paint();refreshFeeds();loadArchive();loadSchedule();loadShowMetadata();loadDiscovery();if(state.page==='show')loadEpisodes(0);setInterval(()=>{refreshFeeds();loadArchive();loadSchedule();loadShowMetadata();loadDiscovery()},15*60*1000);
})();

