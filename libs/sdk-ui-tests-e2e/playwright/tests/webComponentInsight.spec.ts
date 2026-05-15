// (C) 2026 GoodData Corporation

import { expect } from "@playwright/test";

import { injectAuthHeader } from "@gooddata/sdk-e2e-utils";

import { API_TOKEN, test } from "../config.js";
import { visit } from "../helpers.js";
import {
    callCustomElementMethod,
    getScenarioText,
    setCustomElementProperties,
    waitForCustomElementReady,
} from "../helpers/webComponents.js";

const HOST = ".s-wc-insight-host";

test.beforeEach(async ({ page }) => {
    await injectAuthHeader(page, API_TOKEN);
});

test.topLevelDescribe("Web component insight", "webComponentInsightSdk", () => {
    test(
        "renders gd-insight-embed and emits gd-ready once",
        { tag: ["@pre-merge-integrated"] },
        async ({ page }) => {
            await visit(page, "web-components/insight/lifecycle");
            await waitForCustomElementReady(page);

            await expect(page.locator(".s-wc-rendered-state")).toHaveText("rendered");
            await expect(page.locator(".s-wc-title-text")).toContainText("Lifecycle Title");
        },
    );

    test(
        "property bootstrap wins over bootstrap attributes before first ready",
        { tag: ["@pre-merge-integrated"] },
        async ({ page }) => {
            await visit(page, "web-components/insight/precedence");
            await waitForCustomElementReady(page);

            await expect(page.locator(".s-wc-rendered-state")).toHaveText("rendered");
            await expect(page.locator(".s-wc-title-text")).toContainText("Property Title");
            await expect(page.locator(".s-wc-last-error")).toHaveText("");
        },
    );

    test("refresh resolves after first ready", { tag: ["@pre-merge-integrated"] }, async ({ page }) => {
        await visit(page, "web-components/insight/refresh");
        await waitForCustomElementReady(page);

        await callCustomElementMethod(page, HOST, "refresh");

        await expect(page.locator(".s-wc-command-refresh-status")).toHaveText("resolved");
        await expect(page.locator(".s-wc-last-error")).toHaveText("");
    });

    test(
        "post-ready identity reassignment emits invalidUsage and preserves the rendered result",
        { tag: ["@pre-merge-integrated"] },
        async ({ page }) => {
            await visit(page, "web-components/insight/invalid-usage");
            await waitForCustomElementReady(page);

            const before = await getScenarioText(page, ".s-wc-title-text");

            await setCustomElementProperties(page, HOST, {
                insight: "8f88b387-351b-479f-a7fb-e2b072c810f3",
            });

            await expect(page.locator(".s-wc-last-error")).toContainText("invalidUsage");
            await expect(page.locator(".s-wc-title-text")).toHaveText(before);
            await expect(page.locator(".s-wc-ready-count")).toHaveText("1");
        },
    );
});
