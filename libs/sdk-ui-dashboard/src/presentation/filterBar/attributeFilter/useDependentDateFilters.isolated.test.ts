// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
    type DashboardDateFilterOfAnyType,
    type IDashboardAttributeFilter,
    idRef,
    newAbsoluteDashboardDateFilter,
    newRelativeDashboardDateFilter,
} from "@gooddata/sdk-model";

const { commonDateFilter, dateFiltersWithDimension, tabState } = vi.hoisted(() => ({
    commonDateFilter: { current: undefined as DashboardDateFilterOfAnyType | undefined },
    dateFiltersWithDimension: { current: [] as DashboardDateFilterOfAnyType[] },
    tabState: {
        isApplyAllAtOnce: false,
        applied: undefined as DashboardDateFilterOfAnyType | undefined,
        working: undefined as DashboardDateFilterOfAnyType | undefined,
    },
}));

vi.mock("../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: (selector: unknown) => selectorValues().get(selector),
}));

const { selectIsApplyFiltersAllAtOnceEnabledAndSet } =
    await import("../../../model/store/config/configSelectors.js");
const {
    selectFilterContextDateFilterForTab,
    selectFilterContextDateFilterOfAnyType,
    selectFilterContextDateFiltersWithDimensionForTab,
    selectFilterContextDateFiltersWithDimensionOfAnyType,
    selectWorkingFilterContextDateFilterForTab,
    selectWorkingFilterContextDateFilterOfAnyType,
    selectWorkingFilterContextDateFiltersWithDimensionForTab,
    selectWorkingFilterContextDateFiltersWithDimensionOfAnyType,
} = await import("../../../model/store/tabs/filterContext/filterContextSelectors.js");
const { useDependentDateFilters } = await import("./useDependentDateFilters.js");

function selectorValues(): Map<unknown, unknown> {
    return new Map<unknown, unknown>([
        [selectIsApplyFiltersAllAtOnceEnabledAndSet, tabState.isApplyAllAtOnce],
        [selectFilterContextDateFiltersWithDimensionOfAnyType, dateFiltersWithDimension.current],
        [selectWorkingFilterContextDateFiltersWithDimensionOfAnyType, dateFiltersWithDimension.current],
        [selectFilterContextDateFilterOfAnyType, commonDateFilter.current],
        [selectWorkingFilterContextDateFilterOfAnyType, commonDateFilter.current],
        // the tab selector factories are memoized, the same tab id gives the same selector
        [selectFilterContextDateFiltersWithDimensionForTab(tabId), []],
        [selectWorkingFilterContextDateFiltersWithDimensionForTab(tabId), []],
        [selectFilterContextDateFilterForTab(tabId), tabState.applied],
        [selectWorkingFilterContextDateFilterForTab(tabId), tabState.working],
    ]);
}

const dataSet = idRef("date", "dataSet");
const tabId = "secondTab";

const attributeFilter: IDashboardAttributeFilter = {
    attributeFilter: {
        displayForm: idRef("label.region"),
        negativeSelection: true,
        attributeElements: { uris: [] },
        localIdentifier: "regionFilter",
        filterElementsByDate: [{ filterLocalIdentifier: "commonDateFilter", isCommonDate: true, dataSet }],
    },
};

function dependentDateFilters(common: DashboardDateFilterOfAnyType | undefined) {
    commonDateFilter.current = common;
    return renderHook(() => useDependentDateFilters(attributeFilter)).result.current.dependentDateFilters;
}

