/* PakTV Ghar — Learn Quran. Introductory bilingual lessons + verified RSS videos. */
(() => {
  'use strict';
  const LESSONS = [
    {id:'letters',icon:'ا',title:'Meet the Arabic letters',urdu:'عربی حروف کی پہچان',level:'Start here · Noorani Qaida',
     goal:'Recognise the basic letter shapes and learn that similar shapes can have different sounds.',
     letters:['ا','ب','ت','ث','ج','ح','خ'],steps:[
       'Look at each letter individually. Notice how dots distinguish ب, ت and ث.',
       'Say the letter name after listening to a teacher; do not guess the sound from English spelling.',
       'Repeat a small group until you can recognise its written shapes.'
     ],practice:'Point to ب, ت and ث in order, then let a qualified teacher check their pronunciation.',
     note:'پہلے حروف کی پہچان کریں، پھر کسی استاد کی مدد سے درست تلفظ سیکھیں۔',topic:'basics'},
    {id:'shapes',icon:'بـ',title:'Joining letters',urdu:'حروف کو جوڑنا',level:'Beginner · Arabic script',
     goal:'Notice how many Arabic letters change shape at the start, middle and end of a word.',
     letters:['ب','بـ','ـبـ','ـب','م','مـ','ـم'],steps:[
       'Compare a letter on its own with the same letter joined to its neighbours.',
       'Find the dots; they remain important even when the letter changes shape.',
       'Practise recognising connected shapes before reading full words.'
     ],practice:'Find the letter ب in بَ, بُ and a joined form like بِسْمِ; listen to the word in a real recitation.',
     note:'عربی حروف لفظ میں اپنی جگہ کے مطابق شکل بدل سکتے ہیں۔',topic:'basics'},
    {id:'harakat',icon:'بَ',title:'Zabar, zer and pesh',urdu:'زبر، زیر اور پیش',level:'Beginner · Short vowels',
     goal:'Learn the three short vowel signs: fatḥah, kasrah and ḍammah.',
     letters:['بَ','بِ','بُ'],steps:[
       'Fatḥah (zabar, َ) gives a short a-like vowel: بَ.',
       'Kasrah (zer, ِ) gives a short i-like vowel: بِ.',
       'Ḍammah (pesh, ُ) gives a short u-like vowel: بُ.'
     ],practice:'Read بَ, بِ, بُ with a teacher or an Urdu Noorani Qaida recording. Keep each vowel short.',
     note:'زبر (بَ)، زیر (بِ) اور پیش (بُ) کے فرق کو بار بار دہرائیں۔',topic:'basics'},
    {id:'sukun',icon:'بْ',title:'Sukoon and stopping sounds',urdu:'جزم / سکون',level:'Beginner · Reading sounds',
     goal:'Understand that sukūn ( ْ ) marks a consonant without a following short vowel.',
     letters:['بَ','بْ','مْ','نْ'],steps:[
       'A letter with sukūn is not followed by zabar, zer or pesh.',
       'Compare بَ (a letter with a short vowel) with بْ (a letter marked with sukūn).',
       'Practise with connected sounds taught by a teacher rather than trying to say isolated clusters.'
     ],practice:'Point to the sukūn sign in بْ and مْ; listen to a teacher read complete examples.',
     note:'جزم والے حرف کے بعد الگ چھوٹی حرکت نہیں پڑھی جاتی۔',topic:'basics'},
    {id:'shaddah',icon:'بّ',title:'Shaddah and doubled letters',urdu:'تشدید کو سمجھنا',level:'Beginner · Reading sounds',
     goal:'Recognise the shaddah ( ّ ), which indicates that a consonant is doubled.',
     letters:['بَ','بَّ','رَّ'],steps:[
       'Spot the small shaddah sign above the consonant.',
       'Listen to how a teacher distinguishes a normal consonant from a doubled consonant.',
       'Keep the short vowel and the doubled consonant as separate ideas.'
     ],practice:'Compare بَ and بَّ in a teacher-led exercise; do not rely on a text-to-speech voice for this sound.',
     note:'تشدید کا نشان حرف کی آواز کو دوہرا کر پڑھنے کی علامت ہے۔',topic:'tajweed'},
    {id:'tanween',icon:'بٌ',title:'Tanween: two vowel signs',urdu:'تنوین / دو زبر دو زیر دو پیش',level:'Beginner · Word endings',
     goal:'Recognise the pairs of vowel signs called tanwīn.',
     letters:['ـً','ـٍ','ـٌ','بً','بٍ','بٌ'],steps:[
       'Two zabar (ً), two zer (ٍ) and two pesh (ٌ) are tanwīn signs.',
       'In simple reading examples they indicate an added n-like sound.',
       'Tajweed changes how tanwīn is pronounced before some letters; study those rules with a teacher.'
     ],practice:'Identify tanwīn signs in a Noorani Qaida lesson before attempting the advanced rules.',
     note:'تنوین کی تین شکلیں پہچانیں اور استاد کے ساتھ مشق کریں۔',topic:'tajweed'},
    {id:'madd',icon:'بَا',title:'Long vowels and Madd',urdu:'حروفِ مد اور کھینچنا',level:'Beginner · Vowel length',
     goal:'Recognise common long vowel patterns and learn the idea of elongation in recitation.',
     letters:['بَا','بُو','بِي'],steps:[
       'Notice long-vowel patterns involving alif, wāw and yā.',
       'Basic natural madd is often taught as two counts; other madd rules can involve different lengths.',
       'Learn the length from a proper reciter rather than stretching every vowel equally.'
     ],practice:'Listen to بَا, بُو and بِي in a teacher-led lesson and compare them to the short vowels.',
     note:'مد میں آواز کی مناسب مقدار استاد سے سیکھنا ضروری ہے۔',topic:'tajweed'},
    {id:'tajweed',icon:'ق',title:'Tajweed and Makharij',urdu:'تجوید اور مخارج',level:'Growing confidence · Pronunciation',
     goal:'Begin learning where Arabic letters are articulated and why careful recitation matters.',
     letters:['ق','ك','ح','ه','ع','ء'],steps:[
       'Makharij are the articulation points from which different letter sounds are formed.',
       'Letters such as ق and ك, and ح and ه, should not be assumed to sound identical.',
       'Ghunnah, qalqalah and ikhfa are more advanced topics; learn them in a guided course.'
     ],practice:'Choose one pronunciation lesson and ask a qualified teacher to correct two difficult letters.',
     note:'قاف اور کاف، ح اور ہ کے مخارج میں فرق کی مشق کریں۔',topic:'tajweed'},
    {id:'fatihah',icon:'١',title:'Read and understand Al-Fatihah',urdu:'سورۃ الفاتحہ سیکھیں',level:'Reading practice · Surahs',
     goal:'Follow the opening chapter on a verified mushaf while listening to a careful recitation.',
     letters:['الفاتحة','١'],steps:[
       'Open Surah Al-Fatihah on Quran.com and choose a recognised reciter.',
       'Read the Arabic line by line and follow a translation in a language you understand.',
       'Reflect on its broad themes: praise, mercy, worship and asking for guidance.'
     ],practice:'Read one verse with the recitation, pause, and repeat. Have your pronunciation checked by a teacher.',
     note:'سورۃ الفاتحہ کی تلاوت سنتے ہوئے آیات اور ترجمہ پڑھیں۔',topic:'recitation',link:'https://quran.com/1',linkText:'Read & listen to Al-Fatihah ↗'},
    {id:'shortsurahs',icon:'١١٢',title:'Start memorising short surahs',urdu:'چھوٹی سورتیں یاد کرنا',level:'Reading practice · Memorisation',
     goal:'Build a manageable repetition routine for short surahs with accurate recitation.',
     letters:['الإخلاص','الفلق','الناس'],steps:[
       'Begin with Al-Ikhlas (112), Al-Falaq (113) or An-Nas (114).',
       'Listen to one verse, read from a verified mushaf, and repeat without rushing.',
       'Review the previous day’s verses and learn the meaning alongside the sounds.'
     ],practice:'Pick one short surah and practise the first verse with a trusted reciter or teacher.',
     note:'ہر روز تھوڑا سا یاد کریں اور پہلے سبق کا اعادہ کریں۔',topic:'recitation',link:'https://quran.com/112',linkText:'Start with Al-Ikhlas ↗'}
  ];
  const CARDS = [
    {symbol:'ب',name:'Bāʼ',tip:'One dot below the letter.'},
    {symbol:'ت',name:'Tāʼ',tip:'Two dots above the letter.'},
    {symbol:'ث',name:'Thāʼ',tip:'Three dots above the letter.'},
    {symbol:'ج',name:'Jīm',tip:'A letter with one dot below.'},
    {symbol:'ح',name:'Ḥāʼ',tip:'A letter without dots. Its sound is not the same as English h.'},
    {symbol:'خ',name:'Khāʼ',tip:'A letter with one dot above.'},
    {symbol:'بَ',name:'Bāʼ + fatḥah',tip:'Zabar: a short a-like vowel.'},
    {symbol:'بِ',name:'Bāʼ + kasrah',tip:'Zer: a short i-like vowel.'},
    {symbol:'بُ',name:'Bāʼ + ḍammah',tip:'Pesh: a short u-like vowel.'}
  ];
  const KNOWN = new Set(['homebased','understand','bayyinah']);
  const FALLBACK = [
    {id:'7mNmg91pHQU',title:'Noorani Qaida Lesson 1 | Haroof-e-Mufradaat (Arabic Letters)',
     channel:'Home Based Quran Learning',channelId:'homebased',topic:'basics',language:'Urdu',date:'2024-03-29'},
    {id:'p0hiipvTVm0',title:'Noorani Qaida Lesson 12 in Urdu / Hindi | Shaddah | Takhti Number 12',
     channel:'Home Based Quran Learning',channelId:'homebased',topic:'basics',language:'Urdu',date:'2025-02-20'}
  ];
  const KEY = 'pgh_quran_lessons_v1';
  const $ = id => document.getElementById(id);
  let completed = new Set(),active = 'letters',flash = 0,videoFilter='all',videoQuery='',visible=12,videos=FALLBACK.slice(),previousFocus=null;
  const el=(tag,content,cls)=>{const n=document.createElement(tag);if(content!==undefined)n.textContent=content;if(cls)n.className=cls;return n};
  function restore(){
    try {const data=JSON.parse(localStorage.getItem(KEY)||'[]');if(Array.isArray(data))completed=new Set(data.filter(id=>LESSONS.some(l=>l.id===id)));}
    catch {}
  }
  function persist(){try{localStorage.setItem(KEY,JSON.stringify([...completed]));}catch{}}
  function updateProgress(){
    const n=completed.size;$('qProgressCount').textContent=n+' / '+LESSONS.length+' lessons';
    $('qProgressBar').style.width=(100*n/LESSONS.length)+'%';
  }
  function lessonButton(lesson,i){
    const b=el('button',undefined,'q-lesson-option');b.type='button';
    b.setAttribute('aria-current',String(active===lesson.id));
    b.append(el('span',String(i+1).padStart(2,'0'),'q-lesson-number'));
    const label=el('span');label.append(el('b',lesson.title),el('small',lesson.level));b.append(label);
    if(completed.has(lesson.id))b.append(el('span','✓','q-lesson-check'));
    b.addEventListener('click',()=>{active=lesson.id;drawLessons();if(window.innerWidth<700)$('qLessonDetail').scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});});
    return b;
  }
  function drawLessons(){
    const nav=$('qLessonList');nav.replaceChildren();
    LESSONS.forEach((l,i)=>nav.append(lessonButton(l,i)));
    const lesson=LESSONS.find(l=>l.id===active)||LESSONS[0],index=LESSONS.indexOf(lesson);
    const panel=$('qLessonDetail');panel.replaceChildren();
    panel.append(el('span','LESSON '+(index+1)+' OF '+LESSONS.length+' · '+lesson.level,'q-overline'));
    panel.append(el('h3',lesson.title),el('span',lesson.urdu,'q-lesson-urdu'));
    panel.append(el('p',lesson.goal,'q-lesson-purpose'));
    const shapes=el('div',undefined,'q-letter-showcase');shapes.setAttribute('dir','rtl');shapes.setAttribute('lang','ar');
    lesson.letters.forEach(letter=>shapes.append(el('span',letter)));panel.append(shapes);
    panel.append(el('h4','Your next three steps'));
    const list=el('ul');lesson.steps.forEach(step=>list.append(el('li',step)));panel.append(list);
    const activity=el('div',undefined,'q-lesson-activity');activity.append(el('b','🎯 Try this today'),el('span',lesson.practice));panel.append(activity);
    panel.append(el('p',lesson.note,'q-lesson-urdu'));
    const actions=el('div',undefined,'q-lesson-actions');
    const done=el('button',completed.has(lesson.id)?'✓ Marked as practised':'✓ I practised this lesson','q-complete');
    done.type='button';done.setAttribute('aria-pressed',String(completed.has(lesson.id)));
    done.addEventListener('click',()=>{completed.has(lesson.id)?completed.delete(lesson.id):completed.add(lesson.id);persist();drawLessons();updateProgress()});
    actions.append(done);
    if(index<LESSONS.length-1){
      const next=el('button','Next lesson →','q-next');next.type='button';
      next.addEventListener('click',()=>{active=LESSONS[index+1].id;drawLessons();panel.scrollIntoView({block:'start',behavior:'smooth'})});actions.append(next);
    }
    const search=el('a','▶ Find a teacher video ↗','q-button q-outline');search.href='#qVideos';
    search.addEventListener('click',()=>{videoFilter=lesson.topic;visible=12;syncFilters();drawVideos()});actions.append(search);
    if(lesson.link){const ref=el('a',lesson.linkText,'q-button q-outline');ref.href=lesson.link;ref.target='_blank';ref.rel='noopener noreferrer';actions.append(ref)}
    panel.append(actions);
  }
  function updateFlash(){
    const c=CARDS[flash];$('qFlashSymbol').textContent=c.symbol;$('qFlashName').textContent=c.name;$('qFlashTip').textContent=c.tip;
    $('qFlashPosition').textContent=(flash+1)+' / '+CARDS.length;
  }
  function validVideo(video){
    return video&&KNOWN.has(video.channelId)&&typeof video.id==='string'&&/^[A-Za-z0-9_-]{11}$/.test(video.id)
      &&typeof video.title==='string'&&video.title.length>7&&video.title.length<260
      &&['basics','tajweed','recitation','meaning','general'].includes(video.topic);
  }
  function syncFilters(){
    document.querySelectorAll('[data-qtopic]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.qtopic===videoFilter)));
  }
  function openVideo(video){
    if(!validVideo(video))return;
    previousFocus=document.activeElement;
    $('qModalTitle').textContent=video.title;
    $('qModalChannel').textContent=video.channel+' · '+(video.language||'Learning video');
    $('qVideoYoutube').href='https://www.youtube.com/watch?v='+encodeURIComponent(video.id);
    const frame=el('iframe');frame.src='https://www.youtube-nocookie.com/embed/'+encodeURIComponent(video.id)+'?rel=0';
    frame.title=video.title;frame.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen';
    frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';
    $('qVideoFrame').replaceChildren(frame);
    $('qVideoModal').hidden=false;document.body.style.overflow='hidden';$('qVideoClose').focus();
  }
  function closeVideo(){
    $('qVideoFrame').replaceChildren();$('qVideoModal').hidden=true;document.body.style.overflow='';
    if(previousFocus&&typeof previousFocus.focus==='function')previousFocus.focus();
  }
  function videoCard(video){
    const article=el('article',undefined,'q-video-card');
    const poster=el('button',undefined,'q-video-poster');poster.type='button';poster.setAttribute('aria-label','Play '+video.title);
    const img=el('img');img.src='https://i.ytimg.com/vi/'+encodeURIComponent(video.id)+'/hqdefault.jpg';
    img.loading='lazy';img.alt='';
    const play=el('span','▶','q-video-play');play.setAttribute('aria-hidden','true');
    poster.append(img,play);poster.addEventListener('click',()=>openVideo(video));article.append(poster);
    const body=el('div',undefined,'q-video-card-content');body.append(el('small',(video.language||'')+' · '+(video.topic||'Lesson')));
    body.append(el('h3',video.title),el('small',video.channel));
    const yt=el('a','Open on YouTube ↗');yt.href='https://www.youtube.com/watch?v='+encodeURIComponent(video.id);
    yt.target='_blank';yt.rel='noopener noreferrer';body.append(yt);article.append(body);return article;
  }
  function drawVideos(){
    const host=$('qVideoGrid');host.replaceChildren();
    const list=videos.filter(v=>(videoFilter==='all'||v.topic===videoFilter)
      &&(!videoQuery||(v.title+' '+v.channel+' '+v.language).toLowerCase().includes(videoQuery)));
    // Put reading foundations first; newer deep-dive talks remain available below.
    const order={basics:0,tajweed:1,recitation:2,meaning:3,general:4};
    list.sort((a,b)=>(order[a.topic]??5)-(order[b.topic]??5)||
      (b.date||'').localeCompare(a.date||''));
    const count=Math.min(list.length,visible);
    list.slice(0,count).forEach(v=>host.append(videoCard(v)));
    $('qVideoMore').hidden=count>=list.length;
    $('qVideoStatus').textContent=list.length
      ?list.length+' learning video'+(list.length===1?'':'s')+' from selected publisher channels · showing '+count+'.'
      :'No matching videos in the current library. Try a different topic or watch the teacher’s full channel.';
    if(!list.length)host.append(el('p','No lessons match these filters. New videos are added as the original YouTube feeds are checked.','q-video-empty'));
  }
  async function loadVideos(){
    try{
      const response=await fetch('./data/quran-videos.json',{cache:'no-store'});
      if(!response.ok)throw Error('Video library unavailable');
      const payload=await response.json();
      if(!Array.isArray(payload.videos))throw Error('Invalid video library');
      const seen=new Set(),result=[];
      for(const v of payload.videos){
        if(!validVideo(v)||seen.has(v.id))continue;
        seen.add(v.id);result.push(v);
      }
      if(result.length)videos=result;
    }catch{/* Previously verified starter lessons remain available offline. */}
    drawVideos();
  }
  function init(){
    restore();drawLessons();updateProgress();updateFlash();drawVideos();
    $('qFlashPrev').addEventListener('click',()=>{flash=(flash+CARDS.length-1)%CARDS.length;updateFlash()});
    $('qFlashNext').addEventListener('click',()=>{flash=(flash+1)%CARDS.length;updateFlash()});
    document.querySelectorAll('[data-qtopic]').forEach(btn=>btn.addEventListener('click',()=>{
      videoFilter=btn.dataset.qtopic;visible=12;syncFilters();drawVideos();
    }));
    $('qVideoSearch').addEventListener('input',event=>{videoQuery=event.target.value.toLowerCase().trim();visible=12;drawVideos()});
    $('qVideoMore').addEventListener('click',()=>{visible+=12;drawVideos()});
    $('qVideoClose').addEventListener('click',closeVideo);
    $('qVideoModal').querySelector('[data-qclose]').addEventListener('click',closeVideo);
    document.addEventListener('keydown',event=>{
      if($('qVideoModal').hidden)return;
      if(event.key==='Escape'){closeVideo();return}
      if(event.key!=='Tab')return;
      const focusable=[...$('qVideoModal').querySelectorAll('button:not([disabled]),a[href]')];
      if(!focusable.length)return;
      if(event.shiftKey&&document.activeElement===focusable[0]){event.preventDefault();focusable[focusable.length-1].focus()}
      else if(!event.shiftKey&&document.activeElement===focusable[focusable.length-1]){event.preventDefault();focusable[0].focus()}
    });
    loadVideos();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();