// (C) 2007-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { isEditableElement } from "./domUtilities.js";

describe("isEditableElement", () => {
    it("returns false for null", () => {
        expect(isEditableElement(null)).toBe(false);
    });

    it("returns false for a non-HTMLElement target", () => {
        expect(isEditableElement(window)).toBe(false);
    });

    it("returns true for an input element", () => {
        expect(isEditableElement(document.createElement("input"))).toBe(true);
    });

    it("returns true for a textarea element", () => {
        expect(isEditableElement(document.createElement("textarea"))).toBe(true);
    });

    it("returns true for a contentEditable element", () => {
        const div = document.createElement("div");
        div.contentEditable = "true";
        expect(isEditableElement(div)).toBe(true);
    });

    it("returns false for a plain div", () => {
        expect(isEditableElement(document.createElement("div"))).toBe(false);
    });
});
