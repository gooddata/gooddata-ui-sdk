// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type PeriodGranularity,
    isPeriodInOrder,
    isValidPeriodLiteral,
    periodGranularities,
    periodLiteralFormats,
    toModelGranularity,
    toPeriodGranularity,
} from "./dateRangePeriod.js";

describe("isValidPeriodLiteral", () => {
    it.each(periodGranularities)("accepts the documented example of %s", (granularity) => {
        expect(isValidPeriodLiteral(granularity, periodLiteralFormats[granularity].example)).toBe(true);
    });

    it.each<[PeriodGranularity, string]>([
        ["YEAR", "2025"],
        ["QUARTER", "2025-4"],
        ["MONTH", "2025-12"],
        ["WEEK", "2020-53"],
        ["WEEK", "2026-53"],
        ["DAY", "2024-02-29"],
        ["HOUR", "2025-08-14 00"],
        ["MINUTE", "2025-08-14 23:59"],
        ["SECOND", "2025-08-14 23:59:59"],
    ])("accepts %s %s", (granularity, literal) => {
        expect(isValidPeriodLiteral(granularity, literal)).toBe(true);
    });

    it.each<[PeriodGranularity, string]>([
        ["YEAR", "25"],
        ["YEAR", "2025-01"],
        ["QUARTER", "2025-5"],
        ["QUARTER", "2025-03"],
        ["MONTH", "2026-13"],
        ["MONTH", "2025-8"],
        ["MONTH", "2025-08-01"],
        ["WEEK", "2025-00"],
        ["WEEK", "2021-53"],
        ["DAY", "2025-02-29"],
        ["DAY", "2025-04-31"],
        ["DAY", "2025-13-01"],
        ["HOUR", "2025-08-14 24"],
        ["HOUR", "2025-02-30 10"],
        ["MINUTE", "2025-08-14 13:60"],
        ["SECOND", "2025-08-14 13:30"],
        ["DAY", "2025-08-14 13"],
    ])("rejects %s %s", (granularity, literal) => {
        expect(isValidPeriodLiteral(granularity, literal)).toBe(false);
    });
});

describe("isPeriodInOrder", () => {
    it("accepts a start before or equal to the end", () => {
        expect(isPeriodInOrder("2025-08", "2026-08")).toBe(true);
        expect(isPeriodInOrder("2025-08", "2025-08")).toBe(true);
    });

    it("rejects a start after the end", () => {
        expect(isPeriodInOrder("2026-08", "2025-08")).toBe(false);
        expect(isPeriodInOrder("2025-08-14 13", "2025-08-14 09")).toBe(false);
    });

    it("accepts a period open on either side", () => {
        expect(isPeriodInOrder(undefined, "2025-08")).toBe(true);
        expect(isPeriodInOrder("2025-08", undefined)).toBe(true);
    });
});

describe("granularity names", () => {
    it.each(periodGranularities)("maps %s to the model and back", (granularity) => {
        expect(toPeriodGranularity(toModelGranularity(granularity))).toBe(granularity);
    });

    it("names a day and a week as the model does", () => {
        expect(toModelGranularity("DAY")).toBe("GDC.time.date");
        expect(toModelGranularity("WEEK")).toBe("GDC.time.week");
    });
});
