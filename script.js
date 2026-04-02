async function fetchData(file) {
    const response = await fetch(file);
    if (!response.ok) throw new Error(`Failed: ${file}`);
    return file.endsWith(".json")
        ? await response.json()
        : await response.text();
}

function renderMusic(data) {
    const container = document.getElementById("lastfm-container");
    container.innerHTML = `
        <h3>${data.nowPlaying ? "Now Playing" : "Recently Played"}</h3>
        <img src="${data.image}" alt="Album Art" style="margin-bottom: 10px;">
        <p><strong>${data.name}</strong></p>
        <p>${data.artist}</p>
        <a href="${data.url}" target="_blank">View on Last.fm</a>
    `;
}

async function init() {
    const loader = document.getElementById("loader");
    const contentDiv = document.getElementById("content");
    const blogDiv = document.getElementById("blog-content");

    try {
        const [readme, blog, music] = await Promise.all([
            fetchData("README.md"),
            fetchData("Blog.md"),
            fetchData("lastfm.json").catch(() => null),
        ]);

        contentDiv.innerHTML = DOMPurify.sanitize(marked.parse(readme));
        blogDiv.innerHTML = DOMPurify.sanitize(marked.parse(blog));
        if (music) renderMusic(music);
    } catch (error) {
        contentDiv.innerHTML = `<p class="error">${error.message}</p>`;
    } finally {
        loader.classList.add("hidden");
    }
}

window.onload = init;
