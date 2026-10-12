"""Optional official-channel YouTube Data API episode indexer.

The API key is read only from GitHub Actions environment variables. The generated
JSON contains only public video metadata; never write credentials or raw API URLs.
Uses at most 8 search.list calls per run and 80 per Pacific-time day, leaving
quota headroom for testing and other usage.
"""
from datetime import datetime, timedelta, timezone
from html import unescape
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
from zoneinfo import ZoneInfo
import json
import re

HANDLES = {
    'hum': '@HUMTV',
    'arydigital': '@ARYDigitalasia',
    'harpalgeo': '@HarPalGeoOfficial',
    'greentv': '@GreenEntertainmentTV',
    'ptvhome': '@PTVHomeEntertainment',
    'expresstv': '@expressentertainment',
}
# Stable public broadcaster channel IDs; cross-referenced against channel
# identifiers published by independent channel analytics sources in Oct 2026.
# These are not API credentials, and can be refreshed if a handle changes.
OFFICIAL_CHANNEL_IDS = {
    'hum': 'UCEeEQxm6qc_qaTE7qTV5aLQ',
    'arydigital': 'UC4JCksJF76g_MdzPVBJoC3Q',
    'harpalgeo': 'UCe9JSDmyqNgA_l2BzGHq1Ug',
    'greentv': 'UCF2ltLX1dnPa6-L1paPaMzw',
    'ptvhome': 'UCMfwlaPLGMn44BKvHv15yzA',
}
MAX_SEARCH_PER_RUN = 8
SEARCH_BUDGET_PER_DAY = 80
RESULTS_PER_REGION = 25
CACHE_DAYS = 14
CHANNEL_RECHECK_DAYS = 30
VIDEO_ID = re.compile(r'^[a-zA-Z0-9_-]{11}$')
CHANNEL_ID = re.compile(r'^UC[a-zA-Z0-9_-]{22}$')
EP_RE = re.compile(r'\b(?:episode|ep\.?)\s*[:#-]?\s*0*(\d{1,4})\b', re.I)
NOT_FULL = re.compile(
    r'\b(?:teaser|trailer|promo|ost|reaction|review|preview|best scenes|'
    r'next episode|highlights|recap|shorts?|behind the scenes|bts|'
    r'first look|original soundtrack|scene|clip)\b', re.I)
PT_DURATION = re.compile(r'^P(?:\d+D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$')
NETWORK_NAMES = {'hum': 'HUM TV', 'arydigital': 'ARY Digital',
                 'harpalgeo': 'Har Pal Geo', 'greentv': 'Green Entertainment',
                 'ptvhome': 'PTV Home', 'expresstv': 'Express TV'}


def normalize(text):
    return re.sub(r'[^a-z0-9]+', '', unescape(str(text)).casefold())


def duration_seconds(duration):
    match = PT_DURATION.match(duration or '')
    if not match:
        return 0
    h, m, s = [int(p or 0) for p in match.groups()]
    return h * 3600 + m * 60 + s


def region_viewable(details, region):
    restrict = details.get('regionRestriction') or {}
    if 'allowed' in restrict:
        return region in restrict['allowed']
    if 'blocked' in restrict:
        return region not in restrict['blocked']
    return True


