// (C) 2026 GoodData Corporation

// Foldable sidebar sections. sidebar-tree.html renders a section with several
// pages as
//
//   <div data-nav-section="/…/section/">
//     <div> <a data-nav-link href=…>Title</a> <button data-nav-toggle aria-controls=…> </div>
//     <div id=… data-nav-panel> …pages, nested sections… </div>
//   </div>
//
// Every section starts open on every page load. The chevron folds or unfolds it
// without leaving the page; the header link navigates to the section's
// overview, except when that is the page already open, where a second click
// folds the section instead of reloading it. Folds are not remembered: the next
// page starts with the whole tree open again.

function parts(section) {
    return {
        key: section.getAttribute("data-nav-section"),
        link: section.querySelector(":scope > div > [data-nav-link]"),
        toggle: section.querySelector(":scope > div > [data-nav-toggle]"),
        panel: section.querySelector(":scope > [data-nav-panel]"),
    };
}

function setOpen({ toggle, panel }, open) {
    panel.classList.toggle("hidden", !open);
    toggle.setAttribute("aria-expanded", String(open));
}

function sections(root) {
    return [...root.querySelectorAll("[data-nav-section]")]
        .map(parts)
        .filter((s) => s.key && s.toggle && s.panel);
}

export function initSidebarCollapse(root) {
    if (!root) return;

    const flip = (s) => setOpen(s, s.toggle.getAttribute("aria-expanded") !== "true");

    for (const s of sections(root)) {
        s.toggle.addEventListener("click", (e) => {
            e.preventDefault();
            flip(s);
        });
        s.link?.addEventListener("click", (e) => {
            if (s.link.getAttribute("aria-current") !== "page") return;
            e.preventDefault();
            flip(s);
        });
    }
}
