async function loadMarkdown() {
    const loader = document.getElementById("loader");
    const displayDiv = document.getElementById("content");

    try {
        const response = await fetch("README.md");
        if (!response.ok)
            throw new Error(
                `Could not load portfolio (Status: ${response.status})`,
            );

        const rawMarkdown = await response.text();
        const dirtyHTML = marked.parse(rawMarkdown);
        displayDiv.innerHTML = DOMPurify.sanitize(dirtyHTML);
    } catch (error) {
        displayDiv.innerHTML = `<p class="error">Error: ${error.message}</p>`;
    } finally {
        loader.classList.add("hidden");
    }
}

window.onload = loadMarkdown;
