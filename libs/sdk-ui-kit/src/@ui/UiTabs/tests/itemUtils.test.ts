// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { hasInteractiveTabActions } from "../itemUtils.js";

describe("hasInteractiveTabActions", () => {
    it("should return false when actions contain only a separator", () => {
        expect(hasInteractiveTabActions({ id: "1", label: "Tab 1", actions: [{ type: "separator" }] })).toBe(
            false,
        );
    });

    it("should return true when an interactive action survives among separators", () => {
        expect(
            hasInteractiveTabActions({
                id: "1",
                label: "Tab 1",
                actions: [{ id: "actionOne", label: "Action one" }, { type: "separator" }],
            }),
        ).toBe(true);
    });

    it("should return false when actions are empty", () => {
        expect(hasInteractiveTabActions({ id: "1", label: "Tab 1", actions: [] })).toBe(false);
    });

    it("should return false when actions are undefined", () => {
        expect(hasInteractiveTabActions({ id: "1", label: "Tab 1" })).toBe(false);
    });
});
