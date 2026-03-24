// (C) 2023-2026 GoodData Corporation

import { expect, test } from "@playwright/test";

import { injectAuthHeader } from "@gooddata/e2e-utils";

import { API_TOKEN, describe } from "../config.js";
import {
    assertSaveButtonEnabled,
    enterEditMode,
    mockFeatureHub,
    visit,
    waitFilterElementsLoaded,
} from "../helpers.js";

test.beforeEach(async ({ page }) => {
    await injectAuthHeader(page, API_TOKEN);
    await mockFeatureHub(page);
});

describe("Hide Filters Tooltips", "hideFiltersTooltips", () => {
    test(
        "Tooltip hide filter displays on date configuration when hover on hidden option",
        {
            tag: ["@pre-merge-isolated"],
        },
        async ({ page }) => {
            await visit(page, "dashboard/dashboard-tiger");
            await enterEditMode(page);
            await assertSaveButtonEnabled(page, false);

            // Assert date filter is visible and open it
            await expect(page.locator(".s-date-filter-button")).toBeVisible();
            await page.locator(".s-date-filter-button.s-date-filter-button-date_range").click();

            // Open configuration
            await page.locator(".s-gd-date-filter-configuration-button").click();

            // Hover on the "hidden" configuration mode
            await page.locator(".s-configuration-item-mode .s-config-state-hidden").hover();

            // Assert tooltip content
            await expect(page.locator(".gd-overlay-content .bubble-content .content")).toContainText(
                "Dashboard users cannot see the filter but it is applied.",
            );
        },
    );

    test(
        "Tooltip hide filter displays on attribute configuration when hover on hidden option",
        {
            tag: ["@pre-merge-isolated"],
        },
        async ({ page }) => {
            await visit(page, "dashboard/dashboard-tiger-hide-filters");
            await enterEditMode(page);
            await assertSaveButtonEnabled(page, false);

            // Assert the Activity attribute filter is visible and open it
            const attributeFilter = page.locator(".dash-filters-attribute .s-activity");
            await expect(attributeFilter).toBeVisible();
            await attributeFilter.click();

            // Open configuration
            await page.locator(".overlay.dropdown-body .s-configuration-button").click();

            // Hover on the "hidden" configuration mode
            await page.locator(".s-configuration-item-mode .s-config-state-hidden").hover();

            // Assert tooltip content
            await expect(page.locator(".gd-overlay-content .bubble-content .content")).toContainText(
                "Dashboard users cannot see the filter but it is applied.",
            );
        },
    );

    test(
        "Tooltip hide filter displays on edit mode when hover on date filter hidden icon",
        {
            tag: ["@pre-merge-isolated"],
        },
        async ({ page }) => {
            await visit(page, "dashboard/dashboard-tiger");
            await enterEditMode(page);
            await assertSaveButtonEnabled(page, false);

            // Assert date filter is visible and open it
            await expect(page.locator(".s-date-filter-button")).toBeVisible();
            await page.locator(".s-date-filter-button.s-date-filter-button-date_range").click();

            // Open configuration
            await page.locator(".s-gd-date-filter-configuration-button").click();

            // Select "hidden" configuration mode
            await page.locator(".s-configuration-item-mode .s-config-state-hidden").click();

            // Save configuration
            await page
                .locator(".s-gd-extended-date-filter-actions-right-content .s-date-filter-apply")
                .click();

            // Assert hidden icon is visible and hover on it
            const dateFilterButton = page.locator(".s-date-filter-button.s-date-filter-button-date_range");
            const hiddenIcon = dateFilterButton.locator(".s-gd-icon-invisible");
            await expect(hiddenIcon).toBeVisible();
            await hiddenIcon.hover();

            // Assert tooltip content
            await expect(page.locator(".gd-overlay-content .bubble-content .content")).toContainText(
                "This filter is hidden. It can be accessed only via the Edit mode.",
            );
        },
    );

    test(
        "Tooltip hide filter displays on edit mode when hover on attribute filter hidden icon",
        {
            tag: ["@pre-merge-isolated"],
        },
        async ({ page }) => {
            await visit(page, "dashboard/dashboard-tiger-hide-filters");
            await enterEditMode(page);
            await assertSaveButtonEnabled(page, false);

            // Assert the Activity attribute filter is visible and open it
            const attributeFilter = page.locator(".dash-filters-attribute .s-activity");
            await expect(attributeFilter).toBeVisible();
            await attributeFilter.click();
            await expect(attributeFilter).toHaveClass(/gd-is-active/);

            // Wait for filter elements to load, then open configuration
            await waitFilterElementsLoaded(page);
            await page.locator(".overlay.dropdown-body .s-configuration-button").click();

            // Select "hidden" configuration mode
            await page.locator(".s-configuration-item-mode .s-config-state-hidden").click();

            // Save configuration
            await page.locator(".overlay.dropdown-body .s-save").click();

            // Hover on the hidden icon on the attribute filter
            const hiddenIcon = attributeFilter.locator(".s-gd-icon-invisible");
            await expect(hiddenIcon).toBeVisible();
            await hiddenIcon.hover();

            // Assert tooltip content
            await expect(page.locator(".gd-overlay-content .bubble-content .content")).toContainText(
                "This filter is hidden. It can be accessed only via the Edit mode.",
            );
        },
    );

    test(
        "Tooltip locked filter displays on date configuration when hover on locked option",
        {
            tag: ["@pre-merge-isolated"],
        },
        async ({ page }) => {
            await visit(page, "dashboard/dashboard-tiger");
            await enterEditMode(page);
            await assertSaveButtonEnabled(page, false);

            // Assert date filter is visible and open it
            await expect(page.locator(".s-date-filter-button")).toBeVisible();
            await page.locator(".s-date-filter-button.s-date-filter-button-date_range").click();

            // Open configuration
            await page.locator(".s-gd-date-filter-configuration-button").click();

            // Hover on the "readonly" configuration mode
            await page.locator(".s-configuration-item-mode .s-config-state-readonly").hover();

            // Assert tooltip content
            await expect(page.locator(".gd-overlay-content .bubble-content .content")).toContainText(
                "Dashboard users can see the filter but cannot change it.",
            );
        },
    );

    test(
        "Tooltip locked filter displays on attribute configuration when hover on locked option",
        {
            tag: ["@pre-merge-isolated"],
        },
        async ({ page }) => {
            await visit(page, "dashboard/dashboard-tiger-hide-filters");
            await enterEditMode(page);
            await assertSaveButtonEnabled(page, false);

            // Assert the Activity attribute filter is visible and open it
            const attributeFilter = page.locator(".dash-filters-attribute .s-activity");
            await expect(attributeFilter).toBeVisible();
            await attributeFilter.click();

            // Open configuration
            await page.locator(".overlay.dropdown-body .s-configuration-button").click();

            // Hover on the "readonly" configuration mode
            await page.locator(".s-configuration-item-mode .s-config-state-readonly").hover();

            // Assert tooltip content
            await expect(page.locator(".gd-overlay-content .bubble-content .content")).toContainText(
                "Dashboard users can see the filter but cannot change it.",
            );
        },
    );

    test(
        "Tooltip locked filter displays on edit mode when hover on date filter locked icon",
        {
            tag: ["@pre-merge-isolated"],
        },
        async ({ page }) => {
            await visit(page, "dashboard/dashboard-tiger");
            await enterEditMode(page);
            await assertSaveButtonEnabled(page, false);

            // Assert date filter is visible and open it
            await expect(page.locator(".s-date-filter-button")).toBeVisible();
            await page.locator(".s-date-filter-button.s-date-filter-button-date_range").click();

            // Open configuration
            await page.locator(".s-gd-date-filter-configuration-button").click();

            // Select "readonly" configuration mode
            await page.locator(".s-configuration-item-mode .s-config-state-readonly").click();

            // Save configuration
            await page
                .locator(".s-gd-extended-date-filter-actions-right-content .s-date-filter-apply")
                .click();

            // Assert locked icon is visible and hover on it
            const dateFilterButton = page.locator(".s-date-filter-button.s-date-filter-button-date_range");
            const lockedIcon = dateFilterButton.locator(".s-gd-icon-lock");
            await expect(lockedIcon).toBeVisible();
            await lockedIcon.hover();

            // Assert tooltip content
            await expect(page.locator(".gd-overlay-content .bubble-content .content")).toContainText(
                "This filter is locked. It can be changed only via the Edit mode.",
            );
        },
    );

    test(
        "Tooltip locked filter displays on view mode when hover on date filter locked icon",
        {
            tag: ["@pre-merge-isolated"],
        },
        async ({ page }) => {
            await visit(page, "dashboard/dashboard-tiger-readonly-date-filter");

            // Assert date filter is visible
            const dateFilterButton = page.locator(".s-date-filter-button.s-date-filter-button-date_range");
            await expect(dateFilterButton).toBeVisible();

            // Assert locked icon is visible and hover on it
            const lockedIcon = dateFilterButton.locator(".s-gd-icon-lock");
            await expect(lockedIcon).toBeVisible();
            await lockedIcon.hover();

            // Assert tooltip content
            await expect(page.locator(".gd-overlay-content .bubble-content .content")).toContainText(
                "This filter is locked.",
            );
        },
    );
});
