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

## Project content and catalogue

The Projects lead remains in pages/PROJECTS.md. The manifest's ordered parts array assembles category headings and individual project Markdown files under pages/projects/creative-works, software and archived-projects into one article. Existing section anchors and table of contents are unchanged. Add a file and register it in manifest.json when expanding the article.

data/sources.json holds public channel and repository identifiers. data/catalogue.json holds a portable metadata snapshot; js/projects.js renders native Bootstrap repository cards with clickable GitHub statistics, navigation and compact 320px-wide responsive Open Graph images. YouTube sections display every captured upload as a linked thumbnail, title and publication date; no channel cards or large players. No added CSS or client-side API credentials. The browser reads the public main-branch snapshot when reachable and falls back to the deployed copy. No interactive app iframes or unreliable Facebook embeds. Markdown sanitization remains unchanged.

Channel metadata may be captured by the official API but is not displayed as a separate card. Do not invent video titles or statistics. Original source links are retained in Markdown.

The Refresh project catalogue workflow runs daily and on source changes or manual dispatch. It updates repository metadata from the public GitHub REST API. Without a YouTube API key it reads public Atom feeds (recent uploads) and retains earlier captured entries; with the optional repository Actions secret `YOUTUBE_API_KEY` it uses the official YouTube Data API and paginates through the uploads playlist to collect all available public uploads and channel statistics. Failed sources retain existing records. The workflow reports partial failures and commits successful updates. No API key is exposed to the browser. The catalogue may include historically captured entries that are later removed by the provider.
