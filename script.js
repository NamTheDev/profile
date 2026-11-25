const state = { pages: [], current: null, text: new Map(), observer: null, loadVersion: 0 };
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
function navigate(next, hash = "") {
  const page = state.pages.find((item) => item.slug === next) || state.pages[0];
  if (!page) return;
  const url = new URL(location.href);
  url.searchParams.set("page", page.slug);
  url.hash = hash ? "#" + hash : "";
  history.pushState({}, "", url);
  closeMenu();
  void loadPage(page.slug);
}
function renderNav(query = "") {
  const needle = query.trim().toLowerCase();
  const pages = state.pages.filter((page) =>
    !needle || (page.title + " " + (page.description || "")).toLowerCase().includes(needle)
  );
  els.nav.replaceChildren();
  if (!pages.length) {
    const empty = document.createElement("p");
    empty.className = "page-nav-empty fg-3 fs-xs my-2 mx-3";
    empty.textContent = "No matching pages.";
    els.nav.append(empty);
    return;
  }
  for (const page of pages) {
    const link = document.createElement("a");
    link.href = "?page=" + encodeURIComponent(page.slug);
    link.className = "page-link d-block" + (page.slug === state.current ? " active" : "");
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
  els.article.querySelectorAll("h2, h3, h4, h5, h6").forEach((heading) => {
    let id = slugify(heading.textContent) || "section";
    const base = id;
    let i = 2;
    while (used.has(id)) id = base + "-" + i++;
    used.add(id);
    heading.id = id;
  });
}
/* Build a hierarchy from heading levels, including skipped levels. */
function tocTree(headings) {
  const root = { level: 1, children: [] };
  const stack = [root];
  for (const heading of headings) {
    const level = Number(heading.tagName.slice(1));
    while (stack.length > 1 && stack.at(-1).level >= level) stack.pop();
    const node = { heading, level, children: [] };
    stack.at(-1).children.push(node);
    stack.push(node);
  }
  return root.children;
}
function setActiveToc(id) {
  document.querySelectorAll(".toc a, .mobile-contents a").forEach((link) => {
    const active = link.getAttribute("href") === "#" + id;
    link.classList.toggle("bg-2", active);
    if (active) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
}
function tocList(nodes, prefix, nested = false) {
  const list = document.createElement("ul");
  list.className = "list-unstyled m-0 fs-sm" +
    (nested ? " ms-3 ps-3 border-start" : " p-0");
  for (const node of nodes) {
    const item = document.createElement("li");
    item.className = "m-0";
    const link = document.createElement("a");
    link.href = "#" + node.heading.id;
    link.textContent = node.heading.textContent;
    link.className = "py-2 px-2 rounded-3 text-decoration-none text-break " +
      (node.level === 2 ? "fg-success fw-semibold" : "fg-2");
    link.addEventListener("click", () => setActiveToc(node.heading.id));
    if (node.children.length) {
      const branch = document.createElement("details");
      branch.open = true;
      const summary = document.createElement("summary");
      summary.className = "py-2 " + (node.level === 2 ? "fg-success fw-semibold" : "fg-2");
      const children = tocList(node.children, prefix, true);
      children.id = prefix + "-" + node.heading.id;
      summary.append(link);
      branch.append(summary, children);
      item.append(branch);
    } else {
      link.classList.add("d-block");
      item.append(link);
    }
    list.append(item);
  }
  return list;
}
function renderToc() {
  if (state.observer) state.observer.disconnect();
  els.toc.replaceChildren();
  els.article.querySelector(".mobile-contents")?.remove();
  const headings = [...els.article.querySelectorAll("h2, h3, h4, h5, h6")];
  if (!headings.length) return;
  const tree = tocTree(headings);
  els.toc.append(tocList(tree, "desktop-toc"));
  const mobile = document.createElement("details");
  mobile.className = "mobile-contents";
  mobile.innerHTML = '<summary class="fs-sm fw-semibold py-3">Contents</summary><nav class="mt-2" aria-label="On this page"></nav>';
  mobile.querySelector("nav").append(tocList(tree, "mobile-toc"));
  els.article.querySelector("h1")?.insertAdjacentElement("afterend", mobile);
  state.observer = new IntersectionObserver((entries) => {
    const current = entries.filter((entry) => entry.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
    if (current) setActiveToc(current.target.id);
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
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(path)) return;
    const page = resolveMarkdown(path);
    if (!page) return;
    link.href = "?page=" + encodeURIComponent(page.slug) + (hash ? "#" + hash : "");
    link.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      navigate(page.slug, hash);
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
/* Only explicitly configured, trusted project embeds. Markdown remains sanitized. */
const PROJECT_EMBEDS = [
  { section: "photography", type: "facebook", title: "Nam Rhythmical on Facebook",
    url: "https://www.facebook.com/namrythmical" },
  { section: "keep", type: "app", title: "keep — interactive preview",
    url: "https://namthedev.github.io/keep/" },
  { section: "clipboard", type: "app", title: "clipboard — interactive preview",
    url: "https://namthedev.github.io/clipboard/" }
];
function projectEmbedSource(embed, width) {
  if (embed.type === "youtube" && /^UU[\w-]{22}$/.test(embed.playlist || "")) {
    return "https://www.youtube-nocookie.com/embed/videoseries?list=" + embed.playlist;
  }
  if (embed.type === "bandcamp" && /^(album|track)=\d+$/.test(embed.release || "")) {
    return "https://bandcamp.com/EmbeddedPlayer/" + embed.release +
      "/size=large/bgcol=333333/linkcol=89b4fa/tracklist=false/artwork=small/transparent=true/";
  }
  if (embed.type === "facebook" && embed.url === "https://www.facebook.com/namrythmical") {
    const params = new URLSearchParams({
      href: embed.url, tabs: "timeline", width: String(Math.max(180, Math.min(500, Math.floor(width)))),
      height: "500", small_header: "true", adapt_container_width: "true", show_facepile: "false"
    });
    return "https://www.facebook.com/plugins/page.php?" + params;
  }
  if (embed.type === "app" && ["https://namthedev.github.io/keep/", "https://namthedev.github.io/clipboard/"].includes(embed.url)) {
    return embed.url;
  }
  return null;
}
function renderProjectEmbeds() {
  for (const embed of PROJECT_EMBEDS) {
    const heading = document.getElementById(embed.section);
    if (!heading || !els.article.contains(heading) || !projectEmbedSource(embed, 320)) continue;
    let last = heading;
    while (last.nextElementSibling && !/^H[1-3]$/.test(last.nextElementSibling.tagName)) {
      last = last.nextElementSibling;
    }
    const disclosure = document.createElement("details");
    disclosure.className = "my-4";
    const summary = document.createElement("summary");
    summary.className = "fg-2 fs-sm fw-medium py-2";
    summary.textContent = embed.title;
    const container = document.createElement("div");
    container.className = "mt-2";
    disclosure.append(summary, container);
    last.after(disclosure);
    const updateEmbed = () => {
      if (!disclosure.open) {
        container.replaceChildren();
        return;
      }
      const src = projectEmbedSource(embed, container.clientWidth);
      if (!src || container.firstChild) return;
      const frame = document.createElement("iframe");
      frame.src = src;
      frame.title = embed.title;
      frame.className = "d-block w-100 border-0" +
        (embed.type === "youtube" ? " ratio-16x9" : embed.type === "app" ? " ratio-4x3" : "");
      frame.loading = "lazy";
      frame.referrerPolicy = "strict-origin-when-cross-origin";
      if (embed.type === "facebook") frame.height = "500";
      if (embed.type === "bandcamp") frame.height = "120";
      if (embed.type === "youtube") {
        frame.allow = "encrypted-media; picture-in-picture; fullscreen";
        frame.allowFullscreen = true;
      }
      if (embed.type === "app") frame.allow = "clipboard-read; clipboard-write";
      container.append(frame);
    };
    disclosure.addEventListener("toggle", updateEmbed);
    disclosure.open = true;
    updateEmbed();
  }
}

async function loadPage(next) {
  const page = state.pages.find((item) => item.slug === next) || state.pages[0];
  if (!page) return;
  const version = ++state.loadVersion;
  state.current = page.slug;
  renderNav(els.filter.value);
  if (state.observer) state.observer.disconnect();
  els.article.innerHTML = '<p class="loading fg-3 fs-xs my-3">Loading…</p>';
  try {
    const markdown = await pageText(page);
    if (version !== state.loadVersion) return;
    els.article.innerHTML = DOMPurify.sanitize(marked.parse(markdown, { gfm: true }));
    els.article.querySelectorAll("video").forEach(video => video.classList.add("max-w-100", "h-auto"));
    els.article.querySelectorAll("img").forEach(image => image.classList.add("img-fluid"));
    els.article.querySelectorAll("table").forEach(table => table.classList.add("table", "table-bordered", "fs-sm"));
    headingIds();
    if (page.slug === "projects") renderProjectEmbeds();
    renderToc();
    bindLinks();
    document.title = page.title + " — Nam";
    let target = null;
    if (location.hash) {
      try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); }
      catch { /* Ignore malformed URL fragments. */ }
    }
    target ? target.scrollIntoView() : scrollTo(0, 0);
  } catch (error) {
    if (version !== state.loadVersion) return;
    console.error(error);
    const message = document.createElement("p");
    message.className = "error fg-danger fs-xs my-3";
    message.textContent = "Unable to load this page: " + (error?.message || String(error));
    els.article.replaceChildren(message);
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
    const message = document.createElement("p");
    message.className = "error fg-danger fs-xs my-3";
    message.textContent = "Unable to load page index: " + (error?.message || String(error));
    els.article.replaceChildren(message);
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
/* Continuously loop the existing header links without maintaining a second list. */
function initHeaderMarquee() {
  const nav = document.querySelector(".header-links");
  if (!nav || nav.querySelector(".marquee-track")) return;

  const track = document.createElement("div");
  track.className = "marquee-track d-flex align-items-center";
  const group = document.createElement("div");
  group.className = "marquee-group d-flex flex-shrink-0 align-items-center";
  while (nav.firstChild) group.append(nav.firstChild);

  const duplicate = group.cloneNode(true);
  duplicate.setAttribute("aria-hidden", "true");
  duplicate.querySelectorAll("a, button, [tabindex]").forEach((el) => {
    el.setAttribute("tabindex", "-1");
  });

  track.append(group, duplicate);
  nav.append(track);
  nav.classList.add("marquee-enabled");

  // Use a constant scrolling speed, regardless of font or viewport size.
  const updateSpeed = () => {
    const width = group.getBoundingClientRect().width;
    if (width) track.style.setProperty("--marquee-duration", Math.max(20, width / 45) + "s");
  };
  updateSpeed();
  if ("ResizeObserver" in window) new ResizeObserver(updateSpeed).observe(group);
  else window.addEventListener("resize", updateSpeed);
  document.fonts?.ready.then(updateSpeed).catch(() => {});
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => { initHeaderMarquee(); wireEvents(); init(); });
} else {
  initHeaderMarquee(); wireEvents(); init();
}
