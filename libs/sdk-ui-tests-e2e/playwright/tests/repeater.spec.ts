// (C) 2024-2026 GoodData Corporation

import { expect, test } from "@playwright/test";

import { injectAuthHeader } from "@gooddata/e2e-utils";

import { API_TOKEN, describe } from "../config.js";
import { mockFeatureHub, visit } from "../helpers.js";

const REPEATER = ".s-repeater";

test.beforeEach(async ({ page }) => {
    await injectAuthHeader(page, API_TOKEN);
    await mockFeatureHub(page);
});

describe("Repeater", "repeater", () => {
    test(
        "Should render apply full customize configurations",
        {
            tag: ["@pre-merge-integrated"],
        },
        async ({ page }) => {
            await visit(page, "visualizations/repeater/repeater-full-configs");

            const repeater = page.locator(REPEATER);
            const cells = repeater.locator(".ag-cell-value");

            // Header cells count
            await expect(repeater.locator(".ag-header-cell-text")).toHaveCount(5);

            // Row height
            await expect(repeater.locator(".gd-table-row").first()).toHaveCSS("height", "85px");

            // Vertical align & text wrapping on cell 1
            await expect(cells.nth(1).locator(".gd-vertical-align-middle")).toBeAttached();
            await expect(cells.nth(1).locator(".gd-text-wrapping-wrap")).toBeAttached();

            // Image sizing on cell 0
            await expect(cells.nth(0).locator(".gd-image-sizing-fill")).toBeAttached();

            // Image in cell 5, placeholder image in cell 0
            await expect(cells.nth(5).locator("img.gd-repeater-image")).toBeAttached();
            await expect(cells.nth(0).locator(".gd-repeater-image-empty")).toBeAttached();

            // Hyperlink in cell 1
            await expect(cells.nth(1).locator("a.gd-repeater-link")).toContainText("Show more when clicking");

            // Chart in cell 2: column chart with 2 points
            await expect(cells.nth(2).locator(".highcharts-column-series").first()).toBeAttached();
            await expect(cells.nth(2).locator(".highcharts-point")).toHaveCount(2);

            // Chart in cell 3: line chart with 5 points
            await expect(cells.nth(3).locator(".highcharts-line-series").first()).toBeAttached();
            await expect(cells.nth(3).locator(".highcharts-point")).toHaveCount(5);

            // Content in cell 4
            await expect(cells.nth(4)).toContainText(".61");

            // Chart colours
            await expect(cells.nth(2).locator(".highcharts-point").nth(0)).toHaveAttribute(
                "fill",
                "rgb(241, 134, 0)",
            );
            await expect(cells.nth(3).locator(".highcharts-point").nth(0)).toHaveAttribute(
                "fill",
                "rgb(181, 60, 51)",
            );
        },
    );

    test(
        "Should render insightView Repeater",
        {
            tag: ["@pre-merge-integrated"],
        },
        async ({ page }) => {
            await visit(page, "visualizations/repeater/repeater-insight-view");

            const repeater = page.locator(REPEATER);
            const cells = repeater.locator(".ag-cell-value");

            // Header cells count
            await expect(repeater.locator(".ag-header-cell-text")).toHaveCount(5);

            // Header labels
            await expect(repeater.locator(".ag-header-cell-text")).toHaveText([
                "Product",
                "Product",
                "Amount [BOP]",
                "Avg. Amount",
                "Probability",
            ]);

            // Row height
            await expect(repeater.locator(".gd-table-row").first()).toHaveCSS("height", "85px");

            // Vertical align & text wrapping on cell 1
            await expect(cells.nth(1).locator(".gd-vertical-align-middle")).toBeAttached();
            await expect(cells.nth(1).locator(".gd-text-wrapping-wrap")).toBeAttached();

            // Image sizing on cell 0
            await expect(cells.nth(0).locator(".gd-image-sizing-fill")).toBeAttached();

            // Content in cell 1
            await expect(cells.nth(1)).toContainText("(empty value)");

            // Hyperlink in cell 6
            await expect(cells.nth(6).locator("a.gd-repeater-link")).toContainText("Show more when clicking");

            // Chart in cell 2: column chart with 2 points
            await expect(cells.nth(2).locator(".highcharts-column-series").first()).toBeAttached();
            await expect(cells.nth(2).locator(".highcharts-point")).toHaveCount(2);

            // Chart in cell 3: line chart with 5 points
            await expect(cells.nth(3).locator(".highcharts-line-series").first()).toBeAttached();
            await expect(cells.nth(3).locator(".highcharts-point")).toHaveCount(5);

            // Content in cell 9
            await expect(cells.nth(9)).toContainText(".61");

            // Chart colours
            await expect(cells.nth(2).locator(".highcharts-point").nth(0)).toHaveAttribute(
                "fill",
                "rgb(241, 134, 0)",
            );
            await expect(cells.nth(3).locator(".highcharts-point").nth(0)).toHaveAttribute(
                "fill",
                "rgb(181, 60, 51)",
            );
        },
    );

    test(
        "Should render Dashboard Repeater",
        {
            tag: ["@pre-merge-integrated"],
        },
        async ({ page }) => {
            await visit(page, "visualizations/repeater/repeater-dashboard");

            const repeater = page.locator(REPEATER);
            const cells = repeater.locator(".ag-cell-value");

            // Header cells count
            await expect(repeater.locator(".ag-header-cell-text")).toHaveCount(5);

            // Header labels
            await expect(repeater.locator(".ag-header-cell-text")).toHaveText([
                "Product",
                "Product",
                "Amount [BOP]",
                "Avg. Amount",
                "Probability",
            ]);

            // Row height
            await expect(repeater.locator(".gd-table-row").first()).toHaveCSS("height", "85px");

            // Vertical align & text wrapping on cell 1
            await expect(cells.nth(1).locator(".gd-vertical-align-middle")).toBeAttached();
            await expect(cells.nth(1).locator(".gd-text-wrapping-wrap")).toBeAttached();

            // Image sizing on cell 0
            await expect(cells.nth(0).locator(".gd-image-sizing-fill")).toBeAttached();

            // Content in cell 1
            await expect(cells.nth(1)).toContainText("(empty value)");

            // Hyperlink in cell 6
            await expect(cells.nth(6).locator("a.gd-repeater-link")).toContainText("Show more when clicking");

            // Image in cell 10
            await expect(cells.nth(10).locator("img.gd-repeater-image")).toBeAttached();

            // Chart in cell 2: column chart with 2 points
            await expect(cells.nth(2).locator(".highcharts-column-series").first()).toBeAttached();
            await expect(cells.nth(2).locator(".highcharts-point")).toHaveCount(2);

            // Chart in cell 3: line chart with 5 points
            await expect(cells.nth(3).locator(".highcharts-line-series").first()).toBeAttached();
            await expect(cells.nth(3).locator(".highcharts-point")).toHaveCount(5);

            // Content in cell 9
            await expect(cells.nth(9)).toContainText(".61");

            // Chart colours
            await expect(cells.nth(2).locator(".highcharts-point").nth(0)).toHaveAttribute(
                "fill",
                "rgb(241, 134, 0)",
            );
            await expect(cells.nth(3).locator(".highcharts-point").nth(0)).toHaveAttribute(
                "fill",
                "rgb(181, 60, 51)",
            );
        },
    );

    test(
        "Should render Repeater doesn't have any metric",
        {
            tag: ["@pre-merge-integrated"],
        },
        async ({ page }) => {
            await visit(page, "visualizations/repeater/repeater-no-metric");

            const repeater = page.locator(REPEATER);

            // Header cells count
            await expect(repeater.locator(".ag-header-cell-text")).toHaveCount(1);

            // Header labels
            await expect(repeater.locator(".ag-header-cell-text")).toHaveText(["Product Image"]);
        },
    );

    test(
        "Should show error when Repeater has no Column",
        {
            tag: ["@pre-merge-integrated"],
        },
        async ({ page }) => {
            await visit(page, "visualizations/repeater/repeater-no-column");

            await expect(page.locator(".s-error")).toContainText(
                "Sorry, we can't display this visualizationContact your administrator.",
            );
        },
    );
});
