// (C) 2026 GoodData Corporation

import type { Page } from "@playwright/test";

import type { IFeatureHubEnvironment, IFeatureHubFeature } from "./types.js";

const FEATURE_HUB_ROUTE = "**/features*";

export function makeFeatureHubResponse(features: IFeatureHubFeature[]): IFeatureHubEnvironment[] {
    return [
        {
            id: "50e8946c-ef93-4748-bfb1-f0522214cc69",
            features,
        },
    ];
}

/** FeatureHub mock — each test gets a fresh page, so route dies with it. */
export async function registerFeatureHubMock(page: Page, features: IFeatureHubFeature[]): Promise<void> {
    const body = JSON.stringify(makeFeatureHubResponse(features));

    await page.route(FEATURE_HUB_ROUTE, async (route) => {
        await route.fulfill({
            status: 200,
            contentType: "application/json",
            headers: { "access-control-allow-origin": "*" },
            body,
        });
    });
}

/** Remove the FeatureHub mock registered by {@link registerFeatureHubMock}. */
export async function unregisterFeatureHubMock(page: Page): Promise<void> {
    await page.unroute(FEATURE_HUB_ROUTE);
}

/** Replace the current FeatureHub mock with one serving `featureHubResponse`. */
export async function reregisterFeatureHubMock(
    page: Page,
    featureHubResponse: IFeatureHubFeature[],
): Promise<void> {
    await unregisterFeatureHubMock(page);
    await registerFeatureHubMock(page, featureHubResponse);
}
