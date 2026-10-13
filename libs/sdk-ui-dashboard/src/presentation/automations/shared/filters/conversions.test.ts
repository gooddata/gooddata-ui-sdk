// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
    type FilterContextItem,
    type IAutomationVisibleFilter,
    type IDashboardDateFilter,
    type IFilter,
    type IInsight,
    type IInsightWidget,
    type IMeasureValueFilter,
    type IRankingFilter,
    idRef,
    localIdRef,
    newAbsoluteDashboardDateFilter,
    newAbsoluteDateFilter,
    newAllTimeDashboardDateFilter,
    newAllTimeFilter,
    newAttribute,
    newBucket,
    newInsightDefinition,
    newMeasureValueFilter,
    newRankingFilter,
    newRelativeDashboardDateFilter,
} from "@gooddata/sdk-model";

import { type IDashboardFilter } from "../../../../types.js";

import {
    dashboardFilterToFilterContextItem,
    getAppliedWidgetFilters,
    getVisibleFiltersByFilters,
    isNoopAllTimeDateFilterFixed,
    resolveFilterDimensionalityLocalRefs,
} from "./conversions.js";

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
        const result = getVisibleFiltersByFilters([selectedAttributeFilter], visibleFiltersMetadata, false);
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
        const result = getVisibleFiltersByFilters([allValuesAttributeFilter], visibleFiltersMetadata, true);

        expect(result).toEqual([]);
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

    it("should treat an absolute date filter without from/to as noop only when emptyValueHandling is missing", () => {
        const noopAbsoluteShape = {
            absoluteDateFilter: {
                dataSet: { identifier: "ds" },
                localIdentifier: "df",
            },
        };
        const configuredAbsoluteShape = {
            absoluteDateFilter: {
                dataSet: { identifier: "ds" },
                localIdentifier: "df",
                emptyValueHandling: "include",
            },
        };

        expect(isNoopAllTimeDateFilterFixed(noopAbsoluteShape as IFilter)).toBe(true);
        expect(isNoopAllTimeDateFilterFixed(configuredAbsoluteShape as IFilter)).toBe(false);
    });

    it("should return false for a non-date filter", () => {
        const attributeFilter: IFilter = {
            positiveAttributeFilter: {
                displayForm: { identifier: "attr.df" },
                in: { values: ["value"] },
            },
        };

        expect(isNoopAllTimeDateFilterFixed(attributeFilter)).toBe(false);
    });
});

describe("resolveFilterDimensionalityLocalRefs", () => {
    const attribute1 = newAttribute(idRef("attr.df1", "displayForm"), (a) => a.localId("a1"));
    const attribute2 = newAttribute(idRef("attr.df2", "displayForm"), (a) => a.localId("a2"));
    const insight = newInsightDefinition("local:table", (i) =>
        i.buckets([newBucket("attribute", attribute1, attribute2)]),
    ) as IInsight;

    const mvfWithLocalRefs: IMeasureValueFilter = {
        measureValueFilter: {
            ...newMeasureValueFilter(localIdRef("m1"), "GREATER_THAN", 100).measureValueFilter,
            dimensionality: [localIdRef("a1"), localIdRef("a2")],
        },
    };
    const rankingWithLocalRefs: IRankingFilter = newRankingFilter(
        localIdRef("m1"),
        [localIdRef("a1"), localIdRef("a2")],
        "TOP",
        10,
    );

    it("should return filters as-is when there is no insight", () => {
        const filters = [rankingWithLocalRefs];

        expect(resolveFilterDimensionalityLocalRefs(filters, undefined)).toBe(filters);
    });

    it("should resolve MVF dimensionality localIdRefs to display form refs", () => {
        const [resolved] = resolveFilterDimensionalityLocalRefs([mvfWithLocalRefs], insight);

        expect((resolved as IMeasureValueFilter).measureValueFilter.dimensionality).toEqual([
            idRef("attr.df1", "displayForm"),
            idRef("attr.df2", "displayForm"),
        ]);
    });

    it("should resolve ranking filter attributes localIdRefs to display form refs", () => {
        const [resolved] = resolveFilterDimensionalityLocalRefs([rankingWithLocalRefs], insight);

        expect((resolved as IRankingFilter).rankingFilter.attributes).toEqual([
            idRef("attr.df1", "displayForm"),
            idRef("attr.df2", "displayForm"),
        ]);
    });

    it("should keep the ranking filter measure ref untouched while resolving its attributes", () => {
        const [resolved] = resolveFilterDimensionalityLocalRefs([rankingWithLocalRefs], insight);

        expect((resolved as IRankingFilter).rankingFilter.measure).toEqual(localIdRef("m1"));
    });

    it("should keep localIdRefs that do not match any insight attribute", () => {
        const ranking = newRankingFilter(localIdRef("m1"), [localIdRef("unknown")], "TOP", 10);

        const [resolved] = resolveFilterDimensionalityLocalRefs([ranking], insight);

        expect((resolved as IRankingFilter).rankingFilter.attributes).toEqual([localIdRef("unknown")]);
        expect(resolved).toBe(ranking);
    });

    it("should return a ranking filter without attributes unchanged", () => {
        const ranking = newRankingFilter(localIdRef("m1"), "TOP", 10);

        const [resolved] = resolveFilterDimensionalityLocalRefs([ranking], insight);

        expect(resolved).toBe(ranking);
    });

    it("should keep non-localIdRef dimensionality items as they are", () => {
        const ranking = newRankingFilter(
            localIdRef("m1"),
            [idRef("attr.df3", "displayForm"), localIdRef("a1")],
            "BOTTOM",
            5,
        );

        const [resolved] = resolveFilterDimensionalityLocalRefs([ranking], insight);

        expect((resolved as IRankingFilter).rankingFilter.attributes).toEqual([
            idRef("attr.df3", "displayForm"),
            idRef("attr.df1", "displayForm"),
        ]);
    });

    it("should pass through other filter types untouched", () => {
        const attributeFilter: IFilter = {
            positiveAttributeFilter: {
                displayForm: { identifier: "attr.df" },
                in: { values: ["value"] },
            },
        };

        const [resolved] = resolveFilterDimensionalityLocalRefs([attributeFilter], insight);

        expect(resolved).toBe(attributeFilter);
    });
});

