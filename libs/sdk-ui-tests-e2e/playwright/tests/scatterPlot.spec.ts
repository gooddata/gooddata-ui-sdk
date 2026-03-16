// (C) 2024-2026 GoodData Corporation

import { expect, test } from "@playwright/test";

import { injectAuthHeader } from "@gooddata/e2e-utils";

import { API_TOKEN, describe } from "../config";
import { mockFeatureHub, visit, waitChartComputed } from "../helpers.js";

test.beforeEach(async ({ page }) => {
    await injectAuthHeader(page, API_TOKEN);
    await mockFeatureHub(page);
});

describe("Scatter Plot", "scatterPlot", () => {
    test(
        "should group points by segment and customize color",
        { tag: ["@pre-merge-isolated"] },
        async ({ page }) => {
            await visit(page, "visualizations/scatterplot/segmentation");
            await waitChartComputed(page, ".s-scatter-plot");

            const chart = page.locator(".s-scatter-plot");
            const points = chart.locator(".highcharts-series-0 .highcharts-point");
            await expect(points).toHaveCount(5);

            const paths = chart.locator(".highcharts-series-0 path");
            await expect(paths.nth(0)).toHaveAttribute("fill", "rgb(4,140,103)");
            await expect(paths.nth(1)).toHaveAttribute("fill", "rgb(163,101,46)");
            await expect(paths.nth(2)).toHaveAttribute("fill", "rgb(181,60,51)");
            await expect(paths.nth(3)).toHaveAttribute("fill", "rgb(4,140,103)");
            await expect(paths.nth(4)).toHaveAttribute("fill", "rgb(163,101,46)");
        },
    );

    test("should group points by segment", { tag: ["@pre-merge-isolated"] }, async ({ page }) => {
        await visit(page, "visualizations/scatterplot/segmentation-insight-view");
        await waitChartComputed(page, ".s-scatter-plot");

        const chart = page.locator(".s-scatter-plot");
        const points = chart.locator(".highcharts-series-0 .highcharts-point");
        await expect(points).toHaveCount(5);

        const paths = chart.locator(".highcharts-series-0 path");
        await expect(paths.nth(0)).toHaveAttribute("fill", "rgb(20,178,226)");
        await expect(paths.nth(1)).toHaveAttribute("fill", "rgb(0,193,141)");
        await expect(paths.nth(2)).toHaveAttribute("fill", "rgb(20,178,226)");
        await expect(paths.nth(3)).toHaveAttribute("fill", "rgb(0,193,141)");
        await expect(paths.nth(4)).toHaveAttribute("fill", "rgb(20,178,226)");
    });
});
