// (C) 2007-2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import { OverTimeComparisonTypes } from "../../interfaces/OverTimeComparison.js";
import { DerivedMeasureTitleSuffixFactory } from "../DerivedMeasureTitleSuffixFactory.js";

describe("DerivedMeasureTitleSuffixFactory", () => {
    describe("getSuffix", () => {
        it("should return empty string for unknown over time comparison type", () => {
            const suffixFactory = new DerivedMeasureTitleSuffixFactory("en-US");
            const suffix = suffixFactory.getSuffix(OverTimeComparisonTypes.NOTHING);
            expect(suffix).toEqual("");
        });

        it("should return correct suffix for PoP over time comparison type", () => {
            const suffixFactory = new DerivedMeasureTitleSuffixFactory("en-US");
            const suffix = suffixFactory.getSuffix(OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR);
            expect(suffix).toEqual(" - SP year ago");
        });

        it("should return correct suffix for previous period over time comparison type", () => {
            const suffixFactory = new DerivedMeasureTitleSuffixFactory("en-US");
            const suffix = suffixFactory.getSuffix(OverTimeComparisonTypes.PREVIOUS_PERIOD);
            expect(suffix).toEqual(" - period ago");
        });
    });
});
