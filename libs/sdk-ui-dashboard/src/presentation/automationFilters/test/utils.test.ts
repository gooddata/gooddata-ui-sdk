// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type IFilter,
    newAllTimeFilter,
    newArbitraryAttributeFilter,
    newMatchAttributeFilter,
    newRelativeDateFilter,
} from "@gooddata/sdk-model";

import { areFiltersEqual, isAllTimeDateFilterFixed, isNoopAllTimeDateFilterFixed } from "../utils.js";

describe("automationFilters/utils", () => {
    describe("isAllTimeDateFilterFixed", () => {
        it("should return true for standard all-time date filter", () => {
            const filter = newAllTimeFilter({ identifier: "ds" }, "df");

            expect(isAllTimeDateFilterFixed(filter)).toBe(true);
        });

        it("should return true for standard all-time date filter with emptyValueHandling", () => {
            const filter = newAllTimeFilter({ identifier: "ds" }, "df", "exclude");

            expect(isAllTimeDateFilterFixed(filter)).toBe(true);
        });

        it("should treat AD-style relative filter without from/to as all-time", () => {
            const adAllTimeShape = {
                relativeDateFilter: {
                    dataSet: { identifier: "ds" },
                    granularity: "GDC.time.date",
                    localIdentifier: "df",
                },
            };
            const adAllTimeShapeWithConfig = {
                relativeDateFilter: {
                    dataSet: { identifier: "ds" },
                    granularity: "GDC.time.date",
                    localIdentifier: "df",
                    emptyValueHandling: "include",
                },
            };

            expect(isAllTimeDateFilterFixed(adAllTimeShape as IFilter)).toBe(true);
            expect(isAllTimeDateFilterFixed(adAllTimeShapeWithConfig as IFilter)).toBe(true);
        });

        it("should return false for non-all-time relative date filter", () => {
            const filter = newRelativeDateFilter({ identifier: "ds" }, "GDC.time.date", -1, 0, "df");

            expect(isAllTimeDateFilterFixed(filter)).toBe(false);
        });
    });

    describe("isNoopAllTimeDateFilterFixed", () => {
        it("should return true for standard noop all-time date filter", () => {
            const filter = newAllTimeFilter({ identifier: "ds" }, "df");

            expect(isNoopAllTimeDateFilterFixed(filter)).toBe(true);
        });

        it("should return false for all-time date filter with emptyValueHandling", () => {
            const filter = newAllTimeFilter({ identifier: "ds" }, "df", "exclude");

            expect(isNoopAllTimeDateFilterFixed(filter)).toBe(false);
        });

        it("should treat AD-style relative filter without from/to as noop only when emptyValueHandling is missing", () => {
            const noopAdShape = {
                relativeDateFilter: {
                    dataSet: { identifier: "ds" },
                    granularity: "GDC.time.date",
                    localIdentifier: "df",
                },
            };
            const configuredAdShape = {
                relativeDateFilter: {
                    dataSet: { identifier: "ds" },
                    granularity: "GDC.time.date",
                    localIdentifier: "df",
                    emptyValueHandling: "include",
                },
            };

            expect(isNoopAllTimeDateFilterFixed(noopAdShape as IFilter)).toBe(true);
            expect(isNoopAllTimeDateFilterFixed(configuredAdShape as IFilter)).toBe(false);
        });
    });

    describe("areFiltersEqual", () => {
        it("should treat arbitrary attribute filters with same values (different array refs) as equal", () => {
            const ref = { identifier: "attr.df" };
            const filter1 = newArbitraryAttributeFilter(ref, ["a", "b"], false);
            const filter2 = newArbitraryAttributeFilter(ref, ["a", "b"], false);

            expect(filter1.arbitraryAttributeFilter.values).not.toBe(filter2.arbitraryAttributeFilter.values);
            expect(areFiltersEqual(filter1, filter2)).toBe(true);
        });

        it("should treat arbitrary attribute filters with different values as unequal", () => {
            const ref = { identifier: "attr.df" };
            const filter1 = newArbitraryAttributeFilter(ref, ["a", "b"], false);
            const filter2 = newArbitraryAttributeFilter(ref, ["a", "c"], false);

            expect(areFiltersEqual(filter1, filter2)).toBe(false);
        });

        it("should treat match attribute filters with same literal/operator/caseSensitive/negativeSelection as equal", () => {
            const ref = { identifier: "attr.df" };
            const filter1 = newMatchAttributeFilter(ref, "contains", "foo", {
                caseSensitive: true,
                negativeSelection: false,
            });
            const filter2 = newMatchAttributeFilter(ref, "contains", "foo", {
                caseSensitive: true,
                negativeSelection: false,
            });

            expect(areFiltersEqual(filter1, filter2)).toBe(true);
        });

        it("should treat match attribute filters differing in caseSensitive as unequal", () => {
            const ref = { identifier: "attr.df" };
            const filter1 = newMatchAttributeFilter(ref, "contains", "foo", {
                caseSensitive: true,
                negativeSelection: false,
            });
            const filter2 = newMatchAttributeFilter(ref, "contains", "foo", {
                caseSensitive: false,
                negativeSelection: false,
            });

            expect(areFiltersEqual(filter1, filter2)).toBe(false);
        });

        it("should treat match attribute filters differing in negativeSelection as unequal", () => {
            const ref = { identifier: "attr.df" };
            const filter1 = newMatchAttributeFilter(ref, "contains", "foo", {
                caseSensitive: false,
                negativeSelection: false,
            });
            const filter2 = newMatchAttributeFilter(ref, "contains", "foo", {
                caseSensitive: false,
                negativeSelection: true,
            });

            expect(areFiltersEqual(filter1, filter2)).toBe(false);
        });
    });
});
