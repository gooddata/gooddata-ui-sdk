// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
    type IAutomationMetadataObject,
    type INotificationChannelMetadataObject,
    type IWorkspaceUser,
    idRef,
} from "@gooddata/sdk-model";

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

vi.mock("../../../../model/store/tabs/layout/layoutSelectors.js", () => ({
    selectWidgetLocalIdToTabIdMap: () => ({}),
}));

vi.mock("../../../../model/store/tabs/parameters/parametersSelectors.js", () => ({
    selectEffectiveParameterValuesForWidget: () => () => [],
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
                users: [],
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
        const users: IWorkspaceUser[] = [
            { ref: idRef("user-1"), uri: "/users/user-1", login: "user-1", email: "user-1@example.com" },
        ];
        const notificationChannels = [
            { id: "channel-1", type: "notificationChannel" },
        ] as INotificationChannelMetadataObject[];

        const { result } = renderHook(() =>
            useBuildAlertingDialogContext({
                mode: "edit",
                alertToEdit,
                users,
                usersError: undefined,
                notificationChannels,
                isLoading: true,
            }),
        );

        expect(result.current.alertToEdit).toBe(alertToEdit);
        expect(result.current.users).toBe(users);
        expect(result.current.notificationChannels).toBe(notificationChannels);
        expect(result.current.isLoading).toBe(true);
    });
});
