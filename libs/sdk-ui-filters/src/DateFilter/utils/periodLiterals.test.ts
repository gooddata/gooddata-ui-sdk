// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type DatePeriodGranularity, type WeekStart } from "@gooddata/sdk-model";

import { dayToPeriodLiteral, periodLiteralToFirstDay, periodLiteralToLastDay } from "./periodLiterals.js";

describe("period literals", () => {
    it.each<[DatePeriodGranularity, string, WeekStart, string]>([
        ["GDC.time.week", "2026-03-02", "Monday", "2026-10"],
        ["GDC.time.week", "2026-03-08", "Monday", "2026-10"],
        ["GDC.time.week", "2026-03-01", "Sunday", "2026-10"],
        ["GDC.time.week", "2026-03-07", "Sunday", "2026-10"],
        ["GDC.time.week", "2025-12-29", "Monday", "2026-01"],
        ["GDC.time.week", "2025-12-28", "Sunday", "2026-01"],
        ["GDC.time.week", "2027-01-03", "Monday", "2026-53"],
        ["GDC.time.week", "2027-01-02", "Sunday", "2026-53"],
        ["GDC.time.month", "2026-03-31", "Sunday", "2026-03"],
        ["GDC.time.quarter", "2026-05-15", "Sunday", "2026-2"],
        ["GDC.time.year", "2026-12-31", "Monday", "2026"],
    ])("%s of %s with the week starting on %s is %s", (granularity, day, weekStart, literal) => {
        expect(dayToPeriodLiteral(granularity, day, weekStart)).toBe(literal);
    });

    it.each<[DatePeriodGranularity, string, WeekStart, string, string]>([
        ["GDC.time.week", "2026-10", "Monday", "2026-03-02", "2026-03-08"],
        ["GDC.time.week", "2026-10", "Sunday", "2026-03-01", "2026-03-07"],
        ["GDC.time.week", "2026-01", "Monday", "2025-12-29", "2026-01-04"],
        ["GDC.time.week", "2026-01", "Sunday", "2025-12-28", "2026-01-03"],
        ["GDC.time.week", "2026-53", "Monday", "2026-12-28", "2027-01-03"],
        ["GDC.time.month", "2026-02", "Sunday", "2026-02-01", "2026-02-28"],
        ["GDC.time.quarter", "2026-4", "Sunday", "2026-10-01", "2026-12-31"],
        ["GDC.time.year", "2026", "Monday", "2026-01-01", "2026-12-31"],
    ])(
        "%s %s with the week starting on %s spans %s to %s",
        (granularity, literal, weekStart, first, last) => {
            expect(periodLiteralToFirstDay(granularity, literal, weekStart)).toBe(first);
            expect(periodLiteralToLastDay(granularity, literal, weekStart)).toBe(last);
        },
    );

    it.each<[DatePeriodGranularity, string]>([
        ["GDC.time.week", "2027-53"],
        ["GDC.time.month", "2026-13"],
        ["GDC.time.quarter", "2026-03"],
        ["GDC.time.year", "26"],
    ])("%s %s is not a period", (granularity, literal) => {
        expect(periodLiteralToFirstDay(granularity, literal, "Sunday")).toBeUndefined();
        expect(periodLiteralToLastDay(granularity, literal, "Sunday")).toBeUndefined();
    });

    it("ignores the time of day", () => {
        expect(dayToPeriodLiteral("GDC.time.month", "2026-03-31 23:59", "Sunday")).toBe("2026-03");
    });

    it("returns no literal for a day that is not valid", () => {
        expect(dayToPeriodLiteral("GDC.time.month", "2026-02-30", "Sunday")).toBeUndefined();
        expect(dayToPeriodLiteral("GDC.time.month", undefined, "Sunday")).toBeUndefined();
    });
});
