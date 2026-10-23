// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type DateAttributeGranularity } from "@gooddata/sdk-model";

import { getInvalidDateElementPattern } from "./dateElementFormat.js";

describe("getInvalidDateElementPattern", () => {
    it.each<[DateAttributeGranularity, string]>([
        ["GDC.time.second", "2026-05-31 12:51:09"],
        ["GDC.time.minute", "2026-05-31 12:51"],
        ["GDC.time.minute", "2026-5-3 1:5"],
        ["GDC.time.hour", "2026-05-31 23"],
        ["GDC.time.date", "2026-05-31"],
        ["GDC.time.week_us", "2026-52"],
        ["GDC.time.month", "2026-05"],
        ["GDC.time.quarter", "2026-4"],
        ["GDC.time.year", "2026"],
        ["GDC.time.fiscal_month", "2026-11"],
        ["GDC.time.fiscal_quarter", "2026-1"],
        ["GDC.time.fiscal_year", "2026"],
        // the backend check is loose, values it accepts must be accepted here as well
        ["GDC.time.date", "2026-13-39"],
        ["GDC.time.date", "2026-12-05"],
    ])("accepts valid %s value %s", (granularity, value) => {
        expect(getInvalidDateElementPattern(value, granularity)).toBeUndefined();
    });

    it.each<[DateAttributeGranularity, string, string]>([
        ["GDC.time.minute", "2026-31-05 12:51", "YYYY-MM-DD HH24:MI"],
        ["GDC.time.minute", "2026-05-31", "YYYY-MM-DD HH24:MI"],
        ["GDC.time.minute", "2026-05-31 12:60", "YYYY-MM-DD HH24:MI"],
        ["GDC.time.second", "2026-05-31 12:51", "YYYY-MM-DD HH24:MI:SS"],
        ["GDC.time.hour", "2026-05-31 12:51", "YYYY-MM-DD HH24"],
        ["GDC.time.date", "05/31/2026", "YYYY-MM-DD"],
        ["GDC.time.date", "2026-05-31 ", "YYYY-MM-DD"],
        ["GDC.time.week_us", "2026-W52", "IYYY-IW"],
        ["GDC.time.month", "2026-20", "YYYY-MM"],
        ["GDC.time.quarter", "2026-Q1", "YYYY-Q"],
        ["GDC.time.quarter", "2026-5", "YYYY-Q"],
        ["GDC.time.year", "20266", "YYYY"],
        ["GDC.time.fiscal_year", "FY2026", "YYYY"],
    ])("rejects invalid %s value %s", (granularity, value, pattern) => {
        expect(getInvalidDateElementPattern(value, granularity)).toBe(pattern);
    });

    it.each<[DateAttributeGranularity | undefined, string]>([
        [undefined, "2026-31-05"],
        ["GDC.time.day_in_week", "Monday"],
        ["GDC.time.month_in_year", "13"],
        ["GDC.time.date", ""],
    ])("does not check %s value %s", (granularity, value) => {
        expect(getInvalidDateElementPattern(value, granularity)).toBeUndefined();
    });
});
