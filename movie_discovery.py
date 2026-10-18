"""Incremental discovery of full Pakistani films from YouTube's public search index.

One search.list call per successful refresh, alternating broad full-film and
classic-film queries. Every candidate is verified through videos.list and must
match a publisher channel whose identity has been resolved by our normal API
indexer; no third-party or unknown re-uploads are promoted as official films.
The search query is implementation-only and never appears on the website.
"""
import re
from datetime import datetime, timezone, timedelta
from youtube_index import youtube_json, VIDEO_ID, CHANNEL_ID, SafeAPIError
from youtube_archive import normalise_video, MOVIE_ARCHIVE_RETENTION_DAYS
from channel_sources import CHANNELS

QUERY_TYPES = ("full pakistani movies", "classic Pakistani movies full film")
MAX_PER_SEARCH = 35
MOVIE_CHANNELS = tuple(s for s in CHANNELS if s["category"] == "movies")
SEARCH_INTERVAL_HOURS = 2


def discover_movies(api_key, archive, previous=None, transport=None, now=None):
    archive = dict(archive or {})
    previous = dict(previous or {})
    now = now or datetime.now(timezone.utc)
    status = {"enabled":bool(api_key),"checked":0,"added":0,"error":""}
    if not api_key:
        return archive, previous, status
    last = previous.get("checkedAt", "")
    if last:
        try:
            stamp = datetime.fromisoformat(last.replace("Z","+00:00"))
            if stamp.tzinfo and now - stamp < timedelta(hours=SEARCH_INTERVAL_HOURS):
                return archive, previous, status
        except (ValueError,TypeError):
            pass
    # The existing channel cache carries identifiers already resolved via
    # channels.list(forHandle), not inferred from names or text search.
    resolved = archive.get("channels") or {}
    trusted = {}
    for source in MOVIE_CHANNELS:
        cache = resolved.get(source["id"]) or {}
        yt_id = source.get("channelId") or cache.get("youtubeId") or ""
        if CHANNEL_ID.fullmatch(yt_id):
            trusted[yt_id] = dict(source, youtubeId=yt_id)
    previous["checkedAt"] = now.isoformat()
    if not trusted:
        status["error"] = "No indexed movie publishers resolved"
        return archive, previous, status
    cursor = int(previous.get("cursor",0)) % len(QUERY_TYPES)
    previous["cursor"] = cursor+1
    query = QUERY_TYPES[cursor]
    try:
        found = youtube_json("search",{
            "part":"snippet","type":"video","q":query,
            "videoDuration":"long","videoEmbeddable":"true",
            "order":"relevance","regionCode":"PK","maxResults":MAX_PER_SEARCH
        },api_key,transport)
        ids = []
        for entry in found.get("items",[]):
            item_id = entry.get("id") or {}
            vid = item_id.get("videoId") if isinstance(item_id,dict) else ""
            sid = (entry.get("snippet") or {}).get("channelId")
            if VIDEO_ID.fullmatch(vid or "") and sid in trusted:
                ids.append(vid)
        status["checked"] = len(ids)
        if not ids:
            return archive, previous, status
        existing = {v["id"]:v for v in archive.get("videos",[])
                    if VIDEO_ID.fullmatch(v.get("id",""))}
        movie_earliest = (now-timedelta(days=MOVIE_ARCHIVE_RETENTION_DAYS)).date().isoformat()
        for i in range(0,len(ids),50):
            details = youtube_json("videos",{
                "part":"snippet,contentDetails,status",
                "id":",".join(ids[i:i+50])
            },api_key,transport)
            for resource in details.get("items",[]):
                publisher = trusted.get((resource.get("snippet") or {}).get("channelId"))
                if not publisher:
                    continue
                video = normalise_video(resource,publisher)
                if video and video.get("category")=="movies" and video.get("date","")>=movie_earliest:
                    if video["id"] not in existing:status["added"]+=1
                    video["sourceType"] = "youtube_search_verified_publisher"
                    existing[video["id"]] = video
        archive["videos"] = sorted(existing.values(),
                                   key=lambda v:(v.get("published",""),v["id"]),
                                   reverse=True)[:4400]
    except SafeAPIError as e:
        status["error"] = str(e)[:80]
    except (ValueError,TypeError,KeyError):
        status["error"] = "Movie discovery response unavailable"
    return archive, previous, status
