const keys = { 32: 1, 33: 1, 34: 1, 35: 1, 36: 1, 37: 1, 38: 1, 39: 1, 40: 1 };

function preventDefault(e) {
    e.preventDefault();
}

function preventDefaultForScrollKeys(e) {
    if (keys[e.keyCode]) {
        preventDefault(e);
        return false;
    }
}

function disableUserScroll() {
    window.addEventListener("wheel", preventDefault, { passive: false });
    window.addEventListener("touchmove", preventDefault, { passive: false });
    window.addEventListener("keydown", preventDefaultForScrollKeys, {
        passive: false,
    });
}

function enableUserScroll() {
    window.removeEventListener("wheel", preventDefault);
    window.removeEventListener("touchmove", preventDefault);
    window.removeEventListener("keydown", preventDefaultForScrollKeys);
}

function smoothScrollTo(element) {
    if (!element) return;

    disableUserScroll();

    const onScrollEnd = () => {
        enableUserScroll();
        window.removeEventListener("scrollend", onScrollEnd);
    };

    window.addEventListener("scrollend", onScrollEnd);
    element.scrollIntoView({ behavior: "smooth" });

    setTimeout(() => {
        enableUserScroll();
        window.removeEventListener("scrollend", onScrollEnd);
    }, 2000);
}

async function loadMarkdown() {
    const loader = document.getElementById("loader");
    const displayDiv = document.getElementById("content");

    try {
        const response = await fetch("README.md");
        const text = await response.text();
        const html = marked.parse(text);
        displayDiv.innerHTML = DOMPurify.sanitize(html);

        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener("click", function (e) {
                e.preventDefault();
                const targetId = this.getAttribute("href");
                const targetElement = [
                    ...document.getElementsByTagName("h2"),
                    ...document.getElementsByTagName("h3"),
                ].find(
                    (element) =>
                        element.innerHTML.toLowerCase().replace(/\s+/g, "") ===
                        anchor.innerHTML.toLowerCase().replace(/\s+/g, ""),
                );

                if (targetElement) {
                    history.pushState(null, null, targetId);
                    smoothScrollTo(targetElement);
                }
            });
        });

        if (window.location.hash) {
            setTimeout(() => {
                const target = document.querySelector(window.location.hash);
                if (target) smoothScrollTo(target);
            }, 100);
        }
    } catch (error) {
        displayDiv.innerHTML = `<p class="error">Error: ${error.message}</p>`;
    } finally {
        loader.classList.add("hidden");
    }
}

window.addEventListener("hashchange", () => {
    const targetId = window.location.hash;
    if (targetId) {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            smoothScrollTo(targetElement);
        }
    }
});

window.onload = loadMarkdown;
