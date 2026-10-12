"""Curated Pakistani broadcaster and creator channels for the video archive.

Handles are resolved via YouTube Data API before indexing. Unknown or changed
handles simply produce no videos; no unrelated uploader is silently substituted.
"""
CHANNELS = [
 # Prioritise a varied mix on the first run, then rotate through the rest.
 {'id':'geonews','name':'Geo News','handle':'geonews','category':'news','genre':'News & politics'},
 {'id':'ducky','name':'Ducky Bhai','handle':'duckybhai','category':'vloggers','genre':'Lifestyle & vlogs'},
 {'id':'arynews','name':'ARY News','handle':'ArynewsTvofficial','category':'news','genre':'News & politics'},
 {'id':'rhs','name':'Rana Hamza Saif (RHS)','handle':'ranahamzasaifrhs','category':'vloggers','genre':'Food & travel','channelId':'UCgFG7lz7BI5hsNEifevrWSw'},
 {'id':'dunya','name':'Dunya News','handle':'dunyanews','category':'news','genre':'News & politics'},
 {'id':'villagefood','name':'Village Food Secrets','handle':'villagefoodsecrets','category':'vloggers','genre':'Food & recipes','channelId':'UCQexaAjPn3-1MCE4DmBK3Tg'},
 {'id':'geohasna','name':'Hasna Mana Hai','handle':'GeoHasnaManaHai','category':'comedy','genre':'Comedy & satire'},
 {'id':'streetfoodpk','name':'Street Food PK','handle':'streetfoodpk','category':'vloggers','genre':'Food & travel','channelId':'UCt8NJjYKc2aT3T0TnbcWxSw'},
 {'id':'hum','name':'HUM TV','handle':'HUMTV','category':'dramas','genre':'Dramas','channelId':'UCEeEQxm6qc_qaTE7qTV5aLQ'},
 {'id':'imranriaz','name':'Imran Riaz Khan','handle':'ImranRiazKhan','category':'vloggers','genre':'News & commentary'},
 {'id':'arydigital','name':'ARY Digital','handle':'ARYDigitalasia','category':'dramas','genre':'Dramas','channelId':'UC4JCksJF76g_MdzPVBJoC3Q'},
 {'id':'sabir','name':'Sabir Shakir','handle':'sabirshakirpk','category':'vloggers','genre':'News & commentary'},
 {'id':'harpalgeo','name':'Har Pal Geo','handle':'HarPalGeoOfficial','category':'dramas','genre':'Dramas','channelId':'UCe9JSDmyqNgA_l2BzGHq1Ug'},
 {'id':'greentv','name':'Green Entertainment','handle':'GreenEntertainmentTV','category':'dramas','genre':'Dramas','channelId':'UCF2ltLX1dnPa6-L1paPaMzw'},
 {'id':'ptvhome','name':'PTV Home','handle':'PTVHomeEntertainment','category':'dramas','genre':'Classic & family dramas','channelId':'UCMfwlaPLGMn44BKvHv15yzA'},
 {'id':'expresstv','name':'Express TV','handle':'expressentertainment','category':'dramas','genre':'Dramas'},
 {'id':'ptvnews','name':'PTV News','handle':'PTVNewsOfficial','category':'news','genre':'News & politics'},
 {'id':'foodfusion','name':'Food Fusion','handle':'FoodfusionPk','category':'vloggers','genre':'Food & recipes'},
 {'id':'samaa','name':'SAMAA TV','handle':'SAMAATV','category':'news','genre':'News & politics'},
 {'id':'junaid','name':'Junaid Akram','handle':'JunaidAkram','category':'vloggers','genre':'Lifestyle & vlogs'},
 {'id':'mooroo','name':'Mooroo (Taimoor Salahuddin)','handle':'mooroosicity','category':'vloggers','genre':'Lifestyle & vlogs'},
 {'id':'hasbehaal','name':'Hasb-e-Haal Official','handle':'hasbehaalofficial','category':'comedy','genre':'Comedy & satire'},
 {'id':'pakexperience','name':'The Pakistan Experience','handle':'ThePakistanExperience','category':'vloggers','genre':'Interviews & commentary'},
 {'id':'expressnews','name':'Express News','handle':'expressnewspk','category':'news','genre':'News & politics'},
 {'id':'maaz','name':'Maaz Safder','handle':'MaazSafderWorld','category':'vloggers','genre':'Lifestyle & vlogs'},
 {'id':'matiullah','name':'Matiullah Jan MJtv','handle':'MatiullahJanMJtv','category':'vloggers','genre':'News & commentary'},
 {'id':'p4pakao','name':'P 4 Pakao','handle':'p4pakaoofficial','category':'comedy','genre':'Comedy & satire','channelId':'UCI9tIvSPsdxNEICjZk7ujUA'},
 {'id':'dawnnews','name':'Dawn News','handle':'dawnnewspakistan','category':'news','genre':'News & politics'},
 {'id':'irfanjunejo','name':'Irfan Junejo','handle':'irfanjunejo','category':'vloggers','genre':'Travel & lifestyle'},
 {'id':'asadtoor','name':'Asad Toor','handle':'AsadToorUncensored','category':'vloggers','genre':'News & commentary'},
 {'id':'kunfoods','name':'Kun Foods','handle':'KunFoods','category':'vloggers','genre':'Food & recipes'},
 {'id':'siddique','name':'Siddique Jaan','handle':'SiddiqueJaan1','category':'vloggers','genre':'News & commentary'},
 {'id':'kitchenamna','name':'Kitchen with Amna','handle':'KitchenWithAmna','category':'vloggers','genre':'Food & recipes'},
 {'id':'geoclassics','name':'Geo Classics','handle':'GeoNewsClassics','category':'comedy','genre':'Comedy & satire'},
 {'id':'wildlens','name':'WildLens by Abrar','handle':'WildLensByAbrar','category':'vloggers','genre':'Travel & lifestyle'},
 {'id':'ruby','name':'Ruby Ka Kitchen','handle':'RubyKaKitchen','category':'vloggers','genre':'Food & recipes'},
 {'id':'humcomedy','name':'HUM TV Comedy','handle':'HUMTVComedy','category':'comedy','genre':'Comedy & satire'},
 {'id':'ijazfood','name':'Ijaz Ansari Food Secrets','handle':'IjazAnsariFoodSecrets','category':'vloggers','genre':'Food & recipes'},
 {'id':'maz aqraat','name':'Mazaaq Raat','handle':'MazaaqRaatOfficial','category':'comedy','genre':'Comedy & satire'},
]
# Use a stable identifier; not a claim about a channel's verified badge.
for entry in CHANNELS:
    entry['id'] = entry['id'].replace(' ', '')
BY_ID = {entry['id']: entry for entry in CHANNELS}
