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
print('Website JavaScript: parsed', len(scripts), 'blocks; spotlight, reduced-motion and archive controls present')
