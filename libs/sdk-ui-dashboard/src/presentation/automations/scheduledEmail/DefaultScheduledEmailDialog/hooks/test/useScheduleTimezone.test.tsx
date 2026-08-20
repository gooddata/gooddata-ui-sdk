// (C) 2026 GoodData Corporation

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectDefinition,
    type IWidget,
    idRef,
} from "@gooddata/sdk-model";

// `isolate: false` shares one module graph per worker, so the modules mocked below may already have
// been evaluated — against their real dependencies — by a test file that ran earlier in the same
// worker, which turns those `vi.mock()` calls into no-ops. Dropping the module registry from
// `vi.hoisted()` (it runs before this file's own imports, unlike any `beforeEach`) makes those
// imports resolve through the mocks.
vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("../useExportTimezones.js", async (importOriginal: () => Promise<Record<string, unknown>>) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useExportTimezones: vi.fn(),
    };
});

import { useExportTimezones } from "../useExportTimezones.js";
import { useScheduleTimezone } from "../useScheduleTimezone.js";

const useExportTimezonesSpy = vi.mocked(useExportTimezones);

function makeAutomation(timezoneId?: string): IAutomationMetadataObjectDefinition {
    return {
        type: "automation",
        title: "Automation",
        exportDefinitions: [
            {
                type: "exportDefinition",
                title: "Export",
                requestPayload: {
                    type: "dashboard",
                    fileName: "Export",
                    format: "PDF",
                    content: { dashboard: "dash-1" },
                    ...(timezoneId ? { timezoneId } : {}),
                },
            },
        ],
    } as IAutomationMetadataObjectDefinition;
}

function setup({
    scheduledExportToEdit,
    widget,
    automation = makeAutomation(),
}: {
    scheduledExportToEdit?: IAutomationMetadataObject;
    widget?: IWidget;
    automation?: IAutomationMetadataObjectDefinition;
} = {}) {
    let current = automation;
    const setEditedAutomation = vi.fn(
        (updater: (s: IAutomationMetadataObjectDefinition) => IAutomationMetadataObjectDefinition) => {
            current = updater(current);
        },
    );
    const hook = renderHook(() =>
        useScheduleTimezone({
            scheduledExportToEdit,
            widget,
            setEditedAutomation: setEditedAutomation as never,
        }),
    );
    return { hook, getAutomation: () => current };
}

function definitionTimezone(automation: IAutomationMetadataObjectDefinition): string | undefined {
    return automation.exportDefinitions?.[0]?.requestPayload.timezoneId;
}

beforeEach(() => {
    vi.clearAllMocks();
    useExportTimezonesSpy.mockReturnValue({
        isTimezoneFeatureEnabled: true,
        canSelectScheduleTimezone: true,
        workspaceTimezone: "Europe/Prague",
        effectiveTimezone: "America/New_York",
        exportTimezoneId: undefined,
        initialSelection: { id: undefined, shouldSave: false },
        defaultResolvedTimezone: "Europe/Prague",
    });
});

describe("useScheduleTimezone — new schedule", () => {
    it("starts at the Default option when the effective timezone is derivable by the backend", () => {
        const { hook } = setup();

        expect(hook.result.current.scheduleTimezoneSelection).toEqual({ id: undefined, shouldSave: false });
        expect(hook.result.current.scheduleTimezone).toEqual({ active: true, timezoneId: undefined });
    });

    it("starts at the concrete timezone when it comes from the view-mode override or browser detection", () => {
        useExportTimezonesSpy.mockReturnValue({
            isTimezoneFeatureEnabled: true,
            canSelectScheduleTimezone: true,
            workspaceTimezone: "Europe/Prague",
            effectiveTimezone: "America/New_York",
            exportTimezoneId: "America/New_York",
            initialSelection: { id: "America/New_York", shouldSave: true },
            defaultResolvedTimezone: "Europe/Prague",
        });

        const { hook } = setup();

        expect(hook.result.current.scheduleTimezoneSelection).toEqual({
            id: "America/New_York",
            shouldSave: true,
        });
        expect(hook.result.current.scheduleTimezone).toEqual({
            active: true,
            timezoneId: "America/New_York",
        });
    });

    it("bakes a manually selected timezone into the export definitions", () => {
        const { hook, getAutomation } = setup();

        act(() => {
            hook.result.current.onScheduleTimezoneChange("Asia/Tokyo");
        });

        expect(definitionTimezone(getAutomation())).toBe("Asia/Tokyo");
        expect(hook.result.current.scheduleTimezone.timezoneId).toBe("Asia/Tokyo");
    });

    it("removes the timezone from the export definitions when Default is selected", () => {
        const { hook, getAutomation } = setup({ automation: makeAutomation("Asia/Tokyo") });

        act(() => {
            hook.result.current.onScheduleTimezoneChange(undefined);
        });

        expect(definitionTimezone(getAutomation())).toBeUndefined();
        expect(hook.result.current.scheduleTimezone.timezoneId).toBeUndefined();
    });
});

