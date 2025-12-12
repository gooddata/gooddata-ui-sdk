// (C) 2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type FilterContextItem,
    type IAutomationVisibleFilter,
    dashboardFilterLocalIdentifier,
    isAllTimeDashboardDateFilter,
    newAllTimeDashboardDateFilter,
    newRelativeDashboardDateFilter,
} from "@gooddata/sdk-model";

import {
    type IAutomationFiltersPerTabData,
    validateExistingAutomationFiltersPerTab,
} from "../useValidateExistingAutomationFilters.js";

const commonDateFilterLocalIdentifier = "commonDateFilter";
const allTimeCommonDateFilterContextItem: FilterContextItem = newAllTimeDashboardDateFilter(
    undefined,
    commonDateFilterLocalIdentifier,
);
const nonAllTimeCommonDateFilterContextItem: FilterContextItem = newRelativeDashboardDateFilter(
    "GDC.time.date",
    1,
    2,
    undefined,
    commonDateFilterLocalIdentifier,
);

const attributeFilterContextItem: FilterContextItem = {
    attributeFilter: {
        displayForm: {
            identifier: "attribute",
        },
        negativeSelection: true,
        attributeElements: {
            values: ["element"],
        },
        localIdentifier: "attribute",
    },
};

function createVisibleFilter(filterContextItem: FilterContextItem): IAutomationVisibleFilter {
    return {
        localIdentifier: dashboardFilterLocalIdentifier(filterContextItem),
        isAllTimeDateFilter: isAllTimeDashboardDateFilter(filterContextItem),
        title: "not relevant for validation",
    };
}

describe("validateExistingAutomationFiltersPerTab", () => {
    describe("all tabs valid", () => {
        it("should be valid when all tabs have matching filters", () => {
            const dashboardFiltersPerTab: IAutomationFiltersPerTabData[] = [
                {
                    tabId: "tab1",
                    availableFilters: [allTimeCommonDateFilterContextItem],
                    hiddenFilters: [],
                    lockedFilters: [],
                },
                {
                    tabId: "tab2",
                    availableFilters: [attributeFilterContextItem],
                    hiddenFilters: [],
                    lockedFilters: [],
                },
            ];

            const result = validateExistingAutomationFiltersPerTab({
                savedDashboardFiltersByTab: {
                    tab1: [allTimeCommonDateFilterContextItem],
                    tab2: [attributeFilterContextItem],
                },
                savedAutomationVisibleFiltersByTab: {
                    tab1: [createVisibleFilter(allTimeCommonDateFilterContextItem)],
                    tab2: [createVisibleFilter(attributeFilterContextItem)],
                },
                dashboardFiltersPerTab,
            });

            expect(result.isValid).toBe(true);
        });
    });

    describe("one tab valid, second not", () => {
        it("should be invalid when one tab has missing hidden filter", () => {
            const dashboardFiltersPerTab: IAutomationFiltersPerTabData[] = [
                {
                    tabId: "tab1",
                    availableFilters: [allTimeCommonDateFilterContextItem],
                    hiddenFilters: [],
                    lockedFilters: [],
                },
                {
                    tabId: "tab2",
                    availableFilters: [allTimeCommonDateFilterContextItem, attributeFilterContextItem],
                    hiddenFilters: [attributeFilterContextItem],
                    lockedFilters: [],
                },
            ];

            const result = validateExistingAutomationFiltersPerTab({
                savedDashboardFiltersByTab: {
                    tab1: [allTimeCommonDateFilterContextItem],
                    // tab2 is missing the hidden attribute filter in saved filters
                    tab2: [allTimeCommonDateFilterContextItem],
                },
                savedAutomationVisibleFiltersByTab: {
                    tab1: [createVisibleFilter(allTimeCommonDateFilterContextItem)],
                    tab2: [createVisibleFilter(allTimeCommonDateFilterContextItem)],
                },
                dashboardFiltersPerTab,
            });

            expect(result.isValid).toBe(false);
            expect(result.hiddenFilterIsMissingInSavedFilters).toBe(true);
        });

        it("should be invalid when one tab has changed locked filter", () => {
            const changedCommonDateFilterContextItem: FilterContextItem = newRelativeDashboardDateFilter(
                "GDC.time.date",
                3,
                4,
                undefined,
                commonDateFilterLocalIdentifier,
            );

            const dashboardFiltersPerTab: IAutomationFiltersPerTabData[] = [
                {
                    tabId: "tab1",
                    availableFilters: [nonAllTimeCommonDateFilterContextItem],
                    hiddenFilters: [],
                    lockedFilters: [nonAllTimeCommonDateFilterContextItem],
                },
                {
                    tabId: "tab2",
                    availableFilters: [nonAllTimeCommonDateFilterContextItem],
                    hiddenFilters: [],
                    lockedFilters: [],
                },
            ];

            const result = validateExistingAutomationFiltersPerTab({
                savedDashboardFiltersByTab: {
                    // tab1 has changed locked filter value
                    tab1: [changedCommonDateFilterContextItem],
                    tab2: [nonAllTimeCommonDateFilterContextItem],
                },
                savedAutomationVisibleFiltersByTab: {
                    tab1: [createVisibleFilter(nonAllTimeCommonDateFilterContextItem)],
                    tab2: [createVisibleFilter(nonAllTimeCommonDateFilterContextItem)],
                },
                dashboardFiltersPerTab,
            });

            expect(result.isValid).toBe(false);
            expect(result.lockedFilterHasDifferentValueInSavedFilter).toBe(true);
        });
    });

    describe("not matching structure", () => {
        it("should be invalid when automation has filters for non-existent tab", () => {
            const dashboardFiltersPerTab: IAutomationFiltersPerTabData[] = [
                {
                    tabId: "tab1",
                    availableFilters: [allTimeCommonDateFilterContextItem],
                    hiddenFilters: [],
                    lockedFilters: [],
                },
                // tab2 no longer exists in dashboard
            ];

            const result = validateExistingAutomationFiltersPerTab({
                savedDashboardFiltersByTab: {
                    tab1: [allTimeCommonDateFilterContextItem],
                    // tab2 exists in automation but not in dashboard anymore
                    tab2: [attributeFilterContextItem],
                },
                savedAutomationVisibleFiltersByTab: {
                    tab1: [createVisibleFilter(allTimeCommonDateFilterContextItem)],
                    tab2: [createVisibleFilter(attributeFilterContextItem)],
                },
                dashboardFiltersPerTab,
            });

            expect(result.isValid).toBe(false);
            expect(result.removedFilterIsAppliedInSavedFilters).toBe(true);
        });

        it("should be valid with empty savedDashboardFiltersByTab (validates each empty tab)", () => {
            const dashboardFiltersPerTab: IAutomationFiltersPerTabData[] = [
                {
                    tabId: "tab1",
                    availableFilters: [allTimeCommonDateFilterContextItem],
                    hiddenFilters: [],
                    lockedFilters: [],
                },
                {
                    tabId: "tab2",
                    availableFilters: [attributeFilterContextItem],
                    hiddenFilters: [],
                    lockedFilters: [],
                },
            ];

            // Empty object means no tabs to validate - results in valid state
            const result = validateExistingAutomationFiltersPerTab({
                savedDashboardFiltersByTab: {},
                savedAutomationVisibleFiltersByTab: {},
                dashboardFiltersPerTab,
            });

            expect(result.isValid).toBe(true);
        });
    });
});