def match_video(video, show, expected_channel):
    if not VIDEO_ID.fullmatch(video.get('id', '')):
        return None
    snippet = video.get('snippet') or {}
    if snippet.get('channelId') != expected_channel:
        return None
    title = unescape(snippet.get('title', ''))
    if NOT_FULL.search(title):
        return None
    names = [show['name']] + (show.get('aliases') or [])
    if not any(len(normalize(name)) >= 4 and normalize(name) in normalize(title) for name in names):
        return None
    match = EP_RE.search(title)
    if not match:
        return None
    number = int(match.group(1))
    if number < 1 or number > 1200:
        return None
    status = video.get('status') or {}
    if status.get('privacyStatus') not in (None, 'public'):
        return None
    if status.get('embeddable') is False:
        # Keep legitimate videos as external links if iframe playback is disabled.
        embeddable = False
    else:
        embeddable = True
    details = video.get('contentDetails') or {}
    # Exclude short promos and scene clips even if not labelled in their title.
    if duration_seconds(details.get('duration')) < 10 * 60:
        return None
    thumb = snippet.get('thumbnails') or {}
    thumbnail = ((thumb.get('high') or thumb.get('medium') or
                  thumb.get('default') or {}).get('url') or '')
    published = snippet.get('publishedAt') or ''
    result = {
        'id': video['id'], 'title': title, 'episode': number,
        'date': published[:10], 'published': published,
        'source': NETWORK_NAMES.get(show['network'], show['network']),
        'channelId': show['network'], 'sourceType': 'youtube_api',
        'kind': 'youtube', 'embeddable': embeddable,
        'availableGB': region_viewable(details, 'GB'),
        'availablePK': region_viewable(details, 'PK'),
        'thumbnail': thumbnail if thumbnail.startswith('https://') else '',
    }
    return result


class SafeAPIError(Exception):
    """A diagnostic containing only a status code and public reason identifier."""


def youtube_json(endpoint, parameters, api_key, transport=None):
    """Read JSON without exposing a key, API query, or server error message."""
    if transport:
        return transport(endpoint, dict(parameters))
    url = 'https://www.googleapis.com/youtube/v3/' + endpoint + '?' + urlencode(
        dict(parameters, key=api_key))
    req = Request(url, headers={'Accept': 'application/json',
                                'User-Agent': 'PakTVGhar-Index/3.0'})
    try:
        with urlopen(req, timeout=13) as response:
            return json.loads(response.read(1800000))
    except HTTPError as exc:
        # Do NOT expose exception URLs or full Google error messages: URLs
        # include the API key in the query string. Only allow short reason codes.
        code = exc.code
        try:
            obj = json.loads(exc.read(6000))
            err = obj.get('error') or {}
            reasons = err.get('errors') or []
            reason = ((reasons[0] or {}).get('reason') if reasons else '') or err.get('status') or ''
            if not re.fullmatch(r'[A-Za-z][A-Za-z0-9._-]{0,59}', reason):
                reason = 'unknown'
            # Match only fixed error categories, never log provider text. Google's
            # raw error message can echo sensitive request data.
            message = str(err.get('message', '')).casefold()
            if ('api key not valid' in message or 'invalid api key' in message or
                ('key' in message and 'invalid' in message)):
                reason = 'invalidApiKey'
            elif ('api has not been used' in message or 'api is disabled' in message or
                  'access not configured' in message or 'api is not enabled' in message):
                reason = 'apiNotEnabled'
            elif ('key' in message and ('restricted' in message or 'referer' in message or
                                        'referrer' in message or 'ip address' in message)):
                reason = 'keyRestrictions'
            elif 'quota' in message and ('exceeded' in message or 'limit' in message):
                reason = 'quotaExceeded'
        except (ValueError, TypeError, AttributeError, KeyError):
            reason = 'unknown'
        raise SafeAPIError('HTTP ' + str(code) + ': ' + reason) from None
    except (URLError, TimeoutError):
        raise SafeAPIError('Network connection failed') from None


def cached_entries(cache, now):
    cutoff = now - timedelta(days=CACHE_DAYS)
    kept = {}
    for show_id, videos in (cache.get('entries') or {}).items():
        valid = []
        for item in videos:
            try:
                checked = datetime.fromisoformat(item.get('checkedAt', ''))
            except (ValueError, TypeError):
                continue
            if checked.tzinfo is None:
                checked = checked.replace(tzinfo=timezone.utc)
            if checked < cutoff or not VIDEO_ID.fullmatch(item.get('id', '')):
                continue
            valid.append(item)
        if valid:
            kept[show_id] = valid
    return kept


