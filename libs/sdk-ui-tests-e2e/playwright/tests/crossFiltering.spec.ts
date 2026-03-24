// (C) 2023-2026 GoodData Corporation

import { test } from "@playwright/test";

import { injectAuthHeader } from "@gooddata/e2e-utils";

import { API_TOKEN, describe } from "../config.js";
import {
    clickChartSeriesPoint,
    enterEditMode,
    expectAttributeFilterCount,
    expectAttributeFilterLoaded,
    expectAttributeFiltersWithValue,
    expectChartDataLabels,
    expectSeriesPointHasClass,
    expectTableCellValue,
    mockFeatureHub,
    selectCrossFiltering,
    visit,
    waitChartLoaded,
    waitTableLoaded,
    widgetSelector,
} from "../helpers.js";

test.beforeEach(async ({ page }) => {
    await injectAuthHeader(page, API_TOKEN);
    await mockFeatureHub(page);
});

const FIRST_WIDGET = widgetSelector(0, 0);
const SECOND_WIDGET = widgetSelector(0, 1);

describe("Cross filtering", "crossFiltering", () => {
    test(
        "should add virtual filter when cross-filtering in view mode",
        { tag: ["@pre-merge-isolated"] },
        async ({ page }) => {
            await visit(page, "dashboard/dashboard-cross-filtering");

            // Initial state: no attribute filters
            await expectAttributeFilterCount(page, 0);
            await waitChartLoaded(page, FIRST_WIDGET);
            await expectChartDataLabels(page, FIRST_WIDGET, ["$3,843,400.54", "$1,290,997.11"]);
            await waitTableLoaded(page, SECOND_WIDGET);
            await expectTableCellValue(page, SECOND_WIDGET, 0, 1, "770,636,605.83");

            // Click first series point and select cross-filtering
            await clickChartSeriesPoint(page, FIRST_WIDGET, 0);
            await selectCrossFiltering(page);
            await expectAttributeFilterLoaded(page, "Department");

            // New filter added, first widget ignores it, second widget is filtered
            await expectAttributeFiltersWithValue(page, [["Department", "Direct Sales"]]);
            await waitChartLoaded(page, FIRST_WIDGET);
            await expectChartDataLabels(page, FIRST_WIDGET, ["$3,843,400.54", "$1,290,997.11"]);
            await expectSeriesPointHasClass(page, FIRST_WIDGET, "gd-point-highlighted", 0);
            await waitTableLoaded(page, SECOND_WIDGET);
            await expectTableCellValue(page, SECOND_WIDGET, 0, 1, "716,947,106.20");

            // Entering edit mode clears the virtual filter
            await enterEditMode(page);
            await expectAttributeFilterCount(page, 0);
            await waitTableLoaded(page, SECOND_WIDGET);
            await expectTableCellValue(page, SECOND_WIDGET, 0, 1, "770,636,605.83");
        },
    );
});
