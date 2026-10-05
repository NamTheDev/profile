const state = {
  pages: [],
  current: null,
  tocObserver: null
};

const els = {
  article: document.getElementById("article"),
  nav: document.getElementById("page-nav"),
  toc: document.getElementById("toc"),
  filter: document.getElementById("page-filter"),
  theme: document.getElementById("theme-toggle"),
  themeLabel: document.querySelector("#theme-toggle .utility-label"),
  menu: document.getElementById("menu-toggle"),
  sidebar: document.getElementById("sidebar"),
  backdrop: document.getElementById("sidebar-backdrop"),
  home: document.getElementById("home-link")
};

function getPreferredTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") return saved;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("theme", theme);
  const nextTheme = theme === "dark" ? "light" : "dark";
  const label = "Switch to " + nextTheme;
  els.theme.setAttribute("aria-label", label);
  els.themeLabel.textContent = label;
}

function toggleTheme() {
  applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
}

function getSlug() {
  return new URLSearchParams(location.search).get("page") || "profile";
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

  if (open) {
    requestAnimationFrame(() => els.filter.focus());
  }
}

function navigate(slug) {
  const page = state.pages.find((item) => item.slug === slug);
  if (!page) return;

  const url = new URL(location.href);
  url.searchParams.set("page", page.slug);
  url.hash = "";
  history.pushState({}, "", url);

  closeMenu();
  loadPage(page.slug);
}

function renderNav(query = "") {
  const normalized = query.trim().toLowerCase();
  els.nav.innerHTML = "";

  const matches = state.pages.filter((page) => {
    const haystack = (page.title + " " + (page.description || "")).toLowerCase();
    return !normalized || haystack.includes(normalized);
  });

  if (!matches.length) {
    const empty = document.createElement("p");
    empty.className = "page-nav-empty";
    empty.textContent = "No matching pages.";
    els.nav.append(empty);
    return;
  }

  for (const page of matches) {
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

function setActiveToc(id) {
  document.querySelectorAll('.toc a, .mobile-contents a').forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === "#" + id);
  });
}

function observeHeadings() {
  if (state.tocObserver) {
    state.tocObserver.disconnect();
  }

  const headings = [...els.article.querySelectorAll("h2, h3")];
  if (!headings.length) return;

  state.tocObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

      if (visible.length) {
        setActiveToc(visible[0].target.id);
      }
    },
    {
      rootMargin: "-15% 0px -70% 0px",
      threshold: 0
    }
  );

  headings.forEach((heading) => state.tocObserver.observe(heading));
}

function createTocLink(heading) {
  const link = document.createElement("a");
  link.href = "#" + heading.id;
  link.textContent = heading.textContent;
  link.dataset.level = heading.tagName === "H3" ? "3" : "2";
  return link;
}

function renderToc() {
  els.toc.innerHTML = "";

  const headings = [...els.article.querySelectorAll("h2, h3")];

  headings.forEach((heading) => {
    els.toc.append(createTocLink(heading));
  });

  const oldMobile = els.article.querySelector(".mobile-contents");
  if (oldMobile) oldMobile.remove();

  if (headings.length) {
    const details = document.createElement("details");
    details.className = "mobile-contents";

    const summary = document.createElement("summary");
    summary.textContent = "Contents";

    const nav = document.createElement("nav");
    nav.setAttribute("aria-label", "Contents");

    headings.forEach((heading) => {
      nav.append(createTocLink(heading));
    });

    details.append(summary, nav);

    const toolbar = els.article.querySelector(".article-toolbar");
    if (toolbar) {
      toolbar.insertAdjacentElement("afterend", details);
    } else {
      els.article.prepend(details);
    }
  }

  observeHeadings();
}

function insertArticleToolbar(page) {
  const title = els.article.querySelector("h1");
  if (!title) return;

  const toolbar = document.createElement("nav");
  toolbar.className = "article-toolbar";
  toolbar.setAttribute("aria-label", "Page actions");

  const read = document.createElement("span");
  read.className = "article-tab active";
  read.textContent = "Read";

  const source = document.createElement("a");
  source.className = "article-tab";
  source.href = page.file;
  source.textContent = "Source";
  source.target = "_blank";
  source.rel = "noopener";

  toolbar.append(read, source);
  title.insertAdjacentElement("afterend", toolbar);
}

function bindInternalLinks() {
  els.article.querySelectorAll("a[href]").forEach((link) => {
    const rawHref = link.getAttribute("href");
    if (!rawHref || rawHref.startsWith("#")) return;

    const [path, hash = ""] = rawHref.split("#");

    if (path.endsWith(".md")) {
      const clean = path.replace(/^\.\//, "");
      const page = state.pages.find((item) => item.file === clean || item.file.endsWith("/" + clean));
      if (!page) return;

      link.href =
        "?page=" +
        encodeURIComponent(page.slug) +
        (hash ? "#" + encodeURIComponent(hash) : "");

      link.addEventListener("click", (event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

        event.preventDefault();
        navigate(page.slug);

        if (hash) {
          setTimeout(() => {
            const target = document.getElementById(hash);
            if (target) target.scrollIntoView();
          }, 0);
        }
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
    insertArticleToolbar(page);
    renderToc();
    bindInternalLinks();

    document.title = page.title + " — Nam";

    if (location.hash) {
      const target = document.querySelector(location.hash);
      if (target) {
        target.scrollIntoView();
        return;
      }
    }

    window.scrollTo(0, 0);
  } catch (error) {
    els.article.innerHTML =
      '<p class="error">Unable to load this page: ' + error.message + "</p>";
    els.toc.innerHTML = "";
  }
}

async function init() {
  applyTheme(getPreferredTheme());

  try {
    const response = await fetch("index.json", { cache: "no-cache" });
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

els.home.addEventListener("click", (event) => {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  navigate("profile");
});

window.addEventListener("popstate", () => loadPage(getSlug()));

init();