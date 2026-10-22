// (C) 2026 GoodData Corporation

// Button-controlled panel: the kebab menu in the header (header-tools.js) and the
// hamburger in the top strip (topbar.html) share it. State lives in the toggle's
// aria-expanded, so CSS can style the button from the same source of truth.

export function isOpen(toggle) {
    return toggle.getAttribute("aria-expanded") === "true";
}

export function setOpen(toggle, panel, open, { open: openClasses = [], closed: closedClasses = [] } = {}) {
    openClasses.forEach((c) => panel.classList.toggle(c, open));
    closedClasses.forEach((c) => panel.classList.toggle(c, !open));
    toggle.setAttribute("aria-expanded", String(open));
}

export function initDisclosure(toggle, panel, classes) {
    if (!toggle || !panel) return;

    const open = () => {
        setOpen(toggle, panel, true, classes);
        panel.querySelector("a, button, input")?.focus();
    };
    const close = (refocus = false) => {
        setOpen(toggle, panel, false, classes);
        if (refocus) toggle.focus();
    };

    // No stopPropagation: the click has to reach the other disclosures' outside-click
    // handlers below, so opening one menu closes any other that is open.
    toggle.addEventListener("click", () => {
        isOpen(toggle) ? close() : open();
    });

    // Outside click closes (ignore clicks inside the panel or on the toggle).
    document.addEventListener("click", (e) => {
        if (!isOpen(toggle)) return;
        if (panel.contains(e.target) || toggle.contains(e.target)) return;
        close();
    });

    // Tab out of an open panel closes it: below lg the hamburger's panel covers the page, so
    // focus would otherwise move onto controls the reader cannot see. Only a real target outside
    // counts. Safari does not focus clicked buttons, so relatedTarget is null there, and closing on
    // that mousedown would swallow the click; the outside-click handler above covers those cases.
    panel.addEventListener("focusout", (e) => {
        const next = e.relatedTarget;
        if (!isOpen(toggle) || !next || panel.contains(next) || toggle.contains(next)) return;
        close();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && isOpen(toggle)) close(true);
    });
}
