#!/usr/bin/env python3
"""Best-effort static broadcaster and YouTube data builder; no API keys needed."""
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from html import unescape
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import quote, urlencode, urljoin, urlparse
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo
import json, re, xml.etree.ElementTree as ET, os

HERE=Path(__file__).resolve().parent
(HERE/'data').mkdir(exist_ok=True)
SOURCES={
'cokestudio':('Coke Studio Pakistan','cokestudio','music'),
'nescafebasement':('NESCAFÉ Basement','nescafebasement','music'),
'emipakistan':('EMI Pakistan','EMIPakistan','music'),
'talhaanjum':('Talha Anjum','talhaanjum','music'),
'youngstunners':('Young Stunners','YoungStunners','music'),
'sajjadali':('Sajjad Ali','sajjadali','music'),
'jaubi':('Jaubi','Jaubi','music'),
'mekaalhasan':('Mekaal Hasan Band','MekaalHasanBand','music'),
'rahatfateh':('Rahat Fateh Ali Khan','RahatFatehAliKhan','music'),
'atifs':('Atif Aslam','AtifAslamOfficial','music'),
'lollywoodcinema':('LollywoodCinema','LollywoodCinema','movies'),
'lollywoodclassics':('Lollywood Classics','lollywoodclassics','movies'),
'movieboxmovies':('MovieboxMovies','movieboxmovies','movies'),
'waggleworkshop':('The Waggle Workshop','TheWaggleWorkshop','waggle'),
'kidsland':('Kids Land','kidslandofficial','kids'),
'kidsmadani':('Kids Madani Channel','kidsmadanichannel','kids'),
'salamkids':('Salam Kids TV','salamkidstvofficial','kids'),
'urdukidsstudio':('Urdu Kids Studio','urdukidsstudio','kids'),
'shirazi':('Shirazi Village Vlogs','shirazi786','kids'),
'haimparishay':('Haim & Parishay Khan','HaimParishayKhan','kids'),

'pcb':('Pakistan Cricket Board','PakistanCricket','sports'),
'psl':('Pakistan Super League','pakistansuperleagueofficial','sports'),
'asports':('A Sports','asportspk','sports'),
'ptvsports':('PTV SPORTS OFFICIAL','ptvsportsofficialpk','sports'),
'cricketpk':('Cricket Pakistan','CricketPakistanPK','sports'),
'wasay':('Wasay Habib','wasayhabib','sports'),
'hum':('HUM TV','HUMTV','dramas'),
'arydigital':('ARY Digital','ARYDigitalasia','dramas'),
'harpalgeo':('Har Pal Geo','HarPalGeoOfficial','dramas'),
'greentv':('Green Entertainment','GreenEntertainmentTV','dramas'),
'ptvhome':('PTV Home','PTVHomeEntertainment','dramas'),
'expressent':('Express TV','expressentertainment','dramas'),
'ptvnews':('PTV News','PTVNewsOfficial','news'),
'aajnews':('Aaj TV Official','aajtvofficial','news'),
'aajent':('Aaj Entertainment','aajentertainment','dramas'),
'geonews':('Geo News','geonews','news'),
'arynews':('ARY News','ArynewsTvofficial','news'),
'samaa':('SAMAA TV','SAMAATV','news'),
'dunya':('Dunya News','dunyanews','news'),
'expressnews':('Express News','expressnewspk','news'),
'dawnnews':('Dawn News','dawnnewspakistan','news'),
'imranriaz':('Imran Riaz Khan','ImranRiazKhan','vloggers'),
'sabir':('Sabir Shakir','sabirshakirpk','vloggers'),
'matiullah':('Matiullah Jan MJtv','MatiullahJanMJtv','vloggers'),
'asadtoor':('Asad Toor','AsadToorUncensored','vloggers'),
'siddique':('Siddique Jaan','SiddiqueJaan1','vloggers'),
'pakexperience':('The Pakistan Experience','ThePakistanExperience','vloggers'),
'junaid':('Junaid Akram','JunaidAkram','vloggers'),
'humcomedy':('HUM TV Comedy','HUMTVComedy','comedy'),
'geohasna':('Hasna Mana Hai','GeoHasnaManaHai','comedy')}
HEADERS={'User-Agent':'Mozilla/5.0 (compatible; PakTVGhar/2.0)','Accept-Language':'en-US,en;q=0.8'}
def get(url):
 with urlopen(Request(url,headers=HEADERS),timeout=7) as response:return response.read(1600000).decode('utf8','replace')
