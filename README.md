# Self-Documentary

A small, Markdown-driven personal archive with an encyclopedia-style reading interface.

## Content structure

```text
pages/
├── home.md
├── profile.md
└── index.md
```

- `pages/home.md` explains how the site works and where a reader should begin.
- `pages/profile.md` is the owner's personal self-documentary. Its substantive personal content is written entirely by the owner himself.
- `pages/index.md` is the human-readable directory linking to published pages.
- `manifest.json` is the small machine-readable registry used to build site navigation.

To add another page, create a Markdown file in `pages/`, link it from `pages/index.md`, and register it in `manifest.json`.

## Performance

The site stays intentionally small: no framework, no build system, and only the JavaScript required for Markdown rendering and navigation.

Performance features include:

- normal browser HTTP caching instead of forced `no-cache` requests
- in-memory page caching after a document is loaded
- idle-time prefetching of the remaining Markdown pages
- a versioned service worker that pre-caches the core shell
- network-first loading for the app shell and page manifests so code updates do not get trapped behind stale cache entries
- stale-while-revalidate caching for Markdown content and other static resources
- minified third-party Markdown and sanitization libraries delivered from a CDN
- no media-heavy interface assets

This follows the same broad performance principles used by large wiki systems: keep the initial shell small, make responses cacheable, reuse cached resources aggressively, and avoid loading unnecessary code.

## Run

Serve the repository over HTTP/HTTPS using GitHub Pages or another static web server. Direct `file://` loading does not work because Markdown files are fetched in the browser.

## License

MIT. See [LICENSE](LICENSE).

AI use in software development is documented in [AI_DISCLAIMER.md](AI_DISCLAIMER.md).
