// (C) 2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import { type IDashboardExportTabularOptions, NotSupported } from "@gooddata/sdk-backend-spi";
import { type FilterContextItem, idRef } from "@gooddata/sdk-model";

import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";

import { TigerWorkspaceDashboards } from "./index.js";

describe("TigerWorkspaceDashboards.exportDashboardToTabular — absolute date filter with granularity", () => {
    const dashboardRef = idRef("dashboard-1", "analyticalDashboard");
    const granularityDateFilterItem: FilterContextItem = {
        dashboardAbsoluteGranularityDateFilter: {
            dataSet: idRef("date1", "dataSet"),
            granularity: "GDC.time.month",
            from: "2026-01",
            to: "2026-03",
        },
    };

    it.each<[string, IDashboardExportTabularOptions]>([
        ["dashboardFiltersOverride", { dashboardFiltersOverride: [granularityDateFilterItem] }],
        [
            "dashboardTabsFiltersOverrides",
            { dashboardTabsFiltersOverrides: { "tab-A": [], "tab-B": [granularityDateFilterItem] } },
        ],
    ])("rejects the absolute date filter with granularity in %s", async (_desc, options) => {
        const authCall = vi.fn();
        const service = new TigerWorkspaceDashboards(
            authCall as unknown as TigerAuthenticatedCallGuard,
            "ws-1",
        );

        await expect(
            service.exportDashboardToTabular(dashboardRef, { ...options, title: "T" }),
        ).rejects.toThrow(
            new NotSupported(
                "Dashboard tabular exports do not support absolute date filters with granularity yet.",
            ),
        );
        expect(authCall).not.toHaveBeenCalled();
    });
});
