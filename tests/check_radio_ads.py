"""Pakistan live-radio and opt-in Adsterra safeguards."""
from pathlib import Path
import subprocess
import json
import sys

root=Path(__file__).resolve().parent.parent
sys.path.insert(0,str(root))
from radio_fetch import normalize,collect,OFFICIAL_FALLBACKS

sample={"countrycode":"PK","stationuuid":"2a523e1e-00bf-4f23-bc51-236256bbdd00",
        "lastcheckok":True,"codec":"MP3","bitrate":128,"name":"Example Pakistani FM",
        "url_resolved":"https://radio.example.org/live.mp3",
        "homepage":"https://radio.example.org","state":"Lahore","tags":"pakistani,music"}
assert normalize(sample)["stream"]=="https://radio.example.org/live.mp3"
assert normalize(dict(sample,countrycode="GB")) is None
assert normalize(dict(sample,lastcheckok=False)) is None
assert normalize(dict(sample,url_resolved="http://radio.example.org/live.mp3")) is None
assert normalize(dict(sample,url_resolved="https://radio.example.org/live.m3u8")) is None
assert normalize(dict(sample,codec="UNKNOWN")) is None
mock=collect(lambda endpoint:json.dumps([sample]))
assert mock["stations"][0]["name"]=="Example Pakistani FM"
assert len(mock["stations"])==1+len(OFFICIAL_FALLBACKS)

for name in ("radio.js","music.js","cookie-consent.js"):
    proc=subprocess.run(["node","--check",str(root/name)],capture_output=True,text=True)
    assert proc.returncode==0,name+": "+proc.stderr[:1400]
proc=subprocess.run(["python3","-m","py_compile",str(root/"radio_fetch.py")],capture_output=True,text=True)
assert proc.returncode==0,proc.stderr
dj=(root/"music.js").read_text(encoding="utf-8")
radio=(root/"radio.js").read_text(encoding="utf-8")
music=(root/"music.html").read_text(encoding="utf-8")
assert "paktv:music-video-play" in dj and "paktv:music-video-play" in radio
assert "https://" in radio and ".src=st.stream" in radio
assert "autoplay" not in music.lower().split("<audio",1)[1].split("</audio>",1)[0]
for id in ("radioAudio","radioStop","radioStations","radioSearch","radioPlayerStatus"):
    assert 'id="'+id+'"' in music,id
assert 'src="./radio.js"' in music and 'Pakistan Live Radio' in music

consent=(root/"cookie-consent.js").read_text(encoding="utf-8")
assert 'paktvAutoAds' in consent and 'paktvExtraAds' in consent
assert 'kids|waggle-play|waggle-workshop' in consent
assert 'standaloneAdSlots();' in consent
assert 'if(!GPC&&saved?.ads)loadDisplayAds()' in consent
assert 'if(!GPC&&saved?.googleAds)loadGoogleAds()' in consent
assert 'if(!GPC&&saved?.extra&&document.body?.dataset?.paktvExtraAds!=="no")loadExtraAds()' in consent
assert 'ad-banner.html' in consent
assert 'profitableratecpmnetwork.com' in consent
assert 'highrevenueformat.com' in (root/"ad-banner.html").read_text(encoding="utf-8")
for name in ("index.html","today.html","movies.html","news.html","comedy.html","dramas.html",
             "sports.html","archive.html","favourites.html","search.html","show.html",
             "talk.html","vloggers.html"):
    page=(root/name).read_text(encoding="utf-8")
    assert 'cookie-consent.js' in page and 'paktvBannerSection' in page,name
for name in ("music.html","gupshup.html","community.html","privacy.html","disclaimer.html"):
    page=(root/name).read_text(encoding="utf-8")
    for marker in ('data-paktv-auto-ads="yes"','cookie-consent.js','ads-standalone.css',
                   'cookie-consent.css','data-privacy-settings'):
        assert marker in page, name+": missing "+marker
    assert 'highrevenueformat.com' not in page and 'profitableratecpmnetwork.com' not in page
for name in ("kids.html","waggle-play.html","waggle-workshop.html"):
    page=(root/name).read_text(encoding="utf-8")
    assert 'data-paktv-auto-ads' not in page and 'cookie-consent.js' not in page,name
    assert 'ad-banner.html' not in page and 'ads-standalone.css' not in page,name
assert 'python3 radio_fetch.py' in (root/".github/workflows/publish.yml").read_text(encoding="utf-8")
stations=json.loads((root/"data/radio.json").read_text(encoding="utf-8"))
assert any(s["name"].startswith("Radio Pakistan") for s in stations["stations"])
print("Pakistan radio dial, offline-safe source filtering and non-kids opt-in advertising checks passed.")
