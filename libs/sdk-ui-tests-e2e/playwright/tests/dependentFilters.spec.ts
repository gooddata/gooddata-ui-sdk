// (C) 2023-2026 GoodData Corporation

import { expect, test } from "@playwright/test";

import { injectAuthHeader } from "@gooddata/e2e-utils";

import { API_TOKEN, describe } from "../config.js";
import {
    applyAttributeFilter,
    assertElementsListStatus,
    assertFilterSubtitle,
    assertIrrelevantElementValuesVisible,
    assertNoRelevantMessage,
    assertSelectedValueList,
    assertShowAllElementValuesVisible,
    assertTableColumnValues,
    assertValueList,
    assertWidgetNoDataForFilter,
    cancelEditMode,
    clearFilterSearch,
    clearIrrelevantElementValues,
    closeAttributeFilter,
    configureLimitingParentFilterDependency,
    deleteFilterValuesBy,
    discardChanges,
    enterEditMode,
    hasFilterListSize,
    mockFeatureHub,
    openAttributeFilter,
    removeAttributeFilter,
    resetAllFilters,
    searchAndSelectFilterItem,
    selectAttributeValues,
    selectAttributeWithoutSearch,
    showAllElementValues,
    visit,
    waitDashboardLoaded,
    waitFilterElementsLoaded,
    waitTableLoaded,
} from "../helpers.js";

test.beforeEach(async ({ page }) => {
    await injectAuthHeader(page, API_TOKEN);
    await mockFeatureHub(page);
});

