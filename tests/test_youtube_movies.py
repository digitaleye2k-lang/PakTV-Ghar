"""Movie index regression tests: full films, verified publishers and older archives."""
import unittest
from datetime import datetime, timezone
from youtube_archive import normalise_video, update_archive
from channel_sources import BY_ID

CHANNEL = dict(BY_ID['aryfilms'], youtubeId='UC2PYniNHljOED9xNaMpiMiQ')
VIDEO_ID = 'htZXQ5wIxAg'
DATE = '2026-08-13T10:30:00Z'


def resource(title='SHARPASAND - FULL MOVIE | ARY FILMS',duration='PT2H23M35S',
             channel_id='UC2PYniNHljOED9xNaMpiMiQ'):
    return {
        'id': VIDEO_ID,
        'snippet': {
            'title':title, 'channelId':channel_id,
            'publishedAt':DATE,
            'thumbnails': {'high':{'url':'https://i.ytimg.com/vi/'+VIDEO_ID+'/hqdefault.jpg'}}
        },
        'contentDetails':{'duration':duration,'regionRestriction':{'blocked':[]}},
        'status':{'privacyStatus':'public','embeddable':True},
    }


class FilmTests(unittest.TestCase):
    def test_good_full_movie(self):
        converted=normalise_video(resource(),CHANNEL)
        self.assertIsNotNone(converted)
        self.assertEqual(converted['category'],'movies')
        self.assertGreater(converted['durationSeconds'],3600)
        self.assertEqual(converted['channelId'],'aryfilms')
        self.assertTrue(converted['availableGB'])

    def test_trailer_not_movie(self):
        self.assertIsNone(normalise_video(resource(
            title='Sharpasand Official Trailer | ARY Films',duration='PT2M40S'),CHANNEL))

    def test_long_music_track_is_not_movie(self):
        self.assertIsNone(normalise_video(resource(
            title='Sharpasand Full Soundtrack OST',duration='PT1H15M'),CHANNEL))

    def test_episodes_not_movies(self):
        self.assertIsNone(normalise_video(resource(
            title='Kabli Pulao Episode 1 Full',duration='PT1H22M'),CHANNEL))

    def test_full_movie_too_short_rejected(self):
        self.assertIsNone(normalise_video(resource(duration='PT35M'),CHANNEL))

    def test_full_film_and_telefilm_allowed(self):
        self.assertIsNotNone(normalise_video(resource(title='Dhoka - Full Film',duration='PT1H25M'),CHANNEL))
        self.assertIsNotNone(normalise_video(resource(title='Family Telefilm HD',duration='PT1H15M'),CHANNEL))

    def test_unrelated_uploader_rejected(self):
        self.assertIsNone(normalise_video(resource(channel_id='UC'+'X'*22),CHANNEL))

    def test_keep_older_movies_without_network(self):
        old=normalise_video(resource(),CHANNEL)
        old['date']='2024-08-13'
        archived,_=update_archive('',{
            'videos':[old], 'channels':{}, 'cursor':0
        },now=datetime(2026,10,12,tzinfo=timezone.utc))
        self.assertEqual(len(archived['videos']),1)
        self.assertEqual(archived['videos'][0]['id'],VIDEO_ID)


if __name__=='__main__':
    unittest.main()
