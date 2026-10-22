// (C) 2026 GoodData Corporation

import assert from "node:assert/strict";
import test from "node:test";

import { initDisclosure, isOpen, setOpen } from "../assets/js/disclosure.js";

// Just enough of Element for setOpen/isOpen: a class set and an attribute map.
const fakeEl = (...initial) => {
    const classes = new Set(initial);
    const attrs = new Map();
    return {
        classes,
        classList: {
            toggle: (name, force) => (force ? classes.add(name) : classes.delete(name), force),
            contains: (name) => classes.has(name),
        },
        setAttribute: (name, value) => attrs.set(name, String(value)),
        getAttribute: (name) => attrs.get(name) ?? null,
    };
};

test("setOpen(true) swaps closed classes for open ones and sets aria-expanded", () => {
    const toggle = fakeEl();
    const panel = fakeEl("hidden");
    setOpen(toggle, panel, true, { open: ["flex"], closed: ["hidden"] });
    assert.deepEqual([...panel.classes], ["flex"]);
    assert.equal(toggle.getAttribute("aria-expanded"), "true");
    assert.equal(isOpen(toggle), true);
});

test("setOpen(false) restores closed classes", () => {
    const toggle = fakeEl();
    const panel = fakeEl("flex");
    setOpen(toggle, panel, false, { open: ["flex"], closed: ["hidden"] });
    assert.deepEqual([...panel.classes], ["hidden"]);
    assert.equal(toggle.getAttribute("aria-expanded"), "false");
    assert.equal(isOpen(toggle), false);
});

test("open-only classes: the topbar menu toggles a single is-open class", () => {
    const toggle = fakeEl();
    const panel = fakeEl("gd-header-links");
    setOpen(toggle, panel, true, { open: ["is-open"] });
    assert.ok(panel.classes.has("is-open") && panel.classes.has("gd-header-links"));
    setOpen(toggle, panel, false, { open: ["is-open"] });
    assert.deepEqual([...panel.classes], ["gd-header-links"]);
});

test("isOpen is false before the attribute is ever set", () => {
    assert.equal(isOpen(fakeEl()), false);
});

// The page has two disclosures (the top strip's hamburger and the header's kebab). A click
// bubbles from the target to document unless a handler stops it; this fake does the same.
const fakeDom = () => {
    const docHandlers = [];
    globalThis.document = { addEventListener: (type, fn) => docHandlers.push({ type, fn }) };
    const node = (...classes) => {
        const el = fakeEl(...classes);
        const handlers = [];
        el.addEventListener = (type, fn) => handlers.push({ type, fn });
        el.contains = (other) => other === el;
        el.querySelector = () => null;
        el.focus = () => {};
        el.fire = (type, event) => handlers.filter((h) => h.type === type).forEach((h) => h.fn(event));
        el.click = () => {
            const event = { target: el, stopped: false, stopPropagation: () => (event.stopped = true) };
            handlers.filter((h) => h.type === "click").forEach((h) => h.fn(event));
            if (!event.stopped) docHandlers.filter((h) => h.type === "click").forEach((h) => h.fn(event));
        };
        return el;
    };
    return { node };
};

test("opening one disclosure closes the other", () => {
    const { node } = fakeDom();
    const [menuToggle, menu] = [node(), node("gd-header-links")];
    const [toolsToggle, tools] = [node(), node("hidden")];
    initDisclosure(menuToggle, menu, { open: ["is-open"] });
    initDisclosure(toolsToggle, tools, { open: ["flex"], closed: ["hidden"] });

    menuToggle.click();
    assert.equal(isOpen(menuToggle), true);
    toolsToggle.click();
    assert.equal(isOpen(toolsToggle), true);
    assert.equal(isOpen(menuToggle), false, "the hamburger menu should close when the kebab opens");
    assert.ok(!menu.classes.has("is-open"));
    delete globalThis.document;
});

// Below lg the open hamburger panel covers everything under the first row, so Tab past its last
// link would put focus on controls the reader cannot see (WCAG 2.4.11). Focus leaving to a real
// element outside closes it. A null relatedTarget (Safari does not focus clicked buttons) must
// not: the outside-click handler covers that case, and closing on mousedown would eat the click.
test("focus moving out of the open panel closes it; focus moving nowhere does not", (t) => {
    const { node } = fakeDom();
    t.after(() => delete globalThis.document);
    const [toggle, panel, lastLink, outside] = [node(), node("gd-header-links"), node(), node()];
    panel.contains = (other) => other === panel || other === lastLink;
    initDisclosure(toggle, panel, { open: ["is-open"] });

    toggle.click();
    panel.fire("focusout", { target: lastLink, relatedTarget: null });
    assert.equal(isOpen(toggle), true, "a blur to nowhere keeps the panel open");
    panel.fire("focusout", { target: lastLink, relatedTarget: toggle });
    assert.equal(isOpen(toggle), true, "Shift+Tab back to the toggle keeps the panel open");
    panel.fire("focusout", { target: lastLink, relatedTarget: outside });
    assert.equal(isOpen(toggle), false, "Tab past the last link closes the panel");
});
