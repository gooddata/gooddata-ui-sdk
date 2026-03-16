// (C) 2021-2026 GoodData Corporation

import { expect, test } from "@playwright/test";

import { injectAuthHeader } from "@gooddata/e2e-utils";

import { API_TOKEN, describe } from "../config";
import {
    enterEditMode,
    mockFeatureHub,
    saveAsNew,
    toggleDashboardMenu,
    visit,
    widgetSelector,
} from "../helpers.js";

test.beforeEach(async ({ page }) => {
    await injectAuthHeader(page, API_TOKEN);
    await mockFeatureHub(page);
});

describe("RichText", "dashboardRichText", () => {
    test.describe("Isolated", () => {
        test.beforeEach(async ({ page }) => {
            await visit(page, "dashboard/rich-text");
        });

        test("should render rich text in view mode", { tag: ["@pre-merge-isolated"] }, async ({ page }) => {
            const richText = page.locator(".s-dash-item-1_0 .s-rich-text");
            await expect(richText).toBeVisible();

            await expect(richText.locator("h1")).toHaveText("Title");
            await expect(richText.locator("img")).toHaveAttribute("src", "/image.png");
        });

        test(
            "should change rich text widget content in edit mode",
            { tag: ["@pre-merge-isolated"] },
            async ({ page }) => {
                await enterEditMode(page);

                const richText = page.locator(".s-dash-item-1_0 .s-rich-text");
                await expect(richText).toBeVisible();

                // Click the rich text widget to enter edit mode if in view mode
                if (await richText.evaluate((el) => el.classList.contains("s-rich-text-view"))) {
                    await richText.click();
                }
                await expect(richText).toHaveClass(/s-rich-text-edit/);

                // Append new content to the textarea (preserving existing content)
                const textarea = richText.locator("textarea");
                const currentValue = await textarea.inputValue();
                await textarea.fill(currentValue + "\n## Update");

                // Confirm changes by clicking outside the rich text widget
                await page
                    .locator(".s-screen-size-container")
                    .first()
                    .click({ position: { x: 1, y: 1 } });
                await expect(richText).toHaveClass(/s-rich-text-view/);

                // Verify the updated content rendered
                await expect(richText.locator("h2")).toHaveText("Update");
            },
        );

        test(
            "should remove rich text widget in edit mode",
            { tag: ["@pre-merge-isolated"] },
            async ({ page }) => {
                await enterEditMode(page);

                const richText = page.locator(".s-dash-item-1_0 .s-rich-text");
                await expect(richText).toBeVisible();

                // Click the rich text widget to select it
                await richText.click();

                // Click the delete button
                await page.locator(".s-delete-insight-item").click();

                // Assert the rich text widget is removed
                await expect(richText).toBeHidden();
            },
        );
    });

    test.describe("integrated", () => {
        test(
            "should remove rich text widget and save it",
            { tag: ["@pre-merge-integrated"] },
            async ({ page }) => {
                await visit(page, "dashboard/rich-text");
                await enterEditMode(page);

                // Remove the rich text widget
                const richText = page.locator(`${widgetSelector(1, 0)} .s-rich-text`);
                await richText.scrollIntoViewIfNeeded();
                await richText.click();
                await page.locator(".s-delete-insight-item").click();
                await expect(richText).toBeHidden();

                // Save as new dashboard
                await toggleDashboardMenu(page);
                await saveAsNew(page, "RichText With Removed Widget");

                // Assert rich text widget is gone after save
                await expect(richText).toBeHidden();
            },
        );

        test(
            "should add rich text widget and save it",
            { tag: ["@pre-merge-integrated"] },
            async ({ page }) => {
                await visit(page, "dashboard/rich-text");
                await enterEditMode(page);

                // Drag the rich text widget from the catalog to row 0
                await page.evaluate(
                    async ({ src, tgt }) => {
                        const sourceChild = document.querySelector(src);
                        const source = sourceChild?.parentElement;
                        if (!source) throw new Error(`DnD source parent not found: ${src}`);
                        const dt = new DataTransfer();
                        source.dispatchEvent(new DragEvent("dragstart", { dataTransfer: dt, bubbles: true }));
                        await new Promise((resolve) => setTimeout(resolve, 300));
                        const target = document.querySelector(tgt);
                        if (!target) throw new Error(`DnD target not found: ${tgt}`);
                        target.dispatchEvent(new DragEvent("drop", { dataTransfer: dt, bubbles: true }));
                        source.dispatchEvent(new DragEvent("dragend", { dataTransfer: dt, bubbles: true }));
                    },
                    {
                        src: ".s-add-rich-text",
                        tgt: ".gd-grid-layout__section:nth-child(1) .row-hotspot",
                    },
                );

                // Assert the newly added rich text widget is visible
                const addedRichText = page.locator(`${widgetSelector(0, 0)} .s-rich-text`);
                await expect(addedRichText).toBeVisible();

                // Enter rich text edit mode if in view mode
                if (await addedRichText.evaluate((el) => el.classList.contains("s-rich-text-view"))) {
                    await addedRichText.click();
                }
                await expect(addedRichText).toHaveClass(/s-rich-text-edit/);

                // Fill the textarea with markdown content
                const textarea = addedRichText.locator("textarea");
                await textarea.fill("# Title 2\n\n![Image2](/image2.png)");

                // Confirm changes by clicking outside the rich text widget
                await page.locator(".s-screen-size-container").first().click();
                await expect(addedRichText).toHaveClass(/s-rich-text-view/);

                // Save as new dashboard
                await toggleDashboardMenu(page);
                await saveAsNew(page, "RichText With Added Widget");

                // Assert the rendered content
                await expect(addedRichText.locator("img")).toHaveAttribute("src", "/image2.png");
                await expect(addedRichText.locator("h1")).toHaveText("Title 2");
            },
        );
    });
});
