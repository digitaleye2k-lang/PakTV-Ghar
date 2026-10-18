"""Ratings and theme regression for PakTV Ghar."""
from pathlib import Path
import subprocess

root = Path(__file__).resolve().parent.parent
app = (root / "site-app.js").read_text(encoding="utf-8")
script = (root / "ratings.js").read_text(encoding="utf-8")
styles = (root / "ratings.css").read_text(encoding="utf-8")
green = (root / "paktv-green.css").read_text(encoding="utf-8")
migration = (root / "community/migrations/20261018_content_ratings.sql").read_text(encoding="utf-8")

for filename in ("site-app.js", "ratings.js"):
    checked = subprocess.run(["node","--check",str(root / filename)],
                             capture_output=True, text=True)
    assert checked.returncode == 0, filename + ": " + checked.stderr[:1400]

for text in ("rateAnchor('show',s.id)", "rateAnchor('show',show.id)",
             "rateAnchor('movie',FEATURED_MOVIE.id)",
             "v.category==='movies'?rateAnchor('movie',v.id)"):
    assert text in app, "Rating UI missing: " + text
for text in ("pgh_rating_summary","pgh_rate_content","signInAnonymously",
             "illustrative, 0 votes", "1","5","aria-pressed",
             "textContent", "pgh-rating"):
    assert text in script, "Missing ratings feature " + text
assert "innerHTML" not in script, "Never insert untrusted ratings as HTML"
assert "service_role" not in script.lower()
for text in ("security definer set search_path", "auth.uid()",
             "unique(kind,item,user_id)", "enable row level security",
             "revoke all on public.pgh_content_ratings",
             "grant execute on function public.pgh_rate_content(text,text,integer) to authenticated"):
    assert text in migration.lower() if text=="security definer set search_path" else text in migration, text
assert "insert into public.pgh_content_ratings" in migration
assert "insert into public.pgh_content_ratings(kind,item,user_id,stars)" in migration
assert "0 votes" in script, "Starter preview must not be confused with actual votes"
for part in ("library-tools .chips","library-tools .chip.active",
             "linear-gradient(135deg,#204c3c", "archive-toolbar"):
    assert part in green, "Legacy black panels not fully re-themed: " + part
assert ".pgh-rating-stars" in styles and ".pgh-featured-rating" in styles
for page in ("index.html","today.html","dramas.html","comedy.html","movies.html",
             "sports.html","news.html","talk.html","vloggers.html",
             "archive.html","favourites.html","search.html","show.html"):
    html = (root / page).read_text(encoding="utf-8")
    assert 'href="./ratings.css"' in html, "Ratings CSS missing from " + page
    assert 'src="./ratings.js"' in html, "Ratings JS missing from " + page

print("Ratings, clearly labelled demo scores and green theme tests passed.")
