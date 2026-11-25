const CACHE_PREFIX = "self-documentary-";
const CACHE = CACHE_PREFIX + "v10";
const CORE = [
  "./",
  "index.html",
  "style.css",
  "script.js",
  "manifest.json",
  "pages/ABOUT.md",
  "pages/PROJECTS.md"
];

function isCacheable(request, response) {
  if (!response || !response.ok) return false;
  const url = new URL(request.url);
  const ct = (response.headers.get("content-type") || "").toLowerCase();
  const pathname = url.pathname;
  const ext = pathname.split(".").pop()?.toLowerCase() || "";
  switch (ext) {
    case "json": return ct.includes("json");
    case "js":
    case "mjs": return ct.includes("javascript");
    case "css": return ct.includes("css");
    case "html":
    case "htm": return ct.includes("html");
    case "md": return ct.includes("markdown") || ct.includes("text/plain") || ct.includes("octet-stream");
    default:
      if (pathname === "/" || pathname.endsWith("/")) return ct.includes("html");
      return true;
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const results = await Promise.allSettled(CORE.map((url) => cache.add(url)));
    results.forEach((r, i) => {
      if (r.status === "rejected") console.warn("[sw] failed to precache", CORE[i], r.reason);
    });
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request, { cache: "no-cache" });
    if (isCacheable(request, response)) {
      await cache.put(request, response.clone());
    } else if (response.ok) {
      console.warn("[sw] not caching MIME mismatch:", request.url, response.headers.get("content-type"));
    }
    return response;
  } catch {
    return (await cache.match(request)) || Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(new URL(self.registration.scope).pathname)) return;
  event.respondWith(networkFirst(request));
});
