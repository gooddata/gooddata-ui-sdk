// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type FilterContextItem,
    type IAutomationVisibleFilter,
    type IFilter,
    newAllTimeDashboardDateFilter,
    newAllTimeFilter,
    newArbitraryAttributeFilter,
    newMatchAttributeFilter,
    newRelativeDashboardDateFilter,
    newRelativeDateFilter,
} from "@gooddata/sdk-model";

import {
    areFiltersEqual,
    getVisibleFiltersByFilters,
    isAllTimeDateFilterFixed,
    isNoopAllTimeDateFilterFixed,
} from "../utils.js";

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

    describe("getVisibleFiltersByFilters", () => {
        const allValuesAttributeFilter: FilterContextItem = {
            attributeFilter: {
                displayForm: { identifier: "attr.df" },
                negativeSelection: true,
                attributeElements: { values: [] },
                localIdentifier: "allValuesAttr",
            },
        };
        const selectedAttributeFilter: FilterContextItem = {
            attributeFilter: {
                displayForm: { identifier: "attr.df2" },
                negativeSelection: true,
                attributeElements: { values: ["element1"] },
                localIdentifier: "selectedAttr",
            },
        };
        const allTimeDateFilter: FilterContextItem = newAllTimeDashboardDateFilter(
            { identifier: "ds" },
            "allTimeDate",
        );
        const relativeDateFilter: FilterContextItem = newRelativeDashboardDateFilter(
            "GDC.time.date",
            -1,
            0,
            { identifier: "ds2" },
            "relativeDate",
        );

        const visibleFiltersMetadata: IAutomationVisibleFilter[] = [
            { localIdentifier: "allValuesAttr", title: "All Values Attr" },
            { localIdentifier: "selectedAttr", title: "Selected Attr" },
            { localIdentifier: "allTimeDate", title: "All Time Date" },
            { localIdentifier: "relativeDate", title: "Relative Date" },
        ];

        it("should return undefined when storeFilters is false", () => {
            const result = getVisibleFiltersByFilters(
                [selectedAttributeFilter],
                visibleFiltersMetadata,
                false,
            );
            expect(result).toBeUndefined();
        });

        it("should exclude all-values attribute filters from visible filters metadata", () => {
            const result = getVisibleFiltersByFilters(
                [allValuesAttributeFilter, selectedAttributeFilter],
                visibleFiltersMetadata,
                true,
            );

            expect(result).toHaveLength(1);
            expect(result![0].localIdentifier).toBe("selectedAttr");
        });

        it("should keep date filters including all-time with isAllTimeDateFilter flag", () => {
            const result = getVisibleFiltersByFilters(
                [allTimeDateFilter, relativeDateFilter],
                visibleFiltersMetadata,
                true,
            );

            expect(result).toHaveLength(2);
            expect(result![0].localIdentifier).toBe("allTimeDate");
            expect(result![0].isAllTimeDateFilter).toBe(true);
            expect(result![1].localIdentifier).toBe("relativeDate");
            expect(result![1].isAllTimeDateFilter).toBe(false);
        });

        it("should return only non-all-values filters when mixed with date filters", () => {
            const result = getVisibleFiltersByFilters(
                [allValuesAttributeFilter, selectedAttributeFilter, relativeDateFilter],
                visibleFiltersMetadata,
                true,
            );

            expect(result).toHaveLength(2);
            expect(result!.map((f) => f.localIdentifier)).toEqual(["selectedAttr", "relativeDate"]);
        });

        it("should return empty array when all filters are all-values attribute filters", () => {
            const result = getVisibleFiltersByFilters(
                [allValuesAttributeFilter],
                visibleFiltersMetadata,
                true,
            );

            expect(result).toEqual([]);
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
