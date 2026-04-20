// (C) 2023-2026 GoodData Corporation

import { expect } from "@playwright/test";

import { injectAuthHeader } from "@gooddata/e2e-utils";

import { API_TOKEN, test } from "../config.js";

test.beforeEach(async ({ page }) => {
    await injectAuthHeader(page, API_TOKEN);
});

test.topLevelDescribe("Boiler app Chart", "boilerapp", () => {
    test(`check boiler app tiger`, { tag: ["@checklist_integrated_boiler_tiger"] }, async ({ page }) => {
        await page.goto("/");

        const container = page.locator(".insight-view-visualization .headline");
        await expect(container.locator(".s-loading")).toBeHidden();
        await expect(container.locator(".s-headline-primary-item .s-headline-value")).toHaveText(
            "35,844,132",
        );
    });
});
