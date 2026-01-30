const FILES = [
  "content/01_about.md",
  "content/02_socials.md",
  "content/03_music.md",
  "content/04_film.md",
  "content/05_tech.md",
  "content/06_gallery.md",
];

const ICONS = {
  instagram:
    '<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>',
  youtube:
    '<path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>',
  github:
    '<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>',
  twitter:
    '<path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>',
  reddit:
    '<path d="M24 11.5c0-1.65-1.35-3-3-3-.96 0-1.86.48-2.42 1.24-2.22-1.61-5.35-2.6-8.85-2.63l1.52-7.14 5.12 1.07c.12.98.95 1.75 1.98 1.75 1.1 0 2-.9 2-2s-.9-2-2-2c-.93 0-1.73.65-1.95 1.52l-5.55-1.16c-.22-.05-.44.07-.51.28l-1.77 8.3c-3.62.13-6.85 1.19-9.12 2.85-.56-.76-1.46-1.24-2.42-1.24-1.65 0-3 1.35-3 3 0 1.33.85 2.47 2.03 2.86-.06.46-.1.93-.1 1.41 0 3.86 4.48 7 10 7s10-3.14 10-7c0-.48-.04-.95-.1-1.41 1.18-.4 2.03-1.53 2.03-2.86zm-16.5 2.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm6.5 7.5c-2.21 0-4.05-1.1-4.73-2.62.46-.19.93.07 1.12.54.43 1.02 1.74 1.68 3.61 1.68 1.86 0 3.17-.66 3.6-1.68.19-.46.68-.71 1.14-.54.67 1.52-1.17 2.62-4.74 2.62zm4-6c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/>',
  bandcamp:
    '<path d="M0 18.538h8.545l7.143-13.076h-8.546zM24 5.462h-8.545l-7.143 13.076h8.546z"/>',
  discord:
    '<path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-1.5033 16.3242 1.0028 20.0457a.077.077 0 00.0792.0286 19.6973 19.6973 0 005.952 2.9984.0754.0754 0 00.0827-.0262c.4085-.5651.7709-1.1578 1.084-1.7766a.075.075 0 00-.0409-.107 12.6368 12.6368 0 01-1.8327-.887.0773.0773 0 01-.0071-.1278c.125-.0943.2496-.1909.3708-.291a.0761.0761 0 00.0774-.0105c3.9278 1.8093 8.18 1.8093 12.0614 0a.076.076 0 00.0785.0105c.1208.0996.246.1962.3708.291a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.075.075 0 00-.0407.1067c.3195.6247.6883 1.223 1.1065 1.7923a.0744.0744 0 00.0817.0256 19.8647 19.8647 0 005.9928-3.0315.0775.0775 0 00.08-.0277c2.663-4.1455 1.7088-10.9999-1.3957-15.6759a.077.077 0 00-.0317-.0273zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419z"/>',
  default:
    '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>',
};

const desktopArea = document.getElementById("desktop-area");
const searchInput = document.getElementById("searchInput");
const modal = document.getElementById("gallery-modal");
const modalImg = document.getElementById("modal-img");
const caption = document.getElementById("caption");
const closeModal = document.querySelector(".close-modal");

document.addEventListener("DOMContentLoaded", () => {
  init();
});

const LEFT_COL_FILES = ["01_about.md", "02_socials.md", "03_music.md"];

let leftColumnContainer, rightColumnContainer;

async function init() {
  desktopArea.innerHTML = "";

  leftColumnContainer = document.createElement("div");
  leftColumnContainer.className = "layout-col col-left";

  rightColumnContainer = document.createElement("div");
  rightColumnContainer.className = "layout-col col-right";

  desktopArea.appendChild(leftColumnContainer);
  desktopArea.appendChild(rightColumnContainer);

  for (const file of FILES) {
    await loadFile(file);
  }

  setupSearch();
  setupModal();
}

async function loadFile(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const markdown = await response.text();
    const htmlContent = marked.parse(markdown);

    createWindow(path, htmlContent);
  } catch (err) {
    console.error(`Error loading ${path}:`, err);
  }
}

function createWindow(path, html) {
  const filename = path.split("/").pop();

  const windowDiv = document.createElement("div");
  windowDiv.className = "file-window";
  windowDiv.dataset.name = filename;

  const header = document.createElement("div");
  header.className = "window-bar";
  header.innerHTML = `
        <span style="color:var(--accent-red)">●</span>
        <span>/documents/markdown/${filename}</span>
    `;

  const content = document.createElement("div");
  content.className = "window-content";
  content.innerHTML = html;

  processLinks(content);

  windowDiv.appendChild(header);
  windowDiv.appendChild(content);

  if (LEFT_COL_FILES.includes(filename)) {
    leftColumnContainer.appendChild(windowDiv);
  } else {
    rightColumnContainer.appendChild(windowDiv);
  }
}

function processLinks(container) {
  const links = container.querySelectorAll("a");

  links.forEach((link) => {
    const url = link.href.toLowerCase();
    let iconSvg = ICONS.default;

    if (url.includes("instagram")) iconSvg = ICONS.instagram;
    else if (url.includes("youtube")) iconSvg = ICONS.youtube;
    else if (url.includes("github") || url.includes("namthedev"))
      iconSvg = ICONS.github;
    else if (url.includes("twitter") || url.includes("x.com"))
      iconSvg = ICONS.twitter;
    else if (url.includes("reddit")) iconSvg = ICONS.reddit;
    else if (url.includes("bandcamp")) iconSvg = ICONS.bandcamp;
    else if (url.includes("discord")) iconSvg = ICONS.discord;

    link.innerHTML = `<svg viewBox="0 0 24 24">${iconSvg}</svg> ${link.innerText}`;
  });
}

function setupSearch() {
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    const windows = document.querySelectorAll(".file-window");

    windows.forEach((win) => {
      const text = win.innerText.toLowerCase();
      if (text.includes(query)) {
        win.classList.remove("hidden");
      } else {
        win.classList.add("hidden");
      }
    });
  });
}

function setupModal() {
  desktopArea.addEventListener("click", (e) => {
    if (e.target.tagName === "IMG" && !e.target.classList.contains("avatar")) {
      modal.classList.remove("hidden");
      modalImg.src = e.target.src;
      caption.innerText = e.target.alt || "Viewing Image";
    }
  });

  closeModal.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.add("hidden");
  });
}
