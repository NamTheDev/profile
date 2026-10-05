const state = {
  pages: [],
  current: null
};

const els = {
  article: document.getElementById("article"),
  nav: document.getElementById("page-nav"),
  toc: document.getElementById("toc"),
  filter: document.getElementById("page-filter"),
  theme: document.getElementById("theme-toggle"),
  menu: document.getElementById("menu-toggle"),
  sidebar: document.getElementById("sidebar"),
  backdrop: document.getElementById("sidebar-backdrop")
};

function getPreferredTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") return saved;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("theme", theme);
  els.theme.setAttribute(
    "aria-label",
    "Switch to " + (theme === "dark" ? "light" : "dark") + " mode"
  );
}

function toggleTheme() {
  applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
}

function getSlug() {
  return new URLSearchParams(location.search).get("page") || "home";
}

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function closeMenu() {
  els.sidebar.classList.remove("open");
  els.backdrop.hidden = true;
  els.menu.setAttribute("aria-expanded", "false");
}

function toggleMenu() {
  const open = !els.sidebar.classList.contains("open");
  els.sidebar.classList.toggle("open", open);
  els.backdrop.hidden = !open;
  els.menu.setAttribute("aria-expanded", String(open));
}

function navigate(slug) {
  const url = new URL(location.href);
  url.searchParams.set("page", slug);
  url.hash = "";
  history.pushState({}, "", url);
  closeMenu();
  loadPage(slug);
}

function renderNav(query = "") {
  const normalized = query.trim().toLowerCase();
  els.nav.innerHTML = "";

  for (const page of state.pages) {
    const haystack = (page.title + " " + (page.description || "")).toLowerCase();
    if (normalized && !haystack.includes(normalized)) continue;

    const link = document.createElement("a");
    link.href = "?page=" + encodeURIComponent(page.slug);
    link.className = "page-link";
    link.textContent = page.title;
    link.dataset.slug = page.slug;

    if (page.slug === state.current) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }

    link.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      navigate(page.slug);
    });

    els.nav.append(link);
  }
}

function makeHeadingIds(container) {
  const used = new Set();

  container.querySelectorAll("h2, h3").forEach((heading) => {
    let id = slugify(heading.textContent) || "section";
    const base = id;
    let n = 2;

    while (used.has(id)) {
      id = base + "-" + n;
      n += 1;
    }

    used.add(id);
    heading.id = id;
  });
}

function renderToc() {
  els.toc.innerHTML = "";

  els.article.querySelectorAll("h2, h3").forEach((heading) => {
    const link = document.createElement("a");
    link.href = "#" + heading.id;
    link.textContent = heading.textContent;
    link.dataset.level = heading.tagName === "H3" ? "3" : "2";
    els.toc.append(link);
  });
}

function bindInternalLinks() {
  els.article.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#")) return;

    if (href.endsWith(".md")) {
      const clean = href.replace(/^\.\//, "").replace(/^pages\//, "");
      const page = state.pages.find((item) => item.file.endsWith("/" + clean));
      if (!page) return;

      link.href = "?page=" + encodeURIComponent(page.slug);
      link.addEventListener("click", (event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        navigate(page.slug);
      });
    }
  });
}

async function loadPage(slug) {
  const page = state.pages.find((item) => item.slug === slug) || state.pages[0];

  if (!page) {
    els.article.innerHTML = '<p class="error">No pages are configured.</p>';
    return;
  }

  state.current = page.slug;
  renderNav(els.filter.value);
  els.article.innerHTML = '<p class="loading">Loading…</p>';

  try {
    const response = await fetch(page.file, { cache: "no-cache" });
    if (!response.ok) throw new Error("HTTP " + response.status);

    const markdown = await response.text();
    const rendered = marked.parse(markdown, { gfm: true });
    els.article.innerHTML = DOMPurify.sanitize(rendered);

    makeHeadingIds(els.article);
    renderToc();
    bindInternalLinks();

    document.title = page.title + " — Nam";
    window.scrollTo({ top: 0, behavior: "auto" });
  } catch (error) {
    els.article.innerHTML =
      '<p class="error">Unable to load this page: ' + error.message + "</p>";
    els.toc.innerHTML = "";
  }
}

async function init() {
  applyTheme(getPreferredTheme());

  try {
    const response = await fetch("pages/index.json", { cache: "no-cache" });
    if (!response.ok) throw new Error("HTTP " + response.status);

    state.pages = await response.json();
    renderNav();
    await loadPage(getSlug());
  } catch (error) {
    els.article.innerHTML =
      '<p class="error">Unable to load page index: ' + error.message + "</p>";
  }
}

els.theme.addEventListener("click", toggleTheme);
els.menu.addEventListener("click", toggleMenu);
els.backdrop.addEventListener("click", closeMenu);
els.filter.addEventListener("input", () => renderNav(els.filter.value));
window.addEventListener("popstate", () => loadPage(getSlug()));

init();