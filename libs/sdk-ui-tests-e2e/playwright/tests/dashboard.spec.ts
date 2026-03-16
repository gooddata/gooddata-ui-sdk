// (C) 2021-2026 GoodData Corporation

import { expect, test } from "@playwright/test";

import { injectAuthHeader } from "@gooddata/e2e-utils";

import { API_TOKEN, describe } from "../config";
import { enterEditMode, mockFeatureHub, visit, visitCopyOf, waitAllHidden } from "../helpers.js";

test.beforeEach(async ({ page }) => {
    await injectAuthHeader(page, API_TOKEN);
    await mockFeatureHub(page);
});

describe("Dashboard", "dashboard", () => {
    test.skip(
        "should display placeholder and focus title for new dashboard",
        {
            tag: ["@pre-merge-integrated"],
        },
        async ({ page }) => {
            await visit(page, "dashboard/new-dashboard");

            const titleTextarea = page.locator(".s-gd-dashboard-title textarea");
            await expect(titleTextarea).toHaveAttribute("placeholder", "Untitled");
            await expect(titleTextarea).toBeFocused();
        },
    );

    test.describe("Dashboard actions", () => {
        test(
            "should able to delete dashboard after save as new",
            {
                tag: ["@pre-merge-integrated"],
            },
            async ({ page }) => {
                await visitCopyOf(page, "dashboard/kpis");

                await enterEditMode(page);

                // Open header options menu and delete the dashboard
                const menuButton = page.locator(".s-header-options-button");
                await expect(menuButton).toBeVisible();
                await menuButton.click();
                await page.locator(".s-delete_dashboard").click();
                await page.locator(".s-delete").click();

                // After deletion, dashboard title should be "Untitled"
                await expect(page.locator(".s-gd-dashboard-title")).toHaveText("Untitled");
            },
        );

        test(
            "should able to scroll vertical/ horizontal on widget",
            {
                tag: ["@pre-merge-integrated"],
            },
            async ({ page }) => {
                const parentSelector = ".s-dash-item-0_0";

                await visit(page, "dashboard/dashboard-many-rows-columns");
                await waitAllHidden(page, ".s-loading");
                await enterEditMode(page);

                const table = page.locator(`${parentSelector} .gd-pivot-table-next`);

                // Scroll horizontally to the right
                const horizViewport = table.locator(".ag-center-cols-viewport");
                await expect(horizViewport).toBeAttached();
                await horizViewport.evaluate((el) => {
                    el.scrollLeft = el.scrollWidth;
                });

                // Scroll vertically to the bottom
                const vertViewport = table.locator(".ag-body-viewport");
                await vertViewport.evaluate((el) => {
                    el.scrollTop = el.scrollHeight;
                });
            },
        );

        test(
            "should direct to view mode after save as new",
            {
                tag: ["@pre-merge-integrated"],
            },
            async ({ page }) => {
                await visitCopyOf(page, "dashboard/kpis");

                // After save as new, dashboard should be in view mode
                await expect(page.locator(".s-edit_button")).toBeVisible();
                await expect(page.locator(".s-header-share-button")).toBeVisible();
            },
        );
    });
});
