// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

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
        const { result } = renderHook(() => useBuildScheduledEmailManagementDialogContext());

        expect(result.current.isScheduleEmailDialogOpen).toBe(false);
        expect(result.current.automationsInvalidationId).toBe(42);
        expect(result.current.isEmbedded).toBe(false);
        expect(result.current.enableAccessibilityMode).toBe(false);
        expect(result.current.dashboardId).toBe("dashboard-id");
        expect(result.current.dashboardTitle).toBe("Dashboard Title");
        expect(result.current.maxAutomations).toBe(10);
        expect(result.current.unlimitedAutomations).toBe(false);
    });
});
