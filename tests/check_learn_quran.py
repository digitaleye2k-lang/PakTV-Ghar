"""Learn Quran section: smoke tests for structure, sources and accessibility."""
from pathlib import Path
import json, subprocess
p=Path(__file__).resolve().parent.parent
page=(p/'learn-quran.html').read_text(encoding='utf-8')
js=(p/'learn-quran.js').read_text(encoding='utf-8')
css=(p/'learn-quran.css').read_text(encoding='utf-8')
app=(p/'site-app.js').read_text(encoding='utf-8')
home=(p/'index.html').read_text(encoding='utf-8')
catalogue=json.loads((p/'data/quran-videos.json').read_text(encoding='utf-8'))
for value in ('id="qLessonList"','id="qLessonDetail"','id="qVideoGrid"','id="qVideoModal"',
              'id="qProgressBar"','quran.com/1','quran.com/112','quran.com/113',
              'quran.com/114','learn-quran.js?v=2','cookie-consent.js'):
    assert value in page,value
for value in ('pgh_quran_lessons_v1','quran-videos.json','youtube-nocookie.com',
              'Noorani Qaida','Tajweed','Al-Fatihah','Makharij'):
    assert value in js,value
for value in ('prefers-reduced-motion','q-hero','q-lesson-detail','q-modal[hidden]'):
    assert value in css,value
assert 'Learn Quran' in app and './learn-quran.html' in app
assert 'quran-home-promo' in app and 'quran-home.css' in home
assert 'quran_fetch.py' in (p/'.github/workflows/publish.yml').read_text(encoding='utf-8')
for video in catalogue['videos']:
    assert len(video['id'])==11 and video['channelId'] in ('homebased','understand','arabic101','bayyinah')
for f in ('learn-quran.js','site-app.js'):
    result=subprocess.run(['node','--check',str(p/f)],capture_output=True,text=True)
    assert result.returncode==0,result.stderr
print('Learn Quran page, lessons, source validation and JS syntax passed.')
