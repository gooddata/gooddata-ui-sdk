// (C) 2024-2026 GoodData Corporation

import { test } from "@playwright/test";

import { injectAuthHeader } from "@gooddata/e2e-utils";

import { API_TOKEN, describe } from "../config.js";
import {
    applyAttributeFilter,
    assertCommonDateFilterVisible,
    assertHeadlineEmpty,
    assertHeadlineValue,
    assertIrrelevantElementValuesVisible,
    assertNoDataMetricDependency,
    assertSpecificDateFilterVisible,
    clearFilterSearch,
    clearIrrelevantElementValues,
    closeFilterConfiguration,
    configureLimitingDateFilterDependency,
    configureLimitingMetricDependency,
    configureLimitingParentFilterDependency,
    deleteFilterValuesBy,
    enterEditMode,
    expectChartDataLabels,
    hasFilterListSize,
    mockFeatureHub,
    openAttributeFilter,
    openDateFilter,
    searchMetricDependency,
    selectAttributeValues,
    selectDateFilterOption,
    selectFilterConfiguration,
    selectMetricDependency,
    showAllElementValues,
    typeIntoDateRangeFrom,
    typeIntoDateRangeTo,
    visit,
    waitChartLoaded,
    waitDashboardLoaded,
    waitFilterElementsLoaded,
    waitHeadlineLoaded,
} from "../helpers.js";

test.beforeEach(async ({ page }) => {
    await injectAuthHeader(page, API_TOKEN);
    await mockFeatureHub(page);
});

