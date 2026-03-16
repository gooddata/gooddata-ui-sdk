// (C) 2024-2026 GoodData Corporation

import { expect, test } from "@playwright/test";

import { injectAuthHeader } from "@gooddata/e2e-utils";

import { API_TOKEN, describe } from "../config";
import { mockFeatureHub, visit, waitChartComputed } from "../helpers.js";

test.beforeEach(async ({ page }) => {
    await injectAuthHeader(page, API_TOKEN);
    await mockFeatureHub(page);
});

describe("Many data", "manyData", () => {
    test(
        "Should render visualization component when over data points limit",
        { tag: ["@pre-merge-isolated"] },
        async ({ page }) => {
            await visit(page, "visualizations/manydata/pie-many-data");
            await waitChartComputed(page, ".s-pie-chart");
            await expect(page.locator(".s-pie-chart .highcharts-root")).toBeVisible();
        },
    );

    test(
        "Should render visualization by insightView when over data points limit",
        { tag: ["@pre-merge-isolated"] },
        async ({ page }) => {
            await visit(page, "visualizations/manydata/many-data-insight-view");
            await waitChartComputed(page, ".s-column-chart");
            await expect(page.locator(".s-column-chart .highcharts-root")).toBeVisible();
        },
    );
});
