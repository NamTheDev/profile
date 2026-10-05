# profile

Minimal self-documentary website for Nam.

The site is intentionally content-first and inspired by the navigation simplicity of Wikipedia. It has no build step and uses Markdown files as its document source.

## Add a page

1. Create a Markdown file inside `pages/`.
2. Add it to `pages/index.json`.
3. Commit and push.

Example:

```json
{
  "slug": "journal",
  "title": "Journal",
  "file": "pages/journal.md",
  "description": "Personal notes and dated entries."
}
```

Open it with `?page=journal`.

## Themes

- Dark: Catppuccin Mocha
- Light: Catppuccin Latte
- Theme follows the operating system on first visit and can be toggled manually.
- Interface font: Montserrat
- Monospace/meta font: Courier New
