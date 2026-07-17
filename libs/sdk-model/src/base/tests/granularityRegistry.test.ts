// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    GRANULARITY_DESCRIPTORS,
    belongsToCalendar,
    getChronologicalOrigin,
    getFiscalEquivalent,
    getGranularities,
    getGranularityDescriptor,
    getStandardEquivalent,
    isChronologicalGranularity,
    isCyclicalGranularity,
    isFiscalGranularity,
    isSharedGranularity,
    isStandardGranularity,
    isTimeGranularity,
} from "../granularityRegistry.js";

describe("granularityRegistry", () => {
    describe("descriptor table", () => {
        it("keys every descriptor by its own granularity", () => {
            for (const [key, desc] of Object.entries(GRANULARITY_DESCRIPTORS)) {
                expect(desc.granularity).toEqual(key);
            }
        });

        it("keeps counterparts symmetric", () => {
            for (const desc of Object.values(GRANULARITY_DESCRIPTORS)) {
                if (desc.counterpart) {
                    expect(GRANULARITY_DESCRIPTORS[desc.counterpart].counterpart).toEqual(desc.granularity);
                }
            }
        });
    });

    describe("getGranularities reproduces the legacy hardcoded lists", () => {
        it("standard set", () => {
            expect(getGranularities({ calendars: [{ type: "standard" }] })).toEqual([
                "GDC.time.year",
                "GDC.time.quarter",
                "GDC.time.month",
                "GDC.time.week_us",
                "GDC.time.date",
                "GDC.time.hour",
                "GDC.time.minute",
            ]);
        });

        it("fiscal-only set", () => {
            expect(getGranularities({ calendars: [{ type: "fiscal" }], includeShared: false })).toEqual([
                "GDC.time.fiscal_year",
                "GDC.time.fiscal_quarter",
                "GDC.time.fiscal_month",
            ]);
        });

        it("fiscal-tab set (fiscal + shared)", () => {
            expect(getGranularities({ calendars: [{ type: "fiscal" }], includeShared: true })).toEqual([
                "GDC.time.fiscal_year",
                "GDC.time.fiscal_quarter",
                "GDC.time.fiscal_month",
                "GDC.time.week_us",
                "GDC.time.date",
                "GDC.time.hour",
                "GDC.time.minute",
            ]);
        });

        it("excludes time granularities when includeTime is false", () => {
            expect(getGranularities({ calendars: [{ type: "standard" }], includeTime: false })).toEqual([
                "GDC.time.year",
                "GDC.time.quarter",
                "GDC.time.month",
                "GDC.time.week_us",
                "GDC.time.date",
            ]);
        });
    });

    describe("family selection (generic-only, like MAQL LS chronological vs periodical)", () => {
        it("returns cyclical/generic granularities for the standard calendar, excluding not-offered EU variants", () => {
            const result = getGranularities({ calendars: [{ type: "standard" }], families: ["cyclical"] });
            expect(result).toEqual([
                "GDC.time.quarter_in_year",
                "GDC.time.month_in_quarter",
                "GDC.time.month_in_year",
                "GDC.time.week_in_quarter",
                "GDC.time.week_in_year",
                "GDC.time.day_in_week",
                "GDC.time.day_in_month",
                "GDC.time.day_in_quarter",
                "GDC.time.day_in_year",
                "GDC.time.hour_in_day",
                "GDC.time.minute_in_hour",
            ]);
            expect(result).not.toContain("GDC.time.euweek_in_year");
            expect(result).not.toContain("GDC.time.day_in_euweek");
        });
    });

    describe("offered-by-default gating", () => {
        it("never offers the GDC.time.week alias by default", () => {
            const all = getGranularities({
                calendars: [{ type: "standard" }],
                families: ["chronological", "cyclical"],
            });
            expect(all).not.toContain("GDC.time.week");
        });

        it("includes non-default granularities only when explicitly requested", () => {
            const withNonDefault = getGranularities({
                calendars: [{ type: "standard" }],
                includeNonDefault: true,
            });
            expect(withNonDefault).toContain("GDC.time.week");
        });
    });

    describe("custom calendar branch", () => {
        it("emits enabled granularities in their defined order, then shared", () => {
            const result = getGranularities({
                calendars: [
                    {
                        type: "custom",
                        enabledGranularities: [
                            { granularity: "GDC.time.fiscal_month", order: 2 },
                            { granularity: "GDC.time.fiscal_year", order: 1 },
                        ],
                    },
                ],
                includeShared: true,
            });
            expect(result).toEqual([
                "GDC.time.fiscal_year",
                "GDC.time.fiscal_month",
                "GDC.time.week_us",
                "GDC.time.date",
                "GDC.time.hour",
                "GDC.time.minute",
            ]);
        });

        it("omits shared granularities when includeShared is false", () => {
            const result = getGranularities({
                calendars: [
                    { type: "custom", enabledGranularities: [{ granularity: "GDC.time.fiscal_year" }] },
                ],
                includeShared: false,
            });
            expect(result).toEqual(["GDC.time.fiscal_year"]);
        });

        it("does not duplicate a shared token that is also enabled", () => {
            const result = getGranularities({
                calendars: [
                    {
                        type: "custom",
                        enabledGranularities: [
                            { granularity: "GDC.time.fiscal_year", order: 1 },
                            { granularity: "GDC.time.date", order: 2 },
                        ],
                    },
                ],
                includeShared: true,
            });
            // GDC.time.date is both enabled and shared — it must appear once, in its enabled position.
            expect(result.filter((g) => g === "GDC.time.date")).toHaveLength(1);
            expect(result).toEqual([
                "GDC.time.fiscal_year",
                "GDC.time.date",
                "GDC.time.week_us",
                "GDC.time.hour",
                "GDC.time.minute",
            ]);
        });
    });

    describe("multiple calendars (merged union)", () => {
        it("merges standard + fiscal, de-duplicated, in canonical order", () => {
            expect(getGranularities({ calendars: [{ type: "standard" }, { type: "fiscal" }] })).toEqual([
                "GDC.time.year",
                "GDC.time.fiscal_year",
                "GDC.time.quarter",
                "GDC.time.fiscal_quarter",
                "GDC.time.month",
                "GDC.time.fiscal_month",
                "GDC.time.week_us",
                "GDC.time.date",
                "GDC.time.hour",
                "GDC.time.minute",
            ]);
        });

        it("de-duplicates shared granularities that appear in both calendars", () => {
            const result = getGranularities({ calendars: [{ type: "standard" }, { type: "fiscal" }] });
            expect(result.filter((g) => g === "GDC.time.week_us")).toHaveLength(1);
            expect(result.filter((g) => g === "GDC.time.date")).toHaveLength(1);
        });

        it("affinity distinguishes which calendar a merged granularity belongs to", () => {
            const merged = getGranularities({ calendars: [{ type: "standard" }, { type: "fiscal" }] });
            expect(merged.filter(isStandardGranularity)).toEqual([
                "GDC.time.year",
                "GDC.time.quarter",
                "GDC.time.month",
            ]);
            expect(merged.filter(isFiscalGranularity)).toEqual([
                "GDC.time.fiscal_year",
                "GDC.time.fiscal_quarter",
                "GDC.time.fiscal_month",
            ]);
            // shared granularities belong to both calendars
            expect(merged.filter(isSharedGranularity)).toEqual([
                "GDC.time.week_us",
                "GDC.time.date",
                "GDC.time.hour",
                "GDC.time.minute",
            ]);
        });
    });

    describe("belongsToCalendar (own + shared, one-pass bucketing of a merged result)", () => {
        const merged = getGranularities({ calendars: [{ type: "standard" }, { type: "fiscal" }] });

        it("standard bucket = standard + shared (no fiscal)", () => {
            expect(merged.filter((g) => belongsToCalendar(g, "standard"))).toEqual([
                "GDC.time.year",
                "GDC.time.quarter",
                "GDC.time.month",
                "GDC.time.week_us",
                "GDC.time.date",
                "GDC.time.hour",
                "GDC.time.minute",
            ]);
        });

        it("fiscal bucket = fiscal + shared (no standard)", () => {
            expect(merged.filter((g) => belongsToCalendar(g, "fiscal"))).toEqual([
                "GDC.time.fiscal_year",
                "GDC.time.fiscal_quarter",
                "GDC.time.fiscal_month",
                "GDC.time.week_us",
                "GDC.time.date",
                "GDC.time.hour",
                "GDC.time.minute",
            ]);
        });

        it("shared granularities belong to both; own-calendar ones only to theirs", () => {
            expect(belongsToCalendar("GDC.time.week_us", "standard")).toBe(true);
            expect(belongsToCalendar("GDC.time.week_us", "fiscal")).toBe(true);
            expect(belongsToCalendar("GDC.time.year", "fiscal")).toBe(false);
            expect(belongsToCalendar("GDC.time.fiscal_year", "standard")).toBe(false);
            expect(belongsToCalendar(undefined, "standard")).toBe(false);
        });
    });

    describe("predicates", () => {
        it("classifies affinity", () => {
            expect(isFiscalGranularity("GDC.time.fiscal_year")).toBe(true);
            expect(isStandardGranularity("GDC.time.year")).toBe(true);
            expect(isSharedGranularity("GDC.time.week_us")).toBe(true);
            expect(isFiscalGranularity("GDC.time.year")).toBe(false);
        });

        it("classifies family and time scale", () => {
            expect(isChronologicalGranularity("GDC.time.month")).toBe(true);
            expect(isCyclicalGranularity("GDC.time.month_in_year")).toBe(true);
            expect(isTimeGranularity("GDC.time.hour")).toBe(true);
            expect(isTimeGranularity("GDC.time.minute_in_hour")).toBe(true);
            expect(isTimeGranularity("GDC.time.month")).toBe(false);
        });

        it("is lenient about unknown / undefined input", () => {
            expect(isFiscalGranularity(undefined)).toBe(false);
            expect(isFiscalGranularity("not.a.granularity")).toBe(false);
            expect(getGranularityDescriptor("nope")).toBeUndefined();
        });
    });

    describe("relations", () => {
        it("maps standard↔fiscal counterparts", () => {
            expect(getFiscalEquivalent("GDC.time.year")).toEqual("GDC.time.fiscal_year");
            expect(getStandardEquivalent("GDC.time.fiscal_month")).toEqual("GDC.time.month");
            // no cross-mapping in the wrong direction
            expect(getFiscalEquivalent("GDC.time.fiscal_year")).toBeUndefined();
            expect(getStandardEquivalent("GDC.time.year")).toBeUndefined();
            // shared granularities have no counterpart
            expect(getFiscalEquivalent("GDC.time.week_us")).toBeUndefined();
        });

        it("maps cyclical granularities to their chronological parent", () => {
            expect(getChronologicalOrigin("GDC.time.month_in_year")).toEqual("GDC.time.month");
            expect(getChronologicalOrigin("GDC.time.day_in_week")).toEqual("GDC.time.date");
            expect(getChronologicalOrigin("GDC.time.year")).toBeUndefined();
        });
    });
});
