#!/usr/bin/env python3
"""Refresh Learn Quran's teacher-sourced YouTube learning library.

Only publisher-owned channel feeds and pre-verified starter video IDs are used.
Runs during existing GitHub Pages refresh; works without a YouTube API key.
"""
from datetime import datetime, timezone
from html import unescape
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import quote, urlencode
import os
import json
import re
import xml.etree.ElementTree as ET

HERE = Path(__file__).resolve().parent
OUTPUT = HERE / 'data' / 'quran-videos.json'
VIDEO_ID = re.compile(r'^[A-Za-z0-9_-]{11}$')
CHANNEL_ID = re.compile(r'^UC[A-Za-z0-9_-]{22}$')
HEADERS = {'User-Agent': 'Mozilla/5.0 (compatible; PakTVGhar-LearnQuran/1.0)'}
SOURCES = [
    {'id': 'homebased', 'name': 'Home Based Quran Learning',
     'handle': 'HomeBasedQuranLearning', 'youtubeChannelId': 'UCY_4DVK8EYAnr4kG5nvn2FQ',
     'language': 'Urdu'},
    {'id': 'understand', 'name': 'Understand Al-Quran Official',
     'handle': 'understandquran', 'youtubeChannelId': 'UCdqEwn5bGGbFE0u8UqdHmGQ',
     'language': 'English / Urdu'},
    {'id': 'bayyinah', 'name': 'Nouman Ali Khan - Official - Bayyinah',
     'handle': 'bayyinah', 'youtubeChannelId': 'UCRtiU-lpcBSi-ipFKyfIkug',
     'language': 'English / Urdu'}
]
SEEDS = [
    {'id': '7mNmg91pHQU',
     'title': 'Noorani Qaida Lesson 1 | Haroof-e-Mufradaat (Arabic Letters)',
     'channelId': 'homebased', 'channel': 'Home Based Quran Learning',
     'language': 'Urdu', 'topic': 'basics', 'date': '2024-03-29',
     'source': 'verified official teaching upload'},
    {'id': 'p0hiipvTVm0',
     'title': 'Noorani Qaida Lesson 12 in Urdu / Hindi | Shaddah | Takhti Number 12',
     'channelId': 'homebased', 'channel': 'Home Based Quran Learning',
     'language': 'Urdu', 'topic': 'basics', 'date': '2025-02-20',
     'source': 'verified official teaching upload'},
]
LEARNING = re.compile(
    r'(?i)(qur.?an|quran|tajweed|tajwid|qaida|qaaida|noorani|surah|'
    r'har[o]+f|makh[a-z]*|arabic|tilawat|hifz|recitat|tafsir|'
    r'القرآن|قرآن|قاعدہ|تجوید|سورۃ|سورة|الفاتح|پارہ|تلاوت|'
    r'memoris|memoriz|letter|pronunc|meaning|qira)', re.U)
UNRELATED = re.compile(
    r'(?i)(#shorts?\b|\bshorts?\b|#?youtubeshorts\b|#?trendingshorts\b|\bshortvideos?\b|\blivestream\b|\blive stream\b|'
    r'\btrailer\b|\bteaser\b|\bpromo\b|\binterview\b|'
    r'\bdonat(?:e|ion)\b|\bfundrais\w*\b)', re.U)

def get(url, limit=2_000_000):
    with urlopen(Request(url, headers=HEADERS), timeout=12) as response:
        return response.read(limit).decode('utf-8', 'replace')

def channel_id(source, old=None):
    if CHANNEL_ID.fullmatch(source.get('youtubeChannelId', '')):
        return source['youtubeChannelId']
    if old and CHANNEL_ID.fullmatch(old.get('youtubeChannelId', '')):
        return old['youtubeChannelId']
    page = get('https://www.youtube.com/@' + quote(source['handle']))
    for pattern in (
        r'"externalId":"(UC[A-Za-z0-9_-]{22})"',
        r'"channelId":"(UC[A-Za-z0-9_-]{22})"',
        r'https://www\.youtube\.com/channel/(UC[A-Za-z0-9_-]{22})'
    ):
        match = re.search(pattern, page)
        if match:
            return match.group(1)
    raise ValueError('Cannot verify publisher channel ID')