describe("widget automation filter round trip", () => {
    const widget: IInsightWidget = {
        ref: idRef("widget-1"),
        uri: "/widget-1",
        identifier: "widget-1",
        localIdentifier: "widget-1",
        type: "insight",
        title: "Widget",
        description: "",
        insight: idRef("insight-1"),
        drills: [],
        ignoreDashboardFilters: [],
        dateDataSet: idRef("closed", "dataSet"),
    };

    const roundTrip = (filter: FilterContextItem): IDashboardDateFilter => {
        const [executionFilter] = getAppliedWidgetFilters([filter], [], widget, undefined, undefined);

        return dashboardFilterToFilterContextItem(
            executionFilter as IDashboardFilter,
            true,
        ) as IDashboardDateFilter;
    };

    // Saved alerts used to reopen as Day whatever granularity the author had picked.
    it.each([
        ["GDC.time.month", "2026-03-01", "2026-04-30"],
        ["GDC.time.quarter", "2026-01-01", "2026-06-30"],
        ["GDC.time.year", "2025-01-01", "2026-12-31"],
        ["GDC.time.week_us", "2026-07-20", "2026-07-26"],
    ] as const)("keeps the %s granularity of an absolute date filter", (granularity, from, to) => {
        const filter = newAbsoluteDashboardDateFilter(
            from,
            to,
            idRef("closed", "dataSet"),
            "date-filter-1",
            undefined,
            granularity,
        );

        expect(roundTrip(filter).dateFilter).toMatchObject({ type: "absolute", granularity, from, to });
    });

    it("reads an absolute date filter with no granularity as a day range", () => {
        const filter = newAbsoluteDashboardDateFilter(
            "2026-03-15",
            "2026-04-10",
            idRef("closed", "dataSet"),
            "date-filter-1",
        );

        expect(roundTrip(filter).dateFilter).toMatchObject({
            type: "absolute",
            granularity: "GDC.time.date",
            from: "2026-03-15",
            to: "2026-04-10",
        });
    });

    it("reads an absolute date filter at a granularity the date filter cannot select as a day range", () => {
        const filter = newAbsoluteDateFilter(idRef("closed", "dataSet"), "2026-07-20", "2026-07-26", {
            granularity: "GDC.time.week",
        });

        expect(dashboardFilterToFilterContextItem(filter, true)).toMatchObject({
            dateFilter: {
                type: "absolute",
                granularity: "GDC.time.date",
                from: "2026-07-20",
                to: "2026-07-26",
            },
        });
    });
});
