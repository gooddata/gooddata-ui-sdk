// (C) 2024-2026 GoodData Corporation

import { expect, test } from "@playwright/test";

import { injectAuthHeader } from "@gooddata/e2e-utils";

import { API_TOKEN, describe } from "../config.js";
import {
    addDateFilter,
    assertDateFilters,
    enterEditMode,
    focusWidget,
    getTestClassByTitle,
    mockFeatureHub,
    removeDateFilter,
    saveAsNew,
    toggleDashboardMenu,
    visit,
    waitChartLoaded,
    widgetSelector,
} from "../helpers.js";

test.beforeEach(async ({ page }) => {
    await injectAuthHeader(page, API_TOKEN);
    await mockFeatureHub(page);
});

describe("Multitple date filters basic cases", "multipleDateFilters", () => {
    test("can add multiple date filters", { tag: ["@pre-merge-isolated"] }, async ({ page }) => {
        await visit(page, "dashboard/multiple-date-filters");
        await waitChartLoaded(page, widgetSelector(0, 0));

        await enterEditMode(page);

        await assertDateFilters(page, ["Date range", "Activity", "Created"]);
        await addDateFilter(page, "Snapshot");
        await addDateFilter(page, "Timeline");
        await assertDateFilters(page, ["Date range", "Activity", "Created", "Snapshot", "Timeline"]);
    });

    test(
        "can select new filters via config panel without specifying date dataset",
        { tag: ["@pre-merge-isolated"] },
        async ({ page }) => {
            await visit(page, "dashboard/multiple-date-filters");
            await waitChartLoaded(page, widgetSelector(0, 0));

            await enterEditMode(page);

            // Open widget configuration bubble
            await focusWidget(page, 0, 0);
            const configBubble = page.locator(".s-gd-configuration-bubble");
            await expect(configBubble).toBeVisible();

            // Open Configuration tab
            await configBubble.getByText("Configuration").click();
            await expect(configBubble.locator(".s-viz-filters-headline")).toBeVisible();

            // Assert "Created" filter item is visible in the config panel
            await expect(
                configBubble
                    .locator(".s-viz-filters-panel .s-attribute-filter-by-item")
                    .filter({ hasText: "Created" }),
            ).toBeVisible();

            // Assert date dataset dropdown for "Created" does NOT exist
            await expect(page.locator(`.s-date-dataset-button${getTestClassByTitle("Created")}`)).toHaveCount(
                0,
            );

            // Assert "Activity" filter item is visible in the config panel
            await expect(
                configBubble
                    .locator(".s-viz-filters-panel .s-attribute-filter-by-item")
                    .filter({ hasText: "Activity" }),
            ).toBeVisible();

            // Assert date dataset dropdown for "Activity" does NOT exist
            await expect(
                page.locator(`.s-date-dataset-button${getTestClassByTitle("Activity")}`),
            ).toHaveCount(0);
        },
    );

    test(
        "can select default selection of filter in edit mode",
        { tag: ["@pre-merge-isolated"] },
        async ({ page }) => {
            await visit(page, "dashboard/multiple-date-filters");
            await waitChartLoaded(page, widgetSelector(0, 0));

            await enterEditMode(page);

            await addDateFilter(page, "Snapshot");

            // The date filter dropdown opens automatically after adding
            const dateDropdown = page.locator(".s-extended-date-filters-body");
            await expect(dateDropdown).toBeVisible();
            await dateDropdown.locator(".s-relative-preset-this-year").scrollIntoViewIfNeeded();
            await dateDropdown.locator(".s-relative-preset-this-year").click();
            await dateDropdown.locator(".s-date-filter-apply").click();

            // Assert widget shows no data for the filter selection
            await expect(
                page.locator(`${widgetSelector(0, 0)}`).getByText("No data for your filter selection"),
            ).toBeVisible();
        },
    );

    test(
        "can remove date filter for specified date dataset",
        { tag: ["@pre-merge-isolated"] },
        async ({ page }) => {
            await visit(page, "dashboard/multiple-date-filters");
            await waitChartLoaded(page, widgetSelector(0, 0));

            await enterEditMode(page);

            await assertDateFilters(page, ["Date range", "Activity", "Created"]);

            await removeDateFilter(page, 2);

            await assertDateFilters(page, ["Date range", "Activity"]);

            await removeDateFilter(page, 1);

            await assertDateFilters(page, ["Date range"]);
        },
    );

    test(
        "(SEPARATE) can perform common action when specific date filter is set",
        { tag: ["@pre-merge-isolated"] },
        async ({ page }) => {
            await visit(page, "dashboard/multiple-date-filters");
            await waitChartLoaded(page, widgetSelector(0, 0));

            await toggleDashboardMenu(page);
            await saveAsNew(page, "Clone");

            // Assert the "Activity" date filter subtitle in view mode shows "All time"
            const activitySubtitle = page.locator(
                `.dash-filters-all .s-date-filter-button${getTestClassByTitle("Activity", "date-filter-button-")} .s-button-text`,
            );
            await expect(activitySubtitle).toHaveText("All time");
        },
    );
});
