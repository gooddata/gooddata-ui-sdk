// (C) 2021-2026 GoodData Corporation

import { expect } from "@playwright/test";

import { injectAuthHeader } from "@gooddata/sdk-e2e-utils";

import { API_TOKEN, test } from "../config.js";
import { assertSaveButtonEnabled, enterEditMode, resizeColumn, visit, waitTableLoaded } from "../helpers.js";

test.beforeEach(async ({ page }) => {
    await injectAuthHeader(page, API_TOKEN);
});

test.describe("Dashboard", { additionalWindowProperties: { useSafeLocalIdentifiersForE2e: true } }, () => {
    test.describe("edit mode", {}, () => {
        test(
            "should enable the save button after resizing a column",
            {
                tag: ["@pre-merge-integrated"],
            },
            async ({ page }) => {
                await visit(page, "dashboard/stage-name");
                await enterEditMode(page);
                await waitTableLoaded(page, ".s-dash-item");
                await resizeColumn(page, ".s-dash-item", 0, 1, 500, true);
                await assertSaveButtonEnabled(page, true);
            },
        );

        test(
            "should reload the widget after toggling an attribute filter",
            {
                tag: ["@pre-merge-integrated"],
            },
            async ({ page }) => {
                const widgetSelector = ".s-dash-item";
                await visit(page, "dashboard/stage-name");
                await enterEditMode(page);
                await waitTableLoaded(page, widgetSelector);

                // Focus the widget to show configuration panel
                await page.locator(`${widgetSelector} .is-selectable`).click();

                // Open Configuration tab
                const configBubble = page.locator(".s-gd-configuration-bubble");
                await configBubble.getByText("Configuration").click();
                await expect(configBubble.locator(".s-viz-filters-headline")).toBeVisible();

                // Check Stage Name filter checkbox
                const stageNameCheckbox = page.locator(
                    ".s-attribute-filter-configuration .s-stage_name input[type='checkbox']",
                );
                await stageNameCheckbox.check();
                await waitTableLoaded(page, widgetSelector);

                // Check Stage Name filter checkbox again
                await stageNameCheckbox.check();
                await waitTableLoaded(page, widgetSelector);
            },
        );
    });

    test.describe("top bar", {}, () => {
        test(
            "should render the top bar",
            {
                tag: ["@pre-merge-isolated"],
            },
            async ({ page }) => {
                await visit(page, "dashboard/dashboard-tiger");
                await expect(page.locator(".s-top-bar")).toBeVisible();
            },
        );

        test.skip(
            "should render the title",
            {
                tag: ["@pre-merge-isolated"],
            },
            async ({ page }) => {
                await visit(page, "dashboard/dashboard-tiger");
                const title = page.locator(".s-gd-dashboard-title");
                await expect(title).toBeVisible();
                await expect(title).toHaveText("KPIs");
            },
        );

        test(
            "should render the edit button",
            {
                tag: ["@pre-merge-isolated"],
            },
            async ({ page }) => {
                await visit(page, "dashboard/dashboard-tiger");
                await expect(page.locator(".s-top-bar")).toBeVisible();
                await expect(page.locator(".s-edit_button")).toBeVisible();
            },
        );

        test(
            "should render the menu button",
            {
                tag: ["@pre-merge-isolated"],
            },
            async ({ page }) => {
                await visit(page, "dashboard/dashboard-tiger");
                await expect(page.locator('[data-testid="s-header-options-button"]')).toBeVisible();
            },
        );

        test.skip(
            "should open the menu with its items",
            {
                tag: ["@pre-merge-isolated"],
            },
            async ({ page }) => {
                await visit(page, "dashboard/dashboard-tiger");
                await expect(page.locator('[data-testid="s-header-options-button"]')).toBeVisible();
                await page.locator('[data-testid="s-header-options-button"]').click();
                await expect(page.locator(".s-export_to_pdf")).toBeVisible();
                await expect(page.locator(".s-schedule_emailing")).toBeVisible();
            },
        );
    });

    test.describe("filter bar", {}, () => {
        test(
            "should render the filter bar",
            {
                tag: ["@pre-merge-isolated"],
            },
            async ({ page }) => {
                await visit(page, "dashboard/dashboard-tiger");
                await expect(page.locator(".s-gd-dashboard-filter-bar")).toBeVisible();
            },
        );

        test(
            "should render the date filter",
            {
                tag: ["@pre-merge-isolated"],
            },
            async ({ page }) => {
                await visit(page, "dashboard/dashboard-tiger");
                await expect(page.locator(".s-date-filter-button")).toBeVisible();
                await expect(page.locator(".s-date-filter-title")).toHaveText("Date range");
                await page.locator(".s-date-filter-button").click();
                await expect(page.locator(".s-all-time")).toBeVisible();
                await expect(page.locator(".s-date-filter-cancel")).toBeVisible();
                await expect(page.locator(".s-date-filter-apply")).toBeVisible();
            },
        );

        test.skip(
            "should change the date filter",
            {
                tag: ["@pre-merge-isolated"],
            },
            async ({ page }) => {
                await visit(page, "dashboard/dashboard-tiger");
                await expect(page.locator(".s-date-filter-button")).toBeVisible();
                await expect(page.locator(".s-button-text")).toHaveText("All time");
                await page.locator(".s-date-filter-button").click();
                await page.locator(".s-relative-preset-relative-last-7-days").click();
                await page.locator(".s-date-filter-apply").click();
                await expect(page.locator(".s-button-text")).toHaveText("Last 7 days");
            },
        );
    });

    test.describe("body", {}, () => {
        test.skip(
            "should render a single insight",
            {
                tag: ["@pre-merge-isolated"],
            },
            async ({ page }) => {
                await visit(page, "dashboard/kpis");
                await expect(page.locator(".gd-grid-layout__container--root")).toBeVisible();
            },
        );
    });

    test.describe("insight with too many data points", {}, () => {
        test(
            "should render the insight",
            {
                tag: ["@pre-merge-isolated"],
            },
            async ({ page }) => {
                await visit(page, "dashboard/manydata");
                await expect(page.locator(".s-dash-item-0_0 .highcharts-root")).toBeVisible();
            },
        );
    });
});
