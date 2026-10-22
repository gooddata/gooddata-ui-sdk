// (C) 2026 GoodData Corporation

import { initSidebarCollapse } from "./sidebar-collapse.js";

export function initSidebar() {
    const sidebar = document.getElementById("sidebar");
    const backdrop = document.getElementById("sidebar-backdrop");
    const sidebarToggle = document.getElementById("sidebar-toggle");

    // The sidebar always renders scrolled to the top, so on a long section the link
    // for the page you just opened can sit well below the fold — the reader lands on
    // the page with no idea where they are in the tree. Bring it into view.
    function revealCurrentItem() {
        if (!sidebar || sidebar.scrollHeight <= sidebar.clientHeight) return;
        // The deepest match wins, because ancestors are current too.
        let active = null;
        sidebar.querySelectorAll('[aria-current="page"]').forEach((link) => {
            if (link.offsetParent) active = link;
        });
        if (!active) return;
        const box = sidebar.getBoundingClientRect();
        const item = active.getBoundingClientRect();
        if (item.top >= box.top && item.bottom <= box.bottom) return;
        const centred = item.top - box.top - (sidebar.clientHeight - item.height) / 2;
        sidebar.scrollTop = Math.max(0, sidebar.scrollTop + centred);
    }

    function isSidebarOpen() {
        return sidebar && !sidebar.classList.contains("-translate-x-full");
    }

    // Below lg the panel is the off-canvas drawer; at lg and up the same element is
    // the always-visible desktop sidebar, so drawer-only behaviour must be gated.
    const drawerBreakpoint = window.matchMedia("(width < 64rem)");

    // The drawer sits off-canvas but stays in the document, so while it is closed
    // its ~140 links would otherwise still take tab stops and be announced by
    // screen readers ahead of the page content.
    function syncDrawerInert() {
        if (!sidebar) return;
        if (drawerBreakpoint.matches && !isSidebarOpen()) {
            sidebar.setAttribute("inert", "");
        } else {
            sidebar.removeAttribute("inert");
        }
    }

    // The sidebar's top edge must sit exactly where the sticky chrome (strip +
    // header, #site-chrome) ends: any higher and its opaque panel paints over the
    // chrome, any lower and the list starts with a band of dead space. The chrome's
    // height depends on viewport width (the strip's links wrap, the header's
    // controls are 44px), so the CSS values on the sidebar are only a fallback.
    //   - Desktop: the sidebar is sticky, so it needs the chrome's own height —
    //     that is where the chrome sits once the page has scrolled — and its
    //     viewport-relative height follows from the same number.
    //   - Drawer (below lg): fixed to the viewport and opened with page scroll
    //     locked, so the chrome's current bottom edge (which includes a version
    //     banner still in view at the top of the page) is exact for as long as it
    //     is visible. Measured on every open.
    function alignDrawerBelowHeader() {
        const chrome = document.getElementById("site-chrome") || document.querySelector("header");
        if (!chrome) return;
        const h = Math.round(chrome.offsetHeight);
        // Also read by the headings' scroll-margin-top (main.css.tmpl) and the TOC scrollspy.
        document.documentElement.style.setProperty("--gd-chrome-h", `${h}px`);
        if (!sidebar) return;
        if (drawerBreakpoint.matches) {
            sidebar.style.top = `${Math.max(0, Math.round(chrome.getBoundingClientRect().bottom))}px`;
            sidebar.style.height = "";
            return;
        }
        sidebar.style.top = `${h}px`;
        sidebar.style.height = `calc(100vh - ${h}px)`;
    }
    alignDrawerBelowHeader();
    window.addEventListener("resize", alignDrawerBelowHeader);

    // Without this the page keeps scrolling under an open drawer, so closing it
    // drops the reader somewhere they never chose. Inline styles rather than a
    // utility class: Tailwind only sees classes present in the rendered HTML, so a
    // class added from JS would never be compiled.
    //
    // Only the root element. Adding overflow:hidden to <body> as well makes body a
    // scroll container, and the sticky header then sticks to *body's* scrollport
    // instead of the viewport — its own scrollTop is 0, so on a scrolled page the
    // header jumped back to its static offset and disappeared off-screen.
    // documentElement alone already blocks viewport scrolling.
    function lockPageScroll(locked) {
        document.documentElement.style.overflow = locked ? "hidden" : "";
    }

    function openSidebar() {
        // Before revealCurrentItem, which measures against the panel's scroll box.
        alignDrawerBelowHeader();
        sidebar?.classList.remove("-translate-x-full");
        backdrop?.classList.remove("hidden");
        lockPageScroll(true);
        // Before focusing: focus() is a no-op inside an inert subtree.
        syncDrawerInert();
        const firstLink = sidebar?.querySelector("a");
        // preventScroll: plain focus() yanks the panel back to the top and undoes the reveal.
        firstLink?.focus({ preventScroll: true });
        revealCurrentItem();
    }

    function closeSidebar() {
        sidebar?.classList.add("-translate-x-full");
        backdrop?.classList.add("hidden");
        lockPageScroll(false);
        sidebarToggle?.focus();
        // After focus moves out: inert would otherwise blur the element being focused.
        syncDrawerInert();
    }

    // Resizing across lg with the drawer left open would strand the scroll lock and
    // the inert attribute in the wrong state for the new layout.
    drawerBreakpoint.addEventListener("change", () => {
        if (!drawerBreakpoint.matches) {
            sidebar?.classList.add("-translate-x-full");
            backdrop?.classList.add("hidden");
            lockPageScroll(false);
        }
        alignDrawerBelowHeader();
        syncDrawerInert();
    });

    sidebarToggle?.addEventListener("click", () => {
        isSidebarOpen() ? closeSidebar() : openSidebar();
    });
    backdrop?.addEventListener("click", closeSidebar);

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && isSidebarOpen()) {
            closeSidebar();
        }
        if (e.key === "Tab" && isSidebarOpen() && sidebar) {
            const focusable = sidebar.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
            if (!focusable.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    });

    alignDrawerBelowHeader();
    syncDrawerInert();

    // Before revealCurrentItem: a folded section changes where the current link sits.
    initSidebarCollapse(sidebar);

    // After first paint, so the nav has its final laid-out heights.
    requestAnimationFrame(revealCurrentItem);
}
