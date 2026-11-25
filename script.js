const state = { pages: [], current: null, text: new Map(), observer: null, loadVersion: 0 };
const $ = (selector) => document.querySelector(selector);
const els = {
  article: $("#article"), nav: $("#page-nav"), toc: $("#toc"),
  filter: $("#page-filter"), menu: $("#menu-toggle"),
  sidebar: $("#sidebar"), backdrop: $("#sidebar-backdrop")
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
function bindNavigation(link, next, hash = "") {
  link.addEventListener("click", event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(next, hash);
  });
}
function renderNav(query = "") {
  const needle = query.trim().toLowerCase();
  const pages = state.pages.filter((page) =>
    !needle || (page.title + " " + (page.description || "")).toLowerCase().includes(needle)
  );
  els.nav.replaceChildren();
  if (!pages.length) {
    const empty = document.createElement("p");
    empty.className = "fg-3 fs-xs my-2 mx-3";
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
    bindNavigation(link, page.slug);
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
    bindNavigation(link, page.slug, hash);
  });
}
async function markdownText(file) {
  if (state.text.has(file)) return state.text.get(file);
  const response = await fetch(file);
  if (!response.ok) throw new Error("HTTP " + response.status);
  const ct = (response.headers.get("content-type") || "").toLowerCase();
  if (ct.includes("text/html")) {
    const body = await response.clone().text();
    throw new Error(`Server returned HTML instead of markdown for "${file}". Body starts: ${body.slice(0, 80)}`);
  }
  const text = await response.text();
  state.text.set(file, text);
  return text;
}
async function pageText(page) {
  return (await Promise.all([page.file, ...(page.parts || [])].map(markdownText))).join("\n\n");
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
  const version = ++state.loadVersion;
  state.current = page.slug;
  renderNav(els.filter.value);
  if (state.observer) state.observer.disconnect();
  els.article.innerHTML = '<p class="fg-3 fs-xs my-3">Loading…</p>';
  try {
    const markdown = await pageText(page);
    if (version !== state.loadVersion) return;
    els.article.innerHTML = DOMPurify.sanitize(marked.parse(markdown, { gfm: true }));
    els.article.querySelectorAll("video").forEach(video => video.classList.add("max-w-100", "h-auto"));
    els.article.querySelectorAll("img").forEach(image => image.classList.add("img-fluid"));
    els.article.querySelectorAll("table").forEach(table => table.classList.add("table", "table-bordered", "fs-sm"));
    headingIds();
    if (page.slug === "projects") await renderProjectCatalogue(els.article);
    if (version !== state.loadVersion) return;
    renderToc();
    bindLinks();
    document.title = page.slug === "about" ? "Nam — Personal Archive" : page.title + " — Nam — Personal Archive";
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
    message.className = "fg-danger fs-xs my-3";
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
    message.className = "fg-danger fs-xs my-3";
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
  addEventListener("popstate", () => {
  const next = slug();
  if (next !== state.current) void loadPage(next);
});
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

  // Native scroll keeps trackpad, touch and keyboard scrolling available.
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const hover = window.matchMedia("(hover: hover)");
  let loopWidth = 0, manualUntil = 0, activePointer = null;
  let previous = 0, remainder = 0, automaticPosition = nav.scrollLeft;
  const resumeDelay = 1500;
  const pauseManual = () => { manualUntil = performance.now() + resumeDelay; };
  const updateWidth = () => {
    loopWidth = Math.round(group.getBoundingClientRect().width);
    nav.classList.toggle("marquee-overflow", loopWidth > nav.clientWidth);
  };
  updateWidth();
  const observer = new ResizeObserver(updateWidth);
  observer.observe(group);
  observer.observe(nav);

  nav.addEventListener("pointerleave", event => {
    if (event.pointerType === "touch" || !hover.matches) return;
    // Resume immediately on mouse exit, even after manual scrolling.
    manualUntil = 0;
    automaticPosition = nav.scrollLeft;
  });
  nav.addEventListener("wheel", event => {
    if (event.ctrlKey || event.metaKey) return;
    // Capture wheel input over the ticker without scrolling the page.
    event.preventDefault();
    if (nav.scrollWidth <= nav.clientWidth ||
        !event.deltaX || Math.abs(event.deltaY) > Math.abs(event.deltaX)) return;
    pauseManual();
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? nav.clientWidth : 1;
    nav.scrollLeft += event.deltaX * unit;
  }, { passive: false });
  nav.addEventListener("scroll", () => {
    // Native touch momentum and keyboard scrolling extend the manual pause.
    if (Math.abs(nav.scrollLeft - automaticPosition) > .5) pauseManual();
  }, { passive: true });
  nav.addEventListener("pointerdown", event => {
    activePointer = event.pointerId;
    pauseManual();
  });
  const releasePointer = event => {
    if (event.pointerId !== activePointer) return;
    activePointer = null;
    pauseManual();
  };
  window.addEventListener("pointerup", releasePointer);
  window.addEventListener("pointercancel", releasePointer);

  // Resume the same native scroll position after interaction; loop at one group.
  const advance = now => {
    const elapsed = previous ? Math.min(now - previous, 50) : 0;
    previous = now;
    const paused = reducedMotion.matches || loopWidth <= nav.clientWidth ||
      activePointer !== null || now < manualUntil || (hover.matches && nav.matches(":hover")) ||
      nav.querySelector(":focus-visible") !== null;
    if (!paused) {
      const distance = elapsed * .045 + remainder;
      const step = Math.floor(distance);
      remainder = distance - step;
      if (step) {
        nav.scrollLeft = (nav.scrollLeft + step) % loopWidth;
        automaticPosition = nav.scrollLeft;
      }
    } else remainder = 0;
    requestAnimationFrame(advance);
  };
  requestAnimationFrame(advance);
}

initHeaderMarquee();
wireEvents();
init();
