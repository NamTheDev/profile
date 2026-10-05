# Self-Documentary

A small, Markdown-driven personal archive with an encyclopedia-style reading interface.

## Content structure

```text
pages/
└── home.md
```

- `pages/home.md` is the landing page and short reader guide.
- `manifest.json` is the machine-readable registry used to build the sidebar.
- `index.json` mirrors the registry for compatibility with older cached versions.

To add a page, create a Markdown file in `pages/` and register it in `manifest.json` and `index.json`.

## Performance

- browser HTTP caching
- in-memory Markdown caching
- idle-time prefetching
- versioned service-worker cache
- network-first app shell and registries
- stale-while-revalidate Markdown/static content
- no framework or build step

## Run

Serve over HTTP/HTTPS with GitHub Pages or another static web server.

## License

MIT. See [LICENSE](LICENSE).

AI use in software development is documented in [AI_DISCLAIMER.md](AI_DISCLAIMER.md).
