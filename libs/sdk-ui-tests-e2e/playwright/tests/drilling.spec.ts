// (C) 2021-2026 GoodData Corporation

import { test } from "@playwright/test";

import { injectAuthHeader } from "@gooddata/e2e-utils";

import { API_TOKEN, describe } from "../config.js";
import {
    addInteraction,
    assertCustomUrlDialogHasItem,
    assertHasInteractionItems,
    assertInsightNameIsBolder,
    assertWarningMessage,
    chooseDrillAction,
    clickWarningShowMore,
    closeCustomURLDialog,
    closeWidgetConfiguration,
    enterEditMode,
    focusWidget,
    mockFeatureHub,
    openCustomUrlEditor,
    openInteractions,
    removeDrillConfigItem,
    removeWidgetFromDashboard,
    saveDashboard,
    setWidgetTitle,
    visit,
    visitCopyOf,
    waitChartLoaded,
    widgetSelector,
} from "../helpers.js";

test.beforeEach(async ({ page }) => {
    await injectAuthHeader(page, API_TOKEN);
    await mockFeatureHub(page);
});

describe("Interaction", "drilling", () => {
    //Cover ticket: RAIL-4559
    test(
        "Should able to remove existing interactions",
        { tag: ["@pre-merge-integrated"] },
        async ({ page }) => {
            await visitCopyOf(page, "dashboard/drill-to-insight");
            await enterEditMode(page);
            await waitChartLoaded(page, widgetSelector(0, 0));
            await focusWidget(page, 0, 0);
            await openInteractions(page);
            await removeDrillConfigItem(page, "Created - Year");
            await removeDrillConfigItem(page, "Sum of Velocity");
            await closeWidgetConfiguration(page);
            await saveDashboard(page);
            await enterEditMode(page);
            await waitChartLoaded(page, widgetSelector(0, 0));
            await focusWidget(page, 0, 0);
            await openInteractions(page);
            await assertHasInteractionItems(page, false);
        },
    );

    //Cover ticket: RAIL-4717
    test(
        "Should correctly display attribute list in custom URL dialog",
        { tag: ["@pre-merge-integrated"] },
        async ({ page }) => {
            await visit(page, "dashboard/drill-to-insight");
            await enterEditMode(page);
            await waitChartLoaded(page, widgetSelector(0, 0));
            await focusWidget(page, 0, 0);
            await openInteractions(page);

            await removeDrillConfigItem(page, "Created - Year");
            await removeDrillConfigItem(page, "Sum of Velocity");

            await addInteraction(page, "Sum of Probability", "measure");
            await chooseDrillAction(page, "Sum of Probability", "Drill into URL");
            await openCustomUrlEditor(page, "Sum of Probability");
            await assertCustomUrlDialogHasItem(page, "Created");
            await closeCustomURLDialog(page);
            await closeWidgetConfiguration(page);

            // Second widget (section 1, index 0)
            const widget2 = widgetSelector(1, 0);
            await page.locator(widget2).scrollIntoViewIfNeeded();
            await waitChartLoaded(page, widget2);
            await focusWidget(page, 1, 0);
            await openInteractions(page);
            await addInteraction(page, "Sum of Amount", "measure");
            await chooseDrillAction(page, "Sum of Amount", "Drill into URL");
            await openCustomUrlEditor(page, "Sum of Amount");
            await assertCustomUrlDialogHasItem(page, "Stage Name");
        },
    );

    //Cover ticket: RAIL-4716
    test(
        "should display correct insight name on invalid interaction warning",
        { tag: ["@pre-merge-integrated"] },
        async ({ page }) => {
            const widget1 = widgetSelector(1, 0);

            await visit(page, "dashboard/dashboard-many-rows-columns");
            await enterEditMode(page);

            await assertWarningMessage(page, true);
            await clickWarningShowMore(page);
            await assertInsightNameIsBolder(page, "Insight has invalid interaction");

            await waitChartLoaded(page, widget1);
            await page.locator(widget1).scrollIntoViewIfNeeded();
            await focusWidget(page, 1, 0);
            await setWidgetTitle(page, widget1, "Visualization has invalid interaction rename");

            await assertWarningMessage(page, true);
            await clickWarningShowMore(page);
            await assertInsightNameIsBolder(page, "Visualization has invalid interaction rename");

            await waitChartLoaded(page, widget1);
            await page.locator(widget1).scrollIntoViewIfNeeded();
            await focusWidget(page, 1, 0);
            await removeWidgetFromDashboard(page);

            await assertWarningMessage(page, false);
        },
    );
});
