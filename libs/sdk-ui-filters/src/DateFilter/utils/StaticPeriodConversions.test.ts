// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type DateFilterGranularity } from "@gooddata/sdk-model";

import { resolvePeriodBoundaries } from "./StaticPeriodConversions.js";

describe("resolvePeriodBoundaries", () => {
    describe("GDC.time.date", () => {
        it("resolves a single day to itself", () => {
            expect(resolvePeriodBoundaries("GDC.time.date", "2026-03-02", "2026-03-02")).toEqual({
                from: "2026-03-02",
                to: "2026-03-02",
            });
        });

        it("resolves a multi-day range unchanged", () => {
            expect(resolvePeriodBoundaries("GDC.time.date", "2026-03-02", "2026-03-10")).toEqual({
                from: "2026-03-02",
                to: "2026-03-10",
            });
        });

        it("ignores weekStart, since a day needs no period expansion", () => {
            expect(resolvePeriodBoundaries("GDC.time.date", "2026-03-02", "2026-03-02", "Monday")).toEqual({
                from: "2026-03-02",
                to: "2026-03-02",
            });
        });
    });

    describe("GDC.time.week_us", () => {
        it("resolves a single week with Sunday week start", () => {
            // 2026-07-21 is a Tuesday
            expect(resolvePeriodBoundaries("GDC.time.week_us", "2026-07-21", "2026-07-21", "Sunday")).toEqual(
                {
                    from: "2026-07-19",
                    to: "2026-07-25",
                },
            );
        });

        it("resolves a single week with Monday week start", () => {
            expect(resolvePeriodBoundaries("GDC.time.week_us", "2026-07-21", "2026-07-21", "Monday")).toEqual(
                {
                    from: "2026-07-20",
                    to: "2026-07-26",
                },
            );
        });

        it("defaults to Sunday week start when none is provided", () => {
            expect(resolvePeriodBoundaries("GDC.time.week_us", "2026-07-21", "2026-07-21")).toEqual({
                from: "2026-07-19",
                to: "2026-07-25",
            });
        });

        it("resolves a multi-week range", () => {
            expect(resolvePeriodBoundaries("GDC.time.week_us", "2026-07-06", "2026-07-21", "Monday")).toEqual(
                {
                    from: "2026-07-06",
                    to: "2026-07-26",
                },
            );
        });
    });

    describe("GDC.time.month", () => {
        it("resolves a single month", () => {
            expect(resolvePeriodBoundaries("GDC.time.month", "2026-03-15", "2026-03-15")).toEqual({
                from: "2026-03-01",
                to: "2026-03-31",
            });
        });

        it("resolves February in a leap year", () => {
            expect(resolvePeriodBoundaries("GDC.time.month", "2028-02-10", "2028-02-10")).toEqual({
                from: "2028-02-01",
                to: "2028-02-29",
            });
        });

        it("resolves February in a non-leap year", () => {
            expect(resolvePeriodBoundaries("GDC.time.month", "2026-02-10", "2026-02-10")).toEqual({
                from: "2026-02-01",
                to: "2026-02-28",
            });
        });

        it("resolves a multi-month range spanning three months", () => {
            expect(resolvePeriodBoundaries("GDC.time.month", "2026-02-10", "2026-04-05")).toEqual({
                from: "2026-02-01",
                to: "2026-04-30",
            });
        });

        it("resolves a multi-month range across a year rollover", () => {
            expect(resolvePeriodBoundaries("GDC.time.month", "2026-11-05", "2027-02-10")).toEqual({
                from: "2026-11-01",
                to: "2027-02-28",
            });
        });
    });

    describe("GDC.time.quarter", () => {
        it("resolves calendar Q1 (Jan-Mar)", () => {
            expect(resolvePeriodBoundaries("GDC.time.quarter", "2026-02-14", "2026-02-14")).toEqual({
                from: "2026-01-01",
                to: "2026-03-31",
            });
        });

        it("resolves calendar Q4 (Oct-Dec), including year-end", () => {
            expect(resolvePeriodBoundaries("GDC.time.quarter", "2026-11-01", "2026-11-01")).toEqual({
                from: "2026-10-01",
                to: "2026-12-31",
            });
        });

        it("resolves a multi-quarter range across a year rollover", () => {
            expect(resolvePeriodBoundaries("GDC.time.quarter", "2026-10-05", "2027-01-15")).toEqual({
                from: "2026-10-01",
                to: "2027-03-31",
            });
        });
    });

    describe("GDC.time.year", () => {
        it("resolves a single year", () => {
            expect(resolvePeriodBoundaries("GDC.time.year", "2026-06-15", "2026-06-15")).toEqual({
                from: "2026-01-01",
                to: "2026-12-31",
            });
        });

        it("resolves a multi-year range", () => {
            expect(resolvePeriodBoundaries("GDC.time.year", "2025-06-15", "2027-03-01")).toEqual({
                from: "2025-01-01",
                to: "2027-12-31",
            });
        });
    });

    it("throws for an unsupported granularity", () => {
        expect(() =>
            resolvePeriodBoundaries(
                "GDC.time.fiscal_year" as DateFilterGranularity,
                "2026-01-01",
                "2026-01-01",
            ),
        ).toThrow();
        expect(() =>
            resolvePeriodBoundaries("GDC.time.minute" as DateFilterGranularity, "2026-01-01", "2026-01-01"),
        ).toThrow();
    });
});
