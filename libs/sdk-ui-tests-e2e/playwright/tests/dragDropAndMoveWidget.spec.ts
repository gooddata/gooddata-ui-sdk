// (C) 2023-2026 GoodData Corporation

import { expect, test } from "@playwright/test";

import { injectAuthHeader } from "@gooddata/e2e-utils";

import { API_TOKEN, describe } from "../config";
import {
    addInsightAboveRow,
    addInsightAtWidget,
    addInsightLast,
    assertInEditMode,
    assertMenuHasOption,
    assertWidgetWidth,
    cancelDrag,
    dragInsightAboveRow,
    dragInsightAtWidget,
    enterEditMode,
    mockFeatureHub,
    resizeWidgetWidthTo,
    saveAsNew,
    saveDashboard,
    toggleDashboardMenu,
    visit,
    waitChartLoaded,
    waitForCatalogReload,
    waitItemLoaded,
    widgetSelector,
} from "../helpers.js";

test.beforeEach(async ({ page }) => {
    await injectAuthHeader(page, API_TOKEN);
    await mockFeatureHub(page);
});

describe("Drag Drop and Move Widget", "dragDropAndMoveWidget", () => {
    test.describe("Insight on dashboard", () => {
        test(
            "can add 3 widgets into the same row to create a new section",
            { tag: ["@pre-merge-integrated"] },
            async ({ page }) => {
                await visit(page, "dashboard/drag-drop-widgets");
                await assertInEditMode(page);
                await waitForCatalogReload(page);

                // Save as new to avoid mutating the original dashboard
                await toggleDashboardMenu(page);
                await assertMenuHasOption(page, "Save as new");
                await saveAsNew(page, "save after drag drop widgets");
                await enterEditMode(page);

                // Drag ComboChart above row 0 to create a new section
                await addInsightAboveRow(page, "ComboChart", 0);
                await expect(page.locator(".gd-grid-layout__section")).toHaveCount(4);

                const widget0 = page.locator(widgetSelector(0, 0));
                await waitChartLoaded(page, widgetSelector(0, 0));
                await expect(widget0.locator(".s-headline")).toHaveText("Combo chart");

                // Add table before widget 0 in the same row
                await addInsightAtWidget(page, "TableWithHyperlinkAttribute", 0, "prev");
                const row0 = page.locator(".gd-grid-layout__section:nth-child(1)");
                await expect(row0.locator(".s-dash-item")).toHaveCount(2);

                // Wait for widget 1 chart, then add Headline before it
                await waitChartLoaded(page, widgetSelector(0, 1));
                await addInsightAtWidget(page, "Headline", 1, "prev");
                await expect(row0.locator(".s-dash-item")).toHaveCount(3);

                // Verify the newly added Headline widget
                const widget1 = page.locator(widgetSelector(0, 1));
                await expect(widget1.locator(".s-headline")).toHaveText("Headline");
                await expect(widget1).toHaveClass(/is-selected/);

                // Save and verify final state
                await saveDashboard(page);
                await expect(page.locator(".gd-grid-layout__section")).toHaveCount(4);
                await expect(row0.locator(".s-dash-item")).toHaveCount(3);
            },
        );

        test("shows placeholder text during drag", { tag: ["@pre-merge-isolated"] }, async ({ page }) => {
            await visit(page, "dashboard/drag-drop-widgets");
            await assertInEditMode(page);
            await waitForCatalogReload(page);

            // Drag ComboChart above row 1 — should show placeholder text
            await dragInsightAboveRow(page, "ComboChart", 1);
            await expect(page.locator(".drag-info-placeholder-inner.can-drop")).toContainText(
                "Drop to create a new section",
            );
            await cancelDrag(page);

            // Drag TableWithHyperlinkAttribute before widget 0 — should show drop target border
            await dragInsightAtWidget(page, "TableWithHyperlinkAttribute", 0, "prev");
            await expect(page.locator(".gd-grid-layout-dropzone__drop-target-border").first()).toBeAttached();
            await cancelDrag(page);

            // Drag ComboChart after widget 2 — should show drop target border
            await dragInsightAtWidget(page, "ComboChart", 2, "next");
            await expect(page.locator(".gd-grid-layout-dropzone__drop-target-border").first()).toBeAttached();
            await cancelDrag(page);

            // Drag Headline after widget 0 — should show drop target border
            await dragInsightAtWidget(page, "Headline", 0, "next");
            await expect(page.locator(".gd-grid-layout-dropzone__drop-target-border").first()).toBeAttached();
        });

        test("can remove widgets after drap&drop", { tag: ["@pre-merge-isolated"] }, async ({ page }) => {
            await visit(page, "dashboard/drag-drop-widgets");
            await assertInEditMode(page);
            await waitForCatalogReload(page);

            // Scroll row 2 into view and add ComboChart at the last drop position
            await page.locator(".gd-grid-layout__section:nth-child(3)").scrollIntoViewIfNeeded();
            await addInsightLast(page, "ComboChart");
            await expect(page.locator(".gd-grid-layout__section")).toHaveCount(4);

            // Remove the newly added widget (section 3, index 0)
            const widget = page.locator(widgetSelector(3, 0));
            await widget.scrollIntoViewIfNeeded();
            await widget.click();
            await page.locator(".s-delete-insight-item").click();
            await expect(page.locator(".gd-grid-layout__section")).toHaveCount(3);
        });
    });

    //Cover ticket: RAIL-4715
    test.describe("Be able to resize widgeton dashboard", () => {
        test(
            "should able to resize widget when is placed next to other in one row",
            { tag: ["@pre-merge-integrated"] },
            async ({ page }) => {
                await visit(page, "dashboard/insight");
                await enterEditMode(page);

                // Set date filter to "All time"
                await page.locator(".s-date-filter-button").click();
                await page.locator(".s-all-time").click();
                await page.locator(".s-date-filter-apply").click();

                await waitForCatalogReload(page);

                // Add WithOwnDescription insight before widget 0
                await addInsightAtWidget(page, "WithOwnDescription", 0, "prev");

                // Wait for items to finish loading
                await waitItemLoaded(page);

                // Assert widget 0 has width 4, resize to 2, assert width 2
                await assertWidgetWidth(page, 0, 0, 4);
                await resizeWidgetWidthTo(page, 0, 0, 2);
                await assertWidgetWidth(page, 0, 0, 2);

                // Assert widget 1 has width 6, resize to 12, assert width 10
                await assertWidgetWidth(page, 0, 1, 6);
                await resizeWidgetWidthTo(page, 0, 1, 12);
                await assertWidgetWidth(page, 0, 1, 10);
            },
        );
    });
});
