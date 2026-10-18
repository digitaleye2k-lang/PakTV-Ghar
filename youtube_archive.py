"""Incremental public YouTube uploads archive, refreshed by GitHub Actions.

Uses channel uploads playlists (1 unit per list call), not costly search.list.
Every listed video is checked with videos.list for publisher identity, privacy,
embedding and territory metadata. Keeps at most a year of previously indexed
records so yesterday/last month/older uploads remain browseable.
"""
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo
from youtube_index import youtube_json, SafeAPIError, CHANNEL_ID, VIDEO_ID, region_viewable, duration_seconds
from channel_sources import CHANNELS, BY_ID
from html import unescape
from concurrent.futures import ThreadPoolExecutor
import re

PER_RUN = 12
PAGES_PER_CHANNEL = 3
PER_CHANNEL_LIMIT = 220
ARCHIVE_RETENTION_DAYS = 365
MAX_ARCHIVE_VIDEOS = 4400
MOVIE_ARCHIVE_RETENTION_DAYS = 3650
# Publisher-uploaded full films / feature-length telefilms, not teasers or
# arbitrary third-party copies. A label alone does not prove worldwide rights.
MOVIE_TITLE = re.compile(r'\b(?:full\s+(?:pakistani\s+)?(?:movie|film)|(?:movie|film)\s+full|complete\s+(?:movie|film)|tele[ -]?film)\b', re.I)
NOT_MOVIE = re.compile(r'\b(?:trailer|teaser|promo|review|reaction|ost|soundtrack|song|behind\s+the\s+scenes|highlights|shorts|episode\s*\d+)\b', re.I)
MOVIE_SEED_IDS = {'aryfilms': ('htZXQ5wIxAg', 'qHaUmAGJl0s', 'rQlXffmfNVA', 'XOTBrzyhZyo')}  # Full-length ARY Films editions.

PROGRAMMES = (
    'capital talk', 'off the record', 'aaj shahzeb khanzada', 'kal tak',
    'the reporters', '11th hour', '11th hour with waseem badami',
    'on the front', 'dunya kamran khan', 'maz aa q raat', 'mazaaq raat',
    'hasb e haal', 'hasna mana hai', 'khabarnaak', 'khabardar',
    'think tank', 'nuqta e nazar', 'aapas ki baat',
)
PROGRAMMES = tuple(x.replace(' ', '') for x in PROGRAMMES)
# Branded panel discussions and interviews appearing on news channels.
# These are topic labels, not political judgements or endorsements.
DISCUSSIONS = ('straighttalk', 'economymatters', 'newswise', 'nadeemmalik',
               'reportcard', 'jirga', 'thinktank', 'nuqtaenazar',
               'capitaltalk', 'the reporters', 'on the front',
               'shahzebkhanzada', 'offtherecord', 'kaltak',
               'powerplay', '11thhour', 'aapas ki baat', 'nadeemmalik',
               'redline', 'spotlightwithmunizae')
DISCUSSIONS = tuple(x.replace(' ', '') for x in DISCUSSIONS)


def is_video_public(record):
    return (record.get('status') or {}).get('privacyStatus', 'public') == 'public'


def video_category(channel, title):
    text = re.sub(r'[^a-z0-9]+', '', title.casefold())
    if any(word in text for word in PROGRAMMES):
        # A show from any publisher can be discovered under its actual genre.
        return ('comedy' if any(w in text for w in (
            'mazaaqraat', 'maz aaqraat', 'hasbehaal', 'hasnamanahai',
            'khabarnaak', 'khabardar')) else 'talk')
    if channel['category']=='news' and any(word in text for word in DISCUSSIONS):
        return 'talk'
    return channel['category']


def normalise_video(resource, channel):
    vid = resource.get('id', '')
    snippet = resource.get('snippet') or {}
    if not VIDEO_ID.fullmatch(vid) or snippet.get('channelId') != channel['youtubeId']:
        return None
    if not is_video_public(resource):
        return None
    title = unescape(snippet.get('title', '')).strip()
    if not title or len(title) > 500 or '[private video]' in title.casefold():
        return None
    published = snippet.get('publishedAt') or ''
    try:
        stamp = datetime.fromisoformat(published.replace('Z', '+00:00'))
        if stamp.year < 2005:
            return None
    except (ValueError, TypeError):
        return None
    thumb = snippet.get('thumbnails') or {}
    image = ((thumb.get('high') or thumb.get('medium') or thumb.get('default') or {}).get('url') or '')
    details = resource.get('contentDetails') or {}
    seconds = duration_seconds(details.get('duration', ''))
    # Exclude Shorts and tiny promo clips; normal comedy/news reports can be
    # shorter than a full drama episode so don't apply a blanket 10m cutoff.
    if seconds < 95:
        return None
    if channel['category'] == 'movies':
        # Enforce full-length videos listed by the source as movies/telefilms.
        # A TV-drama compilation titled "Full Movie" is labelled as such,
        # not represented as an independent theatrical release.
        if seconds < 60*60 or NOT_MOVIE.search(title) or not MOVIE_TITLE.search(title):
            return None
    return {
        'id': vid, 'title': title, 'channel': channel['name'],
        'channelId': channel['id'], 'youtubeChannelId': channel['youtubeId'],
        'category': video_category(channel, title), 'genre': channel['genre'],
        'date': published[:10], 'published': published,
        'description': 'Video from the publisher’s YouTube channel',
        'durationSeconds': seconds,
        'availableGB': region_viewable(details, 'GB'),
        'availablePK': region_viewable(details, 'PK'),
        'embeddable': (resource.get('status') or {}).get('embeddable', True) is not False,
        'thumbnail': image if image.startswith('https://') else '',
        'sourceType': 'youtube_uploads_playlist',
    }


