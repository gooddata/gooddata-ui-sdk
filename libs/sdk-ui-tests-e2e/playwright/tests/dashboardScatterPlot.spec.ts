// (C) 2024-2026 GoodData Corporation

import { expect, test } from "@playwright/test";

import { injectAuthHeader } from "@gooddata/e2e-utils";

import { API_TOKEN, describe } from "../config.js";
import { mockFeatureHub, visit, waitChartLoaded } from "../helpers.js";

test.beforeEach(async ({ page }) => {
    await injectAuthHeader(page, API_TOKEN);
    await mockFeatureHub(page);
});

describe("Scatter Plot - Segmentation", "dashboardScatterPlot", () => {
    test(
        "should grouped points by segmentation",
        {
            tag: ["@pre-merge-isolated"],
        },
        async ({ page }) => {
            await visit(page, "dashboard/dashboard-scatter-plot-segmentation");
            await waitChartLoaded(page, ".s-dash-item-0_0");

            const chart = page.locator(".s-dash-item-0_0");
            const points = chart.locator(".highcharts-series-0 .highcharts-point");
            await expect(points).toHaveCount(5);

            const paths = chart.locator(".highcharts-series-0 path");
            await expect(paths.nth(0)).toHaveAttribute("fill", "rgb(20,178,226)");
            await expect(paths.nth(1)).toHaveAttribute("fill", "rgb(0,193,141)");
            await expect(paths.nth(2)).toHaveAttribute("fill", "rgb(20,178,226)");
            await expect(paths.nth(3)).toHaveAttribute("fill", "rgb(0,193,141)");
            await expect(paths.nth(4)).toHaveAttribute("fill", "rgb(20,178,226)");
        },
    );
});
