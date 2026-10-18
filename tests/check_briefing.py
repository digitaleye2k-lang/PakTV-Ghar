"""Regression checks for homepage briefing and the standalone GUPSHUP chat."""
from pathlib import Path
import importlib.util
import json
import subprocess
from datetime import datetime, timezone
from unittest.mock import patch

root = Path(__file__).resolve().parent.parent
page = (root / "index.html").read_text(encoding="utf-8")
client = (root / "home-briefing.js").read_text(encoding="utf-8")
stylesheet = (root / "home-briefing.css").read_text(encoding="utf-8")
workflow = (root / ".github/workflows/publish.yml").read_text(encoding="utf-8")
gupshup = (root / "gupshup.html").read_text(encoding="utf-8")
gupshup_js = (root / "gupshup.js").read_text(encoding="utf-8")
gupshup_css = (root / "gupshup.css").read_text(encoding="utf-8")
for expected in ('id="homeBriefing"', 'href="./home-briefing.css"',
                 'src="./home-briefing.js"', "new Event('paktv:paint')",
                 "href:'./gupshup.html'", 'GUPSHUP'):
    assert expected in page, "Missing front-page briefing/GUPSHUP integration: " + expected
assert 'id="pghMiniDrawer"' not in page, "Old floating mini chat still appears on homepage"
for expected in ("briefTabPakistan", "briefTabWorld", "briefWeather",
                 "briefMarkets", "textContent", "noopener noreferrer"):
    assert expected in client, "Briefing behaviour missing: " + expected
for expected in ('id="gupshupMessages"', 'id="gupshupForm"',
                 'id="reportForm"', 'src="./gupshup.js"', 'src="./gupshup.css"',
                 'Friends_talking_over_tea', 'aria-label="Choose discussion room"'):
    assert expected in gupshup, "Dedicated GUPSHUP page missing: " + expected
for expected in ("pgh_public_messages", "pgh_post_message",
                 "pgh_report_message", "signInAnonymously", "textContent",
                 "messageElement", "noopener"):
    # Secure user-generated content must use DOM textContent, never HTML string interpolation.
    assert expected in gupshup_js or (expected == "noopener" and 'noopener noreferrer' in gupshup), "GUPSHUP behaviour missing: " + expected
assert "innerHTML" not in gupshup_js
assert "service_role" not in gupshup_js.lower()
assert ".report-overlay[hidden]" in gupshup_css
assert "document.write(" not in client
assert "python3 briefing_fetch.py" in workflow
assert "data/*.json" in workflow
for filename in ("home-briefing.js", "gupshup.js"):
    result = subprocess.run(["node", "--check", str(root / filename)],
                            capture_output=True, text=True)
    assert result.returncode == 0, filename + " JavaScript syntax: " + result.stderr[:2000]

spec = importlib.util.spec_from_file_location("briefing_fetch", root / "briefing_fetch.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
now = datetime.now(timezone.utc)
news_xml = """<rss><channel><item><title>Pakistan story - Sample publisher</title>
<link>https://news.google.com/rss/articles/test</link><source>Sample publisher</source>
<pubDate>%s</pubDate></item></channel></rss>""" % now.strftime("%a, %d %b %Y %H:%M:%S GMT")
with patch.object(module, "request", return_value=news_xml.encode()):
    news = module.headlines("pakistan")
    assert len(news["items"]) == 1
    assert news["items"][0]["source"] == "Sample publisher"
    assert news["items"][0]["url"].startswith("https://news.google.com/")
sample_weather = {
  "properties": {"timeseries": [{
    "time": now.strftime("%Y-%m-%dT%H:%M:%SZ"),
    "data": {"instant": {"details": {
      "air_temperature": 28.2, "relative_humidity": 64, "wind_speed": 2.7
    }}, "next_1_hours": {"summary": {"symbol_code": "partlycloudy_day"}}}
  }]}}
with patch.object(module, "request", return_value=json.dumps(sample_weather).encode()):
    weather = module.forecast_city(("Karachi", 24.8607, 67.0011))
    assert weather["temperatureC"] == 28
    assert weather["city"] == "Karachi"
sample_market = {"chart": {"result": [{"meta": {"regularMarketPrice": 101,
                       "previousClose": 100, "regularMarketTime": int(now.timestamp())}}]}}
with patch.object(module, "request", return_value=json.dumps(sample_market).encode()):
    quote = module.market_quote("Test index", "^GSPC", "US")
    assert quote["changePercent"] == 1.0
    assert quote["value"] == 101.0
assert not module.recent_utc("2020-01-01T00:00:00Z", 48), "Stale briefing should be hidden"
print("Homepage briefing: source parsing, freshness, mini chat integration and scripts OK.")