def write(name,data):
 (HERE/'data'/name).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
def readold(name,default):
 try:return json.loads((HERE/'data'/name).read_text(encoding='utf8'))
 except (OSError,ValueError):return default
def feed(args):
 cid,(name,handle,category)=args
 try:
  page=get('https://www.youtube.com/@'+quote(handle))
  m=re.search(r'"(?:externalId|channelId)":"(UC[\w-]{22})"',page)
  if not m:return []
  root=ET.fromstring(get('https://www.youtube.com/feeds/videos.xml?'+urlencode({'channel_id':m.group(1)})))
  ns={'a':'http://www.w3.org/2005/Atom','yt':'http://www.youtube.com/xml/schemas/2015'}
  videos=[]
  for node in root.findall('a:entry',ns):
   vid=node.findtext('yt:videoId','',ns)
   if not re.fullmatch(r'[A-Za-z0-9_-]{11}',vid):continue
   title=unescape(node.findtext('a:title','',ns)); date=node.findtext('a:published','',ns)
   cat='talk' if category=='news' and any(x in title.lower() for x in ('capital talk','off the record','the reporters','kal tak','shahzeb khanzada')) else category
   videos.append({'id':vid,'title':title,'channel':name,'channelId':cid,'youtubeChannelId':m.group(1),'category':cat,'date':date[:10],'published':date,'description':'Official upload from '+name})
  return videos
 except Exception as e:
  print('Source unavailable:',cid,type(e).__name__)
  return []
class Text(HTMLParser):
 def __init__(self):super().__init__();self.chunks=[]
 def handle_data(self,s):self.chunks.append(s)
 def result(self):return re.sub(r'\s+',' ',' '.join(self.chunks))
def txt(url):
 parser=Text();parser.feed(get(url));return parser.result()
def time24(s):
 try:return datetime.strptime(s.upper().replace(' ','').replace('.',''),'%I:%M%p').strftime('%H:%M')
 except ValueError:return None

def normalize_title(value):
 return re.sub(r'[^a-z0-9]+','',unescape(value).casefold())

def show_id_for(title,shows,network):
 key=normalize_title(title)
 for s in shows:
  if s['network']!=network:continue
  variants=[s['name']]+s.get('aliases',[])
  if any(normalize_title(n)==key for n in variants):return s['id']
 return None

def row(title,time,channel,network,source_url,shows,episode=None,repeat=None,source_label='Official broadcaster'):
 title=re.sub(r'\s+',' ',unescape(title)).strip(' -–|')
 if not title or len(title)>90 or not re.fullmatch(r'\d{2}:\d{2}',time or ''):return None
 return {'name':title,'showId':show_id_for(title,shows,network),'channel':channel,'time':time,
   'episode':episode,'repeat':repeat,'sourceUrl':source_url,'sourceLabel':source_label}

def days_for(spec):
 days=['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY']
 spec=re.sub(r'\s+','',spec.upper())
 if spec in ('DAILY','MONDAY-SUNDAY'):return days
 parts=spec.split('-')
 if len(parts)==1:return [parts[0]]
 if len(parts)==2 and all(p in days for p in parts):
  a,b=map(days.index,parts)
  return [days[i%7] for i in range(a,a+((b-a)%7)+1)]
 return []

def hum_schedule(text,day,shows):
 # HUM's homepage banner is authoritative for the currently promoted lineup.
 url='https://hum.tv/'
 pattern=(r'(?P<title>[A-Z][A-Z0-9&''’(). \-]{2,65}?)\s+'
          r'(?P<days>(?:MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY|DAILY)'
          r'(?:\s*-\s*(?:MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY))?)'
          r'\s*\|\s*(?P<time>\d{1,2}:\d{2}\s*[AP]M)')
 result=[]
 for m in re.finditer(pattern,text,re.I):
  if day.upper() not in days_for(m['days']):continue
  title=m['title'].strip()
  # Any leftover navigation/promo text before the banner is not a show title.
  matches=[s['name'] for s in shows if s['network']=='hum' and normalize_title(s['name']) in normalize_title(title)]
  if matches:title=max(matches,key=len)
  elif len(title.split())>6:continue
  t=time24(m['time'])
  item=row(title,t,'HUM TV','hum',url,shows)
  if item:result.append(item)
 return result

