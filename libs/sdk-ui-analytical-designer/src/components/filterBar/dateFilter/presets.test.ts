// (C) 2022-2026 GoodData Corporation

// @vitest-environment node
import { describe, expect, it } from "vitest";

import { type Granularity } from "../../../models/granularity.js";

import { findRelativePresetByValue, findSupportedRelativePresets } from "./presets.js";

describe("presets", () => {
    describe("findRelativePresetByValue", () => {
        it("should return undefined when no match is found", () => {
            const result = findRelativePresetByValue({
                type: "relative",
                granularity: "GDC.time.quarter",
                interval: [-1, -18],
            });
            expect(result).toBeUndefined();
        });

        it("should return undefined when no presets of requested granularity is found", () => {
            const result = findRelativePresetByValue({
                type: "relative",
                granularity: "GDC.time.nonExistent" as Granularity,
                interval: [-1, -1],
            });
            expect(result).toBeUndefined();
        });

        it("should return matching preset", () => {
            const result = findRelativePresetByValue({
                type: "relative",
                granularity: "GDC.time.quarter",
                interval: [-1, -1],
            });
            expect(result).toMatchSnapshot();
        });
    });

    describe("findSupportedRelativePresets", () => {
        it("should return expected presets when time is not supported", () => {
            const result = findSupportedRelativePresets(false);
            expect(result).toMatchSnapshot();
        });

        it("should return all presets including minute/hour when time is supported", () => {
            const result = findSupportedRelativePresets(true);
            expect(result).toMatchSnapshot();
        });
    });
});
