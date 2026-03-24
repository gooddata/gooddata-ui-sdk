// (C) 2023-2026 GoodData Corporation

import { expect, test } from "@playwright/test";

import { injectAuthHeader } from "@gooddata/e2e-utils";

import { API_TOKEN, describe } from "../config.js";
import {
    assertSaveButtonEnabled,
    enterEditMode,
    mockFeatureHub,
    saveDashboard,
    visit,
    visitCopyOf,
} from "../helpers.js";

test.beforeEach(async ({ page }) => {
    await injectAuthHeader(page, API_TOKEN);
    await mockFeatureHub(page);
});

describe("Date filtering", "dateFiltering", () => {
    test(
        "verify date filter default state",
        {
            tag: ["@pre-merge-integrated"],
        },
        async ({ page }) => {
            await visit(page, "dashboard/new-dashboard");
            await expect(page.locator(".s-button-text")).toHaveText("This month");
        },
    );

    test(
        "should update date filter value correctly",
        {
            tag: ["@pre-merge-integrated"],
        },
        async ({ page }) => {
            await visit(page, "dashboard/dashboard-many-rows-columns");
            await expect(page.locator(".s-button-text")).toHaveText("All time");

            // Open date filter dropdown and select "This year"
            await page.locator(".s-date-filter-button").click();
            const dropdown = page.locator(".s-extended-date-filters-body");
            await dropdown
                .locator(".gd-filter-list-item")
                .filter({ hasText: /^This year$/ })
                .click();

            // Apply the filter
            await dropdown.locator(".s-date-filter-apply").click();

            // Verify the subtitle updated
            await expect(page.locator(".s-button-text")).toHaveText("This year");
        },
    );

    test(
        "should display message on the top date filter panel",
        {
            tag: ["@pre-merge-integrated"],
        },
        async ({ page }) => {
            await visit(page, "dashboard/dashboard-many-rows-columns");

            // Open date filter and verify the edit-mode message is NOT visible in view mode
            await page.locator(".s-date-filter-button").click();
            const dropdown = page.locator(".s-extended-date-filters-body");
            await expect(dropdown.locator(".gd-extended-date-filter-edit-mode-message-text")).toBeHidden();

            // Cancel the date filter
            await dropdown.locator(".s-date-filter-cancel").click();

            // Enter edit mode
            await enterEditMode(page);
            await expect(page.locator(".s-save_button")).toBeVisible();

            // Open date filter and verify the edit-mode message IS visible in edit mode
            await page.locator(".s-date-filter-button").click();
            await expect(dropdown.locator(".gd-extended-date-filter-edit-mode-message-text")).toBeVisible();
        },
    );

    test(
        "should reset the selected date filter on view mode when open edit mode",
        {
            tag: ["@pre-merge-integrated"],
        },
        async ({ page }) => {
            await visit(page, "dashboard/dashboard-many-rows-columns");

            // Open date filter dropdown and select "This year"
            await page.locator(".s-date-filter-button").click();
            const dropdown = page.locator(".s-extended-date-filters-body");
            await dropdown
                .locator(".gd-filter-list-item")
                .filter({ hasText: /^This year$/ })
                .click();

            // Apply the filter
            await dropdown.locator(".s-date-filter-apply").click();

            // Verify the subtitle updated to "This year"
            await expect(page.locator(".s-button-text")).toHaveText("This year");

            // Enter edit mode — the date filter should reset
            await enterEditMode(page);

            // Verify the date filter subtitle resets to "All time"
            await expect(page.locator(".s-button-text")).toHaveText("All time");
        },
    );

    test(
        "should display the selected date interval correctly",
        {
            tag: ["@pre-merge-integrated"],
        },
        async ({ page }) => {
            await visitCopyOf(page, "dashboard/dashboard-many-rows-columns");

            const dateFilterValues = ["This month", "This year", "All time"];

            for (const dateFilterValue of dateFilterValues) {
                await enterEditMode(page);

                // Wait for date filter button to be visible
                await expect(page.locator(".s-date-filter-button")).toBeVisible();

                // Open date filter dropdown and select the value
                await page.locator(".s-date-filter-button").click();
                const dropdown = page.locator(".s-extended-date-filters-body");
                await dropdown
                    .locator(".gd-filter-list-item")
                    .filter({ hasText: new RegExp(`^${dateFilterValue}$`) })
                    .click();

                // Apply the filter
                await dropdown.locator(".s-date-filter-apply").click();

                // Save the dashboard
                await assertSaveButtonEnabled(page, true);
                await saveDashboard(page);

                // Open date filter and verify the selected value
                await page.locator(".s-date-filter-button").click();
                await expect(page.locator(".gd-list-item.is-selected")).toHaveText(dateFilterValue);
            }
        },
    );
});
