// (C) 2023-2026 GoodData Corporation

import { expect, test } from "@playwright/test";

import { injectAuthHeader } from "@gooddata/e2e-utils";

import { API_TOKEN, describe } from "../config";
import {
    clickChartSeriesPoint,
    mockFeatureHub,
    visit,
    waitStandaloneChartLoaded,
    waitTableLoaded,
} from "../helpers.js";

const LEGEND_NAME_CSS = ".series-name";
const TOOLTIP_TITLE_CSS = ".gd-viz-tooltip-title";

test.beforeEach(async ({ page }) => {
    await injectAuthHeader(page, API_TOKEN);
    await mockFeatureHub(page);
});

describe("Shorten Metric Name", "shortenMetricName", () => {
    test(
        `check shorten in legend and tooltip in chart`,
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
        `check shorten metric name in table`,
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
});
