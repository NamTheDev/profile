# Profile design and implementation

Profile uses the same locally vendored Bootstrap 6.0.0-alpha.2 CSS and canonical [util design configuration](https://github.com/NamTheDev/util/blob/main/design/config.css) as Keep and Clipboard. Load order is bootstrap.min.css, config.css, style.css. Keep config.css identical to util when synchronizing; do not edit the vendor stylesheet. Preserve all license notices.

The site intentionally retains its original reading identity: Source Sans 3, larger article typography, blue links, green/teal/sky/sapphire heading colors, dark Catppuccin Mocha, fixed-width reading column, left page navigation and right table of contents. These are local exceptions to the generic app defaults. The scrolling header remains a deliberate motion exception, with hover/focus pause and reduced-motion fallback.

Native Bootstrap utilities cover flex alignment, spacing where suitable, borders, controls, rounding, typography and rendered Markdown tables/images. Local CSS owns the three-column grid, responsive rails, article typography and marquee. No Bootstrap JavaScript is needed. Profile remains a static site with its existing Markdown rendering and navigation. The contents rail and mobile contents disclosure share a nested heading-based list (H2–H6). Branches are expanded by default and can be collapsed independently with keyboard-accessible buttons; section links retain their original anchors. Bootstrap 6 requires current browsers (Chrome/Edge 138+, Firefox 147+, Safari 26+).

The service worker precaches the local stylesheets and only clears its own versioned caches. The existing external Markdown libraries and font delivery remain unchanged; full offline rendering still depends on those resources being available in the browser cache.

## Verification

GitHub Actions runs syntax checks, cache and manifest tests, plus browser verification for desktop and mobile layouts, navigation, native controls and reduced motion.

The fixed dark theme is advertised through the color-scheme meta element, the root CSS color-scheme property and data-bs-theme. Follow the [native theme signaling specification](https://github.com/NamTheDev/util/blob/main/formatting/THEME_SIGNAL.md). Do not disable browser extensions with a lock.
