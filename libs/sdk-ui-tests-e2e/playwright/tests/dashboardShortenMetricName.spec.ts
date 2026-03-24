// (C) 2024-2026 GoodData Corporation

import { expect, test } from "@playwright/test";

import { injectAuthHeader } from "@gooddata/e2e-utils";

import { API_TOKEN, describe } from "../config.js";
import {
    mockFeatureHub,
    visit,
    waitChartLoaded,
    waitDashboardLoaded,
    waitTableLoaded,
    widgetSelector,
} from "../helpers.js";

test.beforeEach(async ({ page }) => {
    await injectAuthHeader(page, API_TOKEN);
    await mockFeatureHub(page);
});

describe("Dashboard Shorten Metric Name", "dashboardShortenMetricName", () => {
    test(
        "Table should shorten metric name",
        {
            tag: ["@pre-merge-integrated"],
        },
        async ({ page }) => {
            await visit(page, "dashboard/shorten-metric-name");
            await waitDashboardLoaded(page);

            const widget = widgetSelector(0, 0);
            await waitTableLoaded(page, widget);

            await expect(page.locator(`${widget} .ag-header-allow-overflow`)).toBeVisible();
            const viewportWidth = await page
                .locator(`${widget} .ag-header-viewport`)
                .evaluate((el) => el.getBoundingClientRect().width);
            expect(viewportWidth).toBe(526.328125);
        },
    );

    test(
        "Column chart should shorten metric name in legend",
        {
            tag: ["@pre-merge-integrated"],
        },
        async ({ page }) => {
            await visit(page, "dashboard/shorten-metric-name");
            await waitDashboardLoaded(page);

            const widget = widgetSelector(0, 1);
            await waitChartLoaded(page, widget);

            // Assert legend name is truncated with ellipsis and has expected width
            const legendName = page.locator(`${widget} .series-name`).first();
            await expect(legendName).toHaveCSS("text-overflow", "ellipsis");
            const legendWidth = await legendName.evaluate((el) => el.getBoundingClientRect().width);
            expect(legendWidth).toBe(176);

            // Hover on the first highcharts series to trigger tooltip
            const seriesElement = page
                .locator(`${widget} .highcharts-container`)
                .locator(
                    `.highcharts-series-0.highcharts-tracker rect,` +
                        ` .highcharts-series-0.highcharts-tracker path,` +
                        ` .highcharts-data-label text,` +
                        ` .highcharts-series rect`,
                )
                .first();
            await seriesElement.hover();

            // Assert tooltip title has expected max-width
            await expect(
                page.locator('.gd-viz-tooltip-title[style="max-width: 300px;"]').first(),
            ).toBeAttached();
        },
    );
});
