// (C) 2026 GoodData Corporation

// @vitest-environment node

import { readFileSync } from "fs";
import { join } from "path";

import { describe, expect, it } from "vitest";

import { type DateFilterGranularity } from "@gooddata/sdk-model";

import {
    allowedValueGranularities,
    isDateConditionValue,
    normalizeDateConditionGranularity,
    resolveDateConditionBounds,
    snapPlatformRangeToPeriodBounds,
    snapToPeriodBounds,
} from "./dateConditionResolution.js";

const MONTH: DateFilterGranularity = "GDC.time.month";
const QUARTER: DateFilterGranularity = "GDC.time.quarter";
const YEAR: DateFilterGranularity = "GDC.time.year";
const WEEK: DateFilterGranularity = "GDC.time.week_us";
const DAY: DateFilterGranularity = "GDC.time.date";
const HOUR: DateFilterGranularity = "GDC.time.hour";
const MINUTE: DateFilterGranularity = "GDC.time.minute";

const absolute = (from: string, to: string) => ({ kind: "absoluteDate" as const, from, to });
const relative = (granularity: DateFilterGranularity, from: number, to: number) => ({
    kind: "relativeDate" as const,
    granularity,
    from,
    to,
});

// Anchor built from LOCAL components so tests are deterministic in any host timezone: July 13, 2026
// is a Monday, 10:30 local.
const ANCHOR = new Date(2026, 6, 13, 10, 30);
const ctx = { anchor: ANCHOR };

describe("resolveDateConditionBounds — absolute values", () => {
    // Golden wire labels mirror sdk-backend-tiger granularityParsePatterns (dateValueParser.ts):
    // year "2020", quarter "2020-1", month "2020-06", week "2020-05", day "2020-01-31",
    // hour "2020-01-31 14", minute "2020-01-31 14:01". These tests are the cross-package pin.
    it.each([
        [DAY, "2026-07-13", "2026-07-13", "2026-07-13", "2026-07-13"],
        [DAY, "2026-07-01", "2026-07-31", "2026-07-01", "2026-07-31"],
        [MONTH, "2023-12-01", "2023-12-31", "2023-12", "2023-12"],
        [MONTH, "2026-04-01", "2026-09-30", "2026-04", "2026-09"],
        [QUARTER, "2026-04-01", "2026-09-30", "2026-2", "2026-3"],
        [YEAR, "2026-01-01", "2026-12-31", "2026", "2026"],
        // ISO week 2 of 2026 (week 1 contains Jan 1, a Thursday).
        [WEEK, "2026-01-05", "2026-01-11", "2026-02", "2026-02"],
        // Year boundary: the last December week belongs to ISO year 2026.
        [WEEK, "2025-12-29", "2026-01-04", "2026-01", "2026-01"],
    ])("resolves aligned bounds on a %s column (%s .. %s)", (granularity, from, to, fromLabel, toLabel) => {
        expect(resolveDateConditionBounds(absolute(from, to), granularity, undefined)).toEqual({
            fromLabel,
            toLabel,
        });
    });

    it("resolves datetime bounds on hour and minute columns", () => {
        expect(
            resolveDateConditionBounds(absolute("2026-07-13 14:00", "2026-07-13 14:59"), HOUR, undefined),
        ).toEqual({ fromLabel: "2026-07-13 14", toLabel: "2026-07-13 14" });
        expect(
            resolveDateConditionBounds(absolute("2026-07-13 14:05", "2026-07-13 14:05"), MINUTE, undefined),
        ).toEqual({ fromLabel: "2026-07-13 14:05", toLabel: "2026-07-13 14:05" });
    });

    it("snaps misaligned bounds OUTWARD to the containing column periods (overlap semantics)", () => {
        // A partial-month range still touches December — no drift flag, the month matches.
        expect(resolveDateConditionBounds(absolute("2023-12-02", "2023-12-31"), MONTH, undefined)).toEqual({
            fromLabel: "2023-12",
            toLabel: "2023-12",
        });
        // A day range spanning March–July touches Q1, Q2, and Q3 on a quarter column.
        expect(resolveDateConditionBounds(absolute("2026-03-01", "2026-07-31"), QUARTER, undefined)).toEqual({
            fromLabel: "2026-1",
            toLabel: "2026-3",
        });
        // A single day resolves to the week containing it on a week column.
        expect(resolveDateConditionBounds(absolute("2026-07-13", "2026-07-13"), WEEK, undefined)).toEqual({
            fromLabel: "2026-29",
            toLabel: "2026-29",
        });
    });

    it("returns null for an inverted range", () => {
        expect(resolveDateConditionBounds(absolute("2026-07-14", "2026-07-13"), DAY, undefined)).toBeNull();
    });

    it("returns null for malformed or impossible dates", () => {
        expect(resolveDateConditionBounds(absolute("12/24/2026", "12/26/2026"), DAY, undefined)).toBeNull();
        expect(resolveDateConditionBounds(absolute("2026-02-31", "2026-03-01"), DAY, undefined)).toBeNull();
    });

    it("resolves values of any string precision against any column granularity", () => {
        // Datetime strings on a day column collapse to the day(s) they touch.
        expect(
            resolveDateConditionBounds(absolute("2026-07-13 00:00", "2026-07-13 23:59"), DAY, undefined),
        ).toEqual({ fromLabel: "2026-07-13", toLabel: "2026-07-13" });
        // A date-only value on an hour column covers the day's whole hour range.
        expect(resolveDateConditionBounds(absolute("2026-07-13", "2026-07-13"), HOUR, undefined)).toEqual({
            fromLabel: "2026-07-13 00",
            toLabel: "2026-07-13 23",
        });
        // A partial-day time range on an hour column touches only the hours it overlaps.
        expect(
            resolveDateConditionBounds(absolute("2026-07-13 14:30", "2026-07-13 15:10"), HOUR, undefined),
        ).toEqual({ fromLabel: "2026-07-13 14", toLabel: "2026-07-13 15" });
    });

    it("returns null for fiscal, cyclic, unknown, and missing granularities", () => {
        const value = absolute("2026-07-01", "2026-09-30");
        expect(resolveDateConditionBounds(value, "GDC.time.fiscal_quarter", undefined)).toBeNull();
        expect(resolveDateConditionBounds(value, "GDC.time.month_in_year", undefined)).toBeNull();
        expect(resolveDateConditionBounds(value, "something-else", undefined)).toBeNull();
        expect(resolveDateConditionBounds(value, undefined, undefined)).toBeNull();
    });

    it("returns null for non-date value kinds", () => {
        expect(
            resolveDateConditionBounds({ kind: "literal", value: "2026-07-13" }, DAY, undefined),
        ).toBeNull();
    });
});

