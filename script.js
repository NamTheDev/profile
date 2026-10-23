(function () {
  const origFetch = window.fetch;
  window.fetch = async function (...args) {
    const input = args[0];
    const url = input instanceof Request ? input.url : String(input);
    const res = await origFetch.apply(this, args);
    const ct = (res.headers.get("content-type") || "").toLowerCase();
    let pathname = url;
    try { pathname = new URL(url, location.href).pathname; } catch {}
    const wantsJson = /\.json$/i.test(pathname);
    const wantsJs = /\.m?js$/i.test(pathname);
    let expected = null;
    if (wantsJson && !ct.includes("json")) expected = "JSON";
    if (wantsJs && ct.includes("html")) expected = "JavaScript";
    if (expected) {
      const body = await res.clone().text();
      console.error(
        `%c[MIME Mismatch] ${url} → expected ${expected}, got "${ct}" (status ${res.status})`,
        "color:#ff3333;font-weight:bold"
      );
      console.log("Body preview:", body.slice(0, 300));
    }
    return res;
  };
  window.addEventListener("error", (e) => {
    if (e.message && e.message.includes("Unexpected token '<'")) {
      console.error("[Caught] JSON.parse failed with '<' — see MIME Mismatch logs above.");
    }
  });
  console.log("%c[Diagnostic] fetch interceptor installed", "color:#00aaff");
})();

const state = { pages: [], current: null, text: new Map(), observer: null };
const $ = (selector) => document.querySelector(selector);
const els = {
  article: $("#article"), nav: $("#page-nav"), toc: $("#toc"),
  filter: $("#page-filter"), menu: $("#menu-toggle"),
  sidebar: $("#sidebar"), backdrop: $("#sidebar-backdrop"), home: $("#home-link")
};

/* Default slug = whatever the manifest lists first */
function slug() {
  const query = new URLSearchParams(location.search).get("page");
  if (query) return query;
  return state.pages[0]?.slug || "";
}

