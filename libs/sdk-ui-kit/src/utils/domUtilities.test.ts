// (C) 2020-2026 GoodData Corporation

import { afterEach, describe, expect, it, vi } from "vitest";

import { type IRegion } from "../typings/domUtilities.js";

import { getFocusableElements, isElementTextInput, region, removeFromDom } from "./domUtilities.js";

interface IConfig {
    height: number;
    left: number;
    top: number;
    width: number;
}

describe("region", () => {
    const createMockElement = (config: IConfig, parentItemRegion?: IRegion): HTMLElement => {
        return {
            offsetHeight: config.height,
            offsetWidth: config.width,
            getBoundingClientRect() {
                return {
                    top: config.top + (parentItemRegion?.top ?? 0),
                    left: config.left + (parentItemRegion?.left ?? 0),
                };
            },
        } as HTMLElement;
    };

    const createMockForHiddenElement = (
        config: IConfig,
        boundingRect: { width: number; height: number },
    ): HTMLElement => {
        return {
            offsetHeight: config.height,
            offsetWidth: config.width,
            getBoundingClientRect() {
                return {
                    top: config.top,
                    left: config.left,
                    width: boundingRect.width || config.width,
                    height: boundingRect.height || config.height,
                };
            },
        } as HTMLElement;
    };

    function createMockWindow() {
        return {
            pageXOffset: 50,
            pageYOffset: 100,
        } as Window & typeof globalThis;
    }

    it("should get node region", () => {
        const t1 = createMockElement({
            left: 40,
            top: 60,
            width: 200,
            height: 40,
        });

        const t1reg = region(t1);
        expect(t1reg).toEqual({
            left: 40,
            top: 60,
            width: 200,
            height: 40,
            bottom: 100,
            right: 240,
        });

        const t2 = createMockElement(
            {
                left: 5,
                top: 10,
                width: 100,
                height: 20,
            },
            t1reg,
        );

        const t2reg = region(t2);
        expect(t2reg).toEqual({
            left: 45,
            top: 70,
            width: 100,
            height: 20,
            bottom: 90,
            right: 145,
        });
    });

    it("should get node region from boundingRect when width/height is zero", () => {
        const element = createMockForHiddenElement(
            {
                left: 40,
                top: 60,
                width: 0,
                height: 0,
            },
            {
                width: 200,
                height: 40,
            },
        );

        const elementRegion = region(element);
        expect(elementRegion).toEqual({
            left: 40,
            top: 60,
            width: 200,
            height: 40,
            bottom: 100,
            right: 240,
        });
    });

    it("should get node region with window offset", () => {
        const t = createMockElement({
            left: 40,
            top: 60,
            width: 200,
            height: 40,
        });

        const treg = region(t, false, createMockWindow());
        expect(treg).toEqual({
            left: 90,
            top: 160,
            width: 200,
            height: 40,
            bottom: 200,
            right: 290,
        });
    });

    it("should get node region without window offset", () => {
        const t = createMockElement({
            left: 40,
            top: 60,
            width: 200,
            height: 40,
        });

        const treg = region(t, true, createMockWindow());
        expect(treg).toEqual({
            left: 40,
            top: 60,
            width: 200,
            height: 40,
            bottom: 100,
            right: 240,
        });
    });
});

describe("removeFromDom", () => {
    it("should not fail with falsy argument", () => {
        expect(() => removeFromDom(null)).not.toThrow();
    });

    it("should not fail when element is not in DOM", () => {
        const elem = document.createElement("div");
        expect(() => removeFromDom(elem)).not.toThrow();
    });

    it("should properly remove the element from DOM", () => {
        const elem = document.createElement("div");
        document.body.appendChild(elem);
        expect(document.body.children).toContain(elem);
        removeFromDom(elem);
        expect(document.body.children).not.toContain(elem);
    });
});

describe("isElementTextInput", () => {
    // The suite runs with `isolate: false`, so anything left in the document leaks into later files.
    const mounted: HTMLElement[] = [];

    afterEach(() => {
        mounted.splice(0).forEach((host) => host.remove());
    });

    function mount(html: string) {
        const host = document.createElement("div");
        host.innerHTML = html;
        document.body.appendChild(host);
        mounted.push(host);
        return host;
    }

    it.each([
        ["a text input", '<input type="text" />', true],
        ["a number input", '<input type="number" />', true],
        ["a textarea", "<textarea></textarea>", true],
        ["a checkbox", '<input type="checkbox" />', false],
        ["a button", "<button></button>", false],
        ["a plain div", "<div></div>", false],
    ])("reports %s as %s", (_name, html, expected) => {
        const element = mount(html).firstElementChild as HTMLElement;

        expect(isElementTextInput(element)).toBe(expected);
    });

    it("reports a contenteditable host as text input", () => {
        const element = mount('<div contenteditable="true"></div>').firstElementChild as HTMLElement;

        expect(isElementTextInput(element)).toBe(true);
    });

    it("reports a descendant of a contenteditable host as text input", () => {
        // The caret in a rich text editor lands on an inner node, not on the editable host itself.
        const host = mount('<div contenteditable="true"><span class="line">text</span></div>');

        expect(isElementTextInput(host.querySelector(".line"))).toBe(true);
    });

    it("does not report a read-only contenteditable as text input", () => {
        const element = mount('<div contenteditable="false"></div>').firstElementChild as HTMLElement;

        expect(isElementTextInput(element)).toBe(false);
    });

    it("does not report a non-editable island inside a contenteditable host as text input", () => {
        const host = mount(
            '<div contenteditable="true"><div contenteditable="false"><button class="widget"></button></div></div>',
        );

        expect(isElementTextInput(host.querySelector(".widget"))).toBe(false);
    });

    it("handles missing elements and non-elements", () => {
        expect(isElementTextInput(null)).toBe(false);
        expect(isElementTextInput(undefined)).toBe(false);
        expect(isElementTextInput({} as EventTarget)).toBe(false);
    });
});

