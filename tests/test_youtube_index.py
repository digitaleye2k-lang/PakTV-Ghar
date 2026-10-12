"""No-network tests for official YouTube episode indexing."""
from datetime import datetime, timedelta, timezone
from io import BytesIO
from unittest.mock import patch
from urllib.error import HTTPError
import unittest

from youtube_index import (
    index_api, match_video, region_viewable, duration_seconds,
    CHANNEL_ID, MAX_SEARCH_PER_RUN
)

CID = 'UC' + ('A' * 22)
VID = 'aBcDE123_45'
NOW = datetime(2026, 10, 12, 16, 0, tzinfo=timezone.utc)
SHOW = {'id': 'hum-khushi', 'name': 'Khushi', 'network': 'hum',
        'type': 'drama', 'status': 'airing', 'aliases': []}


def resource(title='Khushi Episode 24 Full', channel=CID,
             duration='PT40M10S', embeddable=True, blocked=None):
    return {
        'id': VID, 'snippet': {'channelId': channel,
            'title': title, 'publishedAt': '2026-10-12T11:00:00Z',
            'thumbnails': {'high': {
                'url': 'https://i.ytimg.com/vi/' + VID + '/hqdefault.jpg'}}},
        'status': {'privacyStatus': 'public', 'embeddable': embeddable},
        'contentDetails': {'duration': duration,
            'regionRestriction': {'blocked': blocked or []}}
    }


class IndexTests(unittest.TestCase):
    def test_known_good_official_episode(self):
        found = match_video(resource(blocked=['GB']), SHOW, CID)
        self.assertEqual(found['episode'], 24)
        self.assertFalse(found['availableGB'])
        self.assertTrue(found['availablePK'])
        self.assertTrue(found['embeddable'])
        self.assertEqual(found['sourceType'], 'youtube_api')

    def test_rejects_clips_and_fake_channels(self):
        self.assertIsNone(match_video(resource(title='Khushi Episode 24 Teaser'), SHOW, CID))
        self.assertIsNone(match_video(resource(duration='PT58S'), SHOW, CID))
        self.assertIsNone(match_video(resource(channel='UC' + 'Z' * 22), SHOW, CID))
        self.assertIsNone(match_video(resource(title='Other Serial Episode 24'), SHOW, CID))

    def test_region_rules(self):
        self.assertTrue(region_viewable({}, 'GB'))
        self.assertTrue(region_viewable({'regionRestriction': {'blocked': ['FR']}}, 'GB'))
        self.assertFalse(region_viewable({'regionRestriction': {'allowed': ['PK']}}, 'GB'))
        self.assertFalse(region_viewable({'regionRestriction': {'allowed': []}}, 'PK'))
        self.assertEqual(duration_seconds('PT1H1M2S'), 3662)

    def test_api_searches_and_cache(self):
        calls = []
        def transport(endpoint, parameters):
            calls.append((endpoint, parameters))
            if endpoint == 'channels':
                return {'items': [{'id': CID}]}
            if endpoint == 'search':
                return {'items': [{'id': {'videoId': VID}}]}
            if endpoint == 'videos':
                return {'items': [resource()]}
            raise AssertionError(endpoint)
        entries, cache, stats = index_api([SHOW], 'test-placeholder-key',
                                           {}, transport=transport, now=NOW)
        self.assertEqual(stats['searches'], 2)  # PK and GB
        self.assertEqual(stats['newVideos'], 1)  # one video, not two
        self.assertEqual(entries[SHOW['id']][0]['episode'], 24)
        self.assertEqual(cache['dailySearches'], 2)
        self.assertEqual({p['regionCode'] for e, p in calls if e == 'search'},
                         {'PK', 'GB'})
        self.assertTrue(all(p.get('channelId') == CID
                            for e, p in calls if e == 'search'))
        entries2, cache2, stats2 = index_api([SHOW], 'test-placeholder-key',
                                              cache, transport=transport,
                                              now=NOW + timedelta(hours=2))
        self.assertEqual(stats2['searches'], 2)
        self.assertTrue(entries2[SHOW['id']])
        self.assertEqual(len([c for c in calls if c[0] == 'channels']), 3)  # Each broadcaster resolved only once

    def test_rss_verified_channels_skip_api_handle_lookup(self):
        calls = []
        def transport(endpoint, parameters):
            calls.append((endpoint, parameters))
            if endpoint == 'channels':
                raise AssertionError('Already resolved from official YouTube channel page')
            if endpoint == 'search':
                return {'items': [{'id': {'videoId': VID}}]}
            if endpoint == 'videos':
                return {'items': [resource()]}
            raise AssertionError(endpoint)
        entries, cache, stats = index_api(
            [SHOW], 'test-placeholder-key', {}, transport=transport,
            now=NOW, known_channel_ids={'hum': CID})
        self.assertEqual(stats['newVideos'], 1)
        self.assertEqual(stats['searches'], 2)
        self.assertEqual(cache['channels']['hum']['id'], CID)
        self.assertTrue(entries[SHOW['id']])
        self.assertEqual([e for e, _ in calls if e == 'channels'], [])

    def test_api_errors_are_safe_to_print(self):
        from youtube_index import youtube_json, SafeAPIError
        fake_secret = "dummy-sensitive-test-key"
        payload = b'{"error":{"code":403,"errors":[{"reason":"accessNotConfigured"}],"message":"sensitive data"}}'
        bad = HTTPError("https://www.googleapis.com/youtube/v3/channels?key=" + fake_secret,
                        403, "API not enabled", {}, BytesIO(payload))
        with patch("youtube_index.urlopen", side_effect=bad):
            with self.assertRaises(SafeAPIError) as ctx:
                youtube_json('channels', {'part': 'snippet'}, fake_secret)
        self.assertIn("HTTP 403: accessNotConfigured", str(ctx.exception))
        self.assertNotIn(fake_secret, str(ctx.exception))
        self.assertNotIn("https://", str(ctx.exception))

    def test_no_secret_no_requests(self):
        def bad(*a, **b):
            raise AssertionError("Unexpected request")
        result, cache, info = index_api([SHOW], '', {}, transport=bad, now=NOW)
        self.assertFalse(info['enabled'])
        self.assertEqual(result, {})
        self.assertEqual(info['searches'], 0)

    def test_quota_ceiling(self):
        quota_day = NOW.astimezone(__import__('zoneinfo').ZoneInfo(
            'America/Los_Angeles')).strftime('%Y-%m-%d')
        def bad(*a, **b):
            raise AssertionError("Quota exceeded")
        data = {'quotaDay': quota_day, 'dailySearches': 80,
                'channels': {'hum': {'id': CID, 'checkedAt': NOW.isoformat()}}}
        entries, cache, stats = index_api([SHOW], 'test-placeholder-key',
                                           data, transport=bad, now=NOW)
        self.assertEqual(stats['searches'], 0)
        self.assertIn('budget', stats['error'])
        self.assertEqual(cache['dailySearches'], 80)


if __name__ == '__main__':
    unittest.main()
