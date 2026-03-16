// (C) 2021-2026 GoodData Corporation

import { expect, test } from "@playwright/test";

import { injectAuthHeader } from "@gooddata/e2e-utils";

import { API_TOKEN, describe } from "../config";
import { mockFeatureHub, visit } from "../helpers.js";

test.beforeEach(async ({ page }) => {
    await injectAuthHeader(page, API_TOKEN);
    await mockFeatureHub(page);
});

describe("Dashboard with charts", "dashboardTigerWithCharts", () => {
    test.describe("rendering", () => {
        test("should render charts", { tag: ["@pre-merge-isolated"] }, async ({ page }) => {
            await visit(page, "dashboard/dashboard-tiger-charts");

            // Check dashboard widget list contains expected chart names
            const headlines = page.locator(".visualization .item-headline");
            await expect(headlines.filter({ hasText: "Funnel chart" })).toBeVisible();
            await expect(headlines.filter({ hasText: "Pyramid chart" })).toBeVisible();
            await expect(headlines.filter({ hasText: "Sankey chart" })).toBeVisible();
            await expect(headlines.filter({ hasText: "Dependency wheel chart" })).toBeVisible();
            await expect(headlines.filter({ hasText: "Waterfall chart" })).toBeVisible();

            // Check charts were rendered as Highcharts charts
            await expect(page.locator(".s-dash-item-0_0 .highcharts-root")).toBeVisible();
            await expect(page.locator(".s-dash-item-0_1 .highcharts-root")).toBeVisible();
            await expect(page.locator(".s-dash-item-0_2 .highcharts-root")).toBeVisible();
            await expect(page.locator(".s-dash-item-0_3 .highcharts-root")).toBeVisible();
            await expect(page.locator(".s-dash-item-1_0 .highcharts-root")).toBeVisible();
        });
    });

    test.describe("Dashboard with pyramid and funnel charts", () => {
        test(
            "should render default color legend of funnel and pyramid chart correctly",
            { tag: ["@pre-merge-integrated"] },
            async ({ page }) => {
                await visit(page, "dashboard/dashboard-tiger-charts");

                // Funnel chart (Widget 0) — 4 data labels, first legend icon is blue
                const funnelChart = page.locator(".s-dash-item-0_0");
                await expect(
                    funnelChart.locator(".highcharts-data-labels .highcharts-label text"),
                ).toHaveCount(4);
                await expect(funnelChart.locator(".viz-legend .series-icon").first()).toHaveCSS(
                    "background-color",
                    "rgb(20, 178, 226)",
                );

                // Pyramid chart (Widget 2) — 3 data labels, first legend icon is blue
                const pyramidChart = page.locator(".s-dash-item-0_2");
                await expect(
                    pyramidChart.locator(".highcharts-data-labels .highcharts-label text"),
                ).toHaveCount(3);
                await expect(pyramidChart.locator(".viz-legend .series-icon").first()).toHaveCSS(
                    "background-color",
                    "rgb(20, 178, 226)",
                );
            },
        );
    });
});
