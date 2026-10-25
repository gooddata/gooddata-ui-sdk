// (C) 2020-2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import {
    dashboardItemSelector,
    saveReportFromKDDialogSelector,
} from "./save_report_from_kd_dialog_selector.js";

describe("save_report_from_kd_dialog_selector", () => {
    it("should the dashboardItemSelector return the correct value", () => {
        const analyticalDashboardUriFactory = vi.fn();
        const result = dashboardItemSelector.resultFunc(
            "sourceDashboardId",
            true,
            analyticalDashboardUriFactory,
        );
        expect(result).toEqual({
            sourceDashboardId: "sourceDashboardId",
            isAllowLinkToDashboard: true,
            analyticalDashboardUriFactory,
        });

        const resultNotAllowLink = dashboardItemSelector.resultFunc(
            "sourceDashboardId",
            false,
            analyticalDashboardUriFactory,
        );
        expect(resultNotAllowLink).toEqual({
            sourceDashboardId: "sourceDashboardId",
            isAllowLinkToDashboard: false,
            analyticalDashboardUriFactory,
        });
    });

    it("should allow creating a copy only with the right to create visualizations", () => {
        const [withCreate, withoutCreate] = [true, false].map(
            (canCreate) =>
                saveReportFromKDDialogSelector.resultFunc(undefined, true, "title", false, false, canCreate)
                    .canCreateCopy,
        );
        expect(withCreate).toBe(true);
        expect(withoutCreate).toBe(false);
    });
});
