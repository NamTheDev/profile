# Profile design and implementation

Profile uses the same locally vendored Bootstrap 6.0.0-alpha.2 CSS and canonical [util design configuration](https://github.com/NamTheDev/util/blob/main/design/config.css) as Keep and Clipboard. Load order is bootstrap.min.css, config.css, style.css. Keep config.css identical to util when synchronizing; do not edit the vendor stylesheet. Preserve all license notices.

The site intentionally retains its original reading identity: Source Sans 3, larger article typography, blue links, green/teal/sky/sapphire heading colors, dark Catppuccin Mocha, fixed-width reading column, left page navigation and right table of contents. These are local exceptions to the generic app defaults. The scrolling header remains a deliberate motion exception, with hover/focus pause and reduced-motion fallback.

Native Bootstrap utilities cover flex alignment, spacing where suitable, borders, controls, rounding, typography and rendered Markdown tables/images. Local CSS owns the three-column grid, responsive rails, article typography and marquee. No Bootstrap JavaScript is needed. Profile remains a static site with its existing Markdown rendering and navigation. The contents rail and mobile contents disclosure share a nested heading-based list (H2–H6). Branches are expanded by default and use native HTML details/summary disclosure with Bootstrap utilities for spacing, nesting, typography, borders and active states. Top-level links use Bootstrap's fg-success utility, mapped to the existing H1 green through the Bootstrap success foreground token. Do not add tree-specific CSS or dependencies; section links retain their original anchors. Bootstrap 6 requires current browsers (Chrome/Edge 138+, Firefox 147+, Safari 26+).

The service worker precaches the local stylesheets and only clears its own versioned caches. The existing external Markdown libraries and font delivery remain unchanged; full offline rendering still depends on those resources being available in the browser cache.

## Verification

GitHub Actions runs syntax checks, cache and manifest tests, plus browser verification for desktop and mobile layouts, navigation, native controls and reduced motion.

The fixed dark theme is advertised through the color-scheme meta element, the root CSS color-scheme property and data-bs-theme. Follow the [native theme signaling specification](https://github.com/NamTheDev/util/blob/main/formatting/THEME_SIGNAL.md). Do not disable browser extensions with a lock.

## Bootstrap-first styling

Follow the [minimum-custom-CSS standard in util](https://github.com/NamTheDev/util/blob/main/design/DESIGN_PRINCIPLES.md). The local stylesheet retains only application-specific exceptions: exact reading-column geometry, responsive navigation rail and drawer, marquee animation, Markdown article typography and link behavior, and configuration overrides required by Profile's established visual identity. Use existing Bootstrap utilities in markup for generic spacing, sizing, borders and color.

## Editorial style

Write descriptions in neutral third-person, encyclopedic prose. Preserve Nam's original personal statements and first-person language verbatim as Markdown block quotations, with italic text inside double quotation marks: `> *"Original statement."*`. Use attribution only when necessary to establish who is speaking; surrounding section context can supply it. Avoid formulaic quotation introductions (such as "Nam describes himself as"), redundant navigation prompts, conversational transitions and sentences that merely introduce lists. Prefer direct factual descriptions, meaningful links and concise article leads. Apply the same treatment to direct statements by collaborative projects; never present generated or paraphrased text as the author's own words. Do not add first-person statements on the author's behalf.

## Project embeds

Keep original links in Markdown as accessible fallbacks. `PROJECT_EMBEDS` in `script.js` defines approved media embeds, displayed directly in the article as lazy-loaded iframes without disclosure wrappers or visible toggle labels. Use Bootstrap sizing utilities, not custom CSS. Raw Markdown iframes remain blocked by DOMPurify. Only explicit provider-specific URLs are supported. Three owner-supplied YouTube channel uploads playlists (main, music, Ashes) are configured. Interactive applications remain links and repository preview images, not embedded applications. YouTube channel IDs are converted to uploads playlist IDs by replacing the initial UC with UU. Facebook remains a normal link because its Page plugin produced a blank frame; do not add unsupported or unreliable profile embeds. Add verified YouTube uploads playlist IDs (`UU` followed by 22 ID characters) with `type: "youtube", playlist: "..."`, or verified Bandcamp numeric album/track identifiers with `type: "bandcamp", release: "album=..."` (or `track=...`) and the corresponding section and title. Do not guess IDs, use external proxy services, embed arbitrary webpages, or embed GitHub repository pages and unsupported artist profile pages. Third-party embeds depend on provider availability and visitor browser settings.

GitHub repositories use clickable native Markdown images from `opengraph.githubassets.com`, directly below their descriptions. The original text links remain; the existing renderer applies Bootstrap `img-fluid` to all article images. No additional stylesheet or preview library is needed.
