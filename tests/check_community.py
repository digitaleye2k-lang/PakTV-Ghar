"""Regression checks for opt-in visitor statistics and Supabase community safety."""
from pathlib import Path
import re
import subprocess

root = Path(__file__).resolve().parent.parent
index = (root / 'index.html').read_text(encoding='utf-8')
page = (root / 'community.html').read_text(encoding='utf-8')
client = (root / 'community.js').read_text(encoding='utf-8')
stats = (root / 'site-visitors.js').read_text(encoding='utf-8')
config = (root / 'community-config.js').read_text(encoding='utf-8')
schema = (root / 'community/supabase-schema.sql').read_text(encoding='utf-8')
edge = (root / 'community/edge-functions/community-visit/index.ts').read_text(encoding='utf-8')

for path in ('community.js', 'site-visitors.js', 'community-config.js'):
    result = subprocess.run(['node', '--check', str(root/path)], capture_output=True, text=True)
    if result.returncode:
        raise SystemExit(f'Invalid JavaScript: {path}\n{result.stderr[:1600]}')

for expected in ('./community.html#chat', './community.html#contact',
                 './community.html#visitors', './community.html#report',
                 'homeCountVisit', 'homeVisitCount', 'site-visitors.js', 'community-config.js'):
    assert expected in index, 'Main-site community link or counter missing: '+expected

for expected in ('Visitors','Show chat','Contact us','Report','Be a moderator',
                 'id="communitySetup"', 'id="countryRows"', 'id="chatForm"',
                 'id="chatMessages"', 'id="staffEmailForm"', 'id="ownerInbox"',
                 'data-community-panel="moderator"', 'data-intake-kind="report"',
                 'data-intake-kind="moderator"', 'community.js'):
    assert expected in page, 'Community page missing: '+expected

for control in set(re.findall(r'el\("([A-Za-z][A-Za-z0-9]*)"\)', client)):
    assert f'id="{control}"' in page, 'JS community control missing from HTML: '+control

for expected in ('function friendlyError(', 'pgh_safe_text', 'pgh_post_message',
                 'pgh_report_message', 'pgh_private_inbox',
                 'pgh_review_queue', 'pgh_resolve_submission',
                 'pgh_visit_summary', 'pgh_record_visit',
                 'security definer set search_path', 'enable row level security',
                 "status='visible'", 'auth.uid()', 'grant execute',
                 'pgh_moderator()'):
    assert expected in client or expected in schema, 'Security or moderation missing: '+expected

assert "window.PAKTV_COMMUNITY_CONFIG" in config
assert re.search(r'supabaseUrl:\s*""', config), 'Do not pre-fill a fabricated backend URL'
assert re.search(r'publishableKey:\s*""', config), 'Do not expose or fabricate an API key'
assert "SERVICE_ROLE_KEY" not in config and "service_role" not in config.lower()
assert 'VISITOR_HASH_SECRET' in edge and '"HMAC"' in edge
assert 'ALLOWED.has(origin)' in edge
assert 'countVisit").addEventListener("click"' in client
assert 'recordVisit(),loadChat()' not in client, 'Visit was called automatically'
assert 'window.confirm(' in stats, 'Main-site tracking needs explicit opt-in'
assert 'getElementById' in stats and 'pgh_visit_summary' in stats
assert 'sessionStorage' in client and 'textContent' in client
assert 'content-editable' not in page

print('Community: external JavaScript parses; private forms, consent and RLS hooks present.')
