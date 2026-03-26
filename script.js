const grid = document.getElementById("grid");
const search = document.getElementById("searchInput");

async function init() {
    try {
        const [conf, manifest] = await Promise.all([
            fetch("config.json").then((r) => r.json()),
            fetch("manifest.json").then((r) => r.json()),
        ]);

        const r = document.documentElement.style;
        r.setProperty("--acc", conf.theme.accent);
        r.setProperty("--bg", conf.theme.background);
        r.setProperty("--surf", conf.theme.surface);
        r.setProperty("--txt", conf.theme.text);

        for (const file of manifest.files) {
            const md = await fetch(`content/${file}`).then((r) => r.text());
            const div = document.createElement("div");
            div.className = "tile";
            div.innerHTML = marked.parse(md);
            grid.appendChild(div);
        }

        search.addEventListener("input", (e) => {
            const q = e.target.value.toLowerCase();
            document.querySelectorAll(".tile").forEach((t) => {
                t.style.display = t.innerText.toLowerCase().includes(q)
                    ? ""
                    : "none";
            });
        });
    } catch (err) {
        console.error("Boot failed:", err);
    }
}

init();