describe("Available value filter", "availableValueFilter", () => {
    test("should add metric filter by", { tag: ["@pre-merge-integrated"] }, async ({ page }) => {
        const headlineSelector = ".s-dash-item.viz-type-headline";

        await visit(page, "dashboard/dashboard-tiger-hide-filters");
        await waitDashboardLoaded(page);

        // Enter edit mode (also waits for catalog to load)
        await enterEditMode(page);

        // Select "All time" date filter and apply
        await page.locator(".s-date-filter-button").click();
        await page.locator(".s-all-time").click();
        const executionPromise = page.waitForResponse(
            (resp) => resp.url().includes("/afm/execute/result/") && resp.request().method() === "GET",
            { timeout: 15_000 },
        );
        await page.locator(".s-date-filter-apply").click();
        await executionPromise;

        // Select "101 Financial" in Account filter
        await openAttributeFilter(page, "Account");
        await waitFilterElementsLoaded(page);
        await selectAttributeValues(page, ["101 Financial"]);
        await applyAttributeFilter(page);

        // Verify headline shows "7,200"
        await waitHeadlineLoaded(page, headlineSelector);
        await assertHeadlineValue(page, headlineSelector, "7,200");

        // Open City filter, configure parent dependency on Account
        await openAttributeFilter(page, "City");
        await waitFilterElementsLoaded(page);
        await configureLimitingParentFilterDependency(page, "Account");
        await waitFilterElementsLoaded(page);
        await hasFilterListSize(page, 2);

        // Configure metric dependency "# of Lost Opps."
        await configureLimitingMetricDependency(page, "# of Lost Opps.");
        await waitFilterElementsLoaded(page);
        await hasFilterListSize(page, 1);

        // Search for invalid metric, verify no data
        await selectFilterConfiguration(page);
        await searchMetricDependency(page, "Invalid");
        await assertNoDataMetricDependency(page);

        // Search and select "Account" metric dependency
        await searchMetricDependency(page, "Account");
        await selectMetricDependency(page, "Account");
        await waitFilterElementsLoaded(page);
        await hasFilterListSize(page, 2);

        // Show all values and select "Anaheim"
        await showAllElementValues(page);
        await selectAttributeValues(page, ["Anaheim"]);
        await applyAttributeFilter(page);

        // Verify headline is empty
        await waitHeadlineLoaded(page, headlineSelector);
        await assertHeadlineEmpty(page);

        // Open City filter, clear irrelevant values, select "Seattle"
        await openAttributeFilter(page, "City");
        await assertIrrelevantElementValuesVisible(page, true);
        await clearIrrelevantElementValues(page);
        await selectAttributeValues(page, ["Seattle"]);
        await applyAttributeFilter(page);

        // Verify headline is still empty
        await waitHeadlineLoaded(page, headlineSelector);
        await assertHeadlineEmpty(page);

        // Delete aggregated "Count of Account" filter dependency
        await openAttributeFilter(page, "City");
        await deleteFilterValuesBy(page, "Count of Account", "aggregated");
        await waitFilterElementsLoaded(page);
        await hasFilterListSize(page, 1);
    });

    test(
        "should extend attribute filter by date filter",
        { tag: ["@pre-merge-integrated"] },
        async ({ page }) => {
            const widgetParent = ".s-dash-item-0_0";

            // Wait for attributes to load after navigation
            const attributesPromise = page.waitForResponse(
                (resp) => resp.url().includes("/attributes") && resp.request().method() === "GET",
                { timeout: 30_000 },
            );
            await visit(page, "dashboard/multiple-date-filters", {
                enableKDAttributeFilterDatesValidation: true,
            });
            await attributesPromise;

            await enterEditMode(page);

            // Set default date filter absolute form: from 4/3/2010
            await openDateFilter(page);
            await selectDateFilterOption(page, ".s-absolute-form-button");
            await typeIntoDateRangeFrom(page, "4/3/2010");

            // Set default date filter absolute form: to 4/3/2018
            await openDateFilter(page);
            await selectDateFilterOption(page, ".s-absolute-form-button");
            await typeIntoDateRangeTo(page, "4/3/2018");

            // Set Activity date filter absolute form: from 4/3/2010
            await openDateFilter(page, "Activity");
            await selectDateFilterOption(page, ".s-absolute-form-button");
            await typeIntoDateRangeFrom(page, "4/3/2010");

            // Set Activity date filter absolute form: to 4/3/2018
            await openDateFilter(page, "Activity");
            await selectDateFilterOption(page, ".s-absolute-form-button");
            await typeIntoDateRangeTo(page, "4/3/2018");

            // Verify chart data labels
            await waitChartLoaded(page, widgetParent);
            await expectChartDataLabels(page, widgetParent, [
                "$4,108,360.80",
                "$2,267,528.48",
                "$3,461,373.87",
            ]);

            // Open Sales Rep filter, verify 22 elements
            await openAttributeFilter(page, "Sales Rep");
            await waitFilterElementsLoaded(page);
            await hasFilterListSize(page, 22);

            // Configure date filter dependency "activity" with "Date range"
            await selectFilterConfiguration(page);
            await configureLimitingDateFilterDependency(page, "activity", "Date range");
            await waitFilterElementsLoaded(page);
            await hasFilterListSize(page, 20);

            // Verify specific date filter is disabled for "activity"
            await selectFilterConfiguration(page);
            await assertSpecificDateFilterVisible(page, "activity", false);
            await closeFilterConfiguration(page);

            // Delete "Date range as Activity" dependency
            await deleteFilterValuesBy(page, "Date range as Activity");

            // Configure date filter dependency "activity" with "Date specific"
            await selectFilterConfiguration(page);
            await configureLimitingDateFilterDependency(page, "activity", "Date specific");
            await waitFilterElementsLoaded(page);
            await hasFilterListSize(page, 20);

            // Verify common date filter is disabled for "activity"
            await selectFilterConfiguration(page);
            await assertCommonDateFilterVisible(page, "activity", false);
            await closeFilterConfiguration(page);

            // Select "Cory Owens" and apply
            await selectAttributeValues(page, ["Cory Owens"]);
            await applyAttributeFilter(page);

            // Verify chart re-renders with new data
            await expectChartDataLabels(page, widgetParent, ["$2,376,100.41"]);

            // Open Sales Rep, delete "Activity" dependency, verify 22 elements
            await openAttributeFilter(page, "Sales Rep");
            await clearFilterSearch(page);
            await waitFilterElementsLoaded(page);
            await deleteFilterValuesBy(page, "Activity");
            await hasFilterListSize(page, 22);
        },
    );
});
