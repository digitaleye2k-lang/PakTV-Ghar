"""No-network regression checks for the dedicated music feed."""
import unittest
from music_catalog import build_music_catalog, MUSIC_PUBLISHERS

class MusicCatalogueTests(unittest.TestCase):
    def song(self, video_id, **kwargs):
        s={'id':video_id,'title':'Pakistani song official video',
           'channelId':'emipakistan','category':'music',
           'date':'2022-06-01','published':'2022-06-01T10:00:00Z',
           'durationSeconds':230,'embeddable':True}
        s.update(kwargs)
        return s
    def test_rejects_untrusted_and_clips(self):
        rows=[self.song('5Eqb_-j3FDA'),
              self.song('a18py61_F_w',channelId='untrusted'),
              self.song('kw4tT7SCmaY',title='Promo teaser'),
              self.song('jIQ0Dx-4peE',embeddable=False),
              self.song('wnuDBs6UsM8',durationSeconds=40),
              self.song('FkLFz2RzRhQ',category='news')]
        result=build_music_catalog({'videos':rows})
        self.assertEqual(result['count'],1)
        self.assertEqual(result['videos'][0]['id'],'5Eqb_-j3FDA')
    def test_starters_and_archive_merge(self):
        old=self.song('5Eqb_-j3FDA',title='Old metadata')
        current=self.song('5Eqb_-j3FDA',title='Updated publisher title')
        result=build_music_catalog({'videos':[current]},
            {'videos':[old]},{'videos':[old,self.song('FkLFz2RzRhQ')]})
        self.assertEqual(result['count'],2)
        self.assertEqual(next(v['title'] for v in result['videos'] if v['id']=='5Eqb_-j3FDA'),'Updated publisher title')
        self.assertEqual(result['publishers']['emipakistan'],2)
    def test_source_whitelist(self):
        self.assertIn('cokestudio',MUSIC_PUBLISHERS)
        self.assertNotIn('geonews',MUSIC_PUBLISHERS)

if __name__=='__main__': unittest.main()
