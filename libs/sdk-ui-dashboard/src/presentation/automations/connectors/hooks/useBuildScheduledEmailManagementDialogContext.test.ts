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

vi.mock("../../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: vi.fn((selector: () => unknown) => selector()),
}));

vi.mock("../../../../model/store/config/configSelectors.js", () => ({
    selectEnableAccessibilityMode: () => false,
    selectIsEmbedded: () => false,
}));

vi.mock("../../../../model/store/meta/metaSelectors.js", () => ({
    selectDashboardId: () => "dashboard-id",
    selectDashboardTitle: () => "Dashboard Title",
}));

vi.mock("../../../../model/store/entitlements/entitlementsSelectors.js", () => ({
    selectEntitlementMaxAutomations: () => ({ value: "10" }),
    selectEntitlementUnlimitedAutomations: () => undefined,
}));

vi.mock("../../../../model/store/ui/uiSelectors.js", () => ({
    selectIsScheduleEmailDialogOpen: () => false,
    selectAutomationsInvalidationId: () => 42,
}));

import { useBuildScheduledEmailManagementDialogContext } from "./useBuildScheduledEmailManagementDialogContext.js";

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useBuildScheduledEmailManagementDialogContext", () => {
    it("returns store-derived fields correctly", () => {
        const { result } = renderHook(() =>
            useBuildScheduledEmailManagementDialogContext({ automations: [], isLoading: false }),
        );

        expect(result.current.isScheduleEmailDialogOpen).toBe(false);
        expect(result.current.automationsInvalidationId).toBe(42);
        expect(result.current.isEmbedded).toBe(false);
        expect(result.current.enableAccessibilityMode).toBe(false);
        expect(result.current.dashboardId).toBe("dashboard-id");
        expect(result.current.dashboardTitle).toBe("Dashboard Title");
        expect(result.current.maxAutomations).toBe(10);
        expect(result.current.unlimitedAutomations).toBe(false);
    });

    it("passes the automation list and loading flag through to the context", () => {
        const automations = [{ id: "schedule-1", title: "Weekly" } as IAutomationMetadataObject];

        const { result } = renderHook(() =>
            useBuildScheduledEmailManagementDialogContext({ automations, isLoading: true }),
        );

        expect(result.current.automations).toBe(automations);
        expect(result.current.isLoading).toBe(true);
    });
});