describe("useDependentDateFilters", () => {
    it("applies an absolute date filter with granularity through the dataset of the dependency", () => {
        const result = dependentDateFilters({
            dashboardAbsoluteGranularityDateFilter: {
                localIdentifier: "commonDateFilter",
                granularity: "GDC.time.month",
                from: "2026-03",
                to: "2026-05",
            },
        });

        expect(result).toEqual([
            {
                dashboardAbsoluteGranularityDateFilter: {
                    granularity: "GDC.time.month",
                    from: "2026-03",
                    to: "2026-05",
                    dataSet,
                },
            },
        ]);
    });

    it("keeps an open edge of an absolute date filter with granularity open", () => {
        const result = dependentDateFilters({
            dashboardAbsoluteGranularityDateFilter: {
                granularity: "GDC.time.year",
                to: "2025",
            },
        });

        expect(result).toEqual([
            { dashboardAbsoluteGranularityDateFilter: { granularity: "GDC.time.year", to: "2025", dataSet } },
        ]);
    });

    it("applies an absolute date filter through the dataset of the dependency", () => {
        const result = dependentDateFilters(newAbsoluteDashboardDateFilter("2026-03-01", "2026-03-31"));

        expect(result).toEqual([
            {
                dateFilter: {
                    type: "absolute",
                    granularity: "GDC.time.date",
                    from: "2026-03-01",
                    to: "2026-03-31",
                    dataSet,
                },
            },
        ]);
    });

    it("applies a relative date filter through the dataset of the dependency", () => {
        const result = dependentDateFilters(newRelativeDashboardDateFilter("GDC.time.month", -3, -1));

        expect(result).toEqual([
            { dateFilter: { type: "relative", granularity: "GDC.time.month", from: -3, to: -1, dataSet } },
        ]);
    });

    it("uses All time when the dashboard has no common date filter", () => {
        const result = dependentDateFilters(undefined);

        expect(result).toEqual([
            {
                dateFilter: {
                    type: "relative",
                    granularity: "GDC.time.date",
                    from: undefined,
                    to: undefined,
                    dataSet,
                },
            },
        ]);
    });

    describe("in a given tab", () => {
        const applied: DashboardDateFilterOfAnyType = {
            dashboardAbsoluteGranularityDateFilter: { granularity: "GDC.time.quarter", from: "2026-1" },
        };
        const working: DashboardDateFilterOfAnyType = {
            dashboardAbsoluteGranularityDateFilter: { granularity: "GDC.time.week", to: "2026-05" },
        };

        function dependentDateFiltersInTab(isApplyAllAtOnce: boolean) {
            tabState.isApplyAllAtOnce = isApplyAllAtOnce;
            tabState.applied = applied;
            tabState.working = working;
            // the common date filter of the active tab must not be used
            commonDateFilter.current = newRelativeDashboardDateFilter("GDC.time.year", -1, -1);
            try {
                return renderHook(() => useDependentDateFilters(attributeFilter, tabId)).result.current
                    .dependentDateFilters;
            } finally {
                tabState.isApplyAllAtOnce = false;
            }
        }

        it("applies the applied absolute date filter with granularity of the tab", () => {
            expect(dependentDateFiltersInTab(false)).toEqual([
                {
                    dashboardAbsoluteGranularityDateFilter: {
                        granularity: "GDC.time.quarter",
                        from: "2026-1",
                        dataSet,
                    },
                },
            ]);
        });

        it("applies the working absolute date filter with granularity of the tab when filters apply at once", () => {
            expect(dependentDateFiltersInTab(true)).toEqual([
                {
                    dashboardAbsoluteGranularityDateFilter: {
                        granularity: "GDC.time.week",
                        to: "2026-05",
                        dataSet,
                    },
                },
            ]);
        });
    });

    it("uses a date filter with a dimension of the new type as the parent", () => {
        const closedMonths: DashboardDateFilterOfAnyType = {
            dashboardAbsoluteGranularityDateFilter: {
                granularity: "GDC.time.month",
                from: "2026-03",
                dataSet: idRef("closed", "dataSet"),
                localIdentifier: "closedDateFilter",
            },
        };
        dateFiltersWithDimension.current = [closedMonths];
        const dependentOnClosed: IDashboardAttributeFilter = {
            attributeFilter: {
                ...attributeFilter.attributeFilter,
                filterElementsByDate: [{ filterLocalIdentifier: "closedDateFilter", isCommonDate: false }],
            },
        };

        try {
            expect(
                renderHook(() => useDependentDateFilters(dependentOnClosed)).result.current
                    .dependentDateFilters,
            ).toEqual([closedMonths]);
        } finally {
            dateFiltersWithDimension.current = [];
        }
    });
});
