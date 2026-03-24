// (C) 2021-2026 GoodData Corporation

import { expect, test } from "@playwright/test";

import { injectAuthHeader } from "@gooddata/e2e-utils";

import { API_TOKEN, describe } from "../config.js";
import { mockFeatureHub, visit, waitStandaloneChartLoaded } from "../helpers.js";

test.beforeEach(async ({ page }) => {
    await injectAuthHeader(page, API_TOKEN);
    await mockFeatureHub(page);
});

const DATA_LABELS_SELECTOR = ".highcharts-data-labels .highcharts-label text";

describe("Funnel Chart", "funnelChart", () => {
    test(
        "check default sort of funnel chart",
        {
            tag: ["@pre-merge-integrated"],
        },
        async ({ page }) => {
            await visit(page, "visualizations/funnelchart/funnel-chart-scenario");
            await waitStandaloneChartLoaded(page, ".s-funnel-chart");

            const dataLabels = page.locator(`.s-funnel-chart ${DATA_LABELS_SELECTOR}`);
            await expect(dataLabels).toHaveCount(8);

            const expectedLabels = [
                /\$42,470,571\.16 \(100%\)/,
                /\$38,310,753\.45 \(90%\)/,
                /\$18,447,266\.14 \(43%\)/,
                /\$5,612,062\.60 \(13%\)/,
                /\$4,249,027\.88 \(10%\)/,
                /\$3,067,466\.12 \(7%\)/,
                /\$2,606,293\.46 \(6%\)/,
                /\$1,862,015\.73 \(4%\)/,
            ];

            for (let i = 0; i < expectedLabels.length; i++) {
                await expect(dataLabels.nth(i)).toHaveText(expectedLabels[i]);
            }
        },
    );
});
