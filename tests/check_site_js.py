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
# Single-instance header controls must stay together in the sticky toolbar.
header_match = re.search(r'<header class="topbar"[^>]*>([\s\S]*?)</header>', page)
if not header_match:
    raise SystemExit('Top search and settings header missing')
header = header_match.group(1)
for control in ('id="searchInput"', 'id="topFavourites"', 'id="languageButton"',
                'data-privacy-settings', 'class="topbar-actions"'):
    if control not in header:
        raise SystemExit('Missing header control: ' + control)
for control in ('id="searchInput"', 'id="topFavourites"', 'id="languageButton"'):
    if page.count(control) != 1:
        raise SystemExit('Duplicated header control: ' + control)
if header.index('id="searchInput"') > header.index('class="topbar-actions"'):
    raise SystemExit('Search must precede the settings group')
header_css = Path('header-layout.css').read_text(encoding='utf-8')
for required in ('@media(max-width:930px)', '.topbar-actions',
                 '.topbar-search', '.header-language', 'grid-template-rows',
                 '.content-area>.topbar{position:sticky'):
    if required not in header_css:
        raise SystemExit('Responsive toolbar style missing: ' + required)
if 'document.querySelectorAll("[data-privacy-settings]")' not in Path('cookie-consent.js').read_text():
    raise SystemExit('Privacy button is no longer connected to consent settings')
if 'google-adsense-account' not in page or 'ca-pub-7935805760564580' not in page:
    raise SystemExit('Google AdSense verification tag missing')
if not Path('movies.css').is_file() or not Path('ads.txt').is_file():
    raise SystemExit('Movie styles or AdSense ads.txt file missing')
if 'google.com, pub-7935805760564580, DIRECT, f08c47fec0942fa0' not in Path('ads.txt').read_text():
    raise SystemExit('AdSense ads.txt publisher entry missing')
print('Website JavaScript: parsed', len(scripts), 'blocks; cinema, movies and consent controls present')
