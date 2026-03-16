// (C) 2021-2026 GoodData Corporation

import { expect, test } from "@playwright/test";

import { injectAuthHeader } from "@gooddata/e2e-utils";

import { API_TOKEN, describe } from "../config";
import { mockFeatureHub, visit, waitStandaloneChartLoaded } from "../helpers";

test.beforeEach(async ({ page }) => {
    await injectAuthHeader(page, API_TOKEN);
    await mockFeatureHub(page);
});

describe("Pyramid Chart", "pyramidChart", () => {
    test(
        "check default sort of pyramid chart",
        {
            tag: ["@pre-merge-integrated"],
        },
        async ({ page }) => {
            await visit(page, "visualizations/pyramidchart/pyramid-chart-scenario");
            await waitStandaloneChartLoaded(page, ".s-pyramid-chart");

            const dataLabels = page.locator(
                ".s-pyramid-chart .highcharts-data-labels .highcharts-label text",
            );
            await expect(dataLabels).toHaveCount(8);

            const expectedLabels = [
                /\$42,470,571\.16/,
                /\$38,310,753\.45/,
                /\$18,447,266\.14/,
                /\$5,612,062\.60/,
                /\$4,249,027\.88/,
                /\$3,067,466\.12/,
                /\$2,606,293\.46/,
                /\$1,862,015\.73/,
            ];

            for (let i = 0; i < expectedLabels.length; i++) {
                await expect(dataLabels.nth(i)).toHaveText(expectedLabels[i]);
            }
        },
    );
});
