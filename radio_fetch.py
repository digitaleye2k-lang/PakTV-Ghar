"""Discover Pakistani radio stations from the free community Radio Browser directory.

An external listing is not a guarantee that audio will play everywhere. The
website starts streams only after a user clicks Play, and always shows the
station's own website or directory entry when a stream fails.
"""
from datetime import datetime,timezone
from urllib.request import urlopen,Request
import json,re

SOURCES = (
 "https://de1.api.radio-browser.info/json/stations/bycountrycodeexact/PK?hidebroken=true&order=votes&reverse=true&limit=200",
 "https://nl1.api.radio-browser.info/json/stations/bycountrycodeexact/PK?hidebroken=true&order=votes&reverse=true&limit=200",
)
RADIO_PAKISTAN = "https://www.radio.gov.pk/live-streaming"
OFFICIAL_FALLBACKS = [
 {"name":"Radio Pakistan · FM 101", "city":"Nationwide / cities", "genre":"Music, entertainment and public radio",
  "homepage":RADIO_PAKISTAN, "stream":"", "source":"Official station directory"},
 {"name":"Radio Pakistan · Planet FM 87.6","city":"Islamabad", "genre":"Music and entertainment",
  "homepage":RADIO_PAKISTAN,"stream":"","source":"Official station directory"},
 {"name":"Mast FM 103","city":"Multiple cities","genre":"Music and infotainment",
  "homepage":"https://mastfm103.com.pk/","stream":"","source":"Official station website"}
]
USER_AGENT="PakTVGharRadio/1.0 (public Pakistan station metadata; https://pakghartv.eu.cc/music.html)"
ALLOWED_CODECS = ("MP3","AAC","AAC+","OGG")
MAX_STATIONS=24

def utc_now():
 return datetime.now(timezone.utc).isoformat().replace("+00:00","Z")

def https(value):
 return str(value or "").startswith("https://") and len(str(value))<800

def clean(value,maxlen=110):
 return re.sub(r"[\x00-\x1f\x7f]"," ",str(value or "")).strip()[:maxlen]

def normalize(record):
 if not isinstance(record,dict): return None
 if record.get("countrycode")!="PK" or record.get("lastcheckok") not in (True,1): return None
 if str(record.get("codec","")).upper() not in ALLOWED_CODECS: return None
 if not record.get("stationuuid") or not re.fullmatch(r"[a-zA-Z0-9-]{12,64}",str(record["stationuuid"])):return None
 stream=record.get("url_resolved") or record.get("url") or ""
 if not https(stream):return None
 if any(term in stream.lower() for term in (".m3u8",".m3u",".pls","youtube.com","facebook.com","localhost")):return None
 name=clean(record.get("name"),85)
 if len(name)<3 or name.lower() in ("test","radio","unknown"):return None
 website=record.get("homepage") or ""
 if not https(website):website=RADIO_PAKISTAN if "radio pakistan" in name.lower() else "https://www.radio-browser.info/"
 tags=clean(record.get("tags"),150)
 city=clean(record.get("state"),50) or "Pakistan"
 codec=clean(record.get("codec"),12)
 return {
  "id":clean(record["stationuuid"],64),"name":name,"city":city,"genre":tags or "Pakistani radio",
  "stream":stream,"homepage":website,"codec":codec,"bitrate":int(record.get("bitrate") or 0),
  "source":"Radio Browser (community directory)"
 }

def _download(url):
 req=Request(url,headers={"User-Agent":USER_AGENT,"Accept":"application/json"})
 with urlopen(req,timeout=14) as res:return res.read(2_500_000)

def collect(transport=None):
 transport=transport or _download
 for endpoint in SOURCES:
  try:
   raw=transport(endpoint)
   data=json.loads(raw) if isinstance(raw,(str,bytes)) else raw
   if not isinstance(data,list):continue
   stations=[];seen=set()
   for item in data:
    entry=normalize(item)
    if not entry or entry["id"] in seen:continue
    seen.add(entry["id"]);stations.append(entry)
    if len(stations)>=MAX_STATIONS:break
   if stations:return {"updatedAt":utc_now(),"source":"Radio Browser community directory",
    "sourceUrl":"https://www.radio-browser.info/","stations":stations+OFFICIAL_FALLBACKS}
  except (ValueError,KeyError,TypeError,TimeoutError,OSError):
   continue
 raise RuntimeError("Could not retrieve playable Pakistan radio streams")

def refresh_station_file(path,transport=None):
 from pathlib import Path
 file=Path(path)
 try:
  payload=collect(transport)
 except (RuntimeError,ValueError) as error:
  print("Radio directory unavailable:",type(error).__name__)
  # Keep the previous known streams, but do not mislabel stale data as checked.
  return False
 file.parent.mkdir(parents=True,exist_ok=True)
 file.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
 print("Pakistan radio stations indexed:",len(payload["stations"]))
 return True

if __name__=="__main__":
 refresh_station_file("data/radio.json")
