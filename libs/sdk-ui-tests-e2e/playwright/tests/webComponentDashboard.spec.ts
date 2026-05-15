// (C) 2026 GoodData Corporation

import { expect } from "@playwright/test";

import { injectAuthHeader } from "@gooddata/sdk-e2e-utils";
import { newPositiveAttributeFilter } from "@gooddata/sdk-model";
import { SalesRep } from "@gooddata/sdk-ui-tests-reference-workspace/current_tiger";

import { API_TOKEN, test } from "../config.js";
import { visit } from "../helpers.js";
import {
    callCustomElementMethod,
    getScenarioText,
    setCustomElementProperties,
    waitForCustomElementReady,
} from "../helpers/webComponents.js";

const HOST = ".s-wc-dashboard-host";

test.beforeEach(async ({ page }) => {
    await injectAuthHeader(page, API_TOKEN);
});

test.topLevelDescribe("Web component dashboard", "webComponentDashboardSdk", () => {
    test(
        "renders gd-dashboard-embed and emits gd-ready once",
        { tag: ["@pre-merge-integrated"] },
        async ({ page }) => {
            await visit(page, "web-components/dashboard/lifecycle");
            await waitForCustomElementReady(page);

            await expect(page.locator(".s-wc-result-primary")).not.toHaveText("");
            await expect(page.locator(".s-wc-last-error")).toHaveText("");
        },
    );

    test(
        "property bootstrap wins over bootstrap attributes before first ready",
        { tag: ["@pre-merge-integrated"] },
        async ({ page }) => {
            await visit(page, "web-components/dashboard/precedence");
            await waitForCustomElementReady(page);

            await expect(page.locator(".s-wc-result-primary")).not.toHaveText("");
            await expect(page.locator(".s-wc-last-error")).toHaveText("");
        },
    );

    test("refresh resolves after first ready", { tag: ["@pre-merge-integrated"] }, async ({ page }) => {
        await visit(page, "web-components/dashboard/commands");
        await waitForCustomElementReady(page);

        await callCustomElementMethod(page, HOST, "refresh");

        await expect(page.locator(".s-wc-command-refresh-status")).toHaveText("resolved");
        await expect(page.locator(".s-wc-last-error")).toHaveText("");
    });

    test(
        "replaceFilters resolves and changes the visible primary result",
        { tag: ["@pre-merge-integrated"] },
        async ({ page }) => {
            await visit(page, "web-components/dashboard/commands");
            await waitForCustomElementReady(page);

            const before = await getScenarioText(page, ".s-wc-result-primary");

            await callCustomElementMethod(page, HOST, "replaceFilters", [
                [newPositiveAttributeFilter(SalesRep.OwnerName, ["Antony", "Cory Owens"])],
            ]);

            await expect(page.locator(".s-wc-command-replace-filters-status")).toHaveText("resolved");
            await expect(page.locator(".s-wc-result-primary")).not.toHaveText(before);
            await expect(page.locator(".s-wc-last-error")).toHaveText("");
        },
    );

    test(
        "post-ready identity reassignment emits invalidUsage and preserves the rendered result",
        { tag: ["@pre-merge-integrated"] },
        async ({ page }) => {
            await visit(page, "web-components/dashboard/invalid-usage");
            await waitForCustomElementReady(page);

            const before = await getScenarioText(page, ".s-wc-result-primary");

            await setCustomElementProperties(page, HOST, {
                dashboard: "c4e4916e-ccc2-46d1-8202-8321249ec2a3",
            });

            await expect(page.locator(".s-wc-last-error")).toContainText("invalidUsage");
            await expect(page.locator(".s-wc-result-primary")).toHaveText(before);
            await expect(page.locator(".s-wc-ready-count")).toHaveText("1");
        },
    );

    test(
        "disabled plugin mode emits gd-warning when extraPlugins are provided",
        { tag: ["@pre-merge-integrated"] },
        async ({ page }) => {
            await visit(page, "web-components/dashboard/plugin-warning");
            await waitForCustomElementReady(page);

            await expect(page.locator(".s-wc-last-error")).toHaveText("");
            await expect(page.locator(".s-wc-last-warning")).toContainText("extraPlugins");
            await expect(page.locator(".s-wc-last-warning")).toContainText('pluginMode="disabled"');
        },
    );
});
