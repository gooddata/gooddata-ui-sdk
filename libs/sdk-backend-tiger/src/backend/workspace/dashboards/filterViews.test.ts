// (C) 2026 GoodData Corporation

import { type AxiosResponse } from "axios";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { FilterViewsApi_GetAllEntitiesFilterViews } from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import { ProfileApi_GetCurrent } from "@gooddata/api-client-tiger/endpoints/profile";
import { NotSupported } from "@gooddata/sdk-backend-spi";
import { idRef } from "@gooddata/sdk-model";

import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";

import { type TigerWorkspaceDashboards } from "./index.js";

vi.mock("@gooddata/api-client-tiger/endpoints/entitiesObjects", async (importOriginal) => ({
    ...(await importOriginal<object>()),
    FilterViewsApi_GetAllEntitiesFilterViews: vi.fn(),
}));

vi.mock("@gooddata/api-client-tiger/endpoints/profile", () => ({
    ProfileApi_GetCurrent: vi.fn(),
}));

function filterView(id: string, filters: unknown[]) {
    return {
        id,
        type: "filterView",
        attributes: {
            title: id,
            content: { version: "2", filters },
        },
        relationships: {
            analyticalDashboard: { data: { id: "dashboard-1", type: "analyticalDashboard" } },
            user: { data: { id: "user-1", type: "user" } },
        },
    };
}

const granularityDateFilter = (body: Record<string, unknown>) => ({
    dashboardAbsoluteGranularityDateFilter: { granularity: "GDC.time.month", ...body },
});

describe("TigerWorkspaceDashboards.getFilterViewsForCurrentUser", () => {
    const mockAuthCall = vi.fn((callback) =>
        callback({ axios: {}, basePath: "" }),
    ) as unknown as TigerAuthenticatedCallGuard;
    let service: TigerWorkspaceDashboards;

    // The service is imported dynamically from a fresh module registry so that it picks up the mocks
    // above even when another (non-isolated) test file already imported it without them.
    beforeAll(async () => {
        vi.resetModules();
        const { TigerWorkspaceDashboards } = await import("./index.js");
        service = new TigerWorkspaceDashboards(mockAuthCall, "ws-1");
    });

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(ProfileApi_GetCurrent).mockResolvedValue({ userId: "user-1" } as never);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    function mockFilterViews(data: unknown[]) {
        vi.mocked(FilterViewsApi_GetAllEntitiesFilterViews).mockResolvedValue({
            data: { data, included: [] },
        } as unknown as AxiosResponse);
    }

    it("skips a filter view with an invalid absolute date filter with granularity and returns the others", async () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        mockFilterViews([
            filterView("valid", [granularityDateFilter({ from: "2026-01", to: "2026-03" })]),
            filterView("invalid", [granularityDateFilter({ from: "2026-03", to: "2026-01" })]),
        ]);

        const views = await service.getFilterViewsForCurrentUser(idRef("dashboard-1", "analyticalDashboard"));

        expect(views.map((view) => view.name)).toEqual(["valid"]);
        expect(warn).toHaveBeenCalledOnce();
        expect(warn).toHaveBeenCalledWith(
            "Filter view cannot be loaded, skipping it:",
            "invalid",
            expect.any(NotSupported),
        );
    });
});
