"""No-network regression tests for the rolling video archive."""
import unittest
from datetime import datetime, timezone, timedelta
from youtube_archive import update_archive, normalise_video, video_category
from channel_sources import CHANNELS

NOW=datetime(2026,10,12,12,0,tzinfo=timezone.utc)
CHANNEL='UC_vt34wimdCzdkrzVejwX9g'
VID='2FKJLBp20OI'

def video(title='Straight Talk | Elections', id=VID, channel=CHANNEL, duration='PT10M'):
    return {'id':id,'snippet':{
        'channelId':channel,'title':title,'publishedAt':'2026-10-11T10:20:00Z',
        'thumbnails':{'high':{'url':'https://i.ytimg.com/vi/'+id+'/hqdefault.jpg'}}},
        'status':{'privacyStatus':'public','embeddable':True},
        'contentDetails':{'duration':duration,'regionRestriction':{'blocked':['GB']}}}

class ArchiveTests(unittest.TestCase):
    def test_categories_are_based_on_programme_titles(self):
        news={'id':'geonews','name':'Geo News','category':'news','genre':'News & politics'}
        self.assertEqual(video_category(news,'Straight Talk | Current affairs'), 'talk')
        self.assertEqual(video_category(news,'Khabarnaak | classic comedy'), 'comedy')
        self.assertEqual(video_category(news,'9PM Headlines'), 'news')

    def test_verifies_publisher_and_filters_short_clips(self):
        source={'id':'geonews','name':'Geo News','category':'news','genre':'News & politics',
                'youtubeId':CHANNEL}
        v=normalise_video(video(),source)
        self.assertEqual(v['date'],'2026-10-11')
        self.assertEqual(v['category'],'talk')
        self.assertFalse(v['availableGB'])
        self.assertTrue(v['availablePK'])
        self.assertIsNone(normalise_video(video(channel='UC'+'a'*22),source))
        self.assertIsNone(normalise_video(video(duration='PT50S'),source))

    def test_archive_keeps_yesterday_across_refreshes(self):
        calls=[]
        def transport(endpoint,p):
            calls.append(endpoint)
            if endpoint=='channels':
                return {'items':[{'id':CHANNEL,'contentDetails':{
                    'relatedPlaylists':{'uploads':'UU'+CHANNEL[2:]}}}]}
            if endpoint=='playlistItems':
                return {'items':[{'contentDetails':{'videoId':VID}}]}
            if endpoint=='videos':
                return {'items':[video()]}
            raise AssertionError(endpoint)
        archive,st=update_archive('dummy-test-key',{'cursor':next(i for i,c in enumerate(CHANNELS) if c['id']=='geonews')},NOW,transport,max_channels=1)
        self.assertEqual(st['checked'],1)
        self.assertEqual(len(archive['videos']),1)
        self.assertEqual(archive['videos'][0]['date'],'2026-10-11')
        self.assertEqual(archive['videos'][0]['channel'],'Geo News')
        self.assertEqual(calls,['channels','playlistItems','videos'])
        later,st2=update_archive('dummy-test-key',archive,NOW+timedelta(days=2),
                                 transport,max_channels=0)
        self.assertEqual(st2['checked'],0)
        self.assertEqual(len(later['videos']),1)
        self.assertEqual(later['videos'][0]['id'],VID)

    def test_archived_data_survives_no_key(self):
        past={'videos':[{'id':VID,'date':'2026-10-11','title':'Old news'}]}
        d,s=update_archive('',past,NOW)
        self.assertFalse(s['enabled'])
        self.assertEqual(len(d['videos']),1)

if __name__=='__main__':
    unittest.main()
