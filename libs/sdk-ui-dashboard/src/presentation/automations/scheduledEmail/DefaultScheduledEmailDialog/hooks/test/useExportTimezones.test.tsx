// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { BROWSER_DETECTED, type IDashboardTimezoneConfig } from "@gooddata/sdk-model";

// `isolate: false` shares one module graph per worker, so the modules mocked below may already have
// been evaluated — against their real dependencies — by a test file that ran earlier in the same
// worker, which turns those `vi.mock()` calls into no-ops. Dropping the module registry from
// `vi.hoisted()` (it runs before this file's own imports, unlike any `beforeEach`) makes those
// imports resolve through the mocks.
vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("../../../../contexts/AutomationsContext.js", () => ({
    useAutomationsContext: vi.fn(),
}));

import { useAutomationsContext } from "../../../../contexts/AutomationsContext.js";
import { useExportTimezones } from "../useExportTimezones.js";

const useAutomationsContextSpy = vi.mocked(useAutomationsContext);

// keeps the store-shaped scenario descriptions of the original store-backed tests; the values now
// arrive pre-read through the automations context (filled by the connectors layer)
function mockStore({
    featureEnabled = true,
    timezoneConfig,
    workspaceTimezone,
    effectiveTimezone,
    explicitTimezone,
}: {
    featureEnabled?: boolean;
    timezoneConfig?: IDashboardTimezoneConfig;
    workspaceTimezone?: string;
    effectiveTimezone?: string;
    explicitTimezone?: string;
}) {
    useAutomationsContextSpy.mockReturnValue({
        exportTimezones: {
            isTimezoneFeatureEnabled: featureEnabled,
            allowUserOverrideInViewMode: !!timezoneConfig?.allowUserOverrideInViewMode,
            configuredTimezoneId: timezoneConfig?.timezoneId,
            workspaceTimezone,
            effectiveTimezone,
            scheduledExportTimezone: explicitTimezone,
        },
    } as ReturnType<typeof useAutomationsContext>);
}

beforeEach(() => {
    vi.clearAllMocks();
});

describe("useExportTimezones — Default resolution excludes the session override", () => {
    // WS setting Buenos Aires; dashboard has no own timezone but allows the view-mode override;
    // the user set the override to browser-detected, resolved to Prague.
    const OVERRIDE_SCENARIO = {
        featureEnabled: true,
        timezoneConfig: { allowUserOverrideInViewMode: true } as IDashboardTimezoneConfig,
        workspaceTimezone: "America/Argentina/Buenos_Aires",
        effectiveTimezone: "Europe/Prague",
        explicitTimezone: "Europe/Prague",
    };

    it("resolves Default to the persisted workspace setting, not the active override", () => {
        mockStore(OVERRIDE_SCENARIO);

        const { result } = renderHook(() => useExportTimezones(false));

        // an existing schedule left at Default will be derived by the backend from persisted
        // state — the session override must not leak into the caption
        expect(result.current.defaultResolvedTimezone).toBe("America/Argentina/Buenos_Aires");
    });

    it("provides the override as the explicit timezone for newly created schedules", () => {
        mockStore(OVERRIDE_SCENARIO);

        const { result } = renderHook(() => useExportTimezones(false));

        // a new schedule starts at the concrete override (shown in the dropdown and baked in)
        expect(result.current.exportTimezoneId).toBe("Europe/Prague");
        expect(result.current.canSelectScheduleTimezone).toBe(true);
    });

    it("resolves Default through a persisted browser-detected dashboard configuration", () => {
        mockStore({
            featureEnabled: true,
            timezoneConfig: {
                timezoneId: BROWSER_DETECTED,
                allowUserOverrideInViewMode: true,
            } as IDashboardTimezoneConfig,
            workspaceTimezone: "America/Argentina/Buenos_Aires",
        });

        const { result } = renderHook(() => useExportTimezones(false));

        expect(result.current.defaultResolvedTimezone).toBe(Intl.DateTimeFormat().resolvedOptions().timeZone);
    });

    it("resolves Default to the persisted dashboard timezone when configured", () => {
        mockStore({
            featureEnabled: true,
            timezoneConfig: {
                timezoneId: "Asia/Tokyo",
                allowUserOverrideInViewMode: true,
            } as IDashboardTimezoneConfig,
            workspaceTimezone: "America/Argentina/Buenos_Aires",
        });

        const { result } = renderHook(() => useExportTimezones(false));

        expect(result.current.defaultResolvedTimezone).toBe("Asia/Tokyo");
    });
});

describe("useExportTimezones — section visibility", () => {
    it("is hidden when only showTimezoneInfo is enabled", () => {
        mockStore({
            featureEnabled: true,
            timezoneConfig: { showTimezoneInfo: true } as IDashboardTimezoneConfig,
        });

        const { result } = renderHook(() => useExportTimezones(false));

        expect(result.current.canSelectScheduleTimezone).toBe(false);
    });

    it("is hidden when the feature flag is off even with the override allowed", () => {
        mockStore({
            featureEnabled: false,
            timezoneConfig: { allowUserOverrideInViewMode: true } as IDashboardTimezoneConfig,
        });

        const { result } = renderHook(() => useExportTimezones(false));

        expect(result.current.canSelectScheduleTimezone).toBe(false);
    });
});

describe("useExportTimezones — widget schedules (backend has only workspace/organization settings)", () => {
    it("bakes the dashboard's stored configuration into widget schedules", () => {
        mockStore({
            featureEnabled: true,
            timezoneConfig: {
                timezoneId: "Asia/Tokyo",
                allowUserOverrideInViewMode: true,
            } as IDashboardTimezoneConfig,
            workspaceTimezone: "America/Argentina/Buenos_Aires",
            effectiveTimezone: "Asia/Tokyo",
        });

        const { result } = renderHook(() => useExportTimezones(true));

        expect(result.current.exportTimezoneId).toBe("Asia/Tokyo");
    });

    it("bakes the view-mode override into widget schedules", () => {
        mockStore({
            featureEnabled: true,
            timezoneConfig: { allowUserOverrideInViewMode: true } as IDashboardTimezoneConfig,
            workspaceTimezone: "America/Argentina/Buenos_Aires",
            effectiveTimezone: "Europe/Prague",
            explicitTimezone: "Europe/Prague",
        });

        const { result } = renderHook(() => useExportTimezones(true));

        expect(result.current.exportTimezoneId).toBe("Europe/Prague");
    });

    it("resolves the widget Default to the workspace setting only", () => {
        mockStore({
            featureEnabled: true,
            timezoneConfig: {
                timezoneId: "Asia/Tokyo",
                allowUserOverrideInViewMode: true,
            } as IDashboardTimezoneConfig,
            workspaceTimezone: "America/Argentina/Buenos_Aires",
            effectiveTimezone: "Asia/Tokyo",
        });

        const { result } = renderHook(() => useExportTimezones(true));

        // the backend cannot read the dashboard configuration for widget exports
        expect(result.current.defaultResolvedTimezone).toBe("America/Argentina/Buenos_Aires");
    });

    it("bakes nothing into widget schedules when no timezone is effective", () => {
        mockStore({
            featureEnabled: true,
            timezoneConfig: { allowUserOverrideInViewMode: true } as IDashboardTimezoneConfig,
            workspaceTimezone: "America/Argentina/Buenos_Aires",
        });

        const { result } = renderHook(() => useExportTimezones(true));

        expect(result.current.exportTimezoneId).toBeUndefined();
    });
});
