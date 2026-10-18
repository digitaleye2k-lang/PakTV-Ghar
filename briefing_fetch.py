#!/usr/bin/env python3
"""Best-effort public homepage briefing: source-linked RSS, forecast, delayed market indices.
No API credentials are published, and one failing supplier never breaks TV refresh.
"""
from datetime import datetime, timezone, timedelta
from email.utils import parsedate_to_datetime
from html import unescape
from pathlib import Path
from urllib.parse import urlencode, quote
from urllib.request import Request, urlopen
import json
import math
import re
import xml.etree.ElementTree as ET

HERE = Path(__file__).resolve().parent
DEST = HERE / "data" / "briefing.json"
USER_AGENT = "PakTVGhar/1.0 (+https://pakghartv.eu.cc/; homepage briefing)"
CITIES = (
    ("Karachi", 24.8607, 67.0011), ("Lahore", 31.5204, 74.3587),
    ("Islamabad", 33.6844, 73.0479), ("Peshawar", 34.0151, 71.5249),
)
MARKETS = (("KSE-100", "^KSE", "Pakistan"), ("S&P 500", "^GSPC", "US"),
           ("FTSE 100", "^FTSE", "UK"))
NOW = datetime.now(timezone.utc)


def stamp(value):
    return value.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


def request(url, timeout=11):
    with urlopen(Request(url, headers={"User-Agent": USER_AGENT,
                                        "Accept": "application/json,application/rss+xml,application/xml;q=0.8"}),
                 timeout=timeout) as response:
        return response.read(1_700_000)


def old_data():
    try:
        obj = json.loads(DEST.read_text(encoding="utf-8"))
        return obj if isinstance(obj, dict) else {}
    except (ValueError, OSError):
        return {}


def recent_utc(value, age_hours):
    try:
        date = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
        return date.tzinfo is not None and abs((NOW - date).total_seconds()) <= age_hours * 3600
    except (ValueError, TypeError):
        return False


def headlines(kind, language="en"):
    """Publisher headlines in selected language. Never claim machine translation."""
    if language not in ("en", "ur"):
        raise ValueError("Unsupported news language")
    params = ({"hl": "ur", "gl": "PK", "ceid": "PK:ur"} if language == "ur"
              else {"hl": "en-PK", "gl": "PK", "ceid": "PK:en"} if kind == "pakistan"
              else {"hl": "en-US", "gl": "US", "ceid": "US:en"})
    if kind == "pakistan":
        params["q"] = "پاکستان when:1d" if language == "ur" else "Pakistan when:1d"
    elif language == "ur":
        params["q"] = "دنیا عالمی خبریں when:1d"
    url = ("https://news.google.com/rss/search?" if "q" in params
           else "https://news.google.com/rss?") + urlencode(params)
    root = ET.fromstring(request(url))
    items, seen = [], set()
    for entry in root.findall(".//channel/item"):
        title = re.sub(r"\s+", " ", unescape(entry.findtext("title") or "")).strip()
        link = (entry.findtext("link") or "").strip()
        source = (entry.findtext("source") or "").strip()
        pub = entry.findtext("pubDate") or ""
        try:
            created = parsedate_to_datetime(pub).astimezone(timezone.utc)
        except (ValueError, TypeError, IndexError):
            continue
        if not title or not link.startswith("https://news.google.com/"):
            continue
        if not recent_utc(stamp(created), 48):
            continue
        if not source and " - " in title:
            title, source = title.rsplit(" - ", 1)
        title = title[:210]
        normalized = "".join(ch.lower() for ch in title if ch.isalnum())[:85]
        if not normalized or normalized in seen:
            continue
        seen.add(normalized)
        items.append({"title": title, "source": source[:70] or "Google News",
                      "url": link, "published": stamp(created)})
    items.sort(key=lambda item: item["published"], reverse=True)
    return {"updatedAt": stamp(NOW), "source": "Google News RSS", "items": items[:9]}


