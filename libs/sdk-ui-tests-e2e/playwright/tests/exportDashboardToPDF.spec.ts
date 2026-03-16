// (C) 2023-2026 GoodData Corporation

import { expect, test } from "@playwright/test";
import { camelCase } from "lodash-es";

import { injectAuthHeader } from "@gooddata/e2e-utils";

import { API_TOKEN, describe } from "../config";
import {
    applyAttributeFilter,
    clearAllFilterValues,
    expectExportedPDF,
    filterDropdown,
    mockFeatureHub,
    openAttributeFilter,
    toggleDashboardMenu,
    visit,
    waitAllHidden,
    widgetSelector,
} from "../helpers.js";

test.beforeEach(async ({ page }) => {
    await injectAuthHeader(page, API_TOKEN);
    await mockFeatureHub(page);
});

describe("Export dashboard to PDF", "exportDashboardToPDF", () => {
    test(
        "should be able to export dashboard with temporary filter to PDF",
        {
            tag: ["@pre-merge-integrated"],
        },
        async ({ page }) => {
            await visit(page, "dashboard/nullvalue");

            // Verify dashboard title
            await expect(page.locator(".s-gd-dashboard-title")).toHaveText("KD has null value");

            // Open the Product filter and select PhoenixSoft
            await openAttributeFilter(page, "Product");
            await clearAllFilterValues(page);
            await filterDropdown(page)
                .locator(`.s-attribute-filter-list-item-${camelCase("PhoenixSoft")}`)
                .click();
            await applyAttributeFilter(page);

            // Wait for the table widget to load
            const widget = page.locator(widgetSelector(0, 0));
            await waitAllHidden(widget, ".s-loading");
            await expect(widget.locator("[data-testid='pivot-table-next']")).toBeVisible();
            await expect(widget.locator("[data-testid*='pivot-cell']").first()).toBeVisible();

            // Set up download listener before triggering export
            const downloadPromise = page.waitForEvent("download", { timeout: 200_000 });

            // Open dashboard menu -> Export -> PDF snapshot
            await toggleDashboardMenu(page);
            await page.locator(".s-menu-exports-list").click();
            await page.locator(".s-pdf-export-item").click();

            // Verify the exported PDF
            const download = await downloadPromise;
            await expectExportedPDF(
                page,
                download,
                "KD has null value.pdf",
                "Region\n(empty value)\nPhoenixSoft1,45941,054.0044,195\nAD has null value\nProduct\nMetric has null value_Snapshot [EOP]_Timeline [EOP]\nKD has null value",
            );
        },
    );
});