describe("getFocusableElements", () => {
    // The suite runs with `isolate: false`, so anything left in the document leaks into later files.
    const mounted: HTMLElement[] = [];

    afterEach(() => {
        mounted.splice(0).forEach((host) => host.remove());
    });

    function focusableIds(html: string): string[] {
        const host = document.createElement("div");
        host.innerHTML = html;
        document.body.appendChild(host);
        mounted.push(host);

        return getFocusableElements(host).focusableElements.map((element) => element.id);
    }

    it("includes an editing host without tabindex although it reports a negative tabIndex", () => {
        const host = document.createElement("div");
        host.setAttribute("contenteditable", "true");

        // the browser value the fallback exists for
        expect(host.tabIndex).toBe(-1);
        expect(focusableIds('<div id="editor" contenteditable="true"></div>')).toEqual(["editor"]);
    });

    it.each([
        ["an empty value", '<div id="editor" contenteditable=""></div>'],
        ["plaintext-only", '<div id="editor" contenteditable="plaintext-only"></div>'],
        ["an uppercase keyword", '<div id="editor" contenteditable="TRUE"></div>'],
    ])("includes an editing host set with %s", (_name, html) => {
        expect(focusableIds(html)).toEqual(["editor"]);
    });

    it.each([
        ["an explicit negative tabindex", '<div id="editor" contenteditable="true" tabindex="-1"></div>'],
        ['contenteditable="false"', '<div id="editor" contenteditable="false"></div>'],
        ['contenteditable="FALSE"', '<div id="editor" contenteditable="FALSE"></div>'],
        ["an unknown value, which inherits", '<div id="editor" contenteditable="inherit"></div>'],
        ["an inert ancestor", '<div inert><div id="editor" contenteditable="true"></div></div>'],
    ])("excludes an editable element with %s", (_name, html) => {
        expect(focusableIds(html)).toEqual([]);
    });

    it("includes only the outer host, not an editable element nested in it", () => {
        expect(
            focusableIds(
                '<div id="editor" contenteditable="true"><p id="inner" contenteditable="true"></p></div>',
            ),
        ).toEqual(["editor"]);
    });

    it("includes an editable island inside a non-editable widget as a host of its own", () => {
        expect(
            focusableIds(
                '<div id="editor" contenteditable="true"><div contenteditable="false">' +
                    '<span id="island" contenteditable="true"></span></div></div>',
            ),
        ).toEqual(["editor", "island"]);
    });

    it("excludes other controls in an inert subtree", () => {
        expect(
            focusableIds('<button id="first"></button><div inert><button id="second"></button></div>'),
        ).toEqual(["first"]);
    });

    describe("inside a dialog under an inert ancestor", () => {
        afterEach(() => {
            vi.restoreAllMocks();
        });

        /**
         * Mounts `<div inert><dialog>{content}</dialog></div>`, opens the dialog and returns the ids
         * getFocusableElements finds in it.
         */
        function focusableIdsInDialog(content: string, open: "modal" | "nonModal", dialogAttributes = "") {
            const host = document.createElement("div");
            host.innerHTML = `<div inert><dialog ${dialogAttributes}>${content}</dialog></div>`;
            document.body.appendChild(host);
            mounted.push(host);

            const dialog = host.querySelector("dialog")!;
            if (open === "modal") {
                dialog.showModal();
                // The test DOM opens the dialog modally but does not match :modal, as browsers do.
                const matches = dialog.matches.bind(dialog);
                vi.spyOn(dialog, "matches").mockImplementation(
                    (selector) => selector === ":modal" || matches(selector),
                );
            } else {
                dialog.show();
            }

            return getFocusableElements(dialog).focusableElements.map((element) => element.id);
        }

        it("includes the controls of a modal dialog, which escapes the inert ancestor", () => {
            expect(
                focusableIdsInDialog(
                    '<button id="button"></button><div id="editor" contenteditable="true"></div>',
                    "modal",
                ),
            ).toEqual(["button", "editor"]);
        });

        it("excludes the controls of a non-modal dialog, which stays inert", () => {
            expect(focusableIdsInDialog('<button id="button"></button>', "nonModal")).toEqual([]);
        });

        it("excludes the controls of a modal dialog that is inert itself", () => {
            expect(focusableIdsInDialog('<button id="button"></button>', "modal", "inert")).toEqual([]);
        });

        it("excludes the controls of an inert subtree inside a modal dialog", () => {
            expect(
                focusableIdsInDialog(
                    '<button id="outside"></button><div inert><button id="inside"></button></div>',
                    "modal",
                ),
            ).toEqual(["outside"]);
        });
    });
});
