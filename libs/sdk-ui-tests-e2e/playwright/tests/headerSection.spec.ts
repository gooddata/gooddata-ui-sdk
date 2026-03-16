// (C) 2023-2026 GoodData Corporation

import { expect, test } from "@playwright/test";

import { injectAuthHeader } from "@gooddata/e2e-utils";

import { API_TOKEN, describe } from "../config";
import { enterEditMode, mockFeatureHub, saveDashboard, visit, waitForCatalogReload } from "../helpers.js";

test.beforeEach(async ({ page }) => {
    await injectAuthHeader(page, API_TOKEN);
    await mockFeatureHub(page);
});

describe("Header section", "headerSection", () => {
    test.describe("Default language", () => {
        test("can update header for all sections", { tag: ["@pre-merge-integrated"] }, async ({ page }) => {
            // Navigate and verify not in edit mode
            await visit(page, "dashboard/header");
            await expect(page.locator(".s-save_button")).toBeHidden();
            await expect(page.locator(".s-saving_button")).toBeHidden();

            // Open menu and verify "Save as new" option exists
            const menuButton = page.locator(".s-header-options-button");
            await expect(menuButton).toBeVisible();
            await menuButton.click();
            const saveAsNewItem = page
                .locator(".gd-header-menu-overlay .gd-list-item")
                .filter({ hasText: "Save as new" });
            await expect(saveAsNewItem).toBeVisible();

            // Save as new dashboard with a name
            await saveAsNewItem.click();
            await expect(page.locator(".save-as-new-dialog")).toBeVisible();
            await page.locator(".dashboard-title input").fill("save a new dashboard");
            await page.locator(".s-create_dashboard").click();

            // Enter edit mode (waits for catalog to load)
            await enterEditMode(page);

            // Test data (mirrors headerDataTest.json fixture)
            const dataTest = [
                { rowIndex: 0, sectionName: "  " },
                { rowIndex: 1, sectionName: "!@#$%^^&*" },
                { rowIndex: 2, sectionName: "<button>click here</button>" },
            ];

            // Set title and description for each section
            for (const { rowIndex, sectionName } of dataTest) {
                const section = page.locator(`.gd-grid-layout__section:nth-child(${rowIndex + 1})`);
                await section.scrollIntoViewIfNeeded();

                // Set title: click wrapper, fill textarea, press Enter
                const titleWrapper = section.locator(".s-fluid-layout-row-title-input");
                await titleWrapper.click();
                const titleTextarea = titleWrapper.locator("textarea");
                await titleTextarea.fill(sectionName);
                await titleTextarea.press("Enter");

                // Set description: click wrapper, fill textarea
                const descWrapper = section.locator(".s-fluid-layout-row-description-input");
                await descWrapper.click();
                const descTextarea = descWrapper.locator("textarea");
                await page.waitForTimeout(500);
                await descTextarea.fill(sectionName);

                // Click outside to commit description
                await titleWrapper.click({ position: { x: 0, y: 0 } });
                await page.keyboard.press("Escape");
            }

            // Save the dashboard
            const saveButton = page.locator(".dash-control-buttons .s-save_button");
            await saveButton.scrollIntoViewIfNeeded();
            await saveButton.click();
            await expect(page.locator(".s-edit_button")).not.toHaveClass(/disabled/);

            // Verify headers after save
            for (const { rowIndex, sectionName } of dataTest) {
                const section = page.locator(`.gd-grid-layout__section:nth-child(${rowIndex + 1})`);

                if (rowIndex === 0) {
                    // Whitespace-only title gets trimmed - title element should not exist
                    await expect(section.locator(".s-fluid-layout-row-title")).toBeHidden();
                    await expect(section.locator(".s-fluid-layout-row-description")).toHaveText("");
                } else {
                    await expect(section.locator(".s-fluid-layout-row-title")).toHaveText(sectionName);
                    await expect(section.locator(".s-fluid-layout-row-description")).toHaveText(sectionName);
                }
            }
        });

        test(
            "Header is removed after latest insight is deleted from a section",
            { tag: ["@pre-merge-isolated"] },
            async ({ page }) => {
                // Navigate to dashboard and verify not in edit mode
                await visit(page, "dashboard/header");
                await expect(page.locator(".s-save_button")).toBeHidden();
                await expect(page.locator(".s-saving_button")).toBeHidden();

                // Enter edit mode (waits for catalog to load)
                await enterEditMode(page);

                // Verify there are 3 header sections
                await expect(page.locator(".s-fluid-layout-row-header")).toHaveCount(3);

                // Remove the first widget: click it, then click delete
                await page.locator(".s-dash-item-0_0").click();
                await page.locator(".s-delete-insight-item").click();

                // Verify there are now 2 header sections
                await expect(page.locator(".s-fluid-layout-row-header")).toHaveCount(2);
            },
        );
    });

    test.describe("Localization", () => {
        test("Limitation of title", { tag: ["@pre-merge-integrated"] }, async ({ page }) => {
            // Setup (from Cypress beforeEach for Localization block)
            await visit(page, "dashboard/header-localization");
            await enterEditMode(page);
            await waitForCatalogReload(page);

            // Test data (mirrors headerDataTest.json fixture LimitTexts)
            const title =
                "This is too longggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg123";
            const desc =
                "This is too longggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg123";

            const section0 = page.locator(".gd-grid-layout__section:nth-child(1)");
            const section1 = page.locator(".gd-grid-layout__section:nth-child(2)");

            // Set title on section 0: click wrapper, fill textarea, press Enter
            const titleWrapper0 = section0.locator(".s-fluid-layout-row-title-input");
            await titleWrapper0.click();
            const titleTextarea0 = titleWrapper0.locator("textarea");
            await titleTextarea0.fill(title);
            await titleTextarea0.press("Enter");

            // Click the title input again to trigger the limit message bubble
            await titleWrapper0.click();

            // Assert limit message is visible with correct French text
            const limitBubble = page.locator(
                ".bubble:not(.s-gd-configuration-bubble) .bubble-content .content",
            );
            await expect(limitBubble).toHaveText("128/256 caractères restant");

            // Click outside to dismiss limit message
            await titleWrapper0.click({ position: { x: 0, y: 0 } });
            await page.keyboard.press("Escape");

            // Assert limit message is gone
            await expect(limitBubble).toBeHidden();

            // Scroll section 1 into view and set description
            await section1.scrollIntoViewIfNeeded();
            const descWrapper1 = section1.locator(".s-fluid-layout-row-description-input");
            await descWrapper1.locator(".gd-editable-label-richtext-empty").click();
            const descTextarea1 = descWrapper1.locator("textarea");
            const isVisible = await descTextarea1.isVisible({ timeout: 500 }).catch(() => false);
            if (!isVisible) {
                await descWrapper1.locator(".gd-editable-label-richtext-empty").click();
                await expect(descTextarea1).toBeVisible({ timeout: 500 });
            }
            await descTextarea1.fill(desc);

            // Click description input then click outside to commit
            await descWrapper1.click();
            const titleWrapper1 = section1.locator(".s-fluid-layout-row-title-input");
            await titleWrapper1.click({ position: { x: 0, y: 0 } });
            await page.keyboard.press("Escape");

            // Save the dashboard
            await saveDashboard(page);

            // Verify title on section 0 persisted
            await expect(section0.locator(".s-fluid-layout-row-title")).toHaveText(title);

            // Verify description on section 1 persisted
            await expect(section1.locator(".s-fluid-layout-row-description")).toHaveText(desc);
        });

        test(
            "Header placeholder should be translated",
            { tag: ["@pre-merge-isolated"] },
            async ({ page }) => {
                // Setup (from Cypress beforeEach for Localization block)
                await visit(page, "dashboard/header-localization");
                await enterEditMode(page);
                await waitForCatalogReload(page);

                const section = page.locator(".gd-grid-layout__section:nth-child(1)");

                // Set title to a space and press Enter (clears it)
                const titleWrapper = section.locator(".s-fluid-layout-row-title-input");
                await titleWrapper.click();
                const titleTextarea = titleWrapper.locator("textarea");
                await titleTextarea.fill(" ");
                await titleTextarea.press("Enter");

                // Set description to a space (clears it)
                const descWrapper = section.locator(".s-fluid-layout-row-description-input");
                await descWrapper.click();
                const descTextarea = descWrapper.locator("textarea");
                await page.waitForTimeout(500);
                await descTextarea.fill(" ");

                // Click outside to commit
                await titleWrapper.click({ position: { x: 0, y: 0 } });
                await page.keyboard.press("Escape");

                // Assert placeholder title is translated to French
                await expect(titleWrapper).toHaveText("Ajouter un titre ici...");

                // Assert placeholder description is translated to French
                await expect(descWrapper).toHaveText("Ajouter une description ici...");
            },
        );
    });
});
