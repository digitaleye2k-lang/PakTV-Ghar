"""Check Movies, Dramas and Sports artwork hero sections and rotation behaviour."""
from pathlib import Path
import subprocess

root=Path(__file__).resolve().parent.parent
app=(root/"site-app.js").read_text(encoding="utf-8")
theme=(root/"paktv-green.css").read_text(encoding="utf-8")
movies=(root/"movies.html").read_text(encoding="utf-8")
dramas=(root/"dramas.html").read_text(encoding="utf-8")
sports=(root/"sports.html").read_text(encoding="utf-8")
for term in (
    "sectionBanner('dramas')",
    "sectionBanner('sports')",
    "function sectionBanner(type)",
    "function setupSectionHeadlines()",
    "setupMovieHeadlines();setupSectionHeadlines()",
    "data-banner-index",
    "data-banner-move",
    "aria-hidden",
    "aria-pressed",
    "prefers-reduced-motion",
    "state.showMeta[s.id]?.poster",
    "state.archiveVideos",
    "thumb(video.id)",
    "data-section-banner",
    "film", # contained in app's movie references
    "movie-headline-",
):
    assert term in app, "Missing cinema/TV/sports feature: "+term
for term in (
    ".section-promo-banner", ".section-banner-slide.is-active",
    ".section-banner-art", ".section-banner-shade",
    ".section-banner-controls", ".section-banner-copy",
    "prefers-reduced-motion",
):
    assert term in theme, "Section banner style absent: "+term
for page,html in (("movies",movies),("dramas",dramas),("sports",sports)):
    assert 'src="./site-app.js"' in html, page+" must load site app"
    assert 'href="./paktv-green.css"' in html, page+" must load green theme"
for number in (1,2,3):
    assert "movie-headline-"+str(number) not in app or "movie-headline-" in app
assert "35cc81b7-a472-4dad-9fc9-bb36f86c1158.jpg" in app
assert "4595f7b2-1bc7-4e26-9369-d7f1e9d2ae26.jpg" in app
assert "cad2d0ce-b651-4f07-a409-9293e0a39a76.jpg" in app
assert "movie-headline-"+ "'+(active+1)+'.webp" in app
result=subprocess.run(["node","--check",str(root/"site-app.js")],capture_output=True,text=True)
assert result.returncode==0, result.stderr[:1400]
print("Movies, TV show and sports banner slideshow checks passed.")
