"""No-network discovery tests: films from search must be full-length and source-verified."""
import unittest
from datetime import datetime, timezone, timedelta
from movie_discovery import discover_movies

WHEN=datetime(2026,10,18,12,tzinfo=timezone.utc)
CHANNEL='UC2PYniNHljOED9xNaMpiMiQ'
VIDEO='htZXQ5wIxAg'
OTHER='UC'+'x'*22

def resource(video_id=VIDEO, title='Pakistani Classic FULL MOVIE | ARY Films',
             channel_id=CHANNEL, duration='PT2H4M'):
    return {'id':video_id,
            'snippet':{'title':title,'channelId':channel_id,
                       'publishedAt':'2026-09-15T12:00:00Z'},
            'contentDetails':{'duration':duration,'regionRestriction':{'blocked':[]}},
            'status':{'privacyStatus':'public','embeddable':True}}

def archive():
    return {'channels':{'aryfilms':{'youtubeId':CHANNEL,'uploadsId':'UU'+CHANNEL[2:]}},
            'videos':[]}

class MovieDiscoveryTests(unittest.TestCase):
    def test_search_curated_publisher_only(self):
        calls=[]
        def transport(endpoint,params):
            calls.append((endpoint,params))
            if endpoint=='search':
                return {'items':[
                  {'id':{'videoId':VIDEO},'snippet':{'channelId':CHANNEL}},
                  {'id':{'videoId':'A'*11},'snippet':{'channelId':OTHER}}
                ]}
            if endpoint=='videos':return {'items':[resource()]}
            raise AssertionError(endpoint)
        found, cache, stats=discover_movies('fake-key',archive(),{},transport,WHEN)
        self.assertEqual(stats['added'],1)
        self.assertEqual(stats['checked'],1)
        self.assertEqual(len(found['videos']),1)
        self.assertEqual(found['videos'][0]['sourceType'],'youtube_search_verified_publisher')
        self.assertEqual(calls[0][1]['q'],'full pakistani movies')
        self.assertEqual(calls[0][1]['videoDuration'],'long')
        self.assertEqual(calls[1][1]['id'],VIDEO)
        again,_,ret=discover_movies('fake-key',found,cache,transport,
                                    WHEN+timedelta(hours=1))
        self.assertEqual(len(calls),2)
        self.assertEqual(ret['added'],0)
        self.assertEqual(len(again['videos']),1)

    def test_classics_query_alternates(self):
        calls=[]
        def transport(endpoint,params):
            calls.append(params)
            return {'items':[]}
        _,state,_=discover_movies('key',archive(),{'cursor':1},transport,WHEN)
        self.assertEqual(calls[0]['q'],'classic Pakistani movies full film')
        self.assertEqual(state['cursor'],2)

    def test_no_api_or_unknown_publisher_returns_no_videos(self):
        original=archive()
        result,_,stats=discover_movies('',original,{})
        self.assertFalse(stats['enabled'])
        self.assertFalse(result['videos'])
        bad={'channels':{},'videos':[]}
        result,_,stats=discover_movies('key',bad,{})
        self.assertFalse(result['videos'])
        self.assertIn('publisher',stats['error'])

    def test_reject_trailer_and_short_movie(self):
        for title,length in [('Full Movie Official Trailer','PT2M'),
                             ('Pakistani Full Movie OST','PT1H20M'),
                             ('Drama Full Episode 7','PT1H15M'),
                             ('Pakistani Full Movie','PT20M')]:
            def transport(endpoint,params):
                if endpoint=='search':return {'items':[{
                   'id':{'videoId':VIDEO},'snippet':{'channelId':CHANNEL}}]}
                return {'items':[resource(title=title,duration=length)]}
            found,_,stats=discover_movies('key',archive(),{},transport,WHEN)
            self.assertEqual(len(found['videos']),0,(title,stats))

if __name__=='__main__':unittest.main()