def ary_schedule(text,day,shows):
 url='https://arydigital.tv/schedule'
 start=re.search(r'\b'+re.escape(day)+r'\s+\d+\s+shows\b',text,re.I)
 if not start:return []
 rest=text[start.end():]
 end=re.search(r'\b(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s+\d+\s+shows\b',rest,re.I)
 section=rest[:end.start()] if end else rest[:3500]
 pattern=(r'(\d{1,2}:\d{2}\s*[AP]M)\s*(\d{1,2}:\d{2}\s*[AP]M)'
          r'\s+(.{2,90}?)\s+(\d{1,2}:\d{2}\s*[AP]M)\s*[–-]\s*'
          r'\d{1,2}:\d{2}\s*[AP]M\s+View Details')
 items=[]
 for m in re.finditer(pattern,section,re.I|re.S):
  t=time24(m.group(4))
  item=row(m.group(3),t,'ARY Digital','arydigital',url,shows)
  if item:items.append(item)
 return items

def geo_schedule(text,shows):
 url='https://harpalgeo.tv/schedule'
 start=re.search(r'now\s+on\s+tv',text,re.I)
 if not start:return []
 tail=text[start.end():]
 end=re.search(r'\bSchedule\b',tail,re.I)
 section=tail[:end.start()] if end else tail[:2800]
 # On Geo the programme name and optional episode precede each clock time.
 chunks=re.split(r'(?<!\d)(\d{1,2}:\d{2}\s*[AP]M)',section)
 items=[]
 for i in range(1,len(chunks),2):
  name=chunks[i-1].strip()
  if i==1:name=re.sub(r'^tv\s+','',name,flags=re.I)
  episode_match=re.search(r'\bEp\.?\s*(\d+)\s*$',name,re.I)
  episode=int(episode_match.group(1)) if episode_match else None
  name=re.sub(r'\s*Ep\.?\s*\d+\s*$','',name,flags=re.I).strip()
  t=time24(chunks[i])
  item=row(name,t,'Har Pal Geo','harpalgeo',url,shows,episode=episode)
  if item:items.append(item)
 return items[:35]

def fallback_guide(text,day,date,shows):
 # Only read a date-specific page, never reuse an old show's historical air day.
 date_label=f'{int(date[8:])} {datetime.strptime(date[5:7],"%m").strftime("%B")} {date[:4]}'
 if not re.search(re.escape(day)+r',\s*'+re.escape(date_label),text,re.I):return []
 start=re.search(r'Today.s drama timings',text,re.I)
 if not start:return []
 tail=text[start.end():]
 peak=re.search(r'Peak Hour Timing',tail,re.I)
 if not peak:return []
 tail=tail[peak.end():]
 channels=[('ARY Digital','arydigital'),('Express Entertainment',None),
   ('Geo Entertainment','harpalgeo'),('Green Entertainment',None),
   ('HUM TV','hum'),('LTN Family',None)]
 # The quick prime-time table appears before the full-day listings; use that
 # first occurrence only. Times are Pakistan time on this site.
 sections=re.split(r'\b(?:ARY Digital|Express Entertainment|Geo Entertainment|Green Entertainment|HUM TV|LTN Family)\b',tail,maxsplit=12,flags=re.I)
 labels=re.findall(r'\b(?:ARY Digital|Express Entertainment|Geo Entertainment|Green Entertainment|HUM TV|LTN Family)\b',tail,flags=re.I)
 rows=[]
 source_url='https://dramas.pk/?'+urlencode({'pdhs_date':date})
 for channel,net in channels:
  if not net:continue
  idx=next((i for i,label in enumerate(labels[:6]) if label.lower()==channel.lower()),None)
  if idx is None or idx+1>=len(sections):continue
  sec=sections[idx+1][:400]
  matches=list(re.finditer(r'(?<!\d)(\d{1,2}:\d{2}\s*PM)',sec,re.I))
  for j,m in enumerate(matches):
   title=sec[m.end():(matches[j+1].start() if j+1<len(matches) else len(sec))]
   title=re.sub(r'(?:Image|↗|View drama|New episode|Repeat|Hide schedule).*','',title,flags=re.I).strip()
   if not title or len(title)>65:continue
   item=row(title,time24(m.group(1)),channel,net,source_url,shows,
            source_label='Dramas.pk TV guide (backup, not broadcaster)')
   if item:rows.append(item)
 return rows

