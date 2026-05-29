// (C) 2026 GoodData Corporation

import { type AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as exportApi from "@gooddata/api-client-tiger/endpoints/export";
import { idRef } from "@gooddata/sdk-model";

import { type TigerAuthenticatedCallGuard } from "../../../../types/index.js";
import * as exportPolling from "../../../../utils/exportPolling.js";
import { TigerWorkspaceDashboards } from "../index.js";

vi.mock("@gooddata/api-client-tiger/endpoints/export", () => ({
    ExportApi_CreateDashboardExportRequest: vi.fn(),
    ExportApi_CreateImageExport: vi.fn(),
    ExportApi_CreatePdfExport: vi.fn(),
    ExportApi_CreateRawExport: vi.fn(),
    ExportApi_CreateSlidesExport: vi.fn(),
    ExportApi_GetMetadata: vi.fn(),
    ExportApi_GetSlidesExportMetadata: vi.fn(),
}));

vi.mock("../../../../utils/exportPolling.js", () => ({
    handleExportResultPolling: vi.fn(),
}));

const FAKE_AXIOS_RESPONSE = {
    data: { exportResult: "export-id" },
} as unknown as AxiosResponse;

describe("TigerWorkspaceDashboards.exportDashboardToTabular — dashboardTabsParametersOverrides", () => {
    const dashboardRef = idRef("dashboard-1", "analyticalDashboard");
    const mockAuthCall = vi.fn((callback) =>
        callback({ axios: {}, basePath: "" }),
    ) as unknown as TigerAuthenticatedCallGuard;
    const service = new TigerWorkspaceDashboards(mockAuthCall, "ws-1");

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(exportApi.ExportApi_CreateDashboardExportRequest).mockResolvedValue(FAKE_AXIOS_RESPONSE);
        vi.mocked(exportPolling.handleExportResultPolling).mockResolvedValue({
            uri: "result-uri",
            objectUrl: "blob:result",
        });
    });

    async function callExport(options?: Parameters<TigerWorkspaceDashboards["exportDashboardToTabular"]>[1]) {
        await service.exportDashboardToTabular(dashboardRef, { ...options, title: "T" });
        return vi.mocked(exportApi.ExportApi_CreateDashboardExportRequest).mock.calls[0][2]
            .exportDashboardTabularExportRequest;
    }

    it("forwards dashboardTabsParametersOverrides on the request body when non-empty", async () => {
        const overrides = {
            "tab-A": [{ id: "topN", value: "25", title: "Top N" }],
        };
        const req = await callExport({ dashboardTabsParametersOverrides: overrides });
        expect(req.dashboardTabsParametersOverrides).toEqual(overrides);
    });

    it("omits dashboardTabsParametersOverrides when undefined", async () => {
        const req = await callExport({});
        expect(req).not.toHaveProperty("dashboardTabsParametersOverrides");
    });

    it("omits dashboardTabsParametersOverrides when the map is empty", async () => {
        const req = await callExport({ dashboardTabsParametersOverrides: {} });
        expect(req).not.toHaveProperty("dashboardTabsParametersOverrides");
    });
});