def index_api(shows, key, old_cache=None, transport=None, now=None, known_channel_ids=None):
    """Return (per-show episodes, cache, public stats), even on temporary failures.

    Uses Google search.list with an official channel ID resolved from the
    configured broadcaster's handle, then verifies every candidate via
    videos.list (owner, privacy, embeddability, duration, GB/PK rights).
    """
    now = now or datetime.now(timezone.utc)
    if now.tzinfo is None:
        now = now.replace(tzinfo=timezone.utc)
    cache = dict(old_cache or {})
    entries = cached_entries(cache, now)
    stats = {'enabled': bool(key), 'searches': 0, 'newVideos': 0,
             'indexedShows': len(entries), 'error': ''}
    if not key:
        return entries, cache, stats
    # Detect GitHub secrets containing a key NAME, pasted JSON, quotation marks,
    # or a wrong credential type without ever logging the secret value.
    if transport is None and not re.fullmatch(r'AIza[A-Za-z0-9_-]{35}', key):
        stats['error'] = ('The YOUTUBE_API_KEY secret has the wrong format. '
                          'Paste only the 39-character Google API key value.')
        cache['entries'] = entries
        return entries, cache, stats

    quota_day = now.astimezone(ZoneInfo('America/Los_Angeles')).strftime('%Y-%m-%d')
    if cache.get('quotaDay') != quota_day:
        cache['quotaDay'], cache['dailySearches'] = quota_day, 0
    budget = max(0, min(MAX_SEARCH_PER_RUN,
                        SEARCH_BUDGET_PER_DAY - int(cache.get('dailySearches', 0))))
    if budget < 2:
        stats['error'] = 'Search budget reached; preserved cached results'
        cache['entries'] = entries
        return entries, cache, stats

    # Use a minimal, documented public videos.list request to distinguish a
    # credential/project problem from bad search parameters, costing 1 unit.
    if transport is None and not cache.get('apiValidated'):
        try:
            youtube_json('videos', {
                'part': 'snippet', 'id': 'rUKxY6_eujE'
            }, key, transport)
            cache['apiValidated'] = True
        except SafeAPIError as exc:
            stats['error'] = 'Minimal YouTube API credential check: ' + str(exc)
            cache['entries'] = entries
            return entries, cache, stats
        except Exception:
            stats['error'] = 'Minimal YouTube API credential check: unexpected response'
            cache['entries'] = entries
            return entries, cache, stats

    channels = dict(cache.get('channels') or {})
    for network, channel_id in OFFICIAL_CHANNEL_IDS.items():
        if not CHANNEL_ID.fullmatch((channels.get(network) or {}).get('id', '')):
            channels[network] = {
                'id': channel_id, 'handle': HANDLES[network],
                'checkedAt': now.isoformat(), 'verifiedVia': 'published_channel_id'
            }
    # Feed collector resolves each configured handle on youtube.com and reads
    # its official channel ID from the publisher's public channel page.
    # Reusing it avoids channel.list's redundant API request.
    for network, cid in (known_channel_ids or {}).items():
        if network in HANDLES and CHANNEL_ID.fullmatch(cid or ''):
            channels[network] = {
                'id': cid, 'handle': HANDLES[network],
                'checkedAt': now.isoformat(), 'verifiedVia': 'youtube_official_page'
            }
    channel_errors = set()
    for network, handle in HANDLES.items():
        record = channels.get(network) or {}
        fresh = False
        try:
            if record.get('checkedAt') and CHANNEL_ID.fullmatch(record.get('id', '')):
                checked = datetime.fromisoformat(record['checkedAt'])
                fresh = now - checked < timedelta(days=CHANNEL_RECHECK_DAYS)
        except (TypeError, ValueError):
            pass
        if fresh:
            continue
        try:
            data = youtube_json('channels', {
                'part': 'snippet', 'forHandle': handle, 'maxResults': 1
            }, key, transport)
            found = next((item for item in data.get('items', [])
                          if CHANNEL_ID.fullmatch(item.get('id', ''))), None)
            if found:
                channels[network] = {'id': found['id'], 'handle': handle,
                                     'checkedAt': now.isoformat()}
        except SafeAPIError as exc:
            channel_errors.add(str(exc))
        except Exception:
            channel_errors.add('Unexpected response or service error')
    if channel_errors:
        # Only safe, key-free diagnostic codes are printed to Actions logs.
        stats['error'] = 'Official channel lookup: ' + '; '.join(sorted(channel_errors))
    cache['channels'] = channels
    chosen = [s for s in shows if s.get('type') == 'drama' and s.get('network') in channels
              and CHANNEL_ID.fullmatch(channels[s['network']].get('id', ''))]
    priorities = {'airing': 0, 'upcoming': 1, 'recent': 2,
                  'library': 3, 'archive': 4}
    chosen.sort(key=lambda s: (priorities.get(s.get('status'), 5),
                               s.get('network', ''), s['name']))
    if not chosen:
        stats['error'] = stats['error'] or 'No verified official channel IDs'
        cache['entries'] = entries
        return entries, cache, stats

    # Each programme is searched in both UK and Pakistan. 4 shows/run
    # x 8 scheduled runs/day consumes at most 64 searches, plus headroom.
    cursor = int(cache.get('cursor', 0)) % len(chosen)
    count = min(len(chosen), budget // 2)
    for i in range(count):
        show = chosen[(cursor + i) % len(chosen)]
        channel_id = channels[show['network']]['id']
        candidates = set()
        for region in ('GB', 'PK'):
            if stats['searches'] >= budget:
                break
            params = {
                'part': 'snippet', 'q': show['name'] + ' full episode',
                'type': 'video', 'maxResults': RESULTS_PER_REGION,
                'channelId': channel_id, 'regionCode': region,
                'order': 'date' if show.get('status') in ('airing', 'recent')
                         else 'relevance',
                'safeSearch': 'moderate',
            }
            # Account for failed requests too: Google charges at least one.
            stats['searches'] += 1
            cache['dailySearches'] = int(cache.get('dailySearches', 0)) + 1
            try:
                results = youtube_json('search', params, key, transport)
            except SafeAPIError as exc:
                stats['error'] = 'YouTube search: ' + str(exc)
                continue
            except Exception:
                stats['error'] = 'YouTube search: unexpected response'
                continue
            for item in results.get('items', []):
                video_id = (item.get('id') or {}).get('videoId') or ''
                if VIDEO_ID.fullmatch(video_id):
                    candidates.add(video_id)
        # Inspect the actual video records to avoid misattributing channels,
        # teaser results, disabled embeds, or country blocking.
        confirmed = []
        for chunk_start in range(0, len(candidates), 50):
            batch = sorted(candidates)[chunk_start:chunk_start + 50]
            try:
                data = youtube_json('videos', {
                    'part': 'snippet,status,contentDetails',
                    'id': ','.join(batch), 'maxResults': len(batch)
                }, key, transport)
            except SafeAPIError as exc:
                stats['error'] = 'Video details: ' + str(exc)
                continue
            except Exception:
                stats['error'] = 'Video details: unexpected response'
                continue
            for resource in data.get('items', []):
                result = match_video(resource, show, channel_id)
                if result:
                    result['checkedAt'] = now.isoformat()
                    confirmed.append(result)
        if confirmed:
            old = entries.get(show['id'], [])
            dedup = {entry['id']: entry for entry in old}
            for new in confirmed:
                dedup[new['id']] = new
            entries[show['id']] = sorted(dedup.values(),
                key=lambda v: (v.get('episode', 0), v.get('published', '')),
                reverse=True)[:100]
            stats['newVideos'] += len(confirmed)
    cache['cursor'] = (cursor + count) % len(chosen)
    cache['entries'] = entries
    stats['indexedShows'] = len(entries)
    return entries, cache, stats
