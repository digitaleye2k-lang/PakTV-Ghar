"""Automatic story preview metadata tests: offline, no AI assumptions."""
import unittest
from youtube_archive import normalise_video, publisher_description

CHANNEL = 'UC_vt34wimdCzdkrzVejwX9g'
VID = '2FKJLBp20OI'


class YouTubeStoryPreviewTests(unittest.TestCase):
    def test_publisher_description_strips_promotions_and_urls(self):
        text = ("A story about two families navigating a difficult choice.\n"
                "Subscribe to our official channel for more dramas!\n"
                "https://www.youtube.com/example\n"
                "What happens when old secrets return? #Pakistan #Drama")
        cleaned = publisher_description(text)
        self.assertIn("two families", cleaned)
        self.assertIn("old secrets", cleaned)
        self.assertNotIn("Subscribe", cleaned)
        self.assertNotIn("https://", cleaned)
        self.assertNotIn("#Pakistan", cleaned)

    def test_promotional_preambles_do_not_become_plot_summaries(self):
        text = ("💚 Love Pakistani dramas? Subscribe to Green Entertainment.\n"
                "Thanks for watching Har Pal Geo. Please click here to Subscribe.\n"
                "ARY Plus APP: download the latest episodes.\n"
                "A daughter challenges a long-held family secret before her wedding.")
        cleaned = publisher_description(text)
        self.assertIn("family secret", cleaned)
        self.assertNotIn("Subscribe", cleaned)
        self.assertNotIn("ARY Plus", cleaned)
        self.assertNotIn("Love Pakistani", cleaned)

    def test_clean_excerpts_are_length_limited(self):
        cleaned = publisher_description("The family discovers a difficult secret. " * 80)
        self.assertLessEqual(len(cleaned), 400)
        self.assertNotIn("http", cleaned)

    def test_drama_keeps_publisher_synopsis_without_inventing_it(self):
        source = {'id': 'hum', 'name': 'HUM TV', 'category': 'dramas',
                  'genre': 'Dramas', 'youtubeId': CHANNEL}
        item = {
            'id': VID,
            'snippet': {
                'channelId': CHANNEL,
                'title': 'Aangan - Episode 4',
                'publishedAt': '2026-10-30T19:00:00Z',
                'description': 'Two families face a difficult decision after an unexpected letter.',
            },
            'status': {'privacyStatus': 'public', 'embeddable': True},
            'contentDetails': {'duration': 'PT40M'},
        }
        video = normalise_video(item, source)
        self.assertEqual(video['category'], 'dramas')
        self.assertIn('unexpected letter', video['description'])

    def test_unavailable_plot_data_is_not_faked(self):
        self.assertEqual(publisher_description(''), '')
        self.assertEqual(publisher_description('https://youtu.be/example'), '')


if __name__ == '__main__':
    unittest.main()