describe("useScheduleTimezone — editing an existing schedule", () => {
    it("initializes the selection from the stored export definitions", () => {
        const stored = makeAutomation("Asia/Tokyo") as IAutomationMetadataObject;
        const { hook } = setup({ scheduledExportToEdit: stored, automation: stored });

        expect(hook.result.current.scheduleTimezoneSelection).toEqual({ id: "Asia/Tokyo", shouldSave: true });
    });

    it("starts at Default when the stored schedule carries no timezone", () => {
        const stored = makeAutomation() as IAutomationMetadataObject;
        const { hook } = setup({ scheduledExportToEdit: stored, automation: stored });

        expect(hook.result.current.scheduleTimezoneSelection).toEqual({ id: undefined, shouldSave: false });
    });
});

describe("useScheduleTimezone — section modes", () => {
    it("reports the mode and does not patch definitions when the section is hidden", () => {
        useExportTimezonesSpy.mockReturnValue({
            isTimezoneFeatureEnabled: true,
            canSelectScheduleTimezone: false,
            workspaceTimezone: "Europe/Prague",
            effectiveTimezone: "America/New_York",
            exportTimezoneId: undefined,
            initialSelection: { id: undefined, shouldSave: false },
            defaultResolvedTimezone: "Europe/Prague",
        });

        const { hook, getAutomation } = setup();

        expect(hook.result.current.canSelectScheduleTimezone).toBe(false);
        expect(hook.result.current.scheduleTimezone.active).toBe(false);

        act(() => {
            hook.result.current.onScheduleTimezoneChange("Asia/Tokyo");
        });

        expect(definitionTimezone(getAutomation())).toBeUndefined();
    });
});

describe("useScheduleTimezone — schedule kind", () => {
    it("asks for the widget flavor of the export timezone when scheduling a widget", () => {
        const widget = { localIdentifier: "w1", ref: idRef("w1") } as unknown as IWidget;

        setup({ widget });

        expect(useExportTimezonesSpy).toHaveBeenCalledWith(true);
    });

    it("asks for the dashboard flavor when scheduling a dashboard", () => {
        setup();

        expect(useExportTimezonesSpy).toHaveBeenCalledWith(false);
    });
});

describe("useScheduleTimezone — widget selection has no Default", () => {
    it("shows the resolved timezone for an edited widget schedule without a stored one", () => {
        useExportTimezonesSpy.mockReturnValue({
            isTimezoneFeatureEnabled: true,
            canSelectScheduleTimezone: true,
            workspaceTimezone: "Europe/Prague",
            effectiveTimezone: undefined,
            exportTimezoneId: undefined,
            initialSelection: { id: "Europe/Prague", shouldSave: false },
            defaultResolvedTimezone: "Europe/Prague",
        });
        const widget = { localIdentifier: "w1", ref: idRef("w1") } as unknown as IWidget;
        const stored = makeAutomation() as IAutomationMetadataObject;

        const { hook } = setup({ widget, scheduledExportToEdit: stored, automation: stored });

        expect(hook.result.current.scheduleTimezoneSelection).toEqual({
            id: "Europe/Prague",
            shouldSave: false,
        });
        // workspace-sourced value is derivable by the backend, so nothing is baked
        expect(hook.result.current.scheduleTimezone.timezoneId).toBeUndefined();
    });

    it("bakes a workspace-equal value once the user picks it manually", () => {
        useExportTimezonesSpy.mockReturnValue({
            isTimezoneFeatureEnabled: true,
            canSelectScheduleTimezone: true,
            workspaceTimezone: "Europe/Prague",
            effectiveTimezone: undefined,
            exportTimezoneId: undefined,
            initialSelection: { id: "Europe/Prague", shouldSave: false },
            defaultResolvedTimezone: "Europe/Prague",
        });
        const widget = { localIdentifier: "w1", ref: idRef("w1") } as unknown as IWidget;

        const { hook, getAutomation } = setup({ widget });

        act(() => {
            hook.result.current.onScheduleTimezoneChange("Europe/Prague");
        });

        expect(definitionTimezone(getAutomation())).toBe("Europe/Prague");
    });
});