function slugify(text) {
  return text.toLowerCase().trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-").replace(/-+/g, "-");
}
function closeMenu() {
  els.sidebar.classList.remove("open");
  els.backdrop.hidden = true;
  els.menu.ariaExpanded = "false";
}
function navigate(next) {
  const page = state.pages.find((item) => item.slug === next) || state.pages[0];
  if (!page) return;
  const url = new URL(location.href);
  url.searchParams.set("page", page.slug);
  url.hash = "";
  history.pushState({}, "", url);
  closeMenu();
  loadPage(page.slug);
}
function renderNav(query = "") {
  const needle = query.trim().toLowerCase();
  const pages = state.pages.filter((page) =>
    !needle || (page.title + " " + (page.description || "")).toLowerCase().includes(needle)
  );
  els.nav.replaceChildren();
  if (!pages.length) {
    const empty = document.createElement("p");
    empty.className = "page-nav-empty";
    empty.textContent = "No matching pages.";
    els.nav.append(empty);
    return;
  }
  for (const page of pages) {
    const link = document.createElement("a");
    link.href = "?page=" + encodeURIComponent(page.slug);
    link.className = "page-link" + (page.slug === state.current ? " active" : "");
    link.textContent = page.title;
    if (page.slug === state.current) link.ariaCurrent = "page";
    link.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      navigate(page.slug);
    });
    els.nav.append(link);
  }
}
function headingIds() {
  const used = new Set();
  els.article.querySelectorAll("h2, h3").forEach((heading) => {
    let id = slugify(heading.textContent) || "section";
    const base = id;
    let i = 2;
    while (used.has(id)) id = base + "-" + i++;
    used.add(id);
    heading.id = id;
  });
}
function tocLink(heading) {
  const link = document.createElement("a");
  link.href = "#" + heading.id;
  link.textContent = heading.textContent;
  link.dataset.level = heading.tagName === "H3" ? "3" : "2";
  return link;
}
function renderToc() {
  if (state.observer) state.observer.disconnect();
  els.toc.replaceChildren();
  els.article.querySelector(".mobile-contents")?.remove();
  const headings = [...els.article.querySelectorAll("h2, h3")];
  headings.forEach((heading) => els.toc.append(tocLink(heading)));
  if (!headings.length) return;
  const mobile = document.createElement("details");
  mobile.className = "mobile-contents";
  mobile.innerHTML = "<summary>Contents</summary><nav></nav>";
  const mobileNav = mobile.querySelector("nav");
  headings.forEach((heading) => mobileNav.append(tocLink(heading)));
  els.article.querySelector("h1")?.insertAdjacentElement("afterend", mobile);
  state.observer = new IntersectionObserver((entries) => {
    const current = entries.filter((entry) => entry.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
    if (!current) return;
    document.querySelectorAll(".toc a, .mobile-contents a").forEach((link) => {
      link.classList.toggle("active", link.hash === "#" + current.target.id);
    });
  }, { rootMargin: "-15% 0px -70% 0px" });
  headings.forEach((heading) => state.observer.observe(heading));
}
function resolveMarkdown(path) {
  const clean = path.replace(/^\.\//, "");
  const name = clean.split("/").pop();
  return state.pages.find((page) =>
    page.file === clean || page.file.endsWith("/" + clean) || page.file.endsWith("/" + name)
  );
}
function bindLinks() {
  els.article.querySelectorAll('a[href$=".md"], a[href*=".md#"]').forEach((link) => {
    const raw = link.getAttribute("href");
    const [path, hash = ""] = raw.split("#");
    const page = resolveMarkdown(path);
    if (!page) return;
    link.href = "?page=" + encodeURIComponent(page.slug) + (hash ? "#" + hash : "");
    link.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      navigate(page.slug);
      if (hash) setTimeout(() => document.getElementById(hash)?.scrollIntoView(), 0);
    });
  });
}
async function pageText(page) {
  if (state.text.has(page.file)) return state.text.get(page.file);
  const response = await fetch(page.file);
  if (!response.ok) throw new Error("HTTP " + response.status);
  const ct = (response.headers.get("content-type") || "").toLowerCase();
  if (ct.includes("text/html")) {
    const body = await response.clone().text();
    throw new Error(`Server returned HTML instead of markdown for "${page.file}". Body starts: ${body.slice(0, 80)}`);
  }
  const text = await response.text();
  state.text.set(page.file, text);
  return text;
}
async function loadManifest() {
  const response = await fetch("manifest.json", { cache: "no-cache" });
  if (!response.ok) throw new Error("HTTP " + response.status);
  const ct = (response.headers.get("content-type") || "").toLowerCase();
  if (!ct.includes("json")) {
    const body = await response.clone().text();
    throw new Error(`manifest.json returned "${ct}" instead of JSON. Body starts: ${body.slice(0, 80)}`);
  }
  return response.json();
}
function prefetchPages() {
  const run = () => {
    state.pages.filter((page) => page.slug !== state.current)
      .forEach((page) => pageText(page).catch(() => {}));
  };
  "requestIdleCallback" in window ? requestIdleCallback(run) : setTimeout(run, 250);
}
async function loadPage(next) {
  const page = state.pages.find((item) => item.slug === next) || state.pages[0];
  if (!page) return;
  state.current = page.slug;
  renderNav(els.filter.value);
  els.article.innerHTML = '<p class="loading">Loading…</p>';
  try {
    const markdown = await pageText(page);
    els.article.innerHTML = DOMPurify.sanitize(marked.parse(markdown, { gfm: true }));
    headingIds();
    renderToc();
    bindLinks();
    document.title = page.title + " — Nam";
    const target = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    target ? target.scrollIntoView() : scrollTo(0, 0);
  } catch (error) {
    console.error(error);
    els.article.innerHTML = '<p class="error">Unable to load this page: ' + error.message + "</p>";
    els.toc.replaceChildren();
  }
}
function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js", { updateViaCache: "none" })
      .catch((err) => console.warn("[sw] registration failed:", err));
  }
}
async function init() {
  registerServiceWorker();
  try {
    state.pages = await loadManifest();
    await loadPage(slug());
    prefetchPages();
  } catch (error) {
    console.error(error);
    els.article.innerHTML = '<p class="error">Unable to load page index: ' + error.message + "</p>";
  }
}
function wireEvents() {
  els.menu.addEventListener("click", () => {
    const open = !els.sidebar.classList.contains("open");
    els.sidebar.classList.toggle("open", open);
    els.backdrop.hidden = !open;
    els.menu.ariaExpanded = String(open);
    if (open) requestAnimationFrame(() => els.filter.focus());
  });
  els.backdrop.addEventListener("click", closeMenu);
  els.filter.addEventListener("input", () => renderNav(els.filter.value));
  els.home.addEventListener("click", (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(state.pages[0]?.slug || "");
  });
  addEventListener("popstate", () => loadPage(slug()));
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => { wireEvents(); init(); });
} else {
  wireEvents(); init();
}
