// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type DateRangeParameterGranularity } from "../ldm/metadata/parameter/index.js";

import { type DatePeriodGranularity } from "./dateGranularities.js";
import {
    compareDatePeriodLiterals,
    isDatePeriodGranularity,
    isValidDatePeriodLiteral,
    isValidDatePeriodRange,
} from "./datePeriodLiterals.js";

describe("isDatePeriodGranularity", () => {
    it.each(["GDC.time.week", "GDC.time.month", "GDC.time.quarter", "GDC.time.year"])(
        "should accept %s",
        (granularity) => {
            expect(isDatePeriodGranularity(granularity)).toBe(true);
        },
    );

    it.each(["GDC.time.date", "GDC.time.fiscal_month", "GDC.time.week_us", "", undefined, 1])(
        "should reject %s",
        (granularity) => {
            expect(isDatePeriodGranularity(granularity)).toBe(false);
        },
    );
});

describe("isValidDatePeriodLiteral", () => {
    it.each<[DatePeriodGranularity, string]>([
        ["GDC.time.week", "2026-01"],
        ["GDC.time.week", "2026-53"],
        ["GDC.time.week", "2020-53"],
        ["GDC.time.week", "2004-53"],
        ["GDC.time.month", "2026-01"],
        ["GDC.time.month", "2026-12"],
        ["GDC.time.quarter", "2026-1"],
        ["GDC.time.quarter", "2026-4"],
        ["GDC.time.year", "2026"],
    ])("should accept %s literal %s", (granularity, literal) => {
        expect(isValidDatePeriodLiteral(granularity, literal)).toBe(true);
    });

    it.each<[DateRangeParameterGranularity, string]>([
        ["GDC.time.date", "2026-03-15"],
        ["GDC.time.date", "2024-02-29"],
        ["GDC.time.date", "2000-02-29"],
        ["GDC.time.hour", "2026-03-15 00"],
        ["GDC.time.hour", "2026-03-15 23"],
        ["GDC.time.minute", "2026-03-15 09:59"],
        ["GDC.time.second", "2026-12-31 23:59:59"],
    ])("should accept date range parameter %s literal %s", (granularity, literal) => {
        expect(isValidDatePeriodLiteral(granularity, literal)).toBe(true);
    });

    it.each<[DateRangeParameterGranularity, string]>([
        ["GDC.time.date", "2026-02-29"],
        ["GDC.time.date", "1900-02-29"],
        ["GDC.time.date", "2026-04-31"],
        ["GDC.time.date", "2026-13-01"],
        ["GDC.time.date", "2026-03-00"],
        ["GDC.time.date", "2026-3-15"],
        ["GDC.time.date", "2026-03-15 09"],
        ["GDC.time.hour", "2026-03-15 24"],
        ["GDC.time.hour", "2026-03-15 9"],
        ["GDC.time.hour", "2026-03-15T09"],
        ["GDC.time.minute", "2026-03-15 09:60"],
        ["GDC.time.minute", "2026-03-15 09"],
        ["GDC.time.second", "2026-03-15 09:30:60"],
        ["GDC.time.second", "2026-03-15 09:30"],
    ])("should reject date range parameter %s literal %s", (granularity, literal) => {
        expect(isValidDatePeriodLiteral(granularity, literal)).toBe(false);
    });

    it.each<[DatePeriodGranularity, unknown]>([
        ["GDC.time.week", "2026-00"],
        ["GDC.time.week", "2026-54"],
        ["GDC.time.week", "2025-53"],
        ["GDC.time.week", "2024-53"],
        ["GDC.time.week", "2027-53"],
        ["GDC.time.week", "2026-5"],
        ["GDC.time.month", "2026-00"],
        ["GDC.time.month", "2026-13"],
        ["GDC.time.month", "2026-3"],
        ["GDC.time.month", "26-03"],
        ["GDC.time.month", "2026-03-15"],
        ["GDC.time.quarter", "2026-0"],
        ["GDC.time.quarter", "2026-5"],
        ["GDC.time.quarter", "2026-01"],
        ["GDC.time.year", "26"],
        ["GDC.time.year", "2026-01"],
        ["GDC.time.year", "2026-03-15"],
        ["GDC.time.year", 2026],
        ["GDC.time.month", undefined],
    ])("should reject %s literal %s", (granularity, literal) => {
        expect(isValidDatePeriodLiteral(granularity, literal)).toBe(false);
    });
});

