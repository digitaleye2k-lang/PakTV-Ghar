"""Build per-series poster and episode metadata from broadcaster-owned pages.

All reported episode numbers have a source and type. A listing on a broadcaster
website is not proof a YouTube video is embeddable or already uploaded.
"""
from concurrent.futures import ThreadPoolExecutor
from html import unescape
from html.parser import HTMLParser
from urllib.parse import urljoin, urlsplit
from datetime import datetime
from zoneinfo import ZoneInfo
import re

OFFICIAL_HOSTS = ('hum.tv', 'arydigital.tv', 'harpalgeo.tv')
MAX_FETCH = 75

def normal(text):
    return re.sub(r'[^a-z0-9]+','',unescape(str(text)).casefold())

def safe_image(raw, base):
    if not raw or raw.startswith(('data:','blob:')): return ''
    url=urljoin(base,unescape(raw.strip()))
    u=urlsplit(url)
    if u.scheme!='https' or not u.netloc or len(url)>1200: return ''
    # Only broadcaster-origin images, including their approved image CDNs if
    # explicitly returned by broadcaster pages; no external image scraping.
    return url

class Info(HTMLParser):
    def __init__(self):
        super().__init__();self.meta={};self.images=[];self.parts=[];self.links=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='meta':
            key=a.get('property',a.get('name','')).lower()
            if key in ('og:image','twitter:image','og:title','twitter:title'):
                self.meta[key]=a.get('content','')
        elif tag=='img':
            src=a.get('data-src') or a.get('data-lazy-src') or a.get('src','')
            self.images.append((a.get('alt',''),src))
        elif tag=='a':
            self.links.append((a.get('href',''),a.get('title','')))
    def handle_data(self,data):
        if data.strip():self.parts.append(data.strip())
    @property
    def text(self):return re.sub(r'\s+',' ',' '.join(self.parts))

def matching_cover(info,name,base):
    term=normal(name)
    possible=[]
    for alt,src in info.images:
        altterm=normal(alt)
        # The title should be in alt text or meaningful picture filename.
        stem=normal(urlsplit(src).path.rsplit('/',1)[-1])
        if len(term)>3 and (term in altterm or term in stem):
            url=safe_image(src,base)
            if url:possible.append(url)
    if possible:return possible[0]
    title=normal(info.meta.get('og:title','') or info.meta.get('twitter:title',''))
    if term in title and len(term)>3:
        for field in ('og:image','twitter:image'):
            pic=safe_image(info.meta.get(field,''),base)
            if pic and not any(x in pic.lower() for x in ('logo','placeholder','default','favicon')):
                return pic
    return ''

def ary_episode_guide(info):
    txt=info.text
    p=re.search(r'\bEPISODE GUIDE\b',txt,re.I)
    if not p:return None
    guide=txt[p.end():]
    guide=re.split(r'\b(?:CAST\s*&\s*CREW|MORE ABOUT|RECOMMENDED)\b',guide,maxsplit=1,flags=re.I)[0][:12000]
    episodes=[int(n) for n in re.findall(r'\bEpisode\s+(\d{1,3})\b(?!\s*\+)',guide,re.I)]
    return max(episodes) if episodes else None

def show_meta(args,fetch,old,known_images):
    s,video=args
    result=dict(old.get(s['id'],{}))
    if video:
        result['latestUpload']=video
        # YouTube video thumbnails are official publisher video images.
        result.setdefault('poster', 'https://i.ytimg.com/vi/'+video['id']+'/hqdefault.jpg')
        result.setdefault('posterSource','Official YouTube thumbnail')
    if result.get('poster') and result.get('posterSource','')=='Official broadcaster':
        return s['id'],result
    page=s.get('officialUrl','')
    try:
        u=urlsplit(page)
        if not any(u.hostname==host or u.hostname=='www.'+host for host in OFFICIAL_HOSTS):return s['id'],result
        if '/drama' not in u.path:return s['id'],result
        html=fetch(page)
        info=Info();info.feed(html)
        cover=matching_cover(info,s['name'],page)
        if not cover and s['network']=='hum' and s['id'] in known_images:
            cover=known_images[s['id']]
        if cover:
            result['poster']=cover
            result['posterSource']='Official broadcaster'
        if s['network']=='arydigital':
            ep=ary_episode_guide(info)
            if ep:
                result['latestPublisherEpisode']=ep
                result['latestPublisherLabel']='Highest episode listed on broadcaster website'
                result['latestPublisherSource']=page
    except Exception as exc:
        result['fetchWarning']=type(exc).__name__
    return s['id'],result

