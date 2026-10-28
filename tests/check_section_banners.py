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
    "sectionBanner(type)",
    "sectionBanner(cat)",
    "sectionBanner('today')",
    "sectionBanner('archive')",
    "sectionBanner('favourites')",
    "sectionBanner('search')",
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
    "thumb(v.id)",
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
    assert 'src="./site-app.js' in html, page+" must load site app"
    assert 'href="./paktv-green.css"' in html, page+" must load green theme"
assert "35cc81b7-a472-4dad-9fc9-bb36f86c1158.jpg" in app
assert "4595f7b2-1bc7-4e26-9369-d7f1e9d2ae26.jpg" in app
assert "cad2d0ce-b651-4f07-a409-9293e0a39a76.jpg" in app
assert "movie-headline-"+ "'+(active+1)+'.webp" in app
for label in ("GUPSHUP · Chai, chat & community", "Kids Corner · Watch, learn & play",
              "Pakistani Movies · Cinema & classics", "Pakistani Sports · Cricket & beyond",
              "The Waggle Workshop · Professor Pip", "RetroWorld · Play retro games"):
    assert label in app, "Homepage feature missing: "+label
for fragment in ("sectionBanner('news')","sectionBanner('comedy')"):
    assert fragment not in app, "Generic category pages should use sectionBanner(cat)"
gupshup=(root/"gupshup.html").read_text(encoding="utf-8")
kids=(root/"kids.html").read_text(encoding="utf-8")
for page in (gupshup,kids):
    assert 'data-feature-rotator' in page
    assert 'feature-rotator.js' in page and 'feature-rotator.css' in page
feature=(root/"feature-rotator.js").read_text(encoding="utf-8")
assert 'prefers-reduced-motion' in feature and 'visibilitychange' in feature
assert 'aria-pressed' in feature
check=subprocess.run(["node","--check",str(root/"feature-rotator.js")],capture_output=True,text=True)
assert check.returncode==0, check.stderr[:1400]
result=subprocess.run(["node","--check",str(root/"site-app.js")],capture_output=True,text=True)
assert result.returncode==0, result.stderr[:1400]
print("Movies, TV show and sports banner slideshow checks passed.")
