// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import type { IUnavailableDashboardReference } from "@gooddata/sdk-backend-spi";
import {
    type FilterContextItem,
    type IAutomationVisibleFilter,
    type IDashboardAttributeFilterConfig,
    dashboardFilterLocalIdentifier,
    isAllTimeDashboardDateFilter,
    newAllTimeDashboardDateFilter,
} from "@gooddata/sdk-model";

import { selectAutomationFiltersByTab } from "../../../../../model/store/filtering/dashboardFilterSelectors.js";
import type { IAutomationFiltersTab } from "../../../../../model/store/filtering/types.js";

import { validateExistingAutomationFiltersPerTab } from "./useValidateExistingAutomationFilters.js";

const commonDate = newAllTimeDashboardDateFilter(undefined, "commonDate");

function attributeFilter(localIdentifier: string): FilterContextItem {
    return {
        attributeFilter: {
            displayForm: { identifier: `${localIdentifier}_label`, type: "displayForm" },
            negativeSelection: false,
            attributeElements: { values: ["value"] },
            localIdentifier,
        },
    };
}

const lockedCity = attributeFilter("city");
const hiddenCounty = attributeFilter("county");

const tabAConfigs: IDashboardAttributeFilterConfig[] = [
    { localIdentifier: "city", mode: "readonly" },
    { localIdentifier: "county", mode: "hidden" },
];

function forbidden(filter: FilterContextItem): IUnavailableDashboardReference {
    return {
        ref: { identifier: `${dashboardFilterLocalIdentifier(filter)}_label`, type: "displayForm" },
        type: "displayForm",
        reason: "forbidden",
    };
}

function visible(filter: FilterContextItem): IAutomationVisibleFilter {
    return {
        localIdentifier: dashboardFilterLocalIdentifier(filter),
        isAllTimeDateFilter: isAllTimeDashboardDateFilter(filter),
    };
}

// The combiner is called directly, so the per-tab data is exactly what the dashboard hands the dialog.
const filtersByTabCombiner = (
    selectAutomationFiltersByTab as unknown as { resultFunc: (...args: unknown[]) => IAutomationFiltersTab[] }
).resultFunc;

function dashboardTabs(unavailableObjects: IUnavailableDashboardReference[]) {
    return filtersByTabCombiner(
        [
            { localIdentifier: "tabA", title: "A" },
            { localIdentifier: "tabB", title: "B" },
        ],
        { tabA: [commonDate, lockedCity, hiddenCounty], tabB: [commonDate] },
        unavailableObjects,
        {},
        {},
        { tabA: tabAConfigs, tabB: [] },
        {},
    );
}

// What an author who can read every filter saves: the visible filters, plus the hidden one.
const savedByAuthor = {
    savedDashboardFiltersByTab: { tabA: [commonDate, lockedCity, hiddenCounty], tabB: [commonDate] },
    savedAutomationVisibleFiltersByTab: {
        tabA: [visible(commonDate), visible(lockedCity)],
        tabB: [visible(commonDate)],
    },
};

describe("validateExistingAutomationFiltersPerTab with hidden filters", () => {
    it("accepts a stored hidden filter that the dashboard still has", () => {
        const result = validateExistingAutomationFiltersPerTab({
            ...savedByAuthor,
            dashboardFiltersPerTab: dashboardTabs([]),
            commonDateFilterId: "commonDate",
        });

        expect(result.removedFilterIsAppliedInSavedFilters).toBe(false);
        expect(result.isValid).toBe(true);
    });

    it("accepts a stored hidden restricted filter next to a locked restricted one", () => {
        const result = validateExistingAutomationFiltersPerTab({
            ...savedByAuthor,
            dashboardFiltersPerTab: dashboardTabs([forbidden(lockedCity), forbidden(hiddenCounty)]),
            commonDateFilterId: "commonDate",
        });

        expect(result.removedFilterIsAppliedInSavedFilters).toBe(false);
        expect(result.isValid).toBe(true);
    });

    it("still flags a stored filter the dashboard no longer has", () => {
        const removed = attributeFilter("removed");
        const result = validateExistingAutomationFiltersPerTab({
            ...savedByAuthor,
            savedDashboardFiltersByTab: {
                ...savedByAuthor.savedDashboardFiltersByTab,
                tabA: [...savedByAuthor.savedDashboardFiltersByTab.tabA, removed],
            },
            dashboardFiltersPerTab: dashboardTabs([]),
            commonDateFilterId: "commonDate",
        });

        expect(result.removedFilterIsAppliedInSavedFilters).toBe(true);
        expect(result.isValid).toBe(false);
    });
});
