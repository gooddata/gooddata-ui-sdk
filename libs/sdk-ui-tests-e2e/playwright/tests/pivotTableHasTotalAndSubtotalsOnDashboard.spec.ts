// (C) 2023-2026 GoodData Corporation

import { test } from "@playwright/test";

import { injectAuthHeader } from "@gooddata/e2e-utils";

import { API_TOKEN, describe } from "../config";
import { expectTableCellValue, mockFeatureHub, scrollTableTo, visit, waitTableLoaded } from "../helpers.js";

test.beforeEach(async ({ page }) => {
    await injectAuthHeader(page, API_TOKEN);
    await mockFeatureHub(page);
});

const WIDGET = ".s-dash-item-1_0";

describe("Pivot Table with multi format metrics", "pivotTableHasTotalAndSubtotalsOnDashboard", () => {
    test(
        "should render insight with multi format metrics correctly",
        {
            tag: ["@pre-merge-integrated"],
        },
        async ({ page }) => {
            await visit(page, "dashboard/dashboard-pivot-table-scenario");
            await waitTableLoaded(page, WIDGET);

            await expectTableCellValue(page, WIDGET, 6, 1, "Closed Won");
            await expectTableCellValue(page, WIDGET, 6, 2, "██████████");
            await expectTableCellValue(page, WIDGET, 6, 3, "406");
            await expectTableCellValue(page, WIDGET, 7, 3, "–");
            await expectTableCellValue(page, WIDGET, 6, 4, "▼ 423,451,258.0%");
            await expectTableCellValue(page, WIDGET, 6, 5, "$406.00");
            await expectTableCellValue(
                page,
                WIDGET,
                6,
                7,
                "100.0% long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long",
            );
            await scrollTableTo(page, WIDGET, "center");
        },
    );
});
