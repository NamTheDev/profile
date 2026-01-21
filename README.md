# namchill235 Portfolio

A minimalist, desktop-first portfolio acting as a universal hub for my creative projects (Music, Art, Tech). Built with Vanilla JS, Markdown, and a custom Frutiger Aero/Terminal aesthetic.

## 📂 File Structure

- `index.html` - The "Desktop" container.
- `script.js` - Fetches Markdown files and renders them into "Windows".
- `style.css` - Catppuccin Mocha color scheme + Glassmorphism.
- `content/` - Markdown files containing the actual text/links.
- `assets/` - Images (Profile pic, etc).

## 🚀 How to Run

Because this site fetches local Markdown files via JavaScript, **you cannot open `index.html` directly**. You must run a local server.

### Option 1: VS Code (Easiest)
1. Install the "Live Server" extension.
2. Right-click `index.html` -> "Open with Live Server".

### Option 2: Python
1. Open terminal in this folder.
2. Run: `python3 -m http.server`.
3. Go to `http://localhost:8000`.

## ✏️ Editing Content
Edit the `.md` files in the `content/` folder. The site will automatically update upon refresh.