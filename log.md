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

### 01:26:23 — `0830fe9`
**Add development log from Git history**

Added this `log.md` file using the repository's Git history as the source of record for the redesign.

### 01:26:53 — `334a9cb`
**Remove remaining mobile tagline styling**

Removed the final unused mobile CSS rule for the deleted brand subtext.

### 01:27:06 — `77f9f53`
**Update development log with latest cleanup**

Updated `log.md` to include the header cleanup and theme-label changes.

### 01:33:54 — `752cd17`
**Make Profile the primary documentary page**

Changed the site header/home action so the default documentary entry is `PROFILE.md`.

### 01:33:57 — `a90011c`
**Move Markdown index to repository root**

Changed the frontend to load the Markdown registry from root `index.json`, default to the `profile` page, and support root-level Markdown files.

### 01:33:59 — `f3c474f`
**Document owner-written Profile content model**

Updated the README to define `PROFILE.md` as the project owner's entirely self-written personal document and explain the new root index workflow.

### 01:34:01 — `0945e48`
**Clarify AI is limited to development work**

Updated `AI_DISCLAIMER.md` to state that AI assists software development but does not author the owner's personal self-documentary content.

### 01:34:04 — `60b48d9`
**Add root Markdown index**

Added root `index.json` as the single registry for Markdown documents.

### 01:34:06 — `fc5bc96`
**Add owner-written profile document**

Added `PROFILE.md` with only the structural Profile heading, leaving substantive personal content for the owner to write himself.

### 01:34:08 — `d802b08`
**Remove old documentary scaffold**

Removed `pages/home.md`.

### 01:34:11 — `a206df8`
**Remove old documentary scaffold**

Removed `pages/about.md`.

### 01:34:14 — `b7ecd11`
**Remove old documentary scaffold**

Removed `pages/timeline.md`.

### 01:34:17 — `5e89051`
**Remove old documentary scaffold**

Removed `pages/work.md`.

### 01:34:19 — `6686ccc`
**Remove old documentary scaffold**

Removed `pages/notes.md`.

### 01:34:21 — `d693516`
**Remove obsolete pages manifest**

Removed `pages/index.json`. With the old page files gone, the `pages/` directory disappeared from the repository.


### 01:35:03 — `3834696`
**Log Profile and root index migration**

Recorded the previous Profile/index migration in the development log.

### 01:40:56 — `5a7caee`
**Add Markdown page manifest**

Added `manifest.json` as the machine-readable registry for published Markdown pages.

### 01:40:59 — `01120eb`
**Add archive home page**

Added `pages/home.md` as the reader-facing landing page explaining how the archive works and what to read first.

### 01:41:01 — `59ab1a9`
**Move owner profile into pages**

Created `pages/profile.md` as the owner's self-written personal profile document.

### 01:41:03 — `38b0bf8`
**Add human-readable page index**

Added `pages/index.md` as the visitor-facing directory linking the archive pages.

### 01:41:06 — `7fa949b`
**Add service worker caching**

Added `sw.js` to pre-cache the core site shell and use cached responses for faster repeat visits and offline fallback.

### 01:41:08 — `f74320b`
**Document pages structure and caching**

Updated the README for the `pages/` model, human-readable index, manifest, and performance strategy.

### 01:41:10 — `558108f`
**Clarify personal content authorship**

Updated the AI disclosure to distinguish AI-assisted software/navigation work from owner-written autobiographical content.

### 01:41:13 — `8b40734`
**Remove superseded root Profile file**

Removed the old root `PROFILE.md` after moving the profile document into `pages/`.

### 01:41:15 — `bf0d499`
**Replace old index manifest**

Removed the old root `index.json` in favor of `manifest.json` plus the human-readable `pages/index.md`.

### 01:42:24 — `6f0ce18`
**Optimize shell resource connections**

Added an early connection hint for the CDN serving the Markdown renderer and sanitizer.

### 01:42:27 — `32ad805`
**Add cached Markdown loading and idle prefetch**

Removed forced no-cache loading, added in-memory Markdown caching, idle prefetching, service-worker registration, and a smaller navigation/runtime path.

### 01:43:17 — `8feb8ef`
**Keep contents navigation on smaller screens**

Kept the compact expandable contents navigation for smaller displays while preserving the simplified runtime.


### 01:51:20 — `7c1855e`
**Add legacy-safe page index alias**

Added root `index.json` as a compatibility alias for the Markdown page registry so browsers still running an older cached script can resolve the page index instead of returning HTTP 404.

### 01:51:22 — `c29de14`
**Fix service worker cache invalidation**

Bumped the service-worker cache version and changed the app shell, JavaScript, CSS, and page registries to network-first loading. Markdown content remains cache-friendly with stale-while-revalidate.

### 01:51:24 — `e402fb3`
**Document safer cache strategy**

Updated the README to explain the versioned cache, network-first app shell, and stale-while-revalidate content behavior.


### 01:54:51 — `b38f018`
**Remove Profile from page manifest**

Removed the Profile entry from `manifest.json`.

### 01:54:53 — `238b454`
**Remove Profile from compatibility index**

Removed the Profile entry from the legacy-safe `index.json` alias.

### 01:54:55 — `949a92e`
**Remove Profile from home navigation**

Updated `pages/home.md` so it no longer points readers to the Profile page.

### 01:54:57 — `4069fb4`
**Remove Profile from page index**

Removed the Profile link from the human-readable `pages/index.md`.

### 01:55:00 — `a25014c`
**Remove Profile from documented structure**

Updated the README so the documented content model contains only Home and Index.

### 01:55:02 — `0eb7440`
**Generalize personal content disclosure**

Removed the Profile-specific wording from `AI_DISCLAIMER.md` while keeping the distinction between AI-assisted development and owner-written autobiographical content.

### 01:55:04 — `a9b7f69`
**Drop Profile from service worker cache**

Removed `pages/profile.md` from the pre-cache list and bumped the service worker cache version.

### 01:55:06 — `ea9fd55`
**Remove Profile page**

Deleted `pages/profile.md`.

---

This log documents the rebuild commits created during the collaborative self-documentary redesign. Earlier repository history belongs to previous versions of the project and is intentionally not reproduced here.
