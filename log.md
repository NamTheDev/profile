# Development Log

This file records the self-documentary rebuild performed on 2026-10-05.

The entries below are based on the repository's Git commit history, beginning with the first self-documentary rebuild commit. Times are UTC.

## 2026-10-05

### 00:32:42 — `fb8d477`
**Rebuild site shell for self-documentary**

Replaced the previous portfolio shell with a new static self-documentary structure.

### 00:33:12 — `f1f9323`
**Replace styling with Catppuccin documentary layout**

Introduced Catppuccin Latte and Mocha palettes and a documentation-oriented responsive layout.

### 00:33:40 — `b327fd6`
**Add Markdown page router and theme system**

Added Markdown loading, page routing, page navigation, dark/light theme handling, and internal Markdown link handling.

### 00:33:55 — `220f4cc`
**Document Markdown self-documentary workflow**

Reworked the README around the new Markdown-driven site workflow.

### 00:33:58 — `3f804c2`
**Add page manifest**

Added `pages/index.json` as the navigation and page registry.

### 00:34:01 — `dc82134`
**Add documentary page scaffold**

Added `pages/home.md`.

### 00:34:03 — `55a018b`
**Add documentary page scaffold**

Added `pages/about.md`.

### 00:34:05 — `91f838c`
**Add documentary page scaffold**

Added `pages/timeline.md`.

### 00:34:07 — `8e2f583`
**Add documentary page scaffold**

Added `pages/work.md`.

### 00:34:09 — `cecd123`
**Add documentary page scaffold**

Added `pages/notes.md`.

### 00:34:24 — `9d6ce5c`
**Load Montserrat interface font**

Added Montserrat as the site typeface.

### 00:34:26 — `d3efe48`
**Remove legacy profile artwork**

Removed the previous avatar artwork.

### 00:34:28 — `9c22096`
**Remove legacy banner artwork**

Removed the previous banner artwork.

### 00:34:30 — `ebde772`
**Remove legacy unused artwork**

Removed the remaining unused legacy media asset.

### 00:53:40 — `13d80a3`
**Fix literal newline artifacts in site shell**

Removed literal escaped newline text that had accidentally become visible in the rendered page.

### 00:53:43 — `7ba6418`
**Use Montserrat exclusively across the site**

Started normalizing all typography to Montserrat.

### 00:54:19 — `7ef53e0`
**Use Montserrat as the only site font**

Updated remaining font references to use the single Montserrat font family.

### 00:54:21 — `92001c4`
**Rewrite README as concise reusable project guide**

Replaced the README with a compact overview and reuse instructions for the project.

### 00:54:24 — `6869851`
**Document AI-assisted development**

Added `AI_DISCLAIMER.md` to explicitly disclose ChatGPT/OpenAI assistance in development.

### 00:54:26 — `b8b9928`
**Add MIT license**

Added the MIT License so the project can be reused, modified, and redistributed under a permissive open-source license.

### 00:54:51 — `95e8a4d`
**Remove final Courier font declaration**

Removed the last leftover Courier declaration and completed the Montserrat-only typography requirement.

### 01:17:51 — `4a1eb15`
**Rework shell around encyclopedia-style information hierarchy**

Revised the page shell to better follow encyclopedia-style information architecture rather than a generic dashboard layout.

### 01:17:53 — `0b8e4d5`
**Apply Wikipedia-inspired blocky typography and layout**

Changed spacing, typography, borders, navigation, reading width, and responsive behavior toward a denser, text-driven, rectangular design.

### 01:17:56 — `62f17a0`
**Improve contents navigation and page affordances**

Added improved contents navigation, active-section tracking, mobile contents, and article-level Read / Source controls.

### 01:17:58 — `a62e980`
**Clarify encyclopedia-inspired project purpose**

Updated the README to describe the project as a minimal Markdown-driven personal archive inspired by encyclopedia interfaces.

### 01:25:23 — `52aaf7c`
**Simplify header branding and theme label**

Removed the `SELF-DOCUMENTARY` brand subtext and replaced the static appearance label with a target-theme label.

### 01:25:25 — `bff9929`
**Show target theme in appearance control**

Made the theme control dynamically display `Switch to light` or `Switch to dark` according to the currently active theme.

### 01:25:27 — `520cf1a`
**Remove obsolete brand tagline styling**

Removed CSS that was only used by the deleted header subtext.

---

This log documents the rebuild commits created during the collaborative self-documentary redesign. Earlier repository history belongs to previous versions of the project and is intentionally not reproduced here.
