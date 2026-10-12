"""Check every inline website script and archive wiring before deployment."""
from pathlib import Path
import re
import subprocess

page = Path('index.html').read_text(encoding='utf-8')
scripts = [x for x in re.findall(r'<script(?:\s[^>]*)?>([\s\S]*?)</script>', page, re.I)
           if x.strip()]
if len(scripts) < 2:
    raise SystemExit('Expected inline catalogue and app scripts')
for i, js in enumerate(scripts):
    result = subprocess.run(['node', '--check', '-'], input=js,
                            text=True, capture_output=True)
    if result.returncode:
        raise SystemExit('Script ' + str(i) + ' failed JS parse:\n' + result.stderr[:1800])
for expected in (
    'function renderArchive()', 'function loadArchive()', 'data/archive.json',
    'archiveMatches(v)', 'data-archive-period', 'data-creator-genre',
    "state.page==='archive'?renderArchive()", 'state.archiveVideos',
    'YouTubers', 'Ducky Bhai', 'Village Food Secrets',
    "{id:'movies',icon:", "state.page==='movies'?renderMovies()",
    'function renderMovies()', 'function movieVideos()',
    'data/video', 'movie-feature', 'movie-grid', 'data/archive.json',
):
    if expected not in page:
        raise SystemExit('Missing archive frontend integration: ' + expected)
# The spotlight must remain controllable without autoplay and must respect
# reduced-motion preferences; preserve privacy and consent plumbing.
css = Path('spotlight.css').read_text(encoding='utf-8')
for required in (
    'href="./spotlight.css"', 'function spotlightChoices()',
    'function updateSpotlight(index)', 'function updateSpotlightTimer()',
    'function initSpotlightEvents()', 'data-spotlight-index',
    'data-spotlight-pause', 'data-spotlight-move', 'spotlight-mini-track',
    "spotlightReducedMotion.matches", 'cookie-consent.js',
):
    if required not in page:
        raise SystemExit('Spotlight/consent integration missing: ' + required)
for required in ('@media(prefers-reduced-motion:reduce)', '.spotlight-slide',
                 '.spotlight-mini-track', 'slideProgress', 'ambientDrift'):
    if required not in css:
        raise SystemExit('Spotlight stylesheet missing: ' + required)
if 'google-adsense-account' not in page or 'ca-pub-7935805760564580' not in page:
    raise SystemExit('Google AdSense verification tag missing')
if not Path('movies.css').is_file() or not Path('ads.txt').is_file():
    raise SystemExit('Movie styles or AdSense ads.txt file missing')
if 'google.com, pub-7935805760564580, DIRECT, f08c47fec0942fa0' not in Path('ads.txt').read_text():
    raise SystemExit('AdSense ads.txt publisher entry missing')
print('Website JavaScript: parsed', len(scripts), 'blocks; cinema, movies and consent controls present')
