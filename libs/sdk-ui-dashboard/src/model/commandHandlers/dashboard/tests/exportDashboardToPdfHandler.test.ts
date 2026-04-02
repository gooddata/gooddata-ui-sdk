// (C) 2021-2026 GoodData Corporation

import { beforeEach, describe, expect, it, vi } from "vitest";

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { DecoratedWorkspaceDashboardsService, decoratedBackend } from "@gooddata/sdk-backend-base";
import { recordedBackend } from "@gooddata/sdk-backend-mockingbird";
import {
    type FiltersByTab,
    type IDashboardExportPdfOptions,
    type IDashboardExportPresentationOptions,
    type IExportResult,
    type IWorkspaceDashboardsService,
} from "@gooddata/sdk-backend-spi";
import { type FilterContextItem, type ObjRef, idRef } from "@gooddata/sdk-model";

import {
    exportDashboardToPdf,
    exportDashboardToPdfPresentation,
    exportDashboardToPptPresentation,
    initializeDashboard,
} from "../../../commands/dashboard.js";
import { type IDashboardExportToPdfResolved } from "../../../events/dashboard.js";
import { HeadlessDashboard } from "../../../headlessDashboard/HeadlessDashboard.js";
import { type DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester.js";
import { SimpleDashboardIdentifier } from "../../../tests/fixtures/SimpleDashboard.fixtures.js";
import { type DashboardContext } from "../../../types/commonTypes.js";

class TestHeadlessDashboard extends HeadlessDashboard {
    public resetMonitors(): void {
        this.monitoredActions = {};
        this.capturedActions = [];
        this.capturedEvents = [];
    }
}

class SpyDashboardsService extends DecoratedWorkspaceDashboardsService {
    constructor(
        dashboards: IWorkspaceDashboardsService,
        workspace: string,
        private readonly exportDashboardToPdfSpy: (
            ref: ObjRef,
            filters?: FilterContextItem[],
            filtersByTab?: FiltersByTab,
            options?: IDashboardExportPdfOptions,
        ) => Promise<IExportResult>,
        private readonly exportDashboardToPresentationSpy: (
            ref: ObjRef,
            format: "PDF" | "PPTX",
            filters?: FilterContextItem[],
            filtersByTab?: FiltersByTab,
            options?: IDashboardExportPresentationOptions,
        ) => Promise<IExportResult>,
    ) {
        super(dashboards, workspace);
    }

    public override exportDashboardToPdf(
        ref: ObjRef,
        filters?: FilterContextItem[],
        filtersByTab?: FiltersByTab,
        options?: IDashboardExportPdfOptions,
    ): Promise<IExportResult> {
        return this.exportDashboardToPdfSpy(ref, filters, filtersByTab, options);
    }

    public override exportDashboardToPresentation(
        ref: ObjRef,
        format: "PDF" | "PPTX",
        filters?: FilterContextItem[],
        filtersByTab?: FiltersByTab,
        options?: IDashboardExportPresentationOptions,
    ): Promise<IExportResult> {
        return this.exportDashboardToPresentationSpy(ref, format, filters, filtersByTab, options);
    }
}

async function createSpyDashboard() {
    const exportResult: IExportResult = {
        uri: "https://example.com/export.pdf",
        objectUrl: "blob:https://example.com/test-export",
        fileName: "export.pdf",
    };

    const exportDashboardToPdfSpy = vi.fn().mockResolvedValue(exportResult);
    const exportDashboardToPresentationSpy = vi.fn().mockResolvedValue(exportResult);

    const backend = decoratedBackend(recordedBackend(ReferenceRecordings.Recordings), {
        dashboards: (dashboards, workspace) => {
            return new SpyDashboardsService(
                dashboards,
                workspace,
                exportDashboardToPdfSpy,
                exportDashboardToPresentationSpy,
            );
        },
    }).onHostname("https://example.com");

    const ctx: DashboardContext = {
        backend,
        workspace: "reference-workspace",
        dashboardRef: idRef(SimpleDashboardIdentifier),
    };

    const dashboard = new TestHeadlessDashboard(ctx);
    dashboard.dispatch(initializeDashboard());
    await dashboard.waitFor("GDC.DASH/EVT.INITIALIZED");
    dashboard.resetMonitors();

    return {
        dashboard,
        exportDashboardToPdfSpy,
        exportDashboardToPresentationSpy,
    };
}

describe("export dashboard to PDF handler", () => {
    let Tester: DashboardTester;

    beforeEach(async () => {
        await preloadedTesterFactory((tester) => {
            Tester = tester;
        }, SimpleDashboardIdentifier);
    });

    it("should emit event when dashboard successfully exported", async () => {
        Tester.dispatch(exportDashboardToPdf());
        const event: IDashboardExportToPdfResolved = await Tester.waitFor("GDC.DASH/EVT.EXPORT.PDF.RESOLVED");

        expect(event.payload.resultUri).toBeDefined();
    });

    it("should emit events in correct order and carry-over correlationId", async () => {
        Tester.dispatch(exportDashboardToPdf("correlation-id"));
        await Tester.waitFor("GDC.DASH/EVT.EXPORT.PDF.RESOLVED");

        expect(Tester.emittedEventsDigest()).toMatchSnapshot();
    });

    it("should pass exportMetadata from PDF command payload to backend export", async () => {
        const { dashboard, exportDashboardToPdfSpy } = await createSpyDashboard();

        dashboard.dispatch(
            exportDashboardToPdf({
                exportMetadata: {
                    selectedTab: "switcher-tab-1",
                },
            }),
        );
        await dashboard.waitFor("GDC.DASH/EVT.EXPORT.PDF.RESOLVED");

        expect(exportDashboardToPdfSpy).toHaveBeenCalledOnce();
        expect(exportDashboardToPdfSpy.mock.calls[0]?.[3]).toEqual(
            expect.objectContaining({
                exportMetadata: {
                    selectedTab: "switcher-tab-1",
                },
            }),
        );
    });

    it.each([
        [exportDashboardToPdfPresentation, "GDC.DASH/EVT.EXPORT.PDF_PRESENTATION.RESOLVED", "PDF"] as const,
        [exportDashboardToPptPresentation, "GDC.DASH/EVT.EXPORT.PPT_PRESENTATION.RESOLVED", "PPTX"] as const,
    ])(
        "should pass exportMetadata to %s backend export",
        async (commandFactory, resolvedEventType, format) => {
            const { dashboard, exportDashboardToPresentationSpy } = await createSpyDashboard();

            dashboard.dispatch(
                commandFactory({
                    exportMetadata: {
                        selectedTab: "switcher-tab-1",
                    },
                }),
            );
            await dashboard.waitFor(resolvedEventType);

            expect(exportDashboardToPresentationSpy).toHaveBeenCalledOnce();
            expect(exportDashboardToPresentationSpy.mock.calls[0]?.[1]).toBe(format);
            expect(exportDashboardToPresentationSpy.mock.calls[0]?.[4]).toEqual(
                expect.objectContaining({
                    exportMetadata: {
                        selectedTab: "switcher-tab-1",
                    },
                }),
            );
        },
    );
});
