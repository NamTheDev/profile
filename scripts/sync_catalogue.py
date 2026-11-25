"""Refresh public repository metadata and YouTube uploads."""
import json
import os
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCES = json.loads((ROOT / "data/sources.json").read_text())
TARGET = ROOT / "data/catalogue.json"
KEY = os.environ.get("YOUTUBE_API_KEY", "")
TOKEN = os.environ.get("GITHUB_TOKEN", "")
ATOM = "{http://www.w3.org/2005/Atom}"
YT = "{http://www.youtube.com/xml/schemas/2015}"

def request(url, headers=None):
    req = urllib.request.Request(url, headers={"User-Agent": "NamTheDev-profile-catalogue", **(headers or {})})
    with urllib.request.urlopen(req, timeout=25) as response:
        return response.read()

def api(endpoint, **params):
    return json.loads(request("https://www.googleapis.com/youtube/v3/" + endpoint + "?" + urllib.parse.urlencode({**params, "key": KEY})))

def integer(value):
    return int(value) if value is not None else None

def channel(source, previous):
    result = {**previous, **source}
    # A successful refresh replaces the snapshot; do not retain removed uploads.
    videos = {}
    if KEY:
        item = api("channels", part="snippet,statistics,contentDetails", id=source["id"])["items"][0]
        snippet, stats = item["snippet"], item["statistics"]
        result.update(title=snippet["title"], description=snippet.get("description", ""), avatar=snippet.get("thumbnails", {}).get("default", {}).get("url"), subscribers=None if stats.get("hiddenSubscriberCount") else integer(stats.get("subscriberCount")), videoCount=integer(stats.get("videoCount")), views=integer(stats.get("viewCount")))
        playlist = item["contentDetails"]["relatedPlaylists"]["uploads"]
        token = None
        while True:
            params = dict(part="snippet,contentDetails", playlistId=playlist, maxResults=50)
            if token:
                params["pageToken"] = token
            page = api("playlistItems", **params)
            for item in page.get("items", []):
                snippet = item["snippet"]
                vid = item["contentDetails"]["videoId"]
                if snippet["title"] not in ("Private video", "Deleted video"):
                    videos[vid] = dict(id=vid, title=snippet["title"], published=item["contentDetails"].get("videoPublishedAt", snippet["publishedAt"]))
                else:
                    videos.pop(vid, None)
            token = page.get("nextPageToken")
            if not token:
                break
    else:
        feed = ET.fromstring(request("https://www.youtube.com/feeds/videos.xml?" + urllib.parse.urlencode({"channel_id": source["id"]})))
        if feed.tag != ATOM+"feed":
            raise ValueError("Unexpected YouTube feed root")
        # YouTube may omit the UC prefix from the feed-level ID.
        # The Atom ID, self URL and individual entries can also identify it.
        expected = source["id"]
        def matches(value):
            return value in (expected, expected.removeprefix("UC"))
        candidates = [feed.findtext(YT+"channelId")]
        atom_id = feed.findtext(ATOM+"id") or ""
        if atom_id.startswith("yt:channel:"):
            candidates.append(atom_id.removeprefix("yt:channel:"))
        for link in feed.findall(ATOM+"link"):
            if link.get("rel") == "self":
                query = urllib.parse.parse_qs(urllib.parse.urlsplit(link.get("href", "")).query)
                candidates.extend(query.get("channel_id", []))
        candidates.extend(entry.findtext(YT+"channelId") for entry in feed.findall(ATOM+"entry"))
        if not any(matches(value) for value in candidates):
            raise ValueError("YouTube feed channel identity could not be verified")
        result["title"] = feed.findtext(ATOM+"title") or source["label"]
        for entry in feed.findall(ATOM+"entry"):
            vid = entry.findtext(YT+"videoId")
            title = entry.findtext(ATOM+"title")
            if vid and title:
                videos[vid] = dict(id=vid, title=title, published=entry.findtext(ATOM+"published") or "")
    result["videos"] = sorted(videos.values(), key=lambda x: x["published"], reverse=True)
    return result

def repository(name):
    headers = {"Accept":"application/vnd.github+json"}
    if TOKEN:
        headers["Authorization"] = "Bearer " + TOKEN
    item = json.loads(request("https://api.github.com/repos/NamTheDev/" + name, headers))
    if item.get("private"):
        raise ValueError("Not a public repository")
    return dict(name=item["name"], language=item.get("language"), stars=item["stargazers_count"], forks=item["forks_count"], issues=item["open_issues_count"], license=(item.get("license") or {}).get("spdx_id"), archived=item["archived"], updated=(item.get("pushed_at") or "")[:10])

def refresh(sources, previous, key, fn):
    old = {item[key]: item for item in previous}
    results = []
    failures = 0
    for source in sources:
        ident = source[key] if isinstance(source, dict) else source
        try:
            results.append(fn(source, old.get(ident, {})))
        except Exception as exc:
            failures += 1
            # Exception strings may contain API credentials in URLs.
            print(f"Could not refresh {ident}: {type(exc).__name__}", file=sys.stderr)
            if ident in old:
                results.append(old[ident])
            elif isinstance(source, dict):
                results.append({**source, "videos":[]})
    return results, failures

def main():
    data = json.loads(TARGET.read_text())
    target = os.environ.get("CATALOGUE_CHANNEL", "all")
    if target == "all":
        data["repositories"], repo_fail = refresh(SOURCES["repositories"], data.get("repositories", []), "name", lambda source, old: repository(source))
        data["channels"], channel_fail = refresh(SOURCES["channels"], data.get("channels", []), "id", channel)
    else:
        selected = [source for source in SOURCES["channels"] if source["section"] == target]
        if not selected:
            raise ValueError("Unknown catalogue channel")
        previous = data.get("channels", [])
        refreshed, channel_fail = refresh(selected, previous, "id", channel)
        updates = {item["id"]: item for item in refreshed}
        existing = {item["id"]: item for item in previous}
        existing.update(updates)
        data["channels"] = [existing[source["id"]] for source in SOURCES["channels"] if source["id"] in existing]
        repo_fail = 0
    TARGET.write_text(json.dumps(data, ensure_ascii=False, indent=2)+"\n")
    print(f"Repository failures: {repo_fail}; channel failures: {channel_fail}; videos captured: {sum(len(c['videos']) for c in data['channels'])}")
    return repo_fail + channel_fail

if __name__ == "__main__":
    sys.exit(1 if main() else 0)
