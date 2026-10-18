"""Curated Pakistani broadcaster and creator channels for the video archive.

Handles are resolved via YouTube Data API before indexing. Unknown or changed
handles simply produce no videos; no unrelated uploader is silently substituted.
"""
CHANNELS = [
 # Co-branded family learning channel; handle verified by YouTube API on refresh.
 {'id':'waggleworkshop','name':'The Waggle Workshop','handle':'TheWaggleWorkshop','category':'waggle','genre':'Kids learning videos'},
 # Parent-curated Pakistani children's channels; YouTube API verifies handles and publisher IDs.
 {'id':'kidsland','name':'Kids Land','handle':'kidslandofficial','category':'kids','genre':'Cartoons & stories'},
 {'id':'kidsmadani','name':'Kids Madani Channel','handle':'kidsmadanichannel','category':'kids','genre':'Learning & values'},
 {'id':'salamkids','name':'Salam Kids TV','handle':'salamkidstvofficial','category':'kids','genre':'Rhymes & poems','channelId':'UC_4moTH4Pmatx5ogzCLxUtA'},
 {'id':'urdukidsstudio','name':'Urdu Kids Studio','handle':'urdukidsstudio','category':'kids','genre':'Rhymes & poems','channelId':'UCxqHh4UJsNqiwk_aaMI9HBg'},
 {'id':'shirazi','name':'Shirazi Village Vlogs','handle':'shirazi786','category':'kids','genre':'Family vlogs'},
 {'id':'haimparishay','name':'Haim & Parishay Khan','handle':'HaimParishayKhan','category':'kids','genre':'Kids creators'},
 # Prioritise a varied mix on the first run, then rotate through the rest.
 # Sports TV, official leagues and cricket analysts. Resolved against YouTube channel IDs before inclusion.
 {'id':'pcb','name':'Pakistan Cricket Board','handle':'PakistanCricket','category':'sports','genre':'Cricket board & highlights'},
 {'id':'psl','name':'Pakistan Super League','handle':'pakistansuperleagueofficial','category':'sports','genre':'Cricket league & highlights'},
 {'id':'asports','name':'A Sports','handle':'asportspk','category':'sports','genre':'Sports TV & news'},
 {'id':'ptvsports','name':'PTV SPORTS OFFICIAL','handle':'ptvsportsofficialpk','category':'sports','genre':'Sports TV & news'},
 {'id':'cricketpk','name':'Cricket Pakistan','handle':'CricketPakistanPK','category':'sports','genre':'Sports analysis & creators','channelId':'UCI7I29IPUtWE68VLUoZfXow'},
 {'id':'wasay','name':'Wasay Habib','handle':'wasayhabib','category':'sports','genre':'Sports analysis & creators'},
 # Film distributors and public film publishers; only their labelled full films are included.
 {'id':'lollywoodcinema','name':'LollywoodCinema','handle':'LollywoodCinema','category':'movies','genre':'Classic Pakistani Movies','channelId':'UCMlGWm_woMhMcVYhJu8zsvA'},
 {'id':'movieboxmovies','name':'MovieboxMovies','handle':'movieboxmovies','category':'movies','genre':'Classic Pakistani Movies'},
 {'id':'aryfilms','name':'ARY Films','handle':'ARYFilms','category':'movies','genre':'Pakistani films & TV movies','channelId':'UC2PYniNHljOED9xNaMpiMiQ'},
 {'id':'drmmovies','name':'Pakistani Movies by DRM','handle':'pakistani_movies','category':'movies','genre':'Pakistani films & TV movies'},
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
 {'id':'expressent','name':'Express TV','handle':'expressentertainment','category':'dramas','genre':'Dramas'},
 {'id':'ptvnews','name':'PTV News','handle':'PTVNewsOfficial','category':'news','genre':'News & politics'},
 {'id':'aajnews','name':'Aaj TV Official','handle':'aajtvofficial','category':'news','genre':'News & politics'},
 {'id':'aajent','name':'Aaj Entertainment','handle':'aajentertainment','category':'dramas','genre':'Dramas'},
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
