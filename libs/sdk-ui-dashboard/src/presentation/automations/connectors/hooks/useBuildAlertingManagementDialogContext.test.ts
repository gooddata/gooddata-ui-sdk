// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { IAutomationMetadataObject } from "@gooddata/sdk-model";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// `isolate: false` shares one module graph per worker, so the modules mocked below may already have
// been evaluated — against their real dependencies — by a test file that ran earlier in the same
// worker, which turns those `vi.mock()` calls into no-ops. Dropping the module registry from
// `vi.hoisted()` (it runs before this file's own imports, unlike any `beforeEach`) makes those
// imports resolve through the mocks.
vi.hoisted(() => {
    vi.resetModules();
});

const AUTOMATIONS_FIXTURE = [{ id: "alert-1", title: "Alert 1" } as IAutomationMetadataObject];

vi.mock("../../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: vi.fn((selector: () => unknown) => selector()),
}));

vi.mock("../../../../model/react/useDashboardCommandProcessing.js", () => ({
    useDashboardCommandProcessing: vi.fn(() => ({ run: vi.fn() })),
}));

vi.mock("../../../../model/store/automations/automationsSelectors.js", () => ({
    selectDashboardUserAutomationAlertsInContext: (widgetLocalIdentifier: string | undefined) => () =>
        widgetLocalIdentifier === undefined ? AUTOMATIONS_FIXTURE : [],
    selectAutomationsIsLoading: () => true,
}));

vi.mock("../../../../model/store/config/configSelectors.js", () => ({
    selectEnableAccessibilityMode: () => false,
    selectIsEmbedded: () => false,
}));

vi.mock("../../../../model/store/insights/insightsSelectors.js", () => ({
    selectInsightsMap: () => ({ get: () => undefined }),
}));

vi.mock("../../../../model/store/meta/metaSelectors.js", () => ({
    selectDashboardId: () => "dashboard-id",
    selectDashboardTitle: () => "Dashboard Title",
}));

vi.mock("../../../../model/store/permissions/permissionsSelectors.js", () => ({
    selectCanManageWorkspace: () => true,
}));

vi.mock("../../../../model/store/tabs/layout/layoutSelectors.js", () => ({
    selectWidgetsMap: () => ({ get: () => undefined }),
}));

vi.mock("../../../../model/store/ui/uiSelectors.js", () => ({
    selectIsAlertingDialogOpen: () => false,
    selectAlertingDialogReturnFocusTo: () => undefined,
    selectIsAlertingManagementDialogContext: () => ({}),
    selectAutomationsInvalidationId: () => 42,
}));

vi.mock("../../../../model/store/user/userSelectors.js", () => ({
    selectCurrentUser: () => undefined,
}));

import { useBuildAlertingManagementDialogContext } from "./useBuildAlertingManagementDialogContext.js";

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useBuildAlertingManagementDialogContext", () => {
    it("exposes the in-context alert list and the automations loading flag", () => {
        const { result } = renderHook(() => useBuildAlertingManagementDialogContext());

        expect(result.current.automations).toBe(AUTOMATIONS_FIXTURE);
        expect(result.current.isLoading).toBe(true);
    });

    it("returns store-derived fields correctly", () => {
        const { result } = renderHook(() => useBuildAlertingManagementDialogContext());

        expect(result.current.dashboardId).toBe("dashboard-id");
        expect(result.current.dashboardTitle).toBe("Dashboard Title");
        expect(result.current.canManageWorkspace).toBe(true);
        expect(result.current.isAlertDialogOpen).toBe(false);
        expect(result.current.automationsInvalidationId).toBe(42);
    });
});
