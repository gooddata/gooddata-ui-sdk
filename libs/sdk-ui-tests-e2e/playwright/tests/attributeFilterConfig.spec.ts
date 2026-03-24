// (C) 2022-2026 GoodData Corporation

import { expect, test } from "@playwright/test";

import { injectAuthHeader } from "@gooddata/e2e-utils";

import { API_TOKEN, describe } from "../config.js";
import { enterEditMode, mockFeatureHub, visit } from "../helpers.js";

test.beforeEach(async ({ page }) => {
    await injectAuthHeader(page, API_TOKEN);
    await mockFeatureHub(page);
});

const STAGE_NAME_FILTER_SELECTOR = ".s-attribute-filter.s-stage_name";
const ORDER_DISPLAY_FORM_VALUE = ".gd-list-item.s-attribute-display-form-name-order";

describe("Attribute filter", "attributeFilterConfig", () => {
    //Cover ticket: RAIL-4671
    test.describe("Config attribute filter", () => {
        test(
            "Should reset display form value dropdown after cancel attribute panel",
            { tag: ["@pre-merge-integrated"] },
            async ({ page }) => {
                await visit(page, "dashboard/stage-name");
                await enterEditMode(page);

                // Open the Stage Name attribute filter
                await page.locator(STAGE_NAME_FILTER_SELECTOR).click();

                // Open configuration panel
                await page.locator(".s-configuration-button").click();

                // Switch display form to "Order"
                await page.locator(".s-attribute-display-form-button").click();
                await page
                    .locator(".s-attribute-display-form-dropdown-body")
                    .locator(ORDER_DISPLAY_FORM_VALUE)
                    .click();
                await expect(page.locator(".s-attribute-display-form-button .gd-button-text")).toHaveText(
                    "Order",
                );

                // Cancel configuration
                await page.locator(".dropdown-body .cancel-button").click();

                // Re-open configuration and verify display form is reset
                await page.locator(".s-configuration-button").click();
                await expect(page.locator(".s-attribute-display-form-button .gd-button-text")).toHaveText(
                    "Stage Name",
                );
            },
        );
    });
});