describe("resolveDateConditionBounds — relative values", () => {
    it.each([
        [DAY, relative(DAY, 0, 0), "2026-07-13", "2026-07-13"],
        [DAY, relative(DAY, -7, -1), "2026-07-06", "2026-07-12"],
        [MONTH, relative(MONTH, -5, 0), "2026-02", "2026-07"],
        // Cross-granularity: a quarter/year value resolved into month labels.
        [MONTH, relative(QUARTER, 0, 0), "2026-07", "2026-09"],
        [MONTH, relative(YEAR, 0, 0), "2026-01", "2026-12"],
        [DAY, relative(MONTH, 0, 0), "2026-07-01", "2026-07-31"],
        [QUARTER, relative(YEAR, -1, -1), "2025-1", "2025-4"],
        [YEAR, relative(YEAR, 1, 2), "2027", "2028"],
        // July 13, 2026 is a Monday in ISO week 29.
        [WEEK, relative(WEEK, 0, 0), "2026-29", "2026-29"],
        [DAY, relative(WEEK, 0, 0), "2026-07-13", "2026-07-19"],
    ])("resolves %s column: offsets of %o", (columnGranularity, value, fromLabel, toLabel) => {
        expect(resolveDateConditionBounds(value, columnGranularity, undefined, ctx)).toEqual({
            fromLabel,
            toLabel,
        });
    });

    it("rejects inverted, non-integer, and unsupported-granularity combinations", () => {
        expect(resolveDateConditionBounds(relative(DAY, 0, -1), DAY, undefined, ctx)).toBeNull();
        expect(resolveDateConditionBounds(relative(DAY, 0.5, 1), DAY, undefined, ctx)).toBeNull();
        expect(
            resolveDateConditionBounds(relative("GDC.time.fiscal_month", 0, 0), MONTH, undefined, ctx),
        ).toBeNull();
    });

    it("resolves values FINER than the column by overlap (any touched period matches)", () => {
        // "Today" (July 13) on a month column touches July.
        expect(resolveDateConditionBounds(relative(DAY, 0, 0), MONTH, undefined, ctx)).toEqual({
            fromLabel: "2026-07",
            toLabel: "2026-07",
        });
        // "This week" (Mon Jul 13 – Sun Jul 19) stays within July — one month label.
        expect(resolveDateConditionBounds(relative(WEEK, 0, 0), MONTH, undefined, ctx)).toEqual({
            fromLabel: "2026-07",
            toLabel: "2026-07",
        });
        // "Last 30 days" straddles June and July on a month column.
        expect(resolveDateConditionBounds(relative(DAY, -29, 0), MONTH, undefined, ctx)).toEqual({
            fromLabel: "2026-06",
            toLabel: "2026-07",
        });
        // A month straddling ISO weeks covers every touched week on a week column.
        expect(resolveDateConditionBounds(relative(MONTH, 0, 0), WEEK, undefined, ctx)).toEqual({
            fromLabel: "2026-27",
            toLabel: "2026-31",
        });
    });

    it("computes 'today' in the column's timezone, not the host's", () => {
        // 23:30 UTC is already July 14 in Tokyo (+9) but still July 13 in New York (-4).
        const lateUtc = { anchor: new Date(Date.UTC(2026, 6, 13, 23, 30)) };
        expect(resolveDateConditionBounds(relative(DAY, 0, 0), DAY, "Asia/Tokyo", lateUtc)).toEqual({
            fromLabel: "2026-07-14",
            toLabel: "2026-07-14",
        });
        expect(resolveDateConditionBounds(relative(DAY, 0, 0), DAY, "America/New_York", lateUtc)).toEqual({
            fromLabel: "2026-07-13",
            toLabel: "2026-07-13",
        });
        expect(resolveDateConditionBounds(relative(HOUR, 0, 0), HOUR, "Asia/Tokyo", lateUtc)).toEqual({
            fromLabel: "2026-07-14 08",
            toLabel: "2026-07-14 08",
        });
    });

    it("falls back to the host's wall clock for an invalid timezone id", () => {
        expect(resolveDateConditionBounds(relative(DAY, 0, 0), DAY, "Not/AZone", ctx)).toEqual({
            fromLabel: "2026-07-13",
            toLabel: "2026-07-13",
        });
    });

    it("does wall-clock hour arithmetic across a DST transition (labels match backend wall-clock labels)", () => {
        // Prague springs forward 2026-03-29 02:00 → 03:00; 01:30 UTC is 03:30 local (DST active).
        const dstMorning = { anchor: new Date(Date.UTC(2026, 2, 29, 1, 30)) };
        expect(resolveDateConditionBounds(relative(HOUR, -2, -2), HOUR, "Europe/Prague", dstMorning)).toEqual(
            { fromLabel: "2026-03-29 01", toLabel: "2026-03-29 01" },
        );
    });
});

