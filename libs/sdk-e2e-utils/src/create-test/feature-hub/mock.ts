// (C) 2026 GoodData Corporation

import type { Test } from "../playwright/playwright-types.js";

import type { IFeatureHubEnvironment } from "./types.js";

/** FeatureHub mock — each test gets a fresh page, so route dies with it. */
export function registerFeatureHubMock(
    testInstance: Test,
    featureHubResponse: IFeatureHubEnvironment[],
): void {
    const body = JSON.stringify(featureHubResponse);
    testInstance.beforeEach(async ({ page }) => {
        await page.route("**/features*", async (route) => {
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                headers: { "access-control-allow-origin": "*" },
                body,
            });
        });
    });
}
