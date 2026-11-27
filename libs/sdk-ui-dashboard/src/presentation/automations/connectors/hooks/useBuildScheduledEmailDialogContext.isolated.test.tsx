// (C) 2026 GoodData Corporation

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
    type FilterContextItem,
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectDefinition,
    type INotificationChannelMetadataObject,
    idRef,
} from "@gooddata/sdk-model";

// ---------------------------------------------------------------------------
// Hoisted mocks — must be before any import that resolves these modules
// ---------------------------------------------------------------------------

const runCreateMock = vi.fn();
const runSaveMock = vi.fn();

vi.mock("@gooddata/sdk-ui", () => ({
    useBackendStrict: vi.fn(() => ({ workspace: () => ({ automations: () => ({}) }) })),
    useWorkspaceStrict: vi.fn(() => "workspace"),
}));

vi.mock("../../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: vi.fn((selector: () => unknown) => selector()),
}));

vi.mock("../../../../model/react/useDashboardCommandProcessing.js", () => ({
    useDashboardCommandProcessing: vi.fn(
        ({
            commandCreator,
            successEvent,
            onSuccess,
            onError,
        }: {
            commandCreator: (input: unknown) => unknown;
            successEvent: string;
            onSuccess: (event: unknown) => void;
            onError: (event: unknown) => void;
        }) => {
            const run = successEvent === "GDC.DASH/EVT.SCHEDULED_EMAIL.CREATED" ? runCreateMock : runSaveMock;
            // Simulate the real useDashboardCommandProcessing: invoke commandCreator when run is called
            // so that sanitizeAutomationForSave (called inside commandCreator) fires.
            run.mockImplementation((input: unknown) => commandCreator(input));
            (run as any).__onSuccess = onSuccess;
            (run as any).__onError = onError;
            return { run };
        },
    ),
}));

vi.mock("../../../../model/commands/scheduledEmail.js", () => ({
    createScheduledEmail: vi.fn((se: unknown) => ({ type: "CREATE", se })),
    saveScheduledEmail: vi.fn((se: unknown) => ({ type: "SAVE", se })),
}));

vi.mock("../../../../model/store/filtering/dashboardFilterSelectors.js", () => ({
    selectAutomationCommonDateFilterId: () => "common-date-id",
    selectDashboardHiddenFilters: () => [],
}));

vi.mock("../../../../model/store/meta/metaSelectors.js", () => ({
    selectDashboardId: () => "dashboard-1",
    selectDashboardTitle: () => "My Dashboard",
}));

vi.mock("../../../../model/store/config/configSelectors.js", () => ({
    selectDateFormat: () => "MM/dd/yyyy",
}));

vi.mock("../../../../model/store/drill/drillSelectors.js", () => ({
    selectIsCrossFiltering: () => false,
}));

vi.mock("../../../../model/store/tabs/dateFilterConfig/dateFilterConfigSelectors.js", () => ({
    selectEffectiveDateFilterMode: () => "active",
}));

vi.mock("../../../../model/store/tabs/dateFilterConfigs/dateFilterConfigsSelectors.js", () => ({
    selectEffectiveDateFiltersModeMap: () => new Map(),
}));

vi.mock("../../../../model/store/tabs/attributeFilterConfigs/attributeFilterConfigsSelectors.js", () => ({
    selectEffectiveAttributeFiltersModeMap: () => new Map(),
}));

vi.mock("../../../../model/store/tabs/tabsSelectors.js", () => ({
    selectTabs: () => [],
}));

vi.mock("../../../../model/store/tabs/parameters/parametersSelectors.js", () => ({
    selectExportEffectiveParameters: () => () => ({}),
}));

vi.mock("../../../../model/react/useExportTemplates.js", () => ({
    useExportTemplates: () => [],
}));

vi.mock("../../../../model/utils/dashboardItemUtils.js", () => ({
    getWidgetTitle: () => "widget title",
}));

vi.mock("./sanitizeAutomationForSave.js", () => ({
    sanitizeAutomationForSave: vi.fn((automation: unknown) => ({
        ...(automation as object),
        __sanitized: true,
    })),
}));

import {
    createScheduledEmail as createScheduledEmailCmd,
    saveScheduledEmail as saveScheduledEmailCmd,
} from "../../../../model/commands/scheduledEmail.js";

import { sanitizeAutomationForSave } from "./sanitizeAutomationForSave.js";
import {
    type IUseBuildScheduledEmailDialogContextOpts,
    useBuildScheduledEmailDialogContext,
} from "./useBuildScheduledEmailDialogContext.js";

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

