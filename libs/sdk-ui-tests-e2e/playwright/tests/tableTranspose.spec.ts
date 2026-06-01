// (C) 2023-2026 GoodData Corporation

import { expect } from "@playwright/test";

import { injectAuthHeader } from "@gooddata/sdk-e2e-utils";

import { API_TOKEN, test } from "../config.js";
import { expectTableCellValue, visit, waitTableLoaded, widgetSelector } from "../helpers.js";

test.beforeEach(async ({ page }) => {
    await injectAuthHeader(page, API_TOKEN);
});

test.topLevelDescribe(
    "Dashboard with Table Transpose",
    "tableTranspose",
    { additionalWindowProperties: { useSafeLocalIdentifiersForE2e: true } },
    () => {
        test(
            "rendering",
            {
                tag: ["@pre-merge-integrated"],
            },
            async ({ page }) => {
                const parentSelector = widgetSelector(0, 0);
                await visit(page, "dashboard/dashboard-table-transpose");
                await waitTableLoaded(page, parentSelector);
                await expectTableCellValue(page, parentSelector, 0, 1, "$48,932,639.59");

                // Assert metric header in row
                const table = page.locator(`${parentSelector} .gd-pivot-table-next`);
                const metricHeaderCell = table.locator(
                    `[role="row"][row-index="0"] [role="gridcell"][aria-colindex="1"]`,
                );
                await expect(metricHeaderCell).toHaveText("Amount");
            },
        );
    },
);