def update_archive(key, previous=None, now=None, transport=None, max_channels=PER_RUN):
    now = now or datetime.now(timezone.utc)
    previous = previous or {}
    entries = {}
    earliest = (now - timedelta(days=ARCHIVE_RETENTION_DAYS)).date().isoformat()
    movie_earliest = (now - timedelta(days=MOVIE_ARCHIVE_RETENTION_DAYS)).date().isoformat()
    for v in previous.get('videos', []):
        threshold = movie_earliest if v.get('category') == 'movies' else earliest
        if VIDEO_ID.fullmatch(v.get('id','')) and v.get('date','') >= threshold:
            entries[v['id']] = v
    cache = dict(previous.get('channels') or {})
    start = int(previous.get('cursor', 0)) % len(CHANNELS)
    checked = []
    errors = []
    checked_with_videos = 0
    if not key:
        return {'generatedAt': now.isoformat(), 'cursor': start,
                'channels': cache, 'videos': list(entries.values()),
                'lastError': 'YouTube API not configured'}, {'enabled': False, 'checked': 0, 'new': 0}
    # Newly-added sports channels must appear on their first refresh rather than
    # waiting several scheduled rotations. Do not expend extra requests beyond
    # max_channels: fill the remaining slots from the normal round-robin cursor.
    priority = [source for source in CHANNELS if source.get('category') == 'sports'
                and not (cache.get(source['id']) or {}).get('lastFetchedAt')][:max_channels]
    regular = []
    advance = 0
    while len(priority) + len(regular) < min(max_channels,len(CHANNELS)) and advance < len(CHANNELS):
        source = CHANNELS[(start+advance) % len(CHANNELS)]
        advance += 1
        if source['id'] not in {item['id'] for item in priority}:
            regular.append(source)
    sources = priority + regular
    for source in sources:
        sid = source['id']
        record = cache.get(sid, {})
        youtube_id = source.get('channelId') or record.get('youtubeId', '')
        uploads = record.get('uploadsId','')
        channel_name = source['name']
        try:
            # Resolve official handle with YouTube Data API rather than trusting
            # a name-based text search that could point to an impersonator.
            if not CHANNEL_ID.fullmatch(youtube_id) or not uploads:
                params = {'part': 'contentDetails,snippet', 'maxResults': 1}
                if CHANNEL_ID.fullmatch(youtube_id):
                    params['id'] = youtube_id
                else:
                    params['forHandle'] = '@'+source['handle'].lstrip('@')
                listing = youtube_json('channels', params, key, transport)
                found = next((c for c in listing.get('items',[]) if CHANNEL_ID.fullmatch(c.get('id',''))),None)
                if not found:
                    raise ValueError('Official channel handle not found')
                youtube_id=found['id']
                uploads=((found.get('contentDetails') or {}).get('relatedPlaylists') or {}).get('uploads','')
                if not uploads:
                    uploads = 'UU'+youtube_id[2:]
                cache[sid] = {'youtubeId':youtube_id,'uploadsId':uploads,
                              'handle':source['handle'],'checkedAt':now.isoformat()}
            entry = dict(source, youtubeId=youtube_id)
            candidates = set()
            page_token = ''
            for _ in range(PAGES_PER_CHANNEL):
                args={'part':'contentDetails','playlistId':uploads,'maxResults':50}
                if page_token:args['pageToken']=page_token
                page = youtube_json('playlistItems', args, key, transport)
                for item in page.get('items',[]):
                    vid = (item.get('contentDetails') or {}).get('videoId','')
                    if VIDEO_ID.fullmatch(vid): candidates.add(vid)
                page_token=page.get('nextPageToken') or ''
                if not page_token:break
            if source['category'] == 'movies':
                candidates.update(v for v in MOVIE_SEED_IDS.get(sid, ()) if VIDEO_ID.fullmatch(v))
            for ids in [sorted(candidates)[i:i+50] for i in range(0,len(candidates),50)]:
                video_batch = youtube_json('videos', {
                    'part':'snippet,status,contentDetails', 'id': ','.join(ids)
                }, key, transport)
                for v in video_batch.get('items',[]):
                    converted = normalise_video(v,entry)
                    if converted and converted['date'] >= (movie_earliest if converted['category']=='movies' else earliest):
                        entries[converted['id']] = converted
                        checked_with_videos += 1
            cache[sid]['lastFetchedAt'] = now.isoformat()
            checked.append(channel_name)
        except SafeAPIError as exc:
            errors.append(channel_name+': '+str(exc))
        except (KeyError,TypeError,ValueError):
            errors.append(channel_name+': channel unavailable')
        # A failing creator never halts updates for everyone else.
    # Bound per-channel archive size and overall published JSON, always keeping
    # recent uploads first so browsing previous days is possible.
    ordered = sorted(entries.values(),
        key=lambda x:(x.get('published',''),x['id']),reverse=True)
    by_channel = {}
    videos = []
    for v in ordered:
        sid=v.get('channelId')
        if by_channel.get(sid,0)>=PER_CHANNEL_LIMIT:continue
        if len(videos)>=MAX_ARCHIVE_VIDEOS:break
        by_channel[sid]=by_channel.get(sid,0)+1
        videos.append(v)
    result = {
        'generatedAt':now.isoformat(),'dateTimezone':'UTC',
        'cursor':(start+advance) % len(CHANNELS), 'channels':cache,
        'videos':videos, 'lastError':'; '.join(errors[:7]),
        'notes':'Videos are links to original publishers, not stored here. Country availability can change.',
    }
    stats={'enabled':True,'checked':len(checked),'new':checked_with_videos,
           'archiveTotal':len(videos),'errors':len(errors)}
    return result,stats
