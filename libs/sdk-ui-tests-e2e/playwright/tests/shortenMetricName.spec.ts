// (C) 2023-2026 GoodData Corporation

import { expect } from "@playwright/test";

import { injectAuthHeader } from "@gooddata/sdk-e2e-utils";

import { API_TOKEN, test } from "../config.js";
import { clickChartSeriesPoint, visit, waitStandaloneChartLoaded, waitTableLoaded } from "../helpers.js";

const LEGEND_NAME_CSS = ".series-name";
const TOOLTIP_TITLE_CSS = ".gd-viz-tooltip-title";

test.beforeEach(async ({ page }) => {
    await injectAuthHeader(page, API_TOKEN);
});

test.describe(
    "Shorten metric name",
    { additionalWindowProperties: { useSafeLocalIdentifiersForE2e: true } },
    () => {
        test(
            "should truncate the metric name in the chart legend and tooltip",
            {
                tag: ["@pre-merge-integrated"],
            },
            async ({ page }) => {
                await visit(page, "visualizations/shortenmetricname/shorten-metric-name-chart-scenario");
                await waitStandaloneChartLoaded(page, ".s-column-chart");

                const legendName = page.locator(LEGEND_NAME_CSS).first();
                await expect(legendName).toHaveCSS("text-overflow", "ellipsis");
                const legendWidth = await legendName.evaluate((el) => el.getBoundingClientRect().width);
                expect(legendWidth).toBe(176);

                await clickChartSeriesPoint(page, ".s-column-chart", 0);

                await expect(
                    page.locator('.gd-viz-tooltip-title[style="max-width: 300px;"]').first(),
                ).toBeAttached();
                const tooltipTitle = page.locator(TOOLTIP_TITLE_CSS).first();
                const tooltipWidth = await tooltipTitle.evaluate((el) => el.getBoundingClientRect().width);
                expect(tooltipWidth).toBe(300);
            },
        );

        test(
            "should fit the metric name in the table header",
            {
                tag: ["@pre-merge-integrated"],
            },
            async ({ page }) => {
                await visit(page, "visualizations/shortenmetricname/shorten-metric-name-table-scenario");
                await waitTableLoaded(page, ".s-pivot-table");

                const headerText = page.locator(
                    ".s-pivot-table .gd-pivot-table-next [data-testid~='pivot-header-text']",
                );
                const width = await headerText.evaluate((el) => el.getBoundingClientRect().width);
                expect(width).toBeGreaterThanOrEqual(1352);
                expect(width).toBeLessThanOrEqual(1354);
            },
        );
    },
);