describe("useScheduleTimezone — widget timezone staleness on edit", () => {
    const STALE_SCENARIO = {
        isTimezoneFeatureEnabled: true,
        canSelectScheduleTimezone: true,
        workspaceTimezone: "America/Argentina/Buenos_Aires",
        effectiveTimezone: "Asia/Tokyo",
        exportTimezoneId: "Asia/Tokyo",
        initialSelection: { id: "Asia/Tokyo", shouldSave: true },
        defaultResolvedTimezone: "America/Argentina/Buenos_Aires",
    };

    it("flags an edited widget schedule missing a dashboard-scoped timezone as stale", () => {
        useExportTimezonesSpy.mockReturnValue(STALE_SCENARIO);
        const widget = { localIdentifier: "w1", ref: idRef("w1") } as unknown as IWidget;
        const stored = makeAutomation() as IAutomationMetadataObject;

        const { hook, getAutomation } = setup({ widget, scheduledExportToEdit: stored, automation: stored });

        expect(hook.result.current.scheduleTimezoneIsStale).toBe(true);
        // never migrated silently — only through the apply-current-state confirmation
        expect(definitionTimezone(getAutomation())).toBeUndefined();
    });

    it("applies the resolved timezone through applyCurrentScheduleTimezone", () => {
        useExportTimezonesSpy.mockReturnValue(STALE_SCENARIO);
        const widget = { localIdentifier: "w1", ref: idRef("w1") } as unknown as IWidget;
        const stored = makeAutomation() as IAutomationMetadataObject;

        const { hook, getAutomation } = setup({ widget, scheduledExportToEdit: stored, automation: stored });

        act(() => {
            hook.result.current.applyCurrentScheduleTimezone();
        });

        expect(definitionTimezone(getAutomation())).toBe("Asia/Tokyo");
        expect(hook.result.current.scheduleTimezoneSelection).toEqual({ id: "Asia/Tokyo", shouldSave: true });
    });

    it("is not stale when the resolved value comes from settings (backend derives it itself)", () => {
        useExportTimezonesSpy.mockReturnValue({
            ...STALE_SCENARIO,
            effectiveTimezone: undefined,
            exportTimezoneId: undefined,
            initialSelection: { id: "America/Argentina/Buenos_Aires", shouldSave: false },
        });
        const widget = { localIdentifier: "w1", ref: idRef("w1") } as unknown as IWidget;
        const stored = makeAutomation() as IAutomationMetadataObject;

        const { hook } = setup({ widget, scheduledExportToEdit: stored, automation: stored });

        expect(hook.result.current.scheduleTimezoneIsStale).toBe(false);
    });

    it("is not stale when the widget schedule already stores a timezone", () => {
        useExportTimezonesSpy.mockReturnValue(STALE_SCENARIO);
        const widget = { localIdentifier: "w1", ref: idRef("w1") } as unknown as IWidget;
        const stored = makeAutomation("Europe/Prague") as IAutomationMetadataObject;

        const { hook } = setup({ widget, scheduledExportToEdit: stored, automation: stored });

        expect(hook.result.current.scheduleTimezoneIsStale).toBe(false);
    });

    it("is never stale for dashboard schedules (backend reads the stored dashboard)", () => {
        useExportTimezonesSpy.mockReturnValue(STALE_SCENARIO);
        const stored = makeAutomation() as IAutomationMetadataObject;

        const { hook } = setup({ scheduledExportToEdit: stored, automation: stored });

        expect(hook.result.current.scheduleTimezoneIsStale).toBe(false);
    });
});
