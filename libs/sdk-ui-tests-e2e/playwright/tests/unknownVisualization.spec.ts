// (C) 2021-2026 GoodData Corporation

import { expect } from "@playwright/test";

import { injectAuthHeader } from "@gooddata/e2e-utils";

import { API_TOKEN, test } from "../config.js";
import { mockFeatureHub, visit } from "../helpers.js";

test.beforeEach(async ({ page }) => {
    await injectAuthHeader(page, API_TOKEN);
    await mockFeatureHub(page);
});

test.topLevelDescribe("Dashboard with unknown visualization class", "unknownVisualization", () => {
    test.describe("Basic case", () => {
        test(
            "should render dashboard even if it contains unknown visualization class",
            {
                tag: ["@pre-merge-isolated"],
            },
            async ({ page }) => {
                await visit(page, "dashboard/dashboard-tiger-unknown-visualization");
                await expect(
                    page.locator(".s-dash-item-0_0").getByText("Sorry, we can't display this visualization"),
                ).toBeVisible();
            },
        );
    });
});
