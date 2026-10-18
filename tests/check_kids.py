"""Kids Corner checks: curated sources, JavaScript, discoverability, privacy."""
from pathlib import Path
from html.parser import HTMLParser
import subprocess
import sys

root=Path(__file__).resolve().parent.parent
sys.path.insert(0,str(root))
from channel_sources import CHANNELS

home=(root/"index.html").read_text(encoding="utf-8") + (root/"site-app.js").read_text(encoding="utf-8")
kids=(root/"kids.html").read_text(encoding="utf-8")
client=(root/"kids.js").read_text(encoding="utf-8")
gupshup=(root/"gupshup.html").read_text(encoding="utf-8")
workflow=(root/".github/workflows/publish.yml").read_text(encoding="utf-8")
names={c["id"]:c for c in CHANNELS if c.get("category")=="kids"}
assert {"kidsland","kidsmadani","salamkids","urdukidsstudio","shirazi","haimparishay"}.issubset(names)
assert all(c.get("handle") and c.get("genre") for c in names.values())
assert 'href:\'./kids.html\'' in home, "Kids nav must open standalone kids page"
assert 'href="./kids.html"' in home, "Homepage Kids promo link missing"
assert "Kids Corner · Latest uploads" in home
for token in ("kidsVideos","kidsChannels","playerOverlay","showMore","kids.css","kids.js"):
    assert token in kids, "Kids page missing "+token
for token in ("Cartoons & stories","Rhymes & poems","Learning & values","Family vlogs","Kids creators",
              "youtube-nocookie.com/embed/","textContent","noopener noreferrer"):
    assert token in client or token in kids, "Kids content missing "+token
assert 'signInAnonymously' not in client and 'createClient(' not in client, "Kids page must not have guest chat/auth"
assert 'innerHTML' not in client, "Kids page must not interpolate external video titles as HTML"
assert 'muted loop playsinline' in gupshup, "GUPSHUP loop must remain muted"
assert 'gupshup-chai-main.jpg' in gupshup and 'gupshup-chai-rooftop.jpg' in gupshup
assert 'python3 tests/check_kids.py' in workflow
play=(root/"waggle-play.html").read_text(encoding="utf-8")
game=(root/"waggle-play.js").read_text(encoding="utf-8")
assert 'href="./waggle-play.html"' in kids, "Kids Corner must link to Waggle Workshop playroom"
assert 'waggle-home-teaser' not in home, "Keep Waggle Workshop collaboration inside Kids Corner"
assert "Waggle Workshop" in play and 'Professor Pip' in play
for expected in ('data-game="letters"','data-game="numbers"','data-game="colours"',
                 'data-game="shapes"','data-game="memory"','data-game="builder"','data-game="cricket"',
                 'id="ageMode"','id="gameBoard"'):
    assert expected in play, 'Missing playable game control: '+expected
for expected in ('lettersRound','numbersRound','coloursRound','shapesRound',
                 'startMemory','startBuilder','startCricket','addEventListener'):
    assert expected in game, 'Unimplemented game mode: '+expected
assert 'fetch(' not in game and 'localStorage' not in game and 'createClient' not in game, 'Games should run offline without profiling'
assert 'class="pakistan-flag"' not in home
assert 'pakistan-background-art' not in home, "Remove unwanted flag-bearing figure from website"
assert "en:'Games'" in home and "href:'https://retroworld.eu.cc/'" in home, "RetroWorld Games tab missing"
assert 'href="https://retroworld.eu.cc/" target="_blank" rel="noopener noreferrer"' in kids, "Kids Games link missing"
assert 'GUPSHUP moments · silent loop' not in gupshup
assert 'media-note' not in gupshup
for f in ("waggle-play.js","kids.js","gupshup.js","home-briefing.js"):
    result=subprocess.run(["node","--check",str(root/f)],capture_output=True,text=True)
    assert result.returncode==0, f+": "+result.stderr[:900]
class Tags(HTMLParser):
    def __init__(self):super().__init__();self.ids=set()
    def handle_starttag(self,tag,attrs):
        for key,value in attrs:
            if key=="id":
                assert value not in self.ids, "Duplicate HTML id "+value
                self.ids.add(value)
for page in (kids,gupshup):
    p=Tags();p.feed(page)
print("Kids Corner: curated channels, safe browser scripts, video controls and silent gallery OK")

# Waggle Workshop featured channel and official-only video filtering.
waggle=(root/"waggle-workshop.html").read_text(encoding="utf-8")
waggle_js=(root/"waggle-workshop.js").read_text(encoding="utf-8")
waggle_css=(root/"waggle-workshop.css").read_text(encoding="utf-8")
from channel_sources import CHANNELS as SOURCE_CHANNELS
assert any(c["id"]=="waggleworkshop" and c["handle"]=="TheWaggleWorkshop" for c in SOURCE_CHANNELS)
assert "id:'waggle'" not in home, "Waggle Workshop must not be a top-level tab"
assert "Green TV, PTV & Express collections" not in home, "Remove old broadcaster collections from homepage"
assert "waggle-workshop.html" in kids and "waggle-workshop-logo.svg" in kids
assert "The Waggle Workshop" in waggle and "waggleVideosGrid" in waggle
assert "TheWaggleWorkshop" in waggle_js
assert 'channelId==="waggleworkshop"' in waggle_js
assert "youtube-nocookie.com/embed/" in waggle_js
assert "createClient(" not in waggle_js and "innerHTML" not in waggle_js
assert 'waggle-kids-videos' in kids, "Kids Corner requires a Waggle Workshop full-length video section"
assert ".hero-logo" in waggle_css
result=subprocess.run(["node","--check",str(root/"waggle-workshop.js")],capture_output=True,text=True)
assert result.returncode==0, "Waggle workshop JS: "+result.stderr

assert "briefUrdu" in (root/"home-briefing.js").read_text(encoding="utf-8")
assert "Classic Pakistani Movies" in (root/"site-app.js").read_text(encoding="utf-8")
