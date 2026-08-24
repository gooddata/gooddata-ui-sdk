// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    getKdaSupportedGranularities,
    getKdaSupportedStringGranularities,
    isYearGranularity,
} from "./keyDriverAnalysisGranularities.js";

describe("keyDriverAnalysisGranularities", () => {
    it("excludes second when the feature flag is off", () => {
        expect(getKdaSupportedGranularities(false)).toEqual([
            "GDC.time.year",
            "GDC.time.week_us",
            "GDC.time.week",
            "GDC.time.quarter",
            "GDC.time.month",
            "GDC.time.date",
            "GDC.time.hour",
            "GDC.time.minute",
        ]);
        expect(getKdaSupportedStringGranularities(false)).toEqual([
            "YEAR",
            "WEEK_US",
            "WEEK",
            "QUARTER",
            "MONTH",
            "DAY",
            "HOUR",
            "MINUTE",
        ]);
    });

    it("includes second when the feature flag is on", () => {
        expect(getKdaSupportedGranularities(true)).toEqual([
            "GDC.time.year",
            "GDC.time.week_us",
            "GDC.time.week",
            "GDC.time.quarter",
            "GDC.time.month",
            "GDC.time.date",
            "GDC.time.hour",
            "GDC.time.minute",
            "GDC.time.second",
        ]);
        expect(getKdaSupportedStringGranularities(true)).toEqual([
            "YEAR",
            "WEEK_US",
            "WEEK",
            "QUARTER",
            "MONTH",
            "DAY",
            "HOUR",
            "MINUTE",
            "SECOND",
        ]);
    });

    it("recognizes year in GDC and header-token forms", () => {
        expect(isYearGranularity("GDC.time.year")).toBe(true);
        expect(isYearGranularity("YEAR")).toBe(true);
        expect(isYearGranularity("MONTH")).toBe(false);
        expect(isYearGranularity(undefined)).toBe(false);
    });
});