describe("snapToPeriodBounds", () => {
    it("snaps a mid-period range outward to period bounds", () => {
        expect(snapToPeriodBounds(new Date(2023, 11, 15), new Date(2024, 0, 10), MONTH)).toEqual({
            from: "2023-12-01",
            to: "2024-01-31",
        });
    });

    it("keeps a single day as a one-day period", () => {
        expect(snapToPeriodBounds(new Date(2026, 6, 13), new Date(2026, 6, 13), DAY)).toEqual({
            from: "2026-07-13",
            to: "2026-07-13",
        });
    });

    it("serializes datetime strings for time granularities", () => {
        expect(snapToPeriodBounds(new Date(2026, 6, 13, 14, 5), new Date(2026, 6, 13, 15, 10), HOUR)).toEqual(
            { from: "2026-07-13 14:00", to: "2026-07-13 15:59" },
        );
    });

    it("returns null for unsupported granularities and inverted input", () => {
        expect(
            snapToPeriodBounds(new Date(2026, 0, 1), new Date(2026, 0, 2), "GDC.time.fiscal_year"),
        ).toBeNull();
        expect(snapToPeriodBounds(new Date(2026, 0, 2), new Date(2026, 0, 1), DAY)).toBeNull();
    });
});

describe("snapPlatformRangeToPeriodBounds", () => {
    it("snaps day-level strings outward to periods (the absolute-form apply path)", () => {
        expect(snapPlatformRangeToPeriodBounds("2023-12-15", "2024-01-10", MONTH)).toEqual({
            from: "2023-12-01",
            to: "2024-01-31",
        });
    });

    it("treats a date-only `to` as the WHOLE day on time granularities (absolute presets)", () => {
        // Presets carry day-level bounds; "2026-01-31" means through the end of that day, not the
        // first hour its midnight parse would otherwise snap to.
        expect(snapPlatformRangeToPeriodBounds("2026-01-01", "2026-01-31", HOUR)).toEqual({
            from: "2026-01-01 00:00",
            to: "2026-01-31 23:59",
        });
        expect(snapPlatformRangeToPeriodBounds("2026-01-01", "2026-01-31", MINUTE)).toEqual({
            from: "2026-01-01 00:00",
            to: "2026-01-31 23:59",
        });
        // Explicit datetimes keep their own resolution.
        expect(snapPlatformRangeToPeriodBounds("2026-01-01 08:00", "2026-01-31 14:10", HOUR)).toEqual({
            from: "2026-01-01 08:00",
            to: "2026-01-31 14:59",
        });
    });

    it("returns null for malformed strings and unsupported granularities", () => {
        expect(snapPlatformRangeToPeriodBounds("01/15/2026", "2026-01-31", MONTH)).toBeNull();
        expect(
            snapPlatformRangeToPeriodBounds("2026-01-01", "2026-01-31", "GDC.time.fiscal_year"),
        ).toBeNull();
    });
});