def schedule(shows):
 now=datetime.now(ZoneInfo('Asia/Karachi'))
 day=now.strftime('%A');today=now.strftime('%Y-%m-%d')
 items=[];errors=[];sources={}
 official_sources=[
  ('hum','HUM TV',['https://hum.tv/'],lambda p:hum_schedule(p,day,shows)),
  ('arydigital','ARY Digital',['https://arydigital.tv/schedule'],lambda p:ary_schedule(p,day,shows)),
  ('harpalgeo','Har Pal Geo',['https://harpalgeo.tv/schedule','https://www.harpalgeo.tv/schedule'],lambda p:geo_schedule(p,shows)),
 ]
 for net,name,urls,parser in official_sources:
  result=[];why=''
  for url in urls:
   try:
    page=txt(url)
    result=parser(page)
    if result:break
    why='No scheduled entries in retrieved page'
   except Exception as exc:why=type(exc).__name__
  if result:
   sources[net]='official'
   items.extend(result)
  else:
   sources[net]='unavailable'
   errors.append(name+': '+why)
 # ARY's JS-rendered guide and Geo's bot checks can block Github Actions.
 # Only use a third-party guide if it explicitly identifies TODAY's PK date.
 if any(sources.get(n)=='unavailable' for n in ('arydigital','harpalgeo','hum')):
  try:
   backup=txt('https://dramas.pk/?'+urlencode({'pdhs_date':today}))
   backup_items=fallback_guide(backup,day,today,shows)
   for net in ('arydigital','harpalgeo','hum'):
    if sources[net]=='unavailable':
     found=[x for x in backup_items if x['showId'] is not None or
            (net=='arydigital' and x['channel']=='ARY Digital') or
            (net=='harpalgeo' and x['channel']=='Geo Entertainment') or
            (net=='hum' and x['channel']=='HUM TV')]
     found=[x for x in found if {'ARY Digital':'arydigital','Geo Entertainment':'harpalgeo','HUM TV':'hum'}.get(x['channel'])==net]
     if found:
      items.extend(found)
      sources[net]='independent guide fallback'
  except Exception as exc:errors.append('Backup guide: '+type(exc).__name__)
 # Keep multiple broadcasts of the same show, but avoid duplicate time-slots.
 unique={(x['channel'],x['time'],normalize_title(x['name'])):x for x in items}
 out=sorted(unique.values(),key=lambda x:(x['time'],x['channel'],x['name']))
 return {'date':today,'weekday':day,'timezone':'Asia/Karachi','generatedAt':now.isoformat(),
  'items':out,'sources':sources,'errors':errors,
  'note':'Schedule entries are TV slots, not proof episodes were uploaded. Times and reruns can change.'}