def build_metadata(shows,videos,schedule,fetch,old):
    meta=dict(old or {})
    # Include only full-episode video matches, not teasers, clips, OSTs or reviews.
    rx=re.compile(r'\b(?:episode|ep\.?)\s*[:#-]?\s*(\d{1,4})\b',re.I)
    unwanted=re.compile(r'\b(?:teaser|trailer|promo|ost|reaction|review|preview|best scenes|next episode|highlights|recap)\b',re.I)
    latest={}
    for s in shows:
        if s.get('type') not in ('drama','comedy','satire','reality'):continue
        possible=[]
        for v in videos:
            if v.get('channelId')!=s.get('network') or unwanted.search(v.get('title','')):continue
            title=v.get('title','')
            if not (normal(s.get('name')) in normal(title) or
                    any(len(normal(alias))>=5 and normal(alias) in normal(title) for alias in s.get('aliases',[]))):continue
            m=rx.search(title)
            if m and int(m[1])<1200 and int(m[1])>=1:
                possible.append((int(m[1]),v.get('published',''),v))
        if possible:
            n,dt,v=max(possible,key=lambda x:(x[0],x[1]))
            latest[s['id']]={'number':n,'id':v['id'],'title':v['title'],
                'date':v.get('date',''),'source':'Official YouTube upload'}
    # Broadcast slots are separate from confirmed video uploads.
    for slot in schedule.get('items',[]):
        sid=slot.get('showId')
        ep=slot.get('episode')
        if not sid or not isinstance(ep,int) or ep<1 or ep>1200:continue
        info=meta.setdefault(sid,{})
        previous=info.get('tvToday') or {}
        if not previous or ep>previous.get('number',0):
            info['tvToday']={'number':ep,'time':slot.get('time'),
                             'channel':slot.get('channel'),
                             'source':slot.get('sourceUrl'),
                             'date':schedule.get('date')}
    # Avoid stale "on today" labels when the date changes.
    for val in meta.values():
        if val.get('tvToday',{}).get('date')!=schedule.get('date'):
            val.pop('tvToday',None)
    for sid,latest_upload in latest.items():
        meta.setdefault(sid,{})['latestUpload']=latest_upload
    # Fetch broadcaster image metadata in parallel; use cache for previously verified posters.
    queue=[s for s in shows if s.get('type') in ('drama','comedy','satire','reality')
           and (not meta.get(s['id'],{}).get('poster') or meta.get(s['id'],{}).get('posterSource')!='Official broadcaster')]
    queue.sort(key=lambda s:({'airing':0,'upcoming':1,'recent':2,'library':3,'archive':4}.get(s.get('status'),5),s['name']))
    cover_map={}
    # Current HUM TV homepage carries official poster images for the evening banner.
    try:
        info=Info();info.feed(fetch('https://hum.tv/'))
        for s in shows:
            if s['network']=='hum':
                pic=matching_cover(info,s['name'],'https://hum.tv/')
                if pic:cover_map[s['id']]=pic
    except Exception:pass
    def work(s):
        return show_meta((s,latest.get(s['id'])),fetch,meta,cover_map)
    with ThreadPoolExecutor(max_workers=10) as pool:
        for sid,data in pool.map(work,queue[:MAX_FETCH]):
            previous=meta.get(sid,{})
            # Keep old schedule fields if they were updated earlier in this run.
            previous.update(data);meta[sid]=previous
    # Fill gaps with title-specific official YouTube thumbnail where available.
    for sid,vid in latest.items():
        entry=meta.setdefault(sid,{})
        entry.setdefault('poster','https://i.ytimg.com/vi/'+vid['id']+'/hqdefault.jpg')
        entry.setdefault('posterSource','Official YouTube thumbnail')
    return {'generatedAt':datetime.now(ZoneInfo('Asia/Karachi')).isoformat(),
            'shows':meta, 'notes':'Episode numbers have labelled sources. A TV broadcast or programme page is not confirmation of a playable upload.'}