// The builder's create/edit inputs (notificationChannels, isLoading) are required options;
// tests that don't care about them use this minimal, valid base and override what they need.
const BASE_OPTS: IUseBuildScheduledEmailDialogContextOpts = {
    notificationChannels: [],
    isLoading: false,
};

describe("useBuildScheduledEmailDialogContext", () => {
    it("exposes dashboardId and dashboardTitle from the store selectors", () => {
        const { result } = renderHook(() => useBuildScheduledEmailDialogContext(BASE_OPTS));

        expect(result.current.dashboardId).toBe("dashboard-1");
        expect(result.current.dashboardTitle).toBe("My Dashboard");
    });

    it("passes the create/edit inputs through and carries the effective dashboard filters", () => {
        const scheduledExportToEdit = { id: "schedule-1", title: "Weekly" } as IAutomationMetadataObject;
        const notificationChannels = [
            { id: "channel-1", type: "notificationChannel" },
        ] as INotificationChannelMetadataObject[];
        const dashboardFilters: FilterContextItem[] = [];

        const { result } = renderHook(() =>
            useBuildScheduledEmailDialogContext({
                scheduledExportToEdit,
                notificationChannels,
                isLoading: true,
                dashboardFilters,
            }),
        );

        expect(result.current.scheduledExportToEdit).toBe(scheduledExportToEdit);
        expect(result.current.notificationChannels).toBe(notificationChannels);
        expect(result.current.isLoading).toBe(true);
        // the connector computes `saved ?? getAppliedDashboardFilters(...)` and passes the result in;
        // the builder must not re-derive it from selectAutomationDefaultSelectedFilters
        expect(result.current.dashboardFilters).toBe(dashboardFilters);
    });

    it("createScheduledEmail applies sanitizeAutomationForSave before dispatching the command", async () => {
        const { result } = renderHook(() => useBuildScheduledEmailDialogContext(BASE_OPTS));

        const draft: IAutomationMetadataObjectDefinition = {
            type: "automation",
            title: "New Schedule",
        } as unknown as IAutomationMetadataObjectDefinition;

        // Kick off the create (do not await yet)
        let promise: Promise<IAutomationMetadataObject>;
        act(() => {
            promise = result.current.createScheduledEmail(draft);
        });

        // sanitizeAutomationForSave must have been called with the raw draft
        expect(sanitizeAutomationForSave).toHaveBeenCalledWith(draft);

        // The command creator must have received the sanitized draft (sanitize runs inside commandCreator)
        expect(createScheduledEmailCmd).toHaveBeenCalledWith(expect.objectContaining({ __sanitized: true }));

        // Simulate the CREATED event resolving
        const createdSE: IAutomationMetadataObject = {
            type: "automation",
            id: "se-1",
            title: "New Schedule",
            ref: idRef("se-1"),
        } as unknown as IAutomationMetadataObject;

        act(() => {
            (runCreateMock as any).__onSuccess({
                payload: { scheduledEmail: createdSE },
            });
        });

        await expect(promise!).resolves.toEqual(createdSE);
    });

    it("saveScheduledEmail applies sanitizeAutomationForSave before dispatching the command", async () => {
        const { result } = renderHook(() => useBuildScheduledEmailDialogContext(BASE_OPTS));

        const existing: IAutomationMetadataObject = {
            type: "automation",
            id: "se-2",
            title: "Existing Schedule",
            ref: idRef("se-2"),
        } as unknown as IAutomationMetadataObject;

        let promise: Promise<IAutomationMetadataObject>;
        act(() => {
            promise = result.current.saveScheduledEmail(existing);
        });

        expect(sanitizeAutomationForSave).toHaveBeenCalledWith(existing);
        expect(saveScheduledEmailCmd).toHaveBeenCalledWith(expect.objectContaining({ __sanitized: true }));

        // Simulate SAVED event — no payload on the SE saved event, so resolve with input
        act(() => {
            (runSaveMock as any).__onSuccess({});
        });

        await expect(promise!).resolves.toEqual(existing);
    });

    it("createScheduledEmail rejects with error when the command fails", async () => {
        const { result } = renderHook(() => useBuildScheduledEmailDialogContext(BASE_OPTS));

        const draft: IAutomationMetadataObjectDefinition = {
            type: "automation",
            title: "Fail Schedule",
        } as unknown as IAutomationMetadataObjectDefinition;

        let promise: Promise<IAutomationMetadataObject>;
        act(() => {
            promise = result.current.createScheduledEmail(draft);
        });

        const err = new Error("Backend failure");
        act(() => {
            (runCreateMock as any).__onError({ payload: { error: err } });
        });

        await expect(promise!).rejects.toThrow("Backend failure");
    });
});
