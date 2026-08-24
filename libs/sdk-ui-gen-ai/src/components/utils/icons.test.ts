// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { getIconByObject } from "./icons.js";

describe("getIconByObject", () => {
    it.each([
        ["local:bar", "visualizationBar"],
        ["local:combo2", "visualizationCombo"],
        ["local:tablenext", "visualizationTable"],
    ])("shows the chart type of %s", (visualizationUrl, expected) => {
        expect(getIconByObject({ type: "visualization", visualizationUrl }).iconBefore).toBe(expected);
    });

    it.each([
        ["an unknown chart type", "local:mekko"],
        ["a visualization of unknown type", undefined],
        ["a type named after something on Object.prototype", "local:constructor"],
    ])("falls back to the generic icon for %s", (_case, visualizationUrl) => {
        expect(getIconByObject({ type: "widget", visualizationUrl }).iconBefore).toBe("visualization");
    });
});