def topic(title):
    text = str(title or '').casefold()
    if not LEARNING.search(text) or UNRELATED.search(text):
        return ''
    if re.search(r'(surah.{0,15}names? memor|deeper look|quran study|quranic study)', text):
        return 'meaning'
    if re.search(r'(qaida|qaaida|noorani|alphabet|letters|har[o]+f|'
                 r'harakat|zabar|zer|pesh|قائدہ|قاعدہ|حروف)', text):
        return 'basics'
    if re.search(r'(surah|sura|recitat|tilawat|پارہ|سورۃ|سورة|تلاوت)',text) and \
       re.search(r'(ayat|verse|recitat|tilawat|تلاوت)',text):
        return 'recitation'
    if re.search(r'(tajweed|tajwid|makhar|ikhfa|ghunna|madd|qalqal|'
                 r'shaddah|pronunc|recitation rule|تجوید|غنہ)', text):
        return 'tajweed'
    if re.search(r'(tafsir|meaning|understand|explain|translation|'
                 r'vocab|reflection|تفسیر|ترجمہ)', text):
        return 'meaning'
    if re.search(r'(surah|sura|recitat|tilawat|memor|hifz|پارہ|'
                 r'سورۃ|سورة|تلاوت)', text):
        return 'recitation'
    return 'general'

def parse_feed(xml_text, source, verified_id):
    root = ET.fromstring(xml_text)
    ns = {'a':'http://www.w3.org/2005/Atom',
          'yt':'http://www.youtube.com/xml/schemas/2015'}
    actual = root.findtext('yt:channelId', '', ns)
    if actual != verified_id:
        raise ValueError('The YouTube feed did not match the verified publisher channel')
    results = []
    for entry in root.findall('a:entry', ns):
        video_id = entry.findtext('yt:videoId', '', ns)
        title = unescape(entry.findtext('a:title', '', ns)).strip()
        published = entry.findtext('a:published', '', ns)
        group = topic(title)
        if not VIDEO_ID.fullmatch(video_id or '') or not group:
            continue
        if len(title) > 250 or len(title) < 8:
            continue
        results.append({
            'id': video_id, 'title': title,
            'channelId': source['id'], 'channel': source['name'],
            'language': source['language'], 'topic': group,
            'date': published[:10], 'source': 'publisher YouTube RSS'
        })
    return results

def google_api(endpoint, params, api_key, getter=get):
    data = dict(params)
    data['key'] = api_key
    url = 'https://www.googleapis.com/youtube/v3/' + endpoint + '?' + urlencode(data)
    return json.loads(getter(url))

def parse_api_items(items, source, verified_id):
    """Use only videos whose playlist metadata matches the exact approved owner."""
    rows = []
    for item in items:
        snippet = item.get('snippet') or {}
        details = item.get('contentDetails') or {}
        video_id = details.get('videoId') or (snippet.get('resourceId') or {}).get('videoId')
        owner = snippet.get('videoOwnerChannelId') or snippet.get('channelId')
        title = unescape(str(snippet.get('title') or '')).strip()
        published = details.get('videoPublishedAt') or snippet.get('publishedAt') or ''
        group = topic(title)
        if owner != verified_id or not VIDEO_ID.fullmatch(str(video_id or '')) or not group:
            continue
        if len(title) > 250 or len(title) < 8:
            continue
        if title.casefold() in ('private video', 'deleted video'):
            continue
        rows.append({
            'id': video_id, 'title': title,
            'channelId': source['id'], 'channel': source['name'],
            'language': source['language'], 'topic': group,
            'date': published[:10], 'source': 'publisher YouTube Data API'
        })
    return rows

