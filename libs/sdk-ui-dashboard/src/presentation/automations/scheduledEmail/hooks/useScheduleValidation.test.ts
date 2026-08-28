// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type IAutomationMetadataObjectDefinition, idRef } from "@gooddata/sdk-model";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const widgetExistsByRefMock = vi.fn<(ref: unknown) => boolean>();

// `isolate: false` shares one module graph per worker, so the modules mocked below may already have
// been evaluated — against their real dependencies — by a test file that ran earlier in the same
// worker, which turns those `vi.mock()` calls into no-ops. Dropping the module registry from
// `vi.hoisted()` (it runs before this file's own imports, unlike any `beforeEach`) makes those
// imports resolve through the mocks.
vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("../../contexts/AutomationsContext.js", () => ({
    useAutomationsContext: () => ({
        widgetExistsByRef: widgetExistsByRefMock,
    }),
}));

import { useScheduleValidation } from "./useScheduleValidation.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSchedule(
    hasDashboardExport: boolean,
    widgetLocalId?: string,
): IAutomationMetadataObjectDefinition {
    const exportDefinitions: IAutomationMetadataObjectDefinition["exportDefinitions"] = [];
    if (hasDashboardExport) {
        exportDefinitions.push({
            requestPayload: {
                // The sdk-model type guard checks obj.type === "dashboard"
                type: "dashboard",
                format: "PDF",
                content: { dashboard: idRef("dash-1") },
            },
        } as any);
    }
    if (widgetLocalId) {
        exportDefinitions.push({
            requestPayload: {
                // The sdk-model type guard checks obj.type === "visualizationObject"
                type: "visualizationObject",
                format: "XLSX",
                content: { widget: widgetLocalId, visualizationObject: idRef("viz-1"), filters: [] },
            },
        } as any);
    }
    return {
        type: "automation",
        exportDefinitions,
    } as unknown as IAutomationMetadataObjectDefinition;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useScheduleValidation (context-aware)", () => {
    it("is valid when the schedule has a dashboard export definition", () => {
        widgetExistsByRefMock.mockReturnValue(false);
        const { result } = renderHook(() => useScheduleValidation(makeSchedule(true)));
        expect(result.current.isValid).toBe(true);
    });

    it("is valid when there is no widget reference (pure dashboard schedule, no viz)", () => {
        widgetExistsByRefMock.mockReturnValue(false);
        const { result } = renderHook(() => useScheduleValidation(makeSchedule(false)));
        expect(result.current.isValid).toBe(true);
    });

    it("is valid when the widget reference resolves to an existing widget", () => {
        widgetExistsByRefMock.mockReturnValue(true);
        const { result } = renderHook(() => useScheduleValidation(makeSchedule(false, "widgetA")));
        expect(result.current.isValid).toBe(true);
    });

    it("is invalid when a widget was referenced but widgetExistsByRef returns false", () => {
        widgetExistsByRefMock.mockReturnValue(false);
        const { result } = renderHook(() => useScheduleValidation(makeSchedule(false, "widgetA")));
        expect(result.current.isValid).toBe(false);
    });

    it("calls widgetExistsByRef with an identifier ref for the widget localId", () => {
        widgetExistsByRefMock.mockReturnValue(false);
        renderHook(() => useScheduleValidation(makeSchedule(false, "someWidget")));
        expect(widgetExistsByRefMock).toHaveBeenCalledWith({ identifier: "someWidget" });
    });

    it("does not call widgetExistsByRef when there is no widget export definition", () => {
        widgetExistsByRefMock.mockClear();
        widgetExistsByRefMock.mockReturnValue(false);
        renderHook(() => useScheduleValidation(makeSchedule(true)));
        expect(widgetExistsByRefMock).not.toHaveBeenCalled();
    });
});
