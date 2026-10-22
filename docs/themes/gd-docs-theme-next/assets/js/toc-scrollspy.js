// (C) 2026 GoodData Corporation

export function computeActive(entries, offset) {
    let current = null;
    for (const { heading, link } of entries) {
        if (heading.getBoundingClientRect().top <= offset) current = link;
        else break;
    }
    return current;
}
// Headings land at the chrome height + 0.5rem (scroll-margin-top in main.css.tmpl, fed by
// --gd-chrome-h from sidebar.js); count a heading active from 10px under that, so one jumped to
// via the TOC is highlighted. 152 = the CSS fallback 9.5rem, for pages where nothing measured.
export function activeOffset(chromeHeight) {
    return (chromeHeight > 0 ? chromeHeight : 152) + 18;
}
export function initTocScrollspy() {
    // The desktop TOC (toc.html). The mobile copy isn't tracked: it is collapsed while you scroll.
    const links = document.querySelectorAll('[data-toc] a[href^="#"]');
    if (!links.length) return;
    const entries = [];
    links.forEach((link) => {
        const id = decodeURIComponent(link.getAttribute("href").slice(1));
        const target = document.getElementById(id);
        if (target) entries.push({ heading: target, link });
    });
    let active = null,
        ticking = false;
    const update = () => {
        const chromeH = parseFloat(
            getComputedStyle(document.documentElement).getPropertyValue("--gd-chrome-h"),
        );
        const cur = computeActive(entries, activeOffset(chromeH));
        if (cur === active) return;
        active && active.classList.remove("toc-active");
        cur && cur.classList.add("toc-active");
        active = cur;
    };
    document.addEventListener(
        "scroll",
        () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    update();
                    ticking = false;
                });
                ticking = true;
            }
        },
        { passive: true },
    );
    update();
}
