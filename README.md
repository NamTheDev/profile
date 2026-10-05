# Self-Documentary

A minimal Markdown-driven personal archive inspired by the clarity of encyclopedia interfaces.

## Features

- Markdown pages
- Simple page index and navigation
- Automatic contents navigation
- Catppuccin Latte / Mocha themes
- Montserrat throughout
- No framework or build step
- Static-hosting friendly

## Use it

1. Fork or clone this repository.
2. Edit the site name and metadata in `index.html`.
3. Put Markdown files in `pages/`.
4. Register each page in `pages/index.json`.
5. Serve the repository with any static web server or GitHub Pages.

Example:

```json
{
  "slug": "journal",
  "title": "Journal",
  "file": "pages/journal.md",
  "description": "Personal journal."
}
```

The site must be served over HTTP/HTTPS because pages are loaded with `fetch()`.

## License

MIT. See [LICENSE](LICENSE).

AI assistance used in development is documented in [AI_DISCLAIMER.md](AI_DISCLAIMER.md).
