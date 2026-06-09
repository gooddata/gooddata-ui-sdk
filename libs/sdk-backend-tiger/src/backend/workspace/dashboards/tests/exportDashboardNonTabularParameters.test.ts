// (C) 2026 GoodData Corporation

import { type AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as entitiesObjects from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import * as exportApi from "@gooddata/api-client-tiger/endpoints/export";
import { idRef } from "@gooddata/sdk-model";

import { type IExportMetadata, type TigerAuthenticatedCallGuard } from "../../../../types/index.js";
import * as exportPolling from "../../../../utils/exportPolling.js";
import { TigerWorkspaceDashboards } from "../index.js";

vi.mock("@gooddata/api-client-tiger/endpoints/entitiesObjects", () => ({
    DashboardsApi_GetEntityAnalyticalDashboards: vi.fn(),
}));

vi.mock("@gooddata/api-client-tiger/endpoints/export", () => ({
    ExportApi_CreateImageExport: vi.fn(),
    ExportApi_CreatePdfExport: vi.fn(),
    ExportApi_CreateSlidesExport: vi.fn(),
}));

vi.mock("../../../../utils/exportPolling.js", () => ({
    handleExportResultPolling: vi.fn(),
}));

const EXPORT_RESPONSE = { data: { exportResult: "export-id" } } as unknown as AxiosResponse;

const DASHBOARD_DOC = {
    data: {
        data: {
            id: "dashboard-1",
            type: "analyticalDashboard",
            attributes: { title: "Dashboard", content: { version: "2" } },
        },
        links: { self: "https://example.com/dashboard-1" },
    },
} as unknown as AxiosResponse;

const PARAMS = [{ id: "topN", value: "25", title: "Top N" }];

describe("TigerWorkspaceDashboards — non-tabular export parameter overrides", () => {
    const dashboardRef = idRef("dashboard-1", "analyticalDashboard");
    const mockAuthCall = vi.fn((callback) =>
        callback({ axios: {}, basePath: "" }),
    ) as unknown as TigerAuthenticatedCallGuard;
    const service = new TigerWorkspaceDashboards(mockAuthCall, "ws-1");

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(entitiesObjects.DashboardsApi_GetEntityAnalyticalDashboards).mockResolvedValue(
            DASHBOARD_DOC,
        );
        vi.mocked(exportApi.ExportApi_CreatePdfExport).mockResolvedValue(EXPORT_RESPONSE);
        vi.mocked(exportApi.ExportApi_CreateSlidesExport).mockResolvedValue(EXPORT_RESPONSE);
        vi.mocked(exportApi.ExportApi_CreateImageExport).mockResolvedValue(EXPORT_RESPONSE);
        vi.mocked(exportPolling.handleExportResultPolling).mockResolvedValue({
            uri: "result-uri",
            objectUrl: "blob:result",
        });
    });

    describe("exportDashboardToPdf (dashboard-scoped → parametersByTab)", () => {
        async function callPdf(options?: Parameters<TigerWorkspaceDashboards["exportDashboardToPdf"]>[3]) {
            await service.exportDashboardToPdf(dashboardRef, [], {}, options);
            const req = vi.mocked(exportApi.ExportApi_CreatePdfExport).mock.calls[0][2]
                .exportVisualExportRequest;
            return req.metadata as IExportMetadata;
        }

        it("emits metadata.parametersByTab when non-empty", async () => {
            const metadata = await callPdf({ parametersByTab: { "tab-A": PARAMS } });
            expect(metadata.parametersByTab).toEqual({ "tab-A": PARAMS });
        });

        it("omits parametersByTab when the map is empty", async () => {
            const metadata = await callPdf({ parametersByTab: {} });
            expect(metadata).not.toHaveProperty("parametersByTab");
        });

        it("omits parametersByTab when undefined", async () => {
            const metadata = await callPdf({});
            expect(metadata).not.toHaveProperty("parametersByTab");
        });
    });

    describe("exportDashboardToPresentation", () => {
        async function callSlides(
            options?: Parameters<TigerWorkspaceDashboards["exportDashboardToPresentation"]>[4],
        ) {
            await service.exportDashboardToPresentation(dashboardRef, "PPTX", [], {}, options);
            const req = vi.mocked(exportApi.ExportApi_CreateSlidesExport).mock.calls[0][2]
                .exportSlidesExportRequest;
            return req.metadata as IExportMetadata;
        }

        it("emits metadata.parametersByTab (whole-dashboard and widget slides share one channel)", async () => {
            const metadata = await callSlides({ parametersByTab: { "tab-A": PARAMS } });
            expect(metadata.parametersByTab).toEqual({ "tab-A": PARAMS });
        });

        it("omits parametersByTab when empty", async () => {
            const metadata = await callSlides({ parametersByTab: {} });
            expect(metadata).not.toHaveProperty("parametersByTab");
        });
    });

    describe("exportDashboardToImage (widget-scoped → parametersByTab)", () => {
        async function callImage(
            options?: Parameters<TigerWorkspaceDashboards["exportDashboardToImage"]>[3],
        ) {
            await service.exportDashboardToImage(dashboardRef, [], {}, options);
            const req = vi.mocked(exportApi.ExportApi_CreateImageExport).mock.calls[0][2]
                .exportImageExportRequest;
            return req.metadata as IExportMetadata;
        }

        it("emits metadata.parametersByTab when non-empty", async () => {
            const metadata = await callImage({ parametersByTab: { "tab-A": PARAMS } });
            expect(metadata.parametersByTab).toEqual({ "tab-A": PARAMS });
        });

        it("omits parametersByTab when empty", async () => {
            const metadata = await callImage({ parametersByTab: {} });
            expect(metadata).not.toHaveProperty("parametersByTab");
        });
    });
});
