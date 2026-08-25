// (C) 2026 GoodData Corporation

// @vitest-environment node

import { type MouseEvent } from "react";

import { describe, expect, it } from "vitest";

import { isPlainLeftClick } from "./chromeHelpers.js";

function clickEvent(overrides: Partial<MouseEvent<Element>> = {}): MouseEvent<Element> {
    return {
        defaultPrevented: false,
        button: 0,
        metaKey: false,
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        ...overrides,
    } as MouseEvent<Element>;
}

describe("isPlainLeftClick", () => {
    it("accepts a left click with no modifier held", () => {
        expect(isPlainLeftClick(clickEvent())).toBe(true);
    });

    it.each([
        ["another handler already took the click", { defaultPrevented: true }],
        ["the middle button was used", { button: 1 }],
        ["the right button was used", { button: 2 }],
        ["Cmd was held", { metaKey: true }],
        ["Ctrl was held", { ctrlKey: true }],
        ["Shift was held", { shiftKey: true }],
        ["Alt was held", { altKey: true }],
    ])("returns false when %s", (_case, overrides) => {
        expect(isPlainLeftClick(clickEvent(overrides))).toBe(false);
    });
});
