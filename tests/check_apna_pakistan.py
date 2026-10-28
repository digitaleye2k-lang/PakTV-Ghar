"""Check that Apna Pakistan culture page and navigation stay integrated."""
from pathlib import Path
import subprocess
root=Path(__file__).resolve().parent.parent
page=(root/"apna-pakistan.html").read_text(encoding="utf-8")
script=(root/"apna-pakistan.js").read_text(encoding="utf-8")
css=(root/"apna-pakistan.css").read_text(encoding="utf-8")
home=(root/"index.html").read_text(encoding="utf-8")
app=(root/"site-app.js").read_text(encoding="utf-8")
assert 'data-apna-filter="all"' in page
for name in ('id="apnaEvents"','id="apnaRegions"','id="apnaNext"',
             'id="apnaQuizQuestion"','id="apnaModal"','apna-pakistan.js',
             'cookie-consent.js','apna-pakistan.css'):
    assert name in page, "Missing culture section: "+name
for name in ('Pakistan Day','Independence Day','Sindhi Culture Day',
             'Eid-ul-Fitr','Eid-ul-Adha','Christmas in Pakistan',
             'Kalash Spring Festivals','Balochi Heritage'):
    assert name in script, "Missing festival: "+name
assert 'timeZone:"Asia/Karachi"' in script
assert 'firstSunday' in script
assert 'prefers-reduced-motion' in css
assert 'Apna Pakistan · Culture' in app and './apna-pakistan.html' in app
assert 'apna-home-promo' in app and './apna-home.css' in home
for name in ('music.html','yaadein.html','desi-zaika.html','gupshup.html'):
    assert './apna-pakistan.html' in (root/name).read_text(encoding='utf-8')
for fname in ('apna-pakistan.js','site-app.js'):
    proc=subprocess.run(['node','--check',str(root/fname)],capture_output=True,text=True)
    assert proc.returncode==0,proc.stderr[:1500]
print("Apna Pakistan cultural calendar, quiz, navigation and accessibility checks passed.")
