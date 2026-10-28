"""Verify the DJ Music feature and no-search movie discovery UI."""
from pathlib import Path
import subprocess

root=Path(__file__).resolve().parent.parent
music=(root/"music.html").read_text(encoding="utf-8")
dj=(root/"music.js").read_text(encoding="utf-8")
style=(root/"music.css").read_text(encoding="utf-8")
app=(root/"site-app.js").read_text(encoding="utf-8")
refresh=(root/"refresh.py").read_text(encoding="utf-8")
archive=(root/"youtube_archive.py").read_text(encoding="utf-8")
sources=(root/"channel_sources.py").read_text(encoding="utf-8")
films=(root/"movie_discovery.py").read_text(encoding="utf-8")
for js in ("music.js","site-app.js"):
    proc=subprocess.run(["node","--check",str(root/js)],capture_output=True,text=True)
    assert proc.returncode==0, proc.stderr[:1400]
for filename in ("movie_discovery.py","refresh.py","youtube_archive.py","channel_sources.py"):
    proc=subprocess.run(["python3","-m","py_compile",str(root/filename)],
                        capture_output=True,text=True)
    assert proc.returncode==0, proc.stderr[:1400]
assert "music.html" in app and "Pakistani Music · DJ Lounge" in app
assert "classic Pakistani movies" not in app.lower() or "Classic Pakistani Movies" in app
assert "youtube.com/results?search_query=classic" not in app
assert "Search “classic Pakistani movies”" not in app
assert "search tag: classic" not in app.lower()
assert "function movieVideos()" in app
assert "movie-discovery-state.json" in refresh
assert "from movie_discovery import discover_movies" in refresh
assert "full pakistani movies" in films.lower()
assert "youtube_json(\"search\"" in films
assert "trusted" in films and "normalise_video" in films
assert "youtube_search_verified_publisher" in films
assert "music" in archive and "seconds < 120" in archive
for channel in ("cokestudio","emipakistan","talhaanjum","jaubi"):
    assert "'id':'"+channel+"'" in sources
    assert "'"+channel+"':" in refresh
for control in ('id="genreFilters"','id="playlistCards"','id="musicGrid"',
                'id="musicPlayer"','id="queueList"','id="playerNext"',
                'id="playerShuffle"','id="musicSearch"'):
    assert control in music, "Missing DJ control "+control
for genre in ('classic','ghazal','qawwali','folk','sufi','pop','rock','rap','jazz','indie'):
    assert 'id:"'+genre+'"' in dj, "Missing genre: "+genre
for playlist in ("Golden Hour","Qawwali After Dark","The Desi Drive",
                 "Karachi Mic Check","Jazz on the Rooftop","DJ's Folk & Fusion"):
    assert playlist in dj
assert "youtube-nocookie.com/embed/" in dj
assert "fetch(" in dj and "data/archive.json" in dj
assert "data/music-catalog.json" in dj and "from music_catalog import build_music_catalog" in refresh
assert "createElement(\"iframe\")" in dj
assert "music-hero" in style and ".music-grid" in style
for page in ("kids.html","gupshup.html","waggle-workshop.html"):
    assert "music.html" in (root/page).read_text(encoding="utf-8")
print("Music page, DJ playlists, verified movie discovery and safe player checks passed.")