def forecast_city(city):
    name, latitude, longitude = city
    url = ("https://api.met.no/weatherapi/locationforecast/2.0/compact?" +
           urlencode({"lat": str(latitude), "lon": str(longitude)}))
    obj = json.loads(request(url))
    timeseries = obj["properties"]["timeseries"]
    # This is a forecast, not a real-time thermometer reading.
    item = next((row for row in timeseries if row.get("time", "") >= stamp(NOW)[:19]), timeseries[0])
    details = item["data"]["instant"]["details"]
    summary = ((item["data"].get("next_1_hours") or {}).get("summary") or
               (item["data"].get("next_6_hours") or {}).get("summary") or {})
    temperature = float(details["air_temperature"])
    humidity = float(details["relative_humidity"])
    wind = float(details["wind_speed"])
    if not all(math.isfinite(v) for v in (temperature, humidity, wind)):
        raise ValueError("Non-finite forecast")
    return {"city": name, "temperatureC": round(temperature),
            "humidity": round(humidity), "windMs": round(wind, 1),
            "symbol": str(summary.get("symbol_code", "cloudy"))[:45],
            "forecastTime": item["time"]}


def weather():
    cities = []
    for city in CITIES:
        try:
            cities.append(forecast_city(city))
        except Exception as exc:
            print("Weather source unavailable", city[0], type(exc).__name__)
    if not cities:
        raise ValueError("No weather forecasts")
    return {"updatedAt": stamp(NOW), "source": "MET Norway / Yr (CC BY 4.0)",
            "url": "https://www.met.no/en", "cities": cities}


def market_quote(name, symbol, region):
    url = ("https://query1.finance.yahoo.com/v8/finance/chart/" + quote(symbol, safe="") +
           "?interval=1d&range=5d")
    result = json.loads(request(url))["chart"]["result"][0]
    meta = result["meta"]
    current = float(meta["regularMarketPrice"])
    previous = meta.get("previousClose") or meta.get("regularMarketPreviousClose")
    if not previous:
        closes = (result.get("indicators") or {}).get("quote", [{}])[0].get("close") or []
        valid = [x for x in closes if isinstance(x, (float, int)) and math.isfinite(x)]
        previous = valid[-2] if len(valid) > 1 else None
    previous = float(previous) if previous else None
    if not math.isfinite(current) or current <= 0 or (previous is not None and
                                                     (not math.isfinite(previous) or previous <= 0)):
        raise ValueError("Invalid market quote")
    observed = meta.get("regularMarketTime")
    date = stamp(datetime.fromtimestamp(int(observed), timezone.utc)) if observed else None
    if not date or not recent_utc(date, 168):
        raise ValueError("Quote is too old")
    return {"name": name, "symbol": symbol, "region": region, "value": round(current, 2),
            "changePercent": round((current / previous - 1) * 100, 2) if previous else None,
            "marketTime": date, "source": "Yahoo Finance", "url":
            "https://finance.yahoo.com/quote/" + quote(symbol, safe="") + "/"}


def markets():
    quotes = []
    for values in MARKETS:
        try:
            quotes.append(market_quote(*values))
        except Exception as exc:
            print("Market quote unavailable", values[0], type(exc).__name__)
    if not quotes:
        raise ValueError("No market quotes available")
    return {"updatedAt": stamp(NOW), "source": "Yahoo Finance (delayed)", "quotes": quotes}


def fallback(old, path, max_hours):
    data = old.get(path)
    return data if isinstance(data, dict) and recent_utc(data.get("updatedAt"), max_hours) else {}


def main():
    old = old_data()
    news = {}
    urdu_news = {}
    for language, target, key in (("en", news, "news"), ("ur", urdu_news, "newsUrdu")):
        for kind in ("pakistan", "world"):
            try:
                target[kind] = headlines(kind, language)
                print("News", language, kind, len(target[kind]["items"]), "articles")
                if not target[kind]["items"]:
                    target[kind] = fallback((old.get(key) or {}), kind, 36)
            except Exception as exc:
                print("News source unavailable", language, kind, type(exc).__name__)
                target[kind] = fallback((old.get(key) or {}), kind, 36)
    output = {"generatedAt": stamp(NOW), "news": news, "newsUrdu": urdu_news}
    from sports_scores import pakistan_cricket_scores
    for key, getter, age in (("weather", weather, 12), ("markets", markets, 168),
                              ("sports", pakistan_cricket_scores, 8)):
        try:
            output[key] = getter()
            print(key, "items", len(output[key].get("cities", output[key].get("quotes", output[key].get("matches", [])))))
        except Exception as exc:
            print(key, "unavailable", type(exc).__name__)
            output[key] = fallback(old, key, age)
    DEST.parent.mkdir(exist_ok=True)
    DEST.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("Homepage briefing updated with available source data")


if __name__ == "__main__":
    main()