describe("Dependent filter", "dependentFilters", () => {
    test(
        "should test parent - child interaction in view mode",
        { tag: ["@pre-merge-integrated"] },
        async ({ page }) => {
            await visit(page, "dashboard/dashboard-dependent-filters");

            const WIDGET = ".s-dash-item-0_0";

            // Verify initial table state
            await assertTableColumnValues(page, WIDGET, 2, [
                "Bridgeport",
                "Hartford",
                "Boston",
                "Nashua",
                "New York",
                "Poughkeepsie",
                "Portland",
                "Philadelphia",
                "Providence",
            ]);

            // Select Connecticut in State filter
            await openAttributeFilter(page, "State");
            await waitFilterElementsLoaded(page);
            await selectAttributeValues(page, ["Connecticut"]);
            await applyAttributeFilter(page);

            // Verify table filtered to Connecticut cities
            await assertTableColumnValues(page, WIDGET, 2, ["Bridgeport", "Hartford"]);

            // Verify City filter shows Connecticut cities
            await openAttributeFilter(page, "City");
            await waitFilterElementsLoaded(page);
            await assertFilterSubtitle(page, "City", "All");
            await hasFilterListSize(page, 6);
            await assertSelectedValueList(page, [
                "Bridgeport",
                "Danbury",
                "Hartford",
                "New Haven",
                "Norwich",
                "Waterbury",
            ]);
            await assertValueList(page, [
                "Bridgeport",
                "Danbury",
                "Hartford",
                "New Haven",
                "Norwich",
                "Waterbury",
            ]);
            await assertShowAllElementValuesVisible(page, true);
            await showAllElementValues(page);
            await assertShowAllElementValuesVisible(page, false);
            await hasFilterListSize(page, 363);
            await selectAttributeValues(page, ["Hartford"]);
            await applyAttributeFilter(page);
            await assertFilterSubtitle(page, "City", "Hartford");

            // Verify table shows only Hartford
            await assertTableColumnValues(page, WIDGET, 2, ["Hartford"]);

            // Select Oregon in State filter
            await openAttributeFilter(page, "State");
            await selectAttributeValues(page, ["Oregon"]);
            await applyAttributeFilter(page);

            // Widget should show no data for filter message
            await assertWidgetNoDataForFilter(page, WIDGET);

            // Verify City filter shows Oregon cities, Hartford is irrelevant
            await openAttributeFilter(page, "City");
            await waitFilterElementsLoaded(page);
            await assertFilterSubtitle(page, "City", "Hartford");
            await hasFilterListSize(page, 4);
            await assertSelectedValueList(page, []);
            await assertValueList(page, ["Eugene", "Medford", "Portland", "Salem"]);
            await assertElementsListStatus(page, "Hartford");
            await assertIrrelevantElementValuesVisible(page, true);
            await clearIrrelevantElementValues(page);
            await assertIrrelevantElementValuesVisible(page, false);
            await assertElementsListStatus(page, "None");
            await assertShowAllElementValuesVisible(page, true);
            await showAllElementValues(page);
            await assertShowAllElementValuesVisible(page, false);
            await assertElementsListStatus(page, "None");
            await hasFilterListSize(page, 363);
            await selectAttributeValues(page, ["New York"]);
            await assertElementsListStatus(page, "New York");
            await closeAttributeFilter(page, "City");

            // Re-open to verify state was reset (not applied)
            await openAttributeFilter(page, "City");
            await assertFilterSubtitle(page, "City", "Hartford");
            await hasFilterListSize(page, 4);
            await assertSelectedValueList(page, []);
            await assertValueList(page, ["Eugene", "Medford", "Portland", "Salem"]);
            await assertIrrelevantElementValuesVisible(page, true);
            await assertShowAllElementValuesVisible(page, true);
            await showAllElementValues(page);
            await assertIrrelevantElementValuesVisible(page, false);
            await assertShowAllElementValuesVisible(page, false);
            await closeAttributeFilter(page, "City");

            // Re-open, search and select Medford
            await openAttributeFilter(page, "City");
            await searchAndSelectFilterItem(page, "Medford");
            await assertElementsListStatus(page, "Hartford, Medford");
            await clearIrrelevantElementValues(page);
            await clearFilterSearch(page);
            await waitFilterElementsLoaded(page);
            await assertSelectedValueList(page, ["Medford"]);

            // Select Connecticut and Oregon in State filter
            await openAttributeFilter(page, "State");
            await selectAttributeValues(page, ["Connecticut", "Oregon"]);
            await applyAttributeFilter(page);

            // Verify table shows Hartford (Connecticut city)
            await assertTableColumnValues(page, WIDGET, 2, ["Hartford"]);

            // Verify City filter state
            await openAttributeFilter(page, "City");
            await waitFilterElementsLoaded(page);
            await assertFilterSubtitle(page, "City", "Hartford");
            await hasFilterListSize(page, 10);
            await assertSelectedValueList(page, ["Hartford"]);
        },
    );

    test(
        "should test parent - child interaction in edit mode",
        { tag: ["@pre-merge-integrated"] },
        async ({ page }) => {
            await visit(page, "dashboard/dashboard-dependent-filters");

            const WIDGET = ".s-dash-item-0_0";

            await enterEditMode(page);

            // Verify initial table state in edit mode
            await waitTableLoaded(page, WIDGET);
            await assertTableColumnValues(page, WIDGET, 1, [
                "Connecticut",
                "",
                "Massachusetts",
                "New Hampshire",
                "New York",
                "",
                "Oregon",
                "Pennsylvania",
                "Rhode Island",
            ]);

            // Configure State filter to depend on Region, verify list reduces
            await openAttributeFilter(page, "State");
            await waitFilterElementsLoaded(page);
            await assertFilterSubtitle(page, "State", "All");
            await hasFilterListSize(page, 111);
            await configureLimitingParentFilterDependency(page, "Region");
            await waitFilterElementsLoaded(page);
            await hasFilterListSize(page, 7);
            await assertSelectedValueList(page, [
                "Connecticut",
                "Massachusetts",
                "New Hampshire",
                "New York",
                "Oregon",
                "Pennsylvania",
                "Rhode Island",
            ]);

            // Verify table unchanged after configuring dependency
            await waitTableLoaded(page, WIDGET);
            await assertTableColumnValues(page, WIDGET, 1, [
                "Connecticut",
                "",
                "Massachusetts",
                "New Hampshire",
                "New York",
                "",
                "Oregon",
                "Pennsylvania",
                "Rhode Island",
            ]);

            // Select West Coast in Region filter
            await openAttributeFilter(page, "Region");
            await waitFilterElementsLoaded(page);
            await selectAttributeValues(page, ["West Coast"]);
            await applyAttributeFilter(page);
            await waitTableLoaded(page, WIDGET);

            // Verify State filter now shows West Coast states
            await openAttributeFilter(page, "State");
            await waitFilterElementsLoaded(page);
            await assertFilterSubtitle(page, "State", "All");
            await hasFilterListSize(page, 3);
            await assertSelectedValueList(page, ["California", "Oregon", "Washington"]);
            await assertValueList(page, ["California", "Oregon", "Washington"]);
            await selectAttributeValues(page, ["California"]);
            await applyAttributeFilter(page);
            await assertFilterSubtitle(page, "State", "California");

            await waitTableLoaded(page, WIDGET);

            // Configure City filter to depend on Region, select Sacramento
            await openAttributeFilter(page, "City");
            await waitFilterElementsLoaded(page);
            await assertFilterSubtitle(page, "City", "All");
            await hasFilterListSize(page, 50);
            await configureLimitingParentFilterDependency(page, "Region");
            await waitFilterElementsLoaded(page);
            await hasFilterListSize(page, 7);
            await selectAttributeValues(page, ["Sacramento"]);
            await applyAttributeFilter(page);

            await waitTableLoaded(page, WIDGET);

            // Verify City filter subtitle and table column values
            await assertFilterSubtitle(page, "City", "Sacramento");
            await assertTableColumnValues(page, WIDGET, 0, ["West Coast"]);
            await assertTableColumnValues(page, WIDGET, 1, ["California"]);
            await assertTableColumnValues(page, WIDGET, 2, ["Sacramento"]);

            // Select East Coast in Region filter
            await openAttributeFilter(page, "Region");
            await waitFilterElementsLoaded(page);
            await assertIrrelevantElementValuesVisible(page, false);
            await assertShowAllElementValuesVisible(page, false);
            await selectAttributeValues(page, ["East Coast"]);
            await applyAttributeFilter(page);

            // Widget should show no data for filter
            await assertWidgetNoDataForFilter(page, WIDGET);

            // Verify State filter shows irrelevant values
            await openAttributeFilter(page, "State");
            await waitFilterElementsLoaded(page);
            await assertIrrelevantElementValuesVisible(page, true);
            await assertShowAllElementValuesVisible(page, true);

            // Verify City filter shows irrelevant values
            await openAttributeFilter(page, "City");
            await waitFilterElementsLoaded(page);
            await assertIrrelevantElementValuesVisible(page, true);
            await assertShowAllElementValuesVisible(page, true);

            // Switch Region back to West Coast
            await openAttributeFilter(page, "Region");
            await waitFilterElementsLoaded(page);
            await assertIrrelevantElementValuesVisible(page, false);
            await assertShowAllElementValuesVisible(page, false);
            await selectAttributeValues(page, ["West Coast"]);
            await applyAttributeFilter(page);

            await waitTableLoaded(page, WIDGET);

            // Verify State filter: no irrelevant, but show all visible
            await openAttributeFilter(page, "State");
            await waitFilterElementsLoaded(page);
            await assertIrrelevantElementValuesVisible(page, false);
            await assertShowAllElementValuesVisible(page, true);

            // Verify City filter: no irrelevant, but show all visible
            await openAttributeFilter(page, "City");
            await waitFilterElementsLoaded(page);
            await assertIrrelevantElementValuesVisible(page, false);
            await assertShowAllElementValuesVisible(page, true);

            // Cancel edit mode and discard changes
            await cancelEditMode(page);
            await discardChanges(page);
            await expect(page.locator(".s-edit_button")).toBeVisible();

            // Wait for dashboard to reload after discard
            await waitDashboardLoaded(page);
            await waitTableLoaded(page, WIDGET);

            // Verify filters are back to original state
            await openAttributeFilter(page, "Region");
            await waitFilterElementsLoaded(page);
            await clearFilterSearch(page);
            await waitFilterElementsLoaded(page);
            await assertFilterSubtitle(page, "Region", "East Coast");
            await hasFilterListSize(page, 4);

            await openAttributeFilter(page, "State");
            await waitFilterElementsLoaded(page);
            await assertFilterSubtitle(page, "State", "All");
            await hasFilterListSize(page, 111);

            await openAttributeFilter(page, "City");
            await waitFilterElementsLoaded(page);
            await assertFilterSubtitle(page, "City", "All");
            await hasFilterListSize(page, 363);
        },
    );

    test(
        "child filter can reduce to zero element by parent filter",
        { tag: ["@pre-merge-integrated"] },
        async ({ page }) => {
            await visit(page, "dashboard/dashboard-dependent-filters");

            const WIDGET = ".s-dash-item-0_0";

            await enterEditMode(page);
            await waitTableLoaded(page, WIDGET);

            // Open Product filter, select only TouchAll, apply
            await openAttributeFilter(page, "Product");
            await waitFilterElementsLoaded(page);
            await selectAttributeWithoutSearch(page, "TouchAll");
            await applyAttributeFilter(page);

            // Widget should show no data for filter
            await assertWidgetNoDataForFilter(page, WIDGET);

            // Open Stage Name filter, verify no relevant values and show all visible
            await openAttributeFilter(page, "Stage Name");
            await waitFilterElementsLoaded(page);
            await assertNoRelevantMessage(page);
            await assertShowAllElementValuesVisible(page, true);

            // Widget should still show no data for filter
            await assertWidgetNoDataForFilter(page, WIDGET);
        },
    );

    test(
        "can reload elements after selecting delete parent filter",
        { tag: ["@pre-merge-integrated"] },
        async ({ page }) => {
            await visit(page, "dashboard/dashboard-dependent-filters");

            const WIDGET = ".s-dash-item-0_0";

            await enterEditMode(page);

            // Select only Alabama in State filter and apply
            await openAttributeFilter(page, "State");
            await waitFilterElementsLoaded(page);
            await selectAttributeValues(page, ["Alabama"]);
            await applyAttributeFilter(page);

            // Widget should show no data for filter
            await assertWidgetNoDataForFilter(page, WIDGET);

            // Open City filter, verify 5 elements, delete State parent dependency
            await openAttributeFilter(page, "City");
            await waitFilterElementsLoaded(page);
            await hasFilterListSize(page, 5);
            await deleteFilterValuesBy(page, "State");
            await waitFilterElementsLoaded(page);
            await hasFilterListSize(page, 363);
        },
    );

    test(
        "can reload elements after removing parent filter",
        { tag: ["@pre-merge-integrated"] },
        async ({ page }) => {
            await visit(page, "dashboard/dashboard-dependent-filters");

            const WIDGET = ".s-dash-item-0_0";

            await enterEditMode(page);

            // Select only Alabama in State filter and apply
            await openAttributeFilter(page, "State");
            await waitFilterElementsLoaded(page);
            await selectAttributeValues(page, ["Alabama"]);
            await applyAttributeFilter(page);

            // Widget should show no data for filter
            await assertWidgetNoDataForFilter(page, WIDGET);

            // Open City filter, verify 5 elements, close
            await openAttributeFilter(page, "City");
            await waitFilterElementsLoaded(page);
            await hasFilterListSize(page, 5);
            await closeAttributeFilter(page, "City");

            // Remove the State filter from filter bar
            await removeAttributeFilter(page, "State");

            // Wait for table to reload
            await waitTableLoaded(page, WIDGET);

            // Open City filter, verify it now shows all 363 elements
            await openAttributeFilter(page, "City");
            await waitFilterElementsLoaded(page);
            await hasFilterListSize(page, 363);
        },
    );

    test(
        "should test a circle parent - child filter in edit mode",
        { tag: ["@pre-merge-integrated"] },
        async ({ page }) => {
            await visit(page, "dashboard/dashboard-dependent-filters");

            const WIDGET = ".s-dash-item-0_0";

            await enterEditMode(page);

            // Select Boston and Nashua in City filter
            await openAttributeFilter(page, "City");
            await waitFilterElementsLoaded(page);
            await selectAttributeValues(page, ["Boston", "Nashua"]);
            await applyAttributeFilter(page);
            await waitTableLoaded(page, WIDGET);

            // Configure State filter to depend on City
            await openAttributeFilter(page, "State");
            await waitFilterElementsLoaded(page);
            await configureLimitingParentFilterDependency(page, "City");
            await waitFilterElementsLoaded(page);
            await hasFilterListSize(page, 2);
            await selectAttributeValues(page, ["Massachusetts"]);
            await applyAttributeFilter(page);
            await waitTableLoaded(page, WIDGET);

            // Reopen State filter, verify 2 items, show all visible, click show all, close
            await openAttributeFilter(page, "State");
            await waitFilterElementsLoaded(page);
            await clearFilterSearch(page);
            await waitFilterElementsLoaded(page);
            await hasFilterListSize(page, 2);
            await assertShowAllElementValuesVisible(page, true);
            await showAllElementValues(page);
            await closeAttributeFilter(page, "State");

            // Reopen State filter, verify show all is still visible
            await openAttributeFilter(page, "State");
            await waitFilterElementsLoaded(page);
            await assertShowAllElementValuesVisible(page, true);

            // Verify table column values
            await assertTableColumnValues(page, WIDGET, 1, ["Massachusetts"]);
        },
    );

    test(
        "should not appear blank page after resetting dependent filter",
        { tag: ["@pre-merge-integrated"] },
        async ({ page }) => {
            await visit(page, "dashboard/dashboard-dependent-filters");

            const WIDGET = ".s-dash-item-0_0";

            // Select Connecticut in State filter
            await openAttributeFilter(page, "State");
            await waitFilterElementsLoaded(page);
            await selectAttributeValues(page, ["Connecticut"]);
            await applyAttributeFilter(page);

            // Verify table filtered to Connecticut cities
            await assertTableColumnValues(page, WIDGET, 2, ["Bridgeport", "Hartford"]);

            // Open City filter, verify Connecticut cities, show all elements
            await openAttributeFilter(page, "City");
            await waitFilterElementsLoaded(page);
            await assertValueList(page, [
                "Bridgeport",
                "Danbury",
                "Hartford",
                "New Haven",
                "Norwich",
                "Waterbury",
            ]);
            await assertShowAllElementValuesVisible(page, true);
            await showAllElementValues(page);

            // Reset all filters
            await resetAllFilters(page);

            // Verify City filter shows all 363 elements after reset
            await openAttributeFilter(page, "City");
            await waitFilterElementsLoaded(page);
            await hasFilterListSize(page, 363);

            // Verify table shows default values (no blank page)
            await assertTableColumnValues(page, WIDGET, 2, [
                "Bridgeport",
                "Hartford",
                "Boston",
                "Nashua",
                "New York",
                "Poughkeepsie",
                "Portland",
                "Philadelphia",
                "Providence",
            ]);
        },
    );
});