def fetch_api(source, verified_id, api_key, getter=get):
    channels = google_api('channels',
        {'part':'contentDetails','id':verified_id,'maxResults':1},api_key,getter)
    items = channels.get('items') or []
    if not items or items[0].get('id') != verified_id:
        raise ValueError('YouTube API did not confirm the expected channel')
    uploads = ((items[0].get('contentDetails') or {})
               .get('relatedPlaylists') or {}).get('uploads')
    if not uploads:
        raise ValueError('YouTube channel has no public uploads playlist')
    results = []
    page_token = None
    for _ in range(2):
        params={'part':'snippet,contentDetails','playlistId':uploads,'maxResults':50}
        if page_token:
            params['pageToken']=page_token
        payload=google_api('playlistItems',params,api_key,getter)
        results.extend(parse_api_items(payload.get('items') or [],source,verified_id))
        page_token=payload.get('nextPageToken')
        if not page_token:
            break
    return results


def validate_record(video, sources):
    if not isinstance(video, dict):
        return None
    source = sources.get(video.get('channelId'))
    if not source or not VIDEO_ID.fullmatch(str(video.get('id', ''))):
        return None
    if video.get('source') != 'verified official teaching upload' and \
       video.get('source') != 'verified teacher upload' and \
       not topic(video.get('title', '')):
        return None
    title = str(video.get('title', '')).strip()
    if len(title) < 8 or len(title) > 250:
        return None
    return {
        'id': video['id'], 'title': title,
        'channelId': source['id'], 'channel': source['name'],
        'language': source['language'],
        'topic': topic(title) or str(video.get('topic', 'general')),
        'date': str(video.get('date') or '')[:10],
        'source': str(video.get('source') or 'publisher YouTube RSS')[:60]
    }

def build(previous=None, getter=get, api_key=None):
    if api_key is None:
        api_key = os.getenv('YOUTUBE_API_KEY', '').strip()
    previous = previous if isinstance(previous, dict) else {}
    old_sources = {s.get('id'): s for s in previous.get('sources', []) if isinstance(s, dict)}
    sources = []
    fetched = []
    errors = []
    for source in SOURCES:
        source = dict(source)
        try:
            resolved = channel_id(source, old_sources.get(source['id']))
            source['youtubeChannelId'] = resolved
            # When the existing site API key is configured, index up to 100
            # publisher uploads; public RSS is retained as a no-key fallback.
            try:
                if not api_key:
                    raise ValueError('No YouTube API key configured')
                fetched.extend(fetch_api(source, resolved, api_key, getter))
            except Exception as api_error:
                url = 'https://www.youtube.com/feeds/videos.xml?channel_id=' + resolved
                try:
                    fetched.extend(parse_feed(getter(url), source, resolved))
                except Exception as rss_error:
                    raise ValueError('API: ' + type(api_error).__name__ +
                                     ', RSS: ' + type(rss_error).__name__) from rss_error
        except Exception as exc:
            errors.append(source['id'] + ': ' + str(exc)[:110])
            previous_id = old_sources.get(source['id'], {}).get('youtubeChannelId')
            if CHANNEL_ID.fullmatch(str(previous_id or '')):
                source['youtubeChannelId'] = previous_id
        sources.append(source)
    known = {s['id']:s for s in sources}
    entries = {}
    # Keep old verified videos and seed starter lessons, deduplicated by video ID.
    # Data is kept even if the RSS feed or YouTube API is temporarily unavailable.
    for row in SEEDS + previous.get('videos', []) + fetched:
        checked = validate_record(row, known)
        if checked:
            entries[checked['id']] = checked
    vids = sorted(entries.values(), key=lambda row: (row['date'], row['id']), reverse=True)[:220]
    return {
        'generatedAt': datetime.now(timezone.utc).isoformat(),
        'sources': sources, 'videos': vids, 'count': len(vids),
        'errors': errors
    }

def main():
    try:
        previous = json.loads(OUTPUT.read_text(encoding='utf-8'))
    except (OSError, json.JSONDecodeError):
        previous = {}
    result = build(previous)
    OUTPUT.parent.mkdir(exist_ok=True)
    OUTPUT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print('Learn Quran:', result['count'], 'videos from verified teaching sources; '
          + str(len(result['errors'])) + ' channel fetch issues')

if __name__ == '__main__':
    main()
