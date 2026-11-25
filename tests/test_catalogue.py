import importlib.util
from pathlib import Path
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location("catalogue", Path(__file__).resolve().parents[1] / "scripts/sync_catalogue.py")
catalogue = importlib.util.module_from_spec(spec)
spec.loader.exec_module(catalogue)

SOURCE = {"id": "UC123", "section": "youtube", "label": "Main"}
PREVIOUS = {"id": "UC123", "videos": [{"id": "old", "title": "Removed", "published": "2020"}]}

def feed(entries=""):
    return (f'<feed xmlns="http://www.w3.org/2005/Atom" xmlns:yt="http://www.youtube.com/xml/schemas/2015"><yt:channelId>UC123</yt:channelId><title>Main</title>{entries}</feed>').encode()

class CatalogueTests(unittest.TestCase):
    def test_rss_replaces_old_uploads(self):
        entry = '<entry><yt:videoId>new</yt:videoId><title>New</title><published>2026</published></entry>'
        with patch.object(catalogue, "KEY", ""), patch.object(catalogue, "request", return_value=feed(entry)):
            self.assertEqual([v["id"] for v in catalogue.channel(SOURCE, PREVIOUS)["videos"]], ["new"])

    def test_valid_empty_feed_clears_uploads(self):
        with patch.object(catalogue, "KEY", ""), patch.object(catalogue, "request", return_value=feed()):
            self.assertEqual(catalogue.channel(SOURCE, PREVIOUS)["videos"], [])

    def test_failed_feed_preserves_previous(self):
        with patch.object(catalogue, "KEY", ""), patch.object(catalogue, "request", return_value=b"<html/>"):
            records, failures = catalogue.refresh([SOURCE], [PREVIOUS], "id", catalogue.channel)
            self.assertEqual(records, [PREVIOUS])
            self.assertEqual(failures, 1)

    def test_api_replaces_old_uploads(self):
        metadata = {"items": [{"snippet": {"title": "Main"}, "statistics": {}, "contentDetails": {"relatedPlaylists": {"uploads": "UU123"}}}]}
        listing = {"items": [{"snippet": {"title": "New", "publishedAt": "2026"}, "contentDetails": {"videoId": "new"}}, {"snippet": {"title": "Deleted video", "publishedAt": "2020"}, "contentDetails": {"videoId": "deleted"}}]}
        with patch.object(catalogue, "KEY", "test"), patch.object(catalogue, "api", side_effect=[metadata, listing]):
            self.assertEqual([v["id"] for v in catalogue.channel(SOURCE, PREVIOUS)["videos"]], ["new"])

if __name__ == "__main__":
    unittest.main()
