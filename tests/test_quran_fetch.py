"""Offline checks for the vetted Quran-learning RSS collector."""
import unittest
from unittest.mock import patch
from quran_fetch import SOURCES, SEEDS, build, topic, parse_feed, validate_record

CHANNEL='UCY_4DVK8EYAnr4kG5nvn2FQ'
XML='''<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:yt="http://www.youtube.com/xml/schemas/2015">
<yt:channelId>UCY_4DVK8EYAnr4kG5nvn2FQ</yt:channelId>
<entry><yt:videoId>7mNmg91pHQU</yt:videoId><title>Noorani Qaida Lesson 1 in Urdu</title><published>2026-10-25T11:00:00Z</published></entry>
<entry><yt:videoId>Qwza5HdLyEE</yt:videoId><title>Cooking a delicious biryani</title><published>2026-10-24T11:00:00Z</published></entry>
<entry><yt:videoId>MaW0Q76r-AY</yt:videoId><title>Tajweed for beginners #shorts</title><published>2026-10-23T11:00:00Z</published></entry>
</feed>'''

class QuranSourcesTests(unittest.TestCase):
    def test_basics_and_tajweed_classification(self):
        self.assertEqual(topic('Noorani Qaida Lesson 1'), 'basics')
        self.assertEqual(topic('Makharij and Tajweed Rules'), 'tajweed')
        self.assertEqual(topic('Surah Al-Fatihah with recitation'), 'recitation')
        self.assertEqual(topic('Understanding the Quran word by word'), 'meaning')
        self.assertEqual(topic('Cooking a delicious biryani'), '')
        self.assertEqual(topic('Quran learning #shorts'), '')

    def test_feed_checks_channel_identity_and_filters_unrelated_uploads(self):
        source=SOURCES[0]
        result=parse_feed(XML,source,CHANNEL)
        self.assertEqual(len(result),1)
        self.assertEqual(result[0]['id'],'7mNmg91pHQU')
        with self.assertRaises(ValueError):
            parse_feed(XML,source,'UC'+'x'*22)

    def test_invalid_or_unknown_publishers_never_enter_catalogue(self):
        approved={x['id']:x for x in SOURCES}
        self.assertIsNone(validate_record({
            'id':'7mNmg91pHQU','channelId':'random',
            'title':'Noorani Qaida Lesson 1'},approved))
        self.assertIsNone(validate_record({
            'id':'not_a_valid_id','channelId':'homebased',
            'title':'Noorani Qaida Lesson 1'},approved))

    @patch('quran_fetch.channel_id',side_effect=lambda source,old=None: source.get('youtubeChannelId') or CHANNEL)
    def test_build_keeps_verified_starters_when_feeds_fail(self,_resolve):
        def fail(_):raise OSError('Network unavailable')
        result=build({},getter=fail)
        self.assertEqual(len(result['sources']),4)
        self.assertTrue(result['errors'])
        self.assertTrue({x['id'] for x in SEEDS}.issubset({x['id'] for x in result['videos']}))

if __name__=='__main__':
    unittest.main()
