// (C) 2021-2026 GoodData Corporation

import { expect, test } from "@playwright/test";

import { injectAuthHeader } from "@gooddata/e2e-utils";

import { API_TOKEN, describe } from "../config";
import { mockFeatureHub, visit } from "../helpers";

test.beforeEach(async ({ page }) => {
    await injectAuthHeader(page, API_TOKEN);
    await mockFeatureHub(page);
});

describe("Dashboard with unknown visualization class", "unknownVisualization", () => {
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
