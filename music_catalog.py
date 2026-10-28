"""Build the independent Music Korner feed from verified artist-upload metadata."""
import re
from datetime import datetime, timezone
from channel_sources import CHANNELS

VIDEO_ID = re.compile(r'^[A-Za-z0-9_-]{11}$')
NON_SONG = re.compile(r'\b(?:shorts?|teaser|trailer|promo|reaction|podcast|interview|behind the scenes|bts|vlog)\b|#short', re.I)
MUSIC_PUBLISHERS = {c['id']:c for c in CHANNELS if c['category'] == 'music'}
MAX_MUSIC_TRACKS = 1800

def build_music_catalog(archive, previous_feed=None, starters=None):
    pool = {}
    # Later sources override earlier metadata. Archive contains validated uploads,
    # while starters are preselected videos from their original publishers.
    for source in (starters, previous_feed, archive):
        if not isinstance(source, dict):
            continue
        for record in source.get('videos', []):
            if not isinstance(record, dict):
                continue
            video_id, channel = record.get('id', ''), record.get('channelId', '')
            if not isinstance(video_id, str) or not VIDEO_ID.fullmatch(video_id):
                continue
            if channel not in MUSIC_PUBLISHERS or record.get('category') != 'music':
                continue
            title = record.get('title', '')
            if not isinstance(title, str) or len(title.strip()) < 4 or NON_SONG.search(title):
                continue
            if record.get('embeddable') is False:
                continue
            seconds = record.get('durationSeconds')
            if isinstance(seconds, (int, float)) and 0 < seconds < 120:
                continue
            clean = {
                'id': video_id, 'title': title.strip()[:250],
                'channel': MUSIC_PUBLISHERS[channel]['name'], 'channelId': channel,
                'category': 'music',
                'genre': MUSIC_PUBLISHERS[channel].get('genre', 'Pakistani music'),
                'published': str(record.get('published') or record.get('date') or '')[:30],
                'date': str(record.get('date') or record.get('published') or '')[:10],
                'embeddable': True,
            }
            if isinstance(seconds, (int, float)):
                clean['durationSeconds'] = seconds
            pool[video_id] = clean
    songs = sorted(pool.values(), key=lambda v:(v['published'], v['id']), reverse=True)[:MAX_MUSIC_TRACKS]
    publishers = {}
    for video in songs:
        key = video['channelId']
        publishers[key] = publishers.get(key, 0) + 1
    return {'generatedAt': datetime.now(timezone.utc).isoformat(),
            'source': 'verified_publisher_uploads_and_official_starters',
            'count': len(songs), 'publishers': publishers, 'videos': songs}
