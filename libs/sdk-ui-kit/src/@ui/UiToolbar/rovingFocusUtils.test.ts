// (C) 2026 GoodData Corporation

import { afterEach, describe, expect, it } from "vitest";

import {
    TOOLBAR_COMPOSITE_ATTR,
    TOOLBAR_SKIP_ATTR,
    applyRovingTabIndex,
    getStopFocusTarget,
    getToolbarStops,
    resolveStop,
} from "./rovingFocusUtils.js";

const OPTIONS = { isDisabledFocusable: true };

function mount(html: string): HTMLElement {
    document.body.innerHTML = `<div id="toolbar">${html}</div>`;
    return document.getElementById("toolbar") as HTMLElement;
}

function ids(elements: HTMLElement[]): string[] {
    return elements.map((element) => element.id);
}

describe("rovingFocusUtils", () => {
    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("lists focusable descendants in document order and skips separators, disabled and hidden items", () => {
        const container = mount(`
            <button id="a"></button>
            <div role="separator" tabindex="0"></div>
            <button id="b" disabled></button>
            <button id="c" hidden></button>
            <span><input id="d" type="text" /></span>
            <div ${TOOLBAR_SKIP_ATTR}><button id="e"></button></div>
            <button id="f"></button>
        `);

        expect(ids(getToolbarStops(container, OPTIONS))).toEqual(["a", "d", "f"]);
    });

    it("keeps aria-disabled items unless disabled items are not focusable", () => {
        const container = mount(`<button id="a" aria-disabled="true"></button><button id="b"></button>`);

        expect(ids(getToolbarStops(container, OPTIONS))).toEqual(["a", "b"]);
        expect(ids(getToolbarStops(container, { isDisabledFocusable: false }))).toEqual(["b"]);
    });

    it("collapses a composite into one stop and resolves its children to it", () => {
        const container = mount(`
            <button id="a"></button>
            <div id="group" ${TOOLBAR_COMPOSITE_ATTR}>
                <button id="r1" role="radio" aria-checked="false"></button>
                <button id="r2" role="radio" aria-checked="true"></button>
            </div>
            <button id="b"></button>
        `);

        expect(ids(getToolbarStops(container, OPTIONS))).toEqual(["a", "group", "b"]);
        expect(resolveStop(container, document.getElementById("r1"))?.id).toBe("group");
        expect(resolveStop(container, document.getElementById("a"))?.id).toBe("a");
    });

    it("focuses the checked radio of a composite unless a remembered child is inside", () => {
        const container = mount(`
            <div id="group" ${TOOLBAR_COMPOSITE_ATTR}>
                <button id="r1" role="radio" aria-checked="false"></button>
                <button id="r2" role="radio" aria-checked="true"></button>
            </div>
        `);
        const group = document.getElementById("group") as HTMLElement;

        expect(getStopFocusTarget(group, null, OPTIONS)?.id).toBe("r2");
        expect(getStopFocusTarget(group, document.getElementById("r1"), OPTIONS)?.id).toBe("r1");
        expect(getStopFocusTarget(group, container, OPTIONS)?.id).toBe("r2");
    });

    it("drops an empty composite from the stops", () => {
        const container = mount(`<div ${TOOLBAR_COMPOSITE_ATTR}></div><button id="a"></button>`);

        expect(ids(getToolbarStops(container, OPTIONS))).toEqual(["a"]);
    });

    it("gives exactly one element tabindex 0", () => {
        const container = mount(`<button id="a"></button><button id="b"></button><button id="c"></button>`);

        const target = applyRovingTabIndex(container, document.getElementById("b"), OPTIONS);

        expect(target?.id).toBe("b");
        expect(document.getElementById("a")?.tabIndex).toBe(-1);
        expect(document.getElementById("b")?.tabIndex).toBe(0);
        expect(document.getElementById("c")?.tabIndex).toBe(-1);
    });

    it("falls back to the first stop when the remembered element is gone", () => {
        const container = mount(`<button id="a"></button><button id="b"></button>`);
        const detached = document.createElement("button");

        expect(applyRovingTabIndex(container, detached, OPTIONS)?.id).toBe("a");
        expect(applyRovingTabIndex(container, null, OPTIONS)?.id).toBe("a");
    });

    it("resets the tabindex of a stop that became hidden", () => {
        const container = mount(`<button id="a"></button><button id="b"></button>`);
        const a = document.getElementById("a") as HTMLElement;

        applyRovingTabIndex(container, a, OPTIONS);
        a.setAttribute("aria-hidden", "true");
        applyRovingTabIndex(container, a, OPTIONS);

        expect(a.tabIndex).toBe(-1);
        expect(document.getElementById("b")?.tabIndex).toBe(0);
    });

    it("undoes its tabindex write when an element moves into a skipped subtree", () => {
        const container = mount(`<button id="a"></button><div id="wrap"><button id="b"></button></div>`);
        const wrap = document.getElementById("wrap") as HTMLElement;
        const b = document.getElementById("b") as HTMLElement;

        applyRovingTabIndex(container, null, OPTIONS);
        expect(b.getAttribute("tabindex")).toBe("-1");

        wrap.setAttribute(TOOLBAR_SKIP_ATTR, "");
        applyRovingTabIndex(container, null, OPTIONS);
        expect(b.hasAttribute("tabindex")).toBe(false);
    });

    it("treats every enabled contenteditable value as focusable", () => {
        const container = mount(`
            <div id="a" contenteditable=""></div>
            <div id="b" contenteditable="plaintext-only"></div>
            <div id="c" contenteditable="false"></div>
            <div id="d" contenteditable="true"></div>
        `);

        expect(ids(getToolbarStops(container, OPTIONS))).toEqual(["a", "b", "d"]);
    });

    it("returns null when nothing is focusable", () => {
        const container = mount(`<div role="separator"></div>`);

        expect(applyRovingTabIndex(container, null, OPTIONS)).toBeNull();
    });

    it("clears the tab stop when the last eligible item becomes disabled", () => {
        const container = mount(`<button id="a"></button>`);
        const a = document.getElementById("a") as HTMLElement;
        const options = { isDisabledFocusable: false };

        applyRovingTabIndex(container, a, options);
        expect(a.tabIndex).toBe(0);

        a.setAttribute("aria-disabled", "true");
        expect(applyRovingTabIndex(container, a, options)).toBeNull();
        expect(a.tabIndex).toBe(-1);
    });

    it("treats controls inside a disabled fieldset as disabled, except in its legend", () => {
        const container = mount(`
            <button id="a"></button>
            <fieldset disabled>
                <legend><button id="l"></button></legend>
                <button id="b"></button>
            </fieldset>
            <button id="c"></button>
        `);

        expect(ids(getToolbarStops(container, OPTIONS))).toEqual(["a", "l", "c"]);
    });

    it("skips items hidden by CSS on themselves or an ancestor", () => {
        const container = mount(`
            <button id="a"></button>
            <button id="b" style="display: none"></button>
            <span style="visibility: hidden"><button id="c"></button></span>
            <button id="d"></button>
        `);

        expect(ids(getToolbarStops(container, OPTIONS))).toEqual(["a", "d"]);
    });

    it("skips items inside hidden subtrees", () => {
        const container = mount(`
            <button id="a"></button>
            <div hidden><button id="b"></button></div>
            <div aria-hidden="true"><button id="c"></button></div>
            <div ${TOOLBAR_COMPOSITE_ATTR} hidden><button id="r" role="radio" aria-checked="true"></button></div>
            <button id="d"></button>
        `);

        expect(ids(getToolbarStops(container, OPTIONS))).toEqual(["a", "d"]);
    });
});
