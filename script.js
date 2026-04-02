async function fetchData(file) {
    const response = await fetch(file);
    if (!response.ok) throw new Error(`Failed to load ${file}`);
    return await response.text();
}

async function init() {
    const loader = document.getElementById("loader");
    const contentDiv = document.getElementById("content");
    const blogDiv = document.getElementById("blog-content");

    try {
        const [readmeText, blogText] = await Promise.all([
            fetchData("README.md"),
            fetchData("BLOG.md"),
        ]);

        contentDiv.innerHTML = DOMPurify.sanitize(marked.parse(readmeText));
        blogDiv.innerHTML = DOMPurify.sanitize(marked.parse(blogText));
    } catch (error) {
        contentDiv.innerHTML = `<p class="error">Error: ${error.message}</p>`;
    } finally {
        loader.classList.add("hidden");
    }
}

window.onload = init;
