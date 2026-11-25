# Self-Documentary

## AI Disclaimer

AI tools may support development and maintenance, including coding, debugging, documentation, and research. This does not attribute authorship of personal content to AI.

See [AI_DISCLAIMER.md](AI_DISCLAIMER.md) for the full disclosure.

## Introduction

A small, Markdown-driven personal archive with an encyclopedia-style reading interface, built on Bootstrap 6 and the shared Catppuccin design configuration. [Open Profile](https://namthedev.github.io/profile/).

## Resources

- [Design and implementation](docs/DESIGN.md)
- [Commit message format](commit_message_format.txt)

## License

Original project material is licensed under the [MIT License](LICENSE). Bootstrap retains its [upstream license](LICENSE.bootstrap); shared palette notices are included in config.css.

## Project catalogue

Individual project articles live under `pages/projects/`. Their order is defined in `manifest.json`. The Refresh project catalogue GitHub Actions workflow fetches public repository metadata and recent YouTube uploads daily. Set the repository Actions secret `YOUTUBE_API_KEY` to enable full YouTube upload pagination and channel statistics. See [design documentation](docs/DESIGN.md).