def main():
 catalog=(HERE/'site-catalog.js').read_text(encoding='utf8')
 match=re.search(r'window\.PAKTV_CATALOG\s*=\s*(\[.*?\]);',catalog,re.S)
 if not match:raise RuntimeError('Missing site-catalog.js programme data')
 shows=json.loads(match.group(1))
 with ThreadPoolExecutor(max_workers=8) as pool:groups=list(pool.map(feed,SOURCES.items()))
 latest=[v for group in groups for v in group]
 old=readold('videos.json',{}).get('videos',[])
 unique={v['id']:v for v in old+latest if re.fullmatch(r'[A-Za-z0-9_-]{11}',v.get('id',''))}
 videos=sorted(unique.values(),key=lambda x:x.get('published',''),reverse=True)[:240]
 episodes={}
 bad=re.compile(r'\b(teaser|promo|ost|reaction|preview|trailer|review|best scenes)\b',re.I)
 exp=re.compile(r'\b(?:episode|ep\.?)[\s:#-]*(\d{1,4})\b',re.I)
 for show in shows:
  matchers=[show['name'].casefold()]+[a.casefold() for a in show.get('aliases',[]) if len(a)>4]
  matched=[]
  for v in videos:
   if v['channelId']!=show['network'] or bad.search(v['title']) or not any(x in v['title'].casefold() for x in matchers):continue
   ep=exp.search(v['title'])
   if show['type']=='drama' and not ep:continue
   matched.append({'title':v['title'],'episode':int(ep.group(1)) if ep else None,'id':v['id'],'source':v['channel'],'kind':'youtube','date':v['date']})
  if matched:episodes[show['id']]={'episodes':sorted(matched,key=lambda x:(x['episode'] or 0,x['date']),reverse=True)[:50]}
 # YouTube Data API indexing is optional, only through a GitHub Actions secret.
 # API results are restricted to verified channel IDs and checked video records.
 from youtube_index import index_api
 # These broadcaster IDs are resolved from their public YouTube pages
 # during RSS collection; they avoid unnecessary Data API channel lookups.
 verified_channels={v['channelId']:v['youtubeChannelId'] for v in latest
                    if v.get('channelId') in ('hum','arydigital','harpalgeo','greentv','ptvhome','expressent')
                    and re.fullmatch(r'UC[\w-]{22}',v.get('youtubeChannelId',''))}
 index,yt_cache,yt_stats=index_api(
     shows,os.environ.get('YOUTUBE_API_KEY','').strip(),
     readold('youtube-state.json',{}),
     known_channel_ids=verified_channels)
 write('youtube-state.json',yt_cache)
 api_videos=[]
 for sid,items in index.items():
  for ep in items:
   if ep.get('sourceType')!='youtube_api':continue
   api_videos.append({'id':ep['id'],'title':ep['title'],
      'channel':ep.get('source','Official YouTube'),
      'channelId':ep.get('channelId',''),
      'category':'dramas','date':ep.get('date',''),
      'published':ep.get('published',''),
      'description':'Verified broadcaster-channel upload',
      'availableGB':ep.get('availableGB'),
      'availablePK':ep.get('availablePK'),
      'embeddable':ep.get('embeddable',True)})
  current=episodes.get(sid,{}).get('episodes',[])
  by_id={e['id']:e for e in current if e.get('id')}
  for ep in items:by_id[ep['id']]=ep
  episodes[sid]={'episodes':sorted(by_id.values(),
     key=lambda e:(e.get('episode') or 0,e.get('date') or ''),
     reverse=True)[:100]}
 write('episodes.json',episodes)
 # Separate archive index for date-based browsing, news, political commentary,
 # comedy and creators. It is refreshed incrementally without search quota use.
 from youtube_archive import update_archive
 archive,archive_stats=update_archive(
     os.environ.get('YOUTUBE_API_KEY','').strip(),
     readold('archive.json',{}))
 # One validated full-film discovery query each refresh. Keep the cache
 # on disk; do not expose the search link or promote unrelated uploads.
 from movie_discovery import discover_movies
 archive, movie_state, movie_stats = discover_movies(
     os.environ.get('YOUTUBE_API_KEY','').strip(),archive,
     readold('movie-discovery-state.json',{}))
 write('movie-discovery-state.json',movie_state)
 write('archive.json',archive)
 print('Film discovery:',movie_stats['checked'],'publisher candidates,',
       movie_stats['added'],'new verified full films')
 print('Archive:',archive_stats['checked'],'channels refreshed,',
       archive_stats.get('new',0),'verified upload entries,',
       len(archive.get('videos',[])),'stored,',
       archive_stats.get('errors',0),'sources unavailable')
 combined={v['id']:v for v in videos}
 for v in api_videos:combined[v['id']]=v
 for v in archive.get('videos',[]):combined[v['id']]=v
 # Cap the homepage feed but retain more archive items for browsing by date.
 all_videos=list(combined.values())
 videos=sorted(all_videos,key=lambda v:v.get('published',''),reverse=True)[:360]
 write('videos.json',{'videos':videos,'mode':'youtube' if yt_stats['newVideos'] or archive_stats.get('new') else 'feeds'})
 result=schedule(shows)
 write('schedule.json',result)
 from show_metadata import build_metadata
 metadata=build_metadata(shows,all_videos,result,get,readold('show-meta.json',{}).get('shows',{}))
 write('show-meta.json',metadata)
 write('discover.json',{'shows':[],'errors':[]})
 print('Published',len(videos),'videos,',len(episodes),'programme indexes,',
       len(result['items']),'schedule entries,',len(metadata['shows']),'show metadata entries')
 print('YouTube API enabled:',yt_stats['enabled'],'searches:',yt_stats['searches'],
       'verified video hits:',yt_stats['newVideos'],'cached shows:',yt_stats['indexedShows'],
       'status:',yt_stats['error'] or 'OK')
if __name__=='__main__':main()
