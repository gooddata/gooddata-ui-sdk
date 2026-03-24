// (C) 2024-2026 GoodData Corporation

import { expect, test } from "@playwright/test";

import { injectAuthHeader } from "@gooddata/e2e-utils";

import { API_TOKEN, describe } from "../config.js";
import { mockFeatureHub, visit, waitAllHidden, waitTableLoaded } from "../helpers.js";

const PARENT = ".s-table-component-transpose";

test.beforeEach(async ({ page }) => {
    await injectAuthHeader(page, API_TOKEN);
    await mockFeatureHub(page);
});

describe("Pivot table transposed", "pivotTableTransposed", () => {
    test.describe("Table Component", () => {
        test(
            "should display Metric in row, Column header on top",
            {
                tag: ["@pre-merge-integrated"],
            },
            async ({ page }) => {
                await visit(page, "visualizations/pivot-table/pivot-table-transposed-has-mr-row-top");
                await waitTableLoaded(page, PARENT);

                const table = page.locator(`${PARENT} .gd-pivot-table-next`);

                // Assert metric headers in rows
                await expect(table.locator('[row-index="1"] [aria-colindex="2"]')).toHaveText("Amount");
                await expect(table.locator('[row-index="2"] [aria-colindex="2"]')).toHaveText("Amount");

                // Assert column header contains "Product"
                await expect(
                    table.locator(
                        '[role="columnheader"][aria-colindex="1"] [data-testid~="pivot-header-text"]',
                    ),
                ).toContainText("Product");
            },
        );

        test(
            "should display Row attribute and Column header on top",
            {
                tag: ["@pre-merge-integrated"],
            },
            async ({ page }) => {
                await visit(page, "visualizations/pivot-table/pivot-table-transposed-has-rc-row-top");
                await waitTableLoaded(page, PARENT);

                const table = page.locator(`${PARENT} .gd-pivot-table-next`);

                // Assert column header contains "Product"
                await expect(
                    table.locator(
                        '[role="columnheader"][aria-colindex="1"] [data-testid~="pivot-header-text"]',
                    ),
                ).toContainText("Product");

                // Assert column header on top has "Forecast Category"
                await expect(
                    table.locator(
                        ".ag-header-viewport .ag-header-row.ag-header-row-group .ag-header-group-cell",
                    ),
                ).toHaveText("Forecast Category");
            },
        );

        test(
            "should display Row header on top",
            {
                tag: ["@pre-merge-integrated"],
            },
            async ({ page }) => {
                await visit(page, "visualizations/pivot-table/pivot-table-transposed-has-r-row-top");
                await waitTableLoaded(page, PARENT);

                const table = page.locator(`${PARENT} .gd-pivot-table-next`);

                // Assert column header contains "Product"
                await expect(
                    table.locator(
                        '[role="columnheader"][aria-colindex="1"] [data-testid~="pivot-header-text"]',
                    ),
                ).toContainText("Product");
            },
        );

        test(
            "should display Metric in row",
            {
                tag: ["@pre-merge-integrated"],
            },
            async ({ page }) => {
                await visit(page, "visualizations/pivot-table/pivot-table-transposed-has-m-row-top");
                await waitTableLoaded(page, PARENT);

                const table = page.locator(`${PARENT} .gd-pivot-table-next`);

                // Assert metric header in row at (0, 0) is "Amount"
                await expect(table.locator('[row-index="0"] [aria-colindex="1"]')).toHaveText("Amount");

                // Assert cell value at (0, 1) is "$116,625,456.54"
                await expect(table.locator('[row-index="0"] [aria-colindex="2"]')).toHaveText(
                    "$116,625,456.54",
                );
            },
        );

        test(
            "should display Column header on top",
            {
                tag: ["@pre-merge-integrated"],
            },
            async ({ page }) => {
                await visit(page, "visualizations/pivot-table/pivot-table-transposed-has-c-left");
                await waitAllHidden(page, ".s-loading");

                const table = page.locator(`${PARENT} .gd-pivot-table-next`);

                // Assert table is loaded (header cell exists) — matches Cypress isLoaded()
                await expect(
                    table
                        .locator(
                            '.ag-header .gd-pivot-table-next__header-cell, .ag-header [role="columnheader"]',
                        )
                        .first(),
                ).toBeAttached();

                // Assert column header on top has "Forecast Category"
                await expect(
                    table.locator(
                        ".ag-header-viewport .ag-header-row.ag-header-row-group .ag-header-group-cell",
                    ),
                ).toHaveText("Forecast Category");
            },
        );
    });

    const INSIGHT_PARENT = ".s-insight-view-transpose";

    test.describe("Insight View", () => {
        // TODO: skip this because of bug https://gooddata.atlassian.net/browse/F1-2003
        test.skip(
            "should display Metric in row, Column header on left",
            {
                tag: ["@pre-merge-integrated"],
            },
            async ({ page }) => {
                await visit(page, "insight/insight-transpose-has-mc-row-left");
                await waitTableLoaded(page, INSIGHT_PARENT);

                const table = page.locator(`${INSIGHT_PARENT} .gd-pivot-table-next`);

                // Assert cell at (0, 0) has "Forecast Category"
                await expect(table.locator('[row-index="0"] [aria-colindex="1"]')).toHaveText(
                    "Forecast Category",
                );

                // Assert metric header in row at (1, 0) is "Amount"
                await expect(table.locator('[row-index="1"] [aria-colindex="1"]')).toHaveText("Amount");
            },
        );

        test(
            "should display Metric in column, Column header on the top",
            {
                tag: ["@pre-merge-integrated"],
            },
            async ({ page }) => {
                await visit(page, "insight/insight-transpose-has-mc-column-top");
                await waitTableLoaded(page, INSIGHT_PARENT);

                const table = page.locator(`${INSIGHT_PARENT} .gd-pivot-table-next`);
                const headerTextSelector = '[data-testid~="pivot-header-text"]';

                // Assert column header at index 0 contains "Forecast Category", "Exclude", "Amount"
                const header0 = table.locator(
                    `[role="columnheader"][aria-colindex="1"] ${headerTextSelector}`,
                );
                for (const value of ["Forecast Category", "Exclude", "Amount"]) {
                    await expect(header0.filter({ hasText: value }).first()).toBeVisible();
                }

                // Assert column header at index 1 contains "Include", "Amount"
                const header1 = table.locator(
                    `[role="columnheader"][aria-colindex="2"] ${headerTextSelector}`,
                );
                for (const value of ["Include", "Amount"]) {
                    await expect(header1.filter({ hasText: value }).first()).toBeVisible();
                }
            },
        );

        test(
            "should display Metric in row",
            {
                tag: ["@pre-merge-integrated"],
            },
            async ({ page }) => {
                await visit(page, "insight/insight-transpose-has-mc-row");
                await waitTableLoaded(page, INSIGHT_PARENT);

                const table = page.locator(`${INSIGHT_PARENT} .gd-pivot-table-next`);

                // Assert metric header in row at (0, 0) is "Amount"
                await expect(table.locator('[row-index="0"] [aria-colindex="1"]')).toHaveText("Amount");
            },
        );

        // TODO: skip this because of bug https://gooddata.atlassian.net/browse/F1-2003
        test.skip(
            "should display Column header on top",
            {
                tag: ["@pre-merge-integrated"],
            },
            async ({ page }) => {
                await visit(page, "insight/insight-transpose-has-mc-left");
                await waitTableLoaded(page, INSIGHT_PARENT);

                const table = page.locator(`${INSIGHT_PARENT} .gd-pivot-table-next`);

                // Assert column header on top has "Forecast Category"
                await expect(
                    table.locator(
                        ".ag-header-viewport .ag-header-row.ag-header-row-group .ag-header-group-cell",
                    ),
                ).toHaveText("Forecast Category");
            },
        );
    });
});
