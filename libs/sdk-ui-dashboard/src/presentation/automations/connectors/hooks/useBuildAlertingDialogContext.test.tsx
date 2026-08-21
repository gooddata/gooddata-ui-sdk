// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
    type IAutomationMetadataObject,
    type INotificationChannelMetadataObject,
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

const fixtures = vi.hoisted(() => {
    // A single, referentially stable execution-result envelope, simulating an
    // unchanged normalized store entity across renders.
    const stableExecutionResult = { readAll: () => Promise.resolve({}) };
    const stableEnvelope = { isLoading: false, executionResult: stableExecutionResult };
    // Any serialized ObjRef key resolves to the same stable envelope.
    const entities = new Proxy({} as Record<string, unknown>, {
        get: () => stableEnvelope,
    });
    return { stableEnvelope, entities };
});

vi.mock("@gooddata/sdk-ui", () => ({
    useBackendStrict: vi.fn(() => ({ workspace: () => ({ automations: () => ({}) }) })),
    useWorkspaceStrict: vi.fn(() => "workspace"),
}));

vi.mock("../../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: vi.fn((selector: () => unknown) => selector()),
}));

vi.mock("../../../../model/react/useDashboardCommandProcessing.js", () => ({
    useDashboardCommandProcessing: vi.fn(() => ({ run: vi.fn() })),
}));

vi.mock("../../../../model/commands/alerts.js", () => ({
    createAlert: vi.fn(),
    saveAlert: vi.fn(),
}));

vi.mock("../../../../model/store/executionResults/executionResultsSelectors.js", () => ({
    selectExecutionResultEntities: () => fixtures.entities,
}));

vi.mock("../../../../model/store/filtering/dashboardFilterSelectors.js", () => ({
    selectAutomationCommonDateFilterId: () => undefined,
    selectAutomationDefaultSelectedFilters: () => [],
    selectDashboardHiddenFilters: () => [],
}));

vi.mock("../../../../model/store/meta/metaSelectors.js", () => ({
    selectDashboardId: () => "dashboard-1",
    selectEvaluationFrequency: () => undefined,
}));

const parameterSentinels = vi.hoisted(() => ({
    parameterValues: [] as never[],
    dashboardParameters: [] as never[],
}));

vi.mock("../../../../model/store/tabs/parameters/parametersSelectors.js", () => ({
    selectEffectiveParameterValuesForWidget: () => () => parameterSentinels.parameterValues,
    selectEffectiveDashboardParametersForWidget: () => () => parameterSentinels.dashboardParameters,
}));

vi.mock("../../../../model/utils/dashboardItemUtils.js", () => ({
    getWidgetTitle: () => "widget title",
}));

import { useBuildAlertingDialogContext } from "./useBuildAlertingDialogContext.js";

describe("useBuildAlertingDialogContext", () => {
    it("returns a referentially stable execution-result envelope across renders (no render loop)", () => {
        const ref = idRef("widget-1");

        const { result, rerender } = renderHook(() =>
            useBuildAlertingDialogContext({
                mode: "create",
                notificationChannels: [],
                isLoading: false,
            }),
        );

        const first = result.current.executionResultByRef(ref);
        rerender();
        const second = result.current.executionResultByRef(ref);

        // The envelope must keep the same identity when the underlying store entity
        // is unchanged. A fresh object each call makes useAttributeValuesFromExecResults'
        // useEffect([execResult]) re-fire every render -> infinite readAll() loop ->
        // the alerting dialog Overlay never stabilizes and stays hidden.
        expect(second).toBe(first);
        expect(first?.executionResult).toBe(fixtures.stableEnvelope.executionResult);
    });

    it("passes the create/edit inputs through to the context unchanged", () => {
        const alertToEdit = { id: "alert-1", title: "My alert" } as IAutomationMetadataObject;
        const notificationChannels = [
            { id: "channel-1", type: "notificationChannel" },
        ] as INotificationChannelMetadataObject[];

        const { result } = renderHook(() =>
            useBuildAlertingDialogContext({
                mode: "edit",
                alertToEdit,
                notificationChannels,
                isLoading: true,
            }),
        );

        expect(result.current.alertToEdit).toBe(alertToEdit);
        expect(result.current.notificationChannels).toBe(notificationChannels);
        expect(result.current.isLoading).toBe(true);
    });

    it("forwards the widget's effective dashboard parameters onto the alerting dialog context", () => {
        const { result } = renderHook(() =>
            useBuildAlertingDialogContext({
                mode: "create",
                notificationChannels: [],
                isLoading: false,
            }),
        );

        expect(result.current.dashboardParameters).toBe(parameterSentinels.dashboardParameters);
    });
});
