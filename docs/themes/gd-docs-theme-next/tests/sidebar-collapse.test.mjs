// (C) 2026 GoodData Corporation

import assert from "node:assert/strict";
import test from "node:test";

import { JSDOM } from "jsdom";

import { initSidebarCollapse } from "../assets/js/sidebar-collapse.js";

/*
 * The sidebar's sections start open on every page load. Clicking a section
 * header that is the current page folds the section instead of reloading it;
 * the chevron folds or unfolds without leaving the page. Folds are not
 * remembered across page loads.
 */

// The markup sidebar-tree.html renders for one section: a header row with the
// link and the chevron, then the panel the chevron controls.
function section(key, title, { current = false, location = false, children = "" } = {}) {
    const id = `nav-${title.toLowerCase()}`;
    const mark = current ? ' aria-current="page"' : location ? ' aria-current="location"' : "";
    return `<div data-nav-section="${key}">
  <div class="relative mt-6 mb-2">
    <a href="${key}" data-nav-link class="gd-nav-link gd-nav-group"${mark}>${title}</a>
    <button type="button" data-nav-toggle aria-controls="${id}" aria-expanded="true">v</button>
  </div>
  <div id="${id}" data-nav-panel class="ml-2">${children}</div>
</div>`;
}

const link = (href, current = false) =>
    `<a href="${href}" class="gd-nav-link"${current ? ' aria-current="page"' : ""}>p</a>`;

function mount(html) {
    const dom = new JSDOM(`<nav id="nav">${html}</nav>`, { url: "https://example.com/latest/" });
    const { window } = dom;
    window.localStorage.setItem("gd-nav-collapsed", JSON.stringify(["/a/", "/b/"]));
    const nav = window.document.getElementById("nav");
    const parts = (key) => {
        const s = nav.querySelector(`[data-nav-section="${key}"]`);
        return {
            link: s.querySelector(":scope > div > [data-nav-link]"),
            toggle: s.querySelector("[data-nav-toggle]"),
            panel: s.querySelector(":scope > [data-nav-panel]"),
        };
    };
    const click = (el) => {
        const ev = new window.MouseEvent("click", { bubbles: true, cancelable: true });
        el.dispatchEvent(ev);
        return ev.defaultPrevented;
    };
    const isOpen = (key) => {
        const p = parts(key);
        const open = !p.panel.classList.contains("hidden");
        assert.equal(
            p.toggle.getAttribute("aria-expanded"),
            String(open),
            `${key}: aria-expanded tracks the panel`,
        );
        return open;
    };
    return { window, nav, parts, click, isOpen };
}

test("everything starts open, even with a fold list left in storage by an older version", () => {
    const t = mount(section("/a/", "A", { children: link("/a/x/") }) + section("/b/", "B"));
    initSidebarCollapse(t.nav);
    assert.equal(t.isOpen("/a/"), true);
    assert.equal(t.isOpen("/b/"), true);
});

test("the chevron folds and unfolds the section without navigating", () => {
    const t = mount(section("/a/", "A", { children: link("/a/x/") }));
    initSidebarCollapse(t.nav);
    assert.equal(t.click(t.parts("/a/").toggle), true, "the button click is consumed");
    assert.equal(t.isOpen("/a/"), false);
    t.click(t.parts("/a/").toggle);
    assert.equal(t.isOpen("/a/"), true);
});

test("folding writes nothing to storage", () => {
    const t = mount(section("/a/", "A", { children: link("/a/x/") }));
    t.window.localStorage.clear();
    initSidebarCollapse(t.nav);
    t.click(t.parts("/a/").toggle);
    assert.equal(t.window.localStorage.length, 0);
});

test("clicking the header of the section you are on folds it instead of reloading", () => {
    const t = mount(section("/a/", "A", { current: true, children: link("/a/x/") }));
    initSidebarCollapse(t.nav);
    assert.equal(t.click(t.parts("/a/").link), true, "navigation is prevented");
    assert.equal(t.isOpen("/a/"), false);
    assert.equal(t.click(t.parts("/a/").link), true);
    assert.equal(t.isOpen("/a/"), true);
});

test("clicking the header of the section you are inside (but not on) is a plain navigation", () => {
    const t = mount(section("/a/", "A", { location: true, children: link("/a/x/", true) }));
    initSidebarCollapse(t.nav);
    assert.equal(t.click(t.parts("/a/").link), false, "the overview is a different page, so go there");
    assert.equal(t.isOpen("/a/"), true);
});

test("clicking the header of another section is a plain navigation", () => {
    const t = mount(section("/a/", "A", { children: link("/a/x/") }));
    initSidebarCollapse(t.nav);
    assert.equal(t.click(t.parts("/a/").link), false, "the link keeps its default");
    assert.equal(t.isOpen("/a/"), true);
});

test("nested sections fold independently of their parent", () => {
    const inner = section("/a/n/", "N", { children: link("/a/n/x/") });
    const t = mount(section("/a/", "A", { children: link("/a/x/") + inner }));
    initSidebarCollapse(t.nav);
    t.click(t.parts("/a/n/").toggle);
    assert.equal(t.isOpen("/a/n/"), false);
    assert.equal(t.isOpen("/a/"), true, "folding the child leaves the parent alone");
    t.click(t.parts("/a/").toggle);
    assert.equal(t.isOpen("/a/"), false);
    assert.equal(t.isOpen("/a/n/"), false, "the child keeps its own state inside a folded parent");
});
