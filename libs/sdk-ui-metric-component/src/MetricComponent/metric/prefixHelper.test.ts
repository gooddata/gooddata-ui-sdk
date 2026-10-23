// (C) 2007-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { type IMeasureDef } from "./metricHelpers.js";
import { addPrefixToId, addPrefixToMeasure, hasDefinedPrefix, removePrefixFromId } from "./prefixHelper.js";

it("hasDefinedPrefix", () => {
    expect(hasDefinedPrefix("", "metricId")).toBe(false);
    expect(hasDefinedPrefix("", "prefix.metricId")).toBe(false);
    expect(hasDefinedPrefix("prefix.", "metricId")).toBe(false);
    expect(hasDefinedPrefix("prefix.", "prefix.metricId")).toBe(true);
    expect(hasDefinedPrefix("prefix.", ".prefix.metricId")).toBe(false);
});

it("removePrefixFromId", () => {
    expect(removePrefixFromId("", "metricId")).toBe("metricId");
    expect(removePrefixFromId("", "prefix.metricId")).toBe("prefix.metricId");
    expect(removePrefixFromId("prefix.", "metricId")).toBe("metricId");
    expect(removePrefixFromId("prefix.", "prefix.metricId")).toBe("metricId");
    expect(removePrefixFromId("prefix.", ".prefix.metricId")).toBe(".prefix.metricId");
});

it("addPrefixToId", () => {
    expect(addPrefixToId("", "metricId")).toBe("metricId");
    expect(addPrefixToId("prefix.", "metricId")).toBe("prefix.metricId");
});

describe("addPrefixToMeasure", () => {
    const measure: IMeasureDef = {
        id: "metricId",
        title: "Title",
        description: "Description",
        format: "format",
        expression: "SELECT 1",
        type: "measure",
    };

    it("no prefix defined at all", () => {
        expect(addPrefixToMeasure({ ...measure }, "")).toEqual({
            ...measure,
            id: "metricId",
        });
    });

    it("prefix defined and measure has id without prefix", () => {
        expect(addPrefixToMeasure({ ...measure }, "prefix.")).toEqual({
            ...measure,
            id: "metricId",
        });
    });

    it("prefix defined and measure has id with prefix", () => {
        expect(addPrefixToMeasure({ ...measure, id: "prefix.metricId" }, "prefix.")).toEqual({
            ...measure,
            id: "metricId",
            prefix: "prefix.",
        });
    });

    it("prefix defined and measure has no id", () => {
        expect(addPrefixToMeasure({ ...measure, id: undefined }, "prefix.")).toEqual({
            ...measure,
            id: undefined,
            prefix: "prefix.",
        });
    });
});
