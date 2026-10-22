// (C) 2026 GoodData Corporation

// A link to a page's Markdown copy (<URL>index.md, the MARKDOWN output format) is a real file, so it
// keeps its .md. Any other .md link on this site is a source-file link and goes to the page's HTML
// URL. A link to another host (github.com/.../CHANGELOG.md) is left alone.
export function rewriteMdLinks(root = document) {
    const doc = root.ownerDocument || root;
    const here = doc.defaultView?.location?.host ?? "";
    root.querySelectorAll('a[href$=".md"]').forEach((a) => {
        const href = a.getAttribute("href");
        if (/(^|\/)index\.md$/.test(href)) return;
        if (/^([a-z][a-z0-9+.-]*:|\/\/)/i.test(href) && a.host !== here) return;
        a.setAttribute("href", href.replace(/\.md$/, "/"));
    });
}
export function initContentFixup() {
    rewriteMdLinks(document.querySelector("main") || document);
}
