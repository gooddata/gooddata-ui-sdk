// (C) 2026 GoodData Corporation

// A link icon after every anchored heading in the page content. It shows on hover (main.css.tmpl:
// .gd-heading-anchor), and a click copies the page URL with the heading's #anchor. Added here, not
// in a heading render hook, because the API reference builds its member headings as strings
// (api-member-sections.html) and a hook would miss them. It is a real <a href="#id">, so without
// the clipboard (or with a modifier key) it still works as a plain section link.

const linkIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';
const checkIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';

const LABEL = "Copy link to this section";

// The URL a reader shares: this page, no query string, the heading's anchor.
export function headingUrl(location, id) {
    return `${location.origin}${location.pathname}#${encodeURIComponent(id)}`;
}

// Headings in the page content that have an id. Skips headings inside a link (a whole-card link
// would swallow the click) and headings that already have the icon.
export function anchorableHeadings(root) {
    return [...root.querySelectorAll(".prose :is(h2, h3, h4, h5, h6)[id]")].filter(
        (h) => !h.closest("a") && !h.querySelector(".gd-heading-anchor"),
    );
}

export function addHeadingAnchors(root, { clipboard, location, history } = {}) {
    anchorableHeadings(root).forEach((heading) => {
        const a = root.ownerDocument.createElement("a");
        a.className = "gd-heading-anchor";
        a.href = `#${heading.id}`;
        a.setAttribute("aria-label", LABEL);
        a.title = LABEL;
        a.innerHTML = linkIcon;

        a.addEventListener("click", async (event) => {
            if (!clipboard || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            const url = headingUrl(location, heading.id);
            history?.replaceState(null, "", url);
            try {
                await clipboard.writeText(url);
                a.innerHTML = checkIcon;
                a.setAttribute("aria-label", "Link copied");
                a.dataset.copied = "true";
            } catch {
                return;
            }
            setTimeout(() => {
                a.innerHTML = linkIcon;
                a.setAttribute("aria-label", LABEL);
                delete a.dataset.copied;
            }, 1600);
        });

        heading.appendChild(a);
    });
}

export function initHeadingAnchors() {
    const main = document.getElementById("main-content");
    if (!main) return;
    addHeadingAnchors(main, {
        clipboard: navigator.clipboard,
        location: window.location,
        history: window.history,
    });
}