describe("compareDatePeriodLiterals", () => {
    it("should return zero for the same period", () => {
        expect(compareDatePeriodLiterals("GDC.time.month", "2026-03", "2026-03")).toBe(0);
    });

    it("should order periods across a year boundary", () => {
        expect(compareDatePeriodLiterals("GDC.time.week", "2026-53", "2027-01")).toBeLessThan(0);
        expect(compareDatePeriodLiterals("GDC.time.quarter", "2026-1", "2025-4")).toBeGreaterThan(0);
    });

    it("should order days, hours, minutes and seconds", () => {
        expect(compareDatePeriodLiterals("GDC.time.date", "2025-12-31", "2026-01-01")).toBeLessThan(0);
        expect(compareDatePeriodLiterals("GDC.time.hour", "2026-03-15 10", "2026-03-15 09")).toBeGreaterThan(
            0,
        );
        expect(compareDatePeriodLiterals("GDC.time.minute", "2026-03-15 09:30", "2026-03-15 09:30")).toBe(0);
        expect(
            compareDatePeriodLiterals("GDC.time.second", "2026-03-15 09:30:59", "2026-03-15 09:31:00"),
        ).toBeLessThan(0);
    });

    it("should throw for an invalid literal", () => {
        expect(() => compareDatePeriodLiterals("GDC.time.month", "2026-13", "2026-01")).toThrow();
    });
});

describe("isValidDatePeriodRange", () => {
    it("should accept a range with both edges", () => {
        expect(isValidDatePeriodRange("GDC.time.month", "2026-01", "2026-03")).toBe(true);
    });

    it("should accept a range of one period", () => {
        expect(isValidDatePeriodRange("GDC.time.year", "2026", "2026")).toBe(true);
    });

    it("should accept a range with only one edge", () => {
        expect(isValidDatePeriodRange("GDC.time.month", "2026-01", undefined)).toBe(true);
        expect(isValidDatePeriodRange("GDC.time.month", undefined, "2026-03")).toBe(true);
    });

    it("should accept a week range that ends in week 53", () => {
        expect(isValidDatePeriodRange("GDC.time.week", "2025-52", "2026-53")).toBe(true);
    });

    it("should reject a week range that ends in week 53 of a year with 52 weeks", () => {
        expect(isValidDatePeriodRange("GDC.time.week", "2027-01", "2027-53")).toBe(false);
    });

    it("should reject a range without edges", () => {
        expect(isValidDatePeriodRange("GDC.time.month", undefined, undefined)).toBe(false);
    });

    it("should reject a range with 'from' after 'to'", () => {
        expect(isValidDatePeriodRange("GDC.time.quarter", "2026-2", "2026-1")).toBe(false);
    });

    it("should accept a range of hours within one day", () => {
        expect(isValidDatePeriodRange("GDC.time.hour", "2026-03-15 09", "2026-03-15 17")).toBe(true);
    });

    it("should reject a range of days with 'from' after 'to'", () => {
        expect(isValidDatePeriodRange("GDC.time.date", "2026-03-16", "2026-03-15")).toBe(false);
    });

    it("should reject a range with an invalid edge", () => {
        expect(isValidDatePeriodRange("GDC.time.month", "2026-01", "2026-13")).toBe(false);
        expect(isValidDatePeriodRange("GDC.time.month", "2026-01-01", undefined)).toBe(false);
    });
});
