const state = {
  pages: [],
  current: null,
  text: new Map(),
  observer: null
};

const $ = (selector) => document.querySelector(selector);
const els = {
  article: $("#article"),
  nav: $("#page-nav"),
  toc: $("#toc"),
  filter: $("#page-filter"),
  theme: $("#theme-toggle"),
  themeLabel: $("#theme-toggle .utility-label"),
  menu: $("#menu-toggle"),
  sidebar: $("#sidebar"),
  backdrop: $("#sidebar-backdrop"),
  home: $("#home-link")
};

function preferredTheme() {
  const saved = localStorage.getItem("theme");
  return saved === "light" || saved === "dark"
    ? saved
    : matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("theme", theme);
  const label = "Switch to " + (theme === "dark" ? "light" : "dark");
  els.theme.ariaLabel = label;
  els.themeLabel.textContent = label;
}

function slug() {
  return new URLSearchParams(location.search).get("page") || "home";
}

function slugify(text) {
  return text.toLowerCase().trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function closeMenu() {
  els.sidebar.classList.remove("open");
  els.backdrop.hidden = true;
  els.menu.ariaExpanded = "false";
}

function navigate(next) {
  const page = state.pages.find((item) => item.slug === next);
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
    const current = entries
      .filter((entry) => entry.isIntersecting)
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

  const text = await response.text();
  state.text.set(page.file, text);
  return text;
}

function prefetchPages() {
  const run = () => {
    state.pages
      .filter((page) => page.slug !== state.current)
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
    els.article.innerHTML = '<p class="error">Unable to load this page: ' + error.message + "</p>";
    els.toc.replaceChildren();
  }
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js", { updateViaCache: "none" }).catch(() => {});
  }
}

async function init() {
  applyTheme(preferredTheme());
  registerServiceWorker();

  try {
    const response = await fetch("manifest.json");
    if (!response.ok) throw new Error("HTTP " + response.status);

    state.pages = await response.json();
    await loadPage(slug());
    prefetchPages();
  } catch (error) {
    els.article.innerHTML = '<p class="error">Unable to load page index: ' + error.message + "</p>";
  }
}

els.theme.addEventListener("click", () =>
  applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark")
);

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
  navigate("home");
});
addEventListener("popstate", () => loadPage(slug()));

init();
