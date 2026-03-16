// (C) 2023-2026 GoodData Corporation

import { expect, test } from "@playwright/test";

import { injectAuthHeader } from "@gooddata/e2e-utils";

import { API_TOKEN, describe } from "../config";
import {
    addAttributeFilter,
    assertSaveButtonEnabled,
    enterEditMode,
    filterDropdown,
    getTestClassByTitle,
    mockFeatureHub,
    openAttributeFilter,
    removeAttributeFilter,
    selectFilterConfiguration,
    visit,
    waitFilterElementsLoaded,
} from "../helpers.js";

test.beforeEach(async ({ page }) => {
    await injectAuthHeader(page, API_TOKEN);
    await mockFeatureHub(page);
});

describe("Hide Filters", "hideFilters", () => {
    test("Hide hidden date filter on view mode", { tag: ["@pre-merge-isolated"] }, async ({ page }) => {
        await visit(page, "dashboard/dashboard-tiger-hide-filters");
        await expect(page.locator(".s-edit_button")).toBeVisible();
        await expect(page.locator(".s-date-filter-button")).toHaveCount(0);
    });

    test("Hide hidden attribute filter on view mode", { tag: ["@pre-merge-isolated"] }, async ({ page }) => {
        await visit(page, "dashboard/dashboard-tiger-hide-filters");
        await expect(page.locator(".s-edit_button")).toBeVisible();
        await expect(page.locator(".dash-filters-attribute .s-city")).toHaveCount(0);
    });

    test(
        "User can select hide date filter option on configuration in edit mode",
        { tag: ["@pre-merge-isolated"] },
        async ({ page }) => {
            await visit(page, "dashboard/dashboard-tiger");
            await enterEditMode(page);
            await assertSaveButtonEnabled(page, false);

            // Assert date filter is visible
            const dateFilterButton = page.locator(".s-date-filter-button");
            await expect(dateFilterButton).toBeVisible();

            // Open date filter dropdown
            await dateFilterButton.click();

            // Open configuration
            await page.locator(".s-gd-date-filter-configuration-button").click();

            // Select "hidden" configuration mode
            await page.locator(".s-configuration-item-mode .s-config-state-hidden").click();

            // Save configuration
            await page
                .locator(".s-gd-extended-date-filter-actions-right-content .s-date-filter-apply")
                .click();

            // Assert hidden icon is visible on the date filter button
            await expect(dateFilterButton.locator(".s-gd-icon-invisible")).toBeVisible();
        },
    );

    test(
        "User can select hide attribute filter option on configuration in edit mode",
        { tag: ["@pre-merge-isolated"] },
        async ({ page }) => {
            await visit(page, "dashboard/dashboard-tiger-hide-filters");
            await enterEditMode(page);
            await assertSaveButtonEnabled(page, false);

            // Assert the Activity attribute filter is visible
            const activityTestClass = getTestClassByTitle("Activity");
            const activityFilter = page.locator(`.dash-filters-attribute ${activityTestClass}`);
            await expect(activityFilter).toBeVisible();

            // Open the attribute filter dropdown
            await openAttributeFilter(page, "Activity");

            // Wait for filter elements to load, then open configuration
            await waitFilterElementsLoaded(page);
            await selectFilterConfiguration(page);

            // Select "hidden" configuration mode
            await page.locator(".s-configuration-item-mode .s-config-state-hidden").click();

            // Save configuration
            await filterDropdown(page).locator(".s-save").click();

            // Assert hidden icon is visible on the attribute filter
            await expect(activityFilter.locator(".s-gd-icon-invisible")).toBeVisible();
        },
    );

    test(
        "User can not select and edit readonly date filter in view mode",
        { tag: ["@pre-merge-isolated"] },
        async ({ page }) => {
            await visit(page, "dashboard/dashboard-tiger-readonly-date-filter");

            // Click the date filter button
            const dateFilterButton = page.locator(".s-date-filter-button");
            await dateFilterButton.click();

            // Assert the dropdown body does not open (readonly in view mode)
            await expect(page.locator(".s-extended-date-filters-body")).toHaveCount(0);
        },
    );

    test(
        "User can not select and edit readonly attribute filter in view mode",
        { tag: ["@pre-merge-isolated"] },
        async ({ page }) => {
            await visit(page, "dashboard/dashboard-tiger-hide-filters");

            // Click the locked "Account" attribute filter (disabled, so use JS click)
            const accountTestClass = getTestClassByTitle("Account");
            const accountFilter = page.locator(`.dash-filters-attribute ${accountTestClass}`);
            await accountFilter.evaluate((el: HTMLElement) => el.click());

            // Assert the dropdown body does not open (readonly in view mode)
            await expect(page.locator(".overlay.dropdown-body")).toHaveCount(0);
        },
    );

    test(
        "User can select and edit readonly date filter in edit mode",
        { tag: ["@pre-merge-isolated"] },
        async ({ page }) => {
            await visit(page, "dashboard/dashboard-tiger-readonly-date-filter");
            await enterEditMode(page);
            await assertSaveButtonEnabled(page, false);

            // Open date filter dropdown
            const dateFilterButton = page.locator(".s-date-filter-button");
            await dateFilterButton.click();

            // Assert the dropdown body is open (editable in edit mode even though readonly)
            await expect(page.locator(".s-extended-date-filters-body")).toBeVisible();

            // Open configuration
            await page.locator(".s-gd-date-filter-configuration-button").click();

            // Select "hidden" configuration mode
            await page.locator(".s-configuration-item-mode .s-config-state-hidden").click();

            // Save configuration
            await page
                .locator(".s-gd-extended-date-filter-actions-right-content .s-date-filter-apply")
                .click();

            // Assert hidden icon is visible on the date filter button
            await expect(dateFilterButton.locator(".s-gd-icon-invisible")).toBeVisible();
        },
    );

    test(
        "User can select and edit readonly attribute filter in edit mode",
        { tag: ["@pre-merge-isolated"] },
        async ({ page }) => {
            await visit(page, "dashboard/dashboard-tiger-hide-filters");
            await enterEditMode(page);
            await assertSaveButtonEnabled(page, false);

            // Open the locked "Account" attribute filter
            const accountTestClass = getTestClassByTitle("Account");
            const accountFilter = page.locator(`.dash-filters-attribute ${accountTestClass}`);
            await openAttributeFilter(page, "Account");

            // Assert the dropdown body is open (editable in edit mode even though readonly)
            await expect(filterDropdown(page)).toBeVisible();

            // Wait for filter elements to load, then open configuration
            await waitFilterElementsLoaded(page);
            await selectFilterConfiguration(page);

            // Select "hidden" configuration mode
            await page.locator(".s-configuration-item-mode .s-config-state-hidden").click();

            // Save configuration
            await filterDropdown(page).locator(".s-save").click();

            // Assert hidden icon is visible on the attribute filter
            await expect(accountFilter.locator(".s-gd-icon-invisible")).toBeVisible();
        },
    );

    test(
        "Should not reuse the config mode when re-added attribute filter",
        { tag: ["@pre-merge-isolated"] },
        async ({ page }) => {
            await visit(page, "dashboard/dashboard-tiger-hide-filters");
            await enterEditMode(page);
            await assertSaveButtonEnabled(page, false);

            // Assert the locked "Account" attribute filter is visible with a lock icon
            const accountTestClass = getTestClassByTitle("Account");
            const accountFilter = page.locator(`.dash-filters-attribute ${accountTestClass}`);
            await expect(accountFilter).toBeVisible();
            await expect(accountFilter.locator(".s-gd-icon-lock")).toBeVisible();

            // Remove the filter by dragging it to the delete dropzone
            await removeAttributeFilter(page, "Account");

            // Wait for the filter to be removed, otherwise drag events may close the dropdown
            // of the newly added filter before filling the attribute name
            await expect(accountFilter).toBeHidden();

            // Re-add the "Account" attribute filter
            await addAttributeFilter(page, "Account");

            // Assert the re-added filter does not have lock or hidden icons
            const readdedFilter = page.locator(`.dash-filters-attribute ${accountTestClass}`);
            await expect(readdedFilter.locator(".s-gd-icon-lock")).toHaveCount(0);
            await expect(readdedFilter.locator(".s-gd-icon-invisible")).toHaveCount(0);
        },
    );

    test(
        "Should render correct mode in configuration overlay",
        { tag: ["@pre-merge-isolated"] },
        async ({ page }) => {
            await visit(page, "dashboard/dashboard-tiger-hide-filters");
            await enterEditMode(page);
            await assertSaveButtonEnabled(page, false);

            // Date filter: open dropdown → open configuration → assert "hidden" mode is checked
            await page.locator(".s-date-filter-button").click();
            await page.locator(".s-gd-date-filter-configuration-button").click();
            await expect(page.locator(".s-configuration-item-mode .s-config-state-hidden")).toHaveAttribute(
                "checked",
                "",
            );

            // Activity attribute filter: open → configuration → assert "active" mode is checked
            await openAttributeFilter(page, "Activity");
            await waitFilterElementsLoaded(page);
            await selectFilterConfiguration(page);
            await expect(page.locator(".s-configuration-item-mode .s-config-state-active")).toHaveAttribute(
                "checked",
                "",
            );

            // City (hidden) attribute filter: open → configuration → assert "hidden" mode is checked
            await openAttributeFilter(page, "City");
            await waitFilterElementsLoaded(page);
            await selectFilterConfiguration(page);
            await expect(page.locator(".s-configuration-item-mode .s-config-state-hidden")).toHaveAttribute(
                "checked",
                "",
            );

            // Account (locked) attribute filter: open → configuration → assert "readonly" mode is checked
            await openAttributeFilter(page, "Account");
            await waitFilterElementsLoaded(page);
            await selectFilterConfiguration(page);
            await expect(page.locator(".s-configuration-item-mode .s-config-state-readonly")).toHaveAttribute(
                "checked",
                "",
            );
        },
    );

    test(
        "Should render correct date filter readonly mode in configuration overlay",
        { tag: ["@pre-merge-isolated"] },
        async ({ page }) => {
            await visit(page, "dashboard/dashboard-tiger-readonly-date-filter");
            await enterEditMode(page);
            await assertSaveButtonEnabled(page, false);

            // Open date filter dropdown
            await page.locator(".s-date-filter-button").click();

            // Open configuration
            await page.locator(".s-gd-date-filter-configuration-button").click();

            // Assert "readonly" mode is checked
            await expect(page.locator(".s-configuration-item-mode .s-config-state-readonly")).toHaveAttribute(
                "checked",
                "",
            );
        },
    );

    test(
        "Use interactive mode as default for date filter mode in configuration overlay",
        { tag: ["@pre-merge-isolated"] },
        async ({ page }) => {
            await visit(page, "dashboard/dashboard-tiger");
            await enterEditMode(page);
            await assertSaveButtonEnabled(page, false);

            // Open date filter dropdown
            await page.locator(".s-date-filter-button").click();

            // Open configuration
            await page.locator(".s-gd-date-filter-configuration-button").click();

            // Assert "active" (interactive) mode is checked
            await expect(page.locator(".s-configuration-item-mode .s-config-state-active")).toHaveAttribute(
                "checked",
                "",
            );
        },
    );
});
