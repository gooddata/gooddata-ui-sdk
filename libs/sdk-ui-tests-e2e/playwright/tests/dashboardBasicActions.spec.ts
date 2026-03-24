// (C) 2023-2026 GoodData Corporation

import { expect, test } from "@playwright/test";

import { injectAuthHeader } from "@gooddata/e2e-utils";

import { API_TOKEN, describe } from "../config.js";
import { enterEditMode, mockFeatureHub, visit, waitChartLoaded } from "../helpers.js";

test.beforeEach(async ({ page }) => {
    await injectAuthHeader(page, API_TOKEN);
    await mockFeatureHub(page);
});

describe("Basic actions on dashboard", "dashboardBasicActions", () => {
    test("can discard change an existing dashboard", { tag: ["@pre-merge-isolated"] }, async ({ page }) => {
        // Navigate and enter edit mode (mirrors beforeEach)
        await visit(page, "dashboard/insight");
        await enterEditMode(page);
        await expect(page.locator(".s-save_button")).toBeVisible();

        // Wait for chart to load and verify 1 widget in first section
        await waitChartLoaded(page, ".s-dash-item-0_0");
        const section = page.locator(".gd-grid-layout__section").first();
        await expect(section.locator(".s-dash-item")).toHaveCount(1);

        // Remove the widget
        await page.locator(".s-dash-item-0_0").click();
        await page.locator(".s-delete-insight-item").click();

        // Cancel editing and discard changes
        await page.locator(".s-cancel_button").click();
        await page.locator(".s-discard_changes").click();

        // Verify back in view mode with edit button visible
        await expect(page.locator(".s-edit_button")).toBeVisible();

        // Verify dashboard still has 1 widget (changes were discarded)
        await expect(section.locator(".s-dash-item")).toHaveCount(1);
    });

    test(
        "cancel dashboard by clicking on close button",
        { tag: ["@pre-merge-isolated"] },
        async ({ page }) => {
            // Navigate and enter edit mode (mirrors beforeEach)
            await visit(page, "dashboard/insight");
            await enterEditMode(page);
            await expect(page.locator(".s-save_button")).toBeVisible();

            // Wait for chart to load and remove the widget
            await waitChartLoaded(page, ".s-dash-item-0_0");
            await page.locator(".s-dash-item-0_0").click();
            await page.locator(".s-delete-insight-item").click();

            // Cancel editing and close the discard changes dialog
            await page.locator(".s-cancel_button").click();
            await page.locator(".s-dialog-close-button").click();

            // Verify still in edit mode (save button still present)
            await expect(page.locator(".s-save_button")).toBeVisible();
        },
    );
});
