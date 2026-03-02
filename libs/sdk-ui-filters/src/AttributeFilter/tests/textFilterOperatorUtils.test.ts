// (C) 2007-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { resolveValuesOnTextOperatorChange } from "../textFilterOperatorUtils.js";

describe("resolveValuesOnTextOperatorChange", () => {
    it("resets values when switching from arbitrary to match operator", () => {
        expect(resolveValuesOnTextOperatorChange("contains", "is", ["Berlin", "Prague"], "")).toEqual({
            values: [],
            literal: "",
        });
    });

    it("resets values when switching from match to arbitrary operator", () => {
        expect(resolveValuesOnTextOperatorChange("is", "startsWith", [], "Bos")).toEqual({
            values: [],
            literal: "",
        });
    });

    it("keeps values when switching within arbitrary operators (is ↔ isNot)", () => {
        expect(resolveValuesOnTextOperatorChange("isNot", "is", ["Berlin", "Prague"], "")).toEqual({
            values: ["Berlin", "Prague"],
            literal: "",
        });
    });

    it("keeps literal when switching within match operators", () => {
        expect(resolveValuesOnTextOperatorChange("endsWith", "contains", [], "on")).toEqual({
            values: [],
            literal: "on",
        });
    });
});
