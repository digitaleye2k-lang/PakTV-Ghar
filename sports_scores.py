"""Best-effort Pakistan cricket score snapshot from ESPN's publicly documented feed.

No paywalled data, API tokens or synthetic scores. This feed is unofficial and
may be unavailable, so the website must show a source link and an honest empty state.
"""
from datetime import datetime, timezone, timedelta
from urllib.request import Request, urlopen
import json
import re

SCORE_SOURCE = "https://www.espncricinfo.com/live-cricket-score"
HEADER_URL = "https://site.api.espn.com/apis/personalized/v2/scoreboard/header?sport=cricket&region=in&tz=Asia%2FCalcutta"
SCOREBOARD_API = "https://site.web.api.espn.com/apis/site/v2/sports/cricket/{league}/summary?contentorigin=espn&event={event}&lang=en&region=in"
PAK_TERMS = ("pakistan", "psl", "karachi", "lahore", "islamabad", "peshawar",
             "multan", "quetta", "rawalpindi", "faisalabad", "sindh",
             "balochistan", "punjab", "khyber", "abbottabad")
NOW = datetime.now(timezone.utc)


def stamp(value):
    return value.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


def get_json(url):
    req = Request(url, headers={"User-Agent": "Mozilla/5.0 PakTVGhar/1.0",
                                "Accept": "application/json"})
    with urlopen(req, timeout=12) as response:
        return json.loads(response.read(1800000))


def safe_date(value):
    try:
        date = datetime.fromisoformat(str(value or "").replace("Z", "+00:00"))
        return date if date.tzinfo else None
    except (TypeError, ValueError):
        return None


def is_pak_match(text):
    value = re.sub(r"\s+", " ", str(text)).lower()
    return any(term in value for term in PAK_TERMS)


def score_value(competitor):
    value = competitor.get("score")
    if isinstance(value, dict):
        value = value.get("displayValue") or value.get("value")
    if isinstance(value, (float, int, str)) and str(value).strip():
        # Never convert an absent score into a guessed total.
        return str(value)[:35]
    return ""


def parse_event(event, league):
    if not isinstance(event, dict):
        return None
    title = str(event.get("shortName") or event.get("name") or "").strip()
    date = safe_date(event.get("date"))
    if not title or not date:
        return None
    # Results within 4 days and scheduled matches up to 3 days ahead.
    if date < NOW - timedelta(days=4) or date > NOW + timedelta(days=3):
        return None
    competitions = event.get("competitions") or []
    all_comps = [c for c in competitions if isinstance(c, dict)]
    competitors = next((c.get("competitors") for c in all_comps
                        if isinstance(c.get("competitors"), list)), []) or []
    names = []
    teams = []
    for c in competitors[:2]:
        if not isinstance(c, dict):
            continue
        team = c.get("team") if isinstance(c.get("team"), dict) else {}
        name = str(team.get("shortDisplayName") or team.get("displayName")
                   or c.get("displayName") or "").strip()
        if name:
            names.append(name)
            teams.append({"name": name[:60], "score": score_value(c)})
    if not is_pak_match(" ".join([title, str(league)] + names)):
        return None
    status = event.get("status") if isinstance(event.get("status"), dict) else {}
    typ = status.get("type") if isinstance(status.get("type"), dict) else {}
    detail = str(typ.get("shortDetail") or typ.get("description")
                 or status.get("displayClock") or "Fixture")[:100]
    if any(team["score"] for team in teams) and detail.lower() in ("fixture","scheduled"):
        detail="Score posted — match status unconfirmed"
    return {"name": title[:110], "series": str(league)[:110],
            "startAt": stamp(date), "status": detail, "teams": teams,
            "url": SCORE_SOURCE}


def merge_summary(record, info):
    """Summary can optionally supply scores missing from the navigation header."""
    hdr = info.get("header") or {}
    comp = (hdr.get("competitions") or [])
    if isinstance(hdr.get("competitors"), list):
        comp = [{"competitors": hdr["competitors"]}]
    for event in comp:
        if not isinstance(event, dict):
            continue
        candidates = event.get("competitors") or []
        if not isinstance(candidates, list):
            continue
        found = []
        for t in candidates[:2]:
            if not isinstance(t, dict):
                continue
            team = t.get("team") if isinstance(t.get("team"), dict) else {}
            name = team.get("shortDisplayName") or team.get("displayName") or t.get("displayName") or ""
            if name:
                found.append({"name": str(name)[:60], "score": score_value(t)})
        if found and any(t["score"] for t in found):
            record["teams"] = found
            return record
    return record


def pakistan_cricket_scores():
    response = get_json(HEADER_URL)
    sports = response.get("sports") or []
    leagues = [lg for sp in sports if isinstance(sp, dict)
               for lg in (sp.get("leagues") or []) if isinstance(lg, dict)]
    matches, seen = [], set()
    to_enrich = []
    for league in leagues[:100]:
        name = str(league.get("name") or "Cricket")
        league_id = str(league.get("id") or "")
        for event in (league.get("events") or [])[:25]:
            match = parse_event(event, name)
            if not match:
                continue
            key = (match["name"], match["startAt"])
            if key in seen:
                continue
            seen.add(key)
            matches.append(match)
            event_id = str(event.get("id") or "")
            if league_id.isdigit() and event_id.isdigit() and len(to_enrich) < 5:
                to_enrich.append((match, league_id, event_id))
    # Up to five scorecard fetches so the widget doesn't request hundreds of pages.
    for match, league_id, event_id in to_enrich:
        if any(team["score"] for team in match["teams"]):
            continue
        try:
            data = get_json(SCOREBOARD_API.format(league=league_id, event=event_id))
            merge_summary(match, data)
        except Exception:
            pass
    matches.sort(key=lambda m: (0 if any(w in m["status"].lower()
                           for w in ("live", "in progress", "innings", "stumps"))
                           else 1, m["startAt"]))
    return {"updatedAt": stamp(NOW), "source": "ESPN cricket snapshot",
            "url": SCORE_SOURCE, "matches": matches[:8]}
