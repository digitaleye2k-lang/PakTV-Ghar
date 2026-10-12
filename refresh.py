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
import json, re, xml.etree.ElementTree as ET

HERE=Path(__file__).resolve().parent
(HERE/'data').mkdir(exist_ok=True)
SOURCES={
'hum':('HUM TV','HUMTV','dramas'),
'arydigital':('ARY Digital','ARYDigitalasia','dramas'),
'harpalgeo':('Har Pal Geo','HarPalGeoOfficial','dramas'),
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
   videos.append({'id':vid,'title':title,'channel':name,'channelId':cid,'category':cat,'date':date[:10],'published':date,'description':'Official upload from '+name})
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
def schedule(shows):
 now=datetime.now(ZoneInfo('Asia/Karachi'));day=now.strftime('%A');out=[];errors=[]
 try:
  page=txt('https://hum.tv/')
  days=['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY']
  for s in shows:
   if s['network']!='hum':continue
   m=re.search(re.escape(s['name'])+r'\s+((?:MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)(?:-(?:MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY))?)\s*\|\s*(\d{1,2}:\d{2}\s*[AP]M)',page,re.I)
   if not m:continue
   bounds=m.group(1).upper().split('-')
   valid=[bounds[0]] if len(bounds)==1 else [days[i%7] for i in range(days.index(bounds[0]),days.index(bounds[0])+((days.index(bounds[1])-days.index(bounds[0]))%7)+1)]
   t=time24(m.group(2))
   if day.upper() in valid and t:out.append({'name':s['name'],'showId':s['id'],'channel':'HUM TV','time':t,'episode':None,'sourceUrl':'https://hum.tv/'})
 except Exception as e:errors.append('HUM: '+type(e).__name__)
 try:
  page=txt('https://arydigital.tv/schedule')
  m=re.search(r'\b'+day+r'\s+\d+\s+shows\b(.*?)(?=\b(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s+\d+\s+shows\b|$)',page,re.I|re.S)
  section=m.group(1) if m else ''
  for s in shows:
   if s['network']!='arydigital':continue
   m=re.search(re.escape(s['name'])+r'\s*(\d{1,2}:\d{2}\s*[AP]M)\s*[–-]\s*\d{1,2}:\d{2}\s*[AP]M',section,re.I)
   t=time24(m.group(1)) if m else None
   if t:out.append({'name':s['name'],'showId':s['id'],'channel':'ARY Digital','time':t,'episode':None,'sourceUrl':'https://arydigital.tv/schedule'})
 except Exception as e:errors.append('ARY: '+type(e).__name__)
 try:
  page=txt('https://harpalgeo.tv/schedule')
  m=re.search(r'now\s+on\s+tv',page,re.I)
  section=re.split(r'\bSchedule\s+Monday\b',page[m.end():],maxsplit=1,flags=re.I)[0][:5000] if m else ''
  for s in shows:
   if s['network']!='harpalgeo':continue
   for match in re.finditer(re.escape(s['name'])+r'\s*(?:Ep\.?\s*(\d+)\s*)?(\d{1,2}:\d{2}\s*[AP]M)',section,re.I):
    t=time24(match.group(2))
    if t and t>='17:00':out.append({'name':s['name'],'showId':s['id'],'channel':'Har Pal Geo','time':t,'episode':int(match.group(1)) if match.group(1) else None,'sourceUrl':'https://harpalgeo.tv/schedule'})
 except Exception as e:errors.append('Geo: '+type(e).__name__)
 return {'date':now.strftime('%Y-%m-%d'),'weekday':day,'timezone':'Asia/Karachi','items':sorted(out,key=lambda x:(x['time'],x['channel'])),'errors':errors,'note':'These are broadcast slots, not proof an episode was uploaded; reruns possible.'}
def main():
 html=(HERE/'index.html').read_text(encoding='utf8')
 match=re.search(r'window\.PAKTV_CATALOG\s*=\s*(\[.*?\]);',html,re.S)
 if not match:raise RuntimeError('Missing embedded catalogue')
 shows=json.loads(match.group(1))
 with ThreadPoolExecutor(max_workers=8) as pool:groups=list(pool.map(feed,SOURCES.items()))
 latest=[v for group in groups for v in group]
 old=readold('videos.json',{}).get('videos',[])
 unique={v['id']:v for v in old+latest if re.fullmatch(r'[A-Za-z0-9_-]{11}',v.get('id',''))}
 videos=sorted(unique.values(),key=lambda x:x.get('published',''),reverse=True)[:240]
 write('videos.json',{'videos':videos,'mode':'feeds'})
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
 write('episodes.json',episodes)
 result=schedule(shows)
 write('schedule.json',result)
 write('discover.json',{'shows':[],'errors':[]})
 print('Published',len(videos),'videos,',len(episodes),'programme indexes,',len(result['items']),'schedule entries')
if __name__=='__main__':main()