describe("allowedValueGranularities", () => {
    it("offers every supported linear granularity for any date column (overlap semantics)", () => {
        const all = [MINUTE, HOUR, DAY, WEEK, MONTH, QUARTER, YEAR];
        expect(allowedValueGranularities(MONTH)).toEqual(all);
        expect(allowedValueGranularities(WEEK)).toEqual(all);
        expect(allowedValueGranularities(DAY)).toEqual(all);
    });

    it("offers nothing for cyclic, fiscal, or unknown granularities", () => {
        expect(allowedValueGranularities("GDC.time.month_in_year")).toEqual([]);
        expect(allowedValueGranularities("GDC.time.fiscal_year")).toEqual([]);
        expect(allowedValueGranularities(undefined)).toEqual([]);
    });
});

describe("wire-enum granularities (Tiger execution descriptors carry raw enums, not GDC constants)", () => {
    it("normalizeDateConditionGranularity accepts both spellings and rejects cyclic/fiscal/unknown", () => {
        expect(normalizeDateConditionGranularity("MONTH")).toBe(MONTH);
        expect(normalizeDateConditionGranularity("DAY")).toBe(DAY);
        expect(normalizeDateConditionGranularity("WEEK")).toBe(WEEK);
        expect(normalizeDateConditionGranularity(MONTH)).toBe(MONTH);
        expect(normalizeDateConditionGranularity("MONTH_OF_YEAR")).toBeNull();
        expect(normalizeDateConditionGranularity("GDC.time.month_in_year")).toBeNull();
        expect(normalizeDateConditionGranularity("GDC.time.fiscal_year")).toBeNull();
        expect(normalizeDateConditionGranularity(undefined)).toBeNull();
    });

    it("resolution and the matrix accept a wire-enum column granularity", () => {
        expect(resolveDateConditionBounds(absolute("2023-12-01", "2023-12-31"), "MONTH", undefined)).toEqual({
            fromLabel: "2023-12",
            toLabel: "2023-12",
        });
        expect(resolveDateConditionBounds(relative(QUARTER, 0, 0), "MONTH", undefined, ctx)).toEqual({
            fromLabel: "2026-07",
            toLabel: "2026-09",
        });
        expect(allowedValueGranularities("MONTH")).toContain(QUARTER);
        expect(allowedValueGranularities("DAY_OF_WEEK")).toEqual([]);
    });
});

describe("wire-label grammar contract (sdk-backend-tiger)", () => {
    it("pins the serialization patterns to tiger's granularityParsePatterns", () => {
        // sdk-backend-tiger is deliberately not a dependency of this package, so the shared grammar
        // is pinned by reading its source in-repo (vitest runs from the package root): if a pattern
        // there changes — or the table moves — this fails loudly instead of the two serializers
        // drifting apart silently.
        const tigerSource = readFileSync(
            join(
                process.cwd(),
                "../sdk-backend-tiger/src/convertors/fromBackend/dateFormatting/dateValueParser.ts",
            ),
            "utf-8",
        );
        const pinnedPatterns: Array<[string, string]> = [
            ["GDC.time.minute", "yyyy-MM-dd HH:mm"],
            ["GDC.time.hour", "yyyy-MM-dd HH"],
            ["GDC.time.date", "yyyy-MM-dd"],
            ["GDC.time.week_us", "RRRR-II"],
            ["GDC.time.month", "yyyy-MM"],
            ["GDC.time.quarter", "yyyy-Q"],
            ["GDC.time.year", "yyyy"],
        ];
        for (const [granularity, pattern] of pinnedPatterns) {
            expect(tigerSource).toContain(`"${granularity}": "${pattern}",`);
        }
    });
});

describe("isDateConditionValue", () => {
    it("accepts only the date kinds", () => {
        expect(isDateConditionValue(absolute("2026-01-01", "2026-01-01"))).toBe(true);
        expect(isDateConditionValue(relative(DAY, 0, 0))).toBe(true);
        expect(isDateConditionValue({ kind: "none" })).toBe(false);
        expect(isDateConditionValue({ kind: "literal", value: "x" })).toBe(false);
        expect(isDateConditionValue({ kind: "literalRange", from: 0, to: 1 })).toBe(false);
    });
});
