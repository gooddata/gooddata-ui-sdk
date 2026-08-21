// (C) 2026 GoodData Corporation

import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { IAutomationMetadataObject } from "@gooddata/sdk-model";

// `isolate: false` shares one module graph per worker, so the modules mocked below may already have
// been evaluated — against their real dependencies — by a test file that ran earlier in the same
// worker, which turns those `vi.mock()` calls into no-ops. Dropping the module registry from
// `vi.hoisted()` (it runs before this file's own imports, unlike any `beforeEach`) makes those
// imports resolve through the mocks.
vi.hoisted(() => {
    vi.resetModules();
});

const fixtures = vi.hoisted(() => {
    const buildAutomationUrl = vi.fn(() => "/target-url");
    const navigate = vi.fn();
    const onAlertingManagementEdit = vi.fn();
    let managementDialogProps: Record<string, unknown> | undefined;
    let dialogProps: Record<string, unknown> | undefined;
    let automationsError: Error | undefined;
    const alertsState = { isAlertDialogOpen: false, isAlertManagementDialogOpen: true };

    return {
        buildAutomationUrl,
        navigate,
        onAlertingManagementEdit,
        alertsState,
        get managementDialogProps() {
            return managementDialogProps;
        },
        set managementDialogProps(value: Record<string, unknown> | undefined) {
            managementDialogProps = value;
        },
        get dialogProps() {
            return dialogProps;
        },
        set dialogProps(value: Record<string, unknown> | undefined) {
            dialogProps = value;
        },
        get automationsError() {
            return automationsError;
        },
        set automationsError(value: Error | undefined) {
            automationsError = value;
        },
    };
});

vi.mock("@gooddata/sdk-ui", () => ({
    buildAutomationUrl: fixtures.buildAutomationUrl,
    navigate: fixtures.navigate,
    useWorkspaceStrict: () => "workspace-id",
}));

vi.mock("../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: vi.fn((selector: () => unknown) => selector()),
}));

vi.mock("../../../model/react/useDashboardAlerting/useDashboardAlerts.js", () => ({
    useDashboardAlerts: () => ({
        isInitialized: true,
        get isAlertDialogOpen() {
            return fixtures.alertsState.isAlertDialogOpen;
        },
        get isAlertManagementDialogOpen() {
            return fixtures.alertsState.isAlertManagementDialogOpen;
        },
        alertToEdit: undefined,
        automations: [],
        automationsError: fixtures.automationsError,
        automationsLoading: false,
        notificationChannels: [],
        onAlertingCancel: vi.fn(),
        onAlertingCreateSuccess: vi.fn(),
        onAlertingCreateError: vi.fn(),
        onAlertingSaveSuccess: vi.fn(),
        onAlertingSaveError: vi.fn(),
        onAlertingManagementClose: vi.fn(),
        onAlertingManagementAdd: vi.fn(),
        onAlertingManagementEdit: fixtures.onAlertingManagementEdit,
        onAlertingManagementDeleteSuccess: vi.fn(),
        onAlertingManagementDeleteError: vi.fn(),
        onAlertingManagementPauseSuccess: vi.fn(),
        onAlertingManagementPauseError: vi.fn(),
        widget: undefined,
        insight: undefined,
    }),
}));

vi.mock("../../../model/store/config/configSelectors.js", () => ({
    selectExternalRecipient: () => "recipient@example.com",
    selectIsEmbedded: () => false,
    selectSettings: () => ({
        enableShellApplication: true,
        enableShellApplication_dashboards: true,
    }),
}));

vi.mock("../../../model/store/meta/metaSelectors.js", () => ({
    selectDashboardId: () => "current-dashboard",
}));

vi.mock("../alerting/AlertingDialog.js", () => ({
    AlertingDialog: (props: Record<string, unknown>) => {
        fixtures.dialogProps = props;
        return null;
    },
}));

vi.mock("../alerting/AlertingManagementDialog.js", () => ({
    AlertingManagementDialog: (props: Record<string, unknown>) => {
        fixtures.managementDialogProps = props;
        return null;
    },
}));

vi.mock("../contexts/AlertingDialogContext.js", () => ({
    AlertingDialogContextProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("../contexts/AlertingManagementDialogContext.js", () => ({
    AlertingManagementDialogContextProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("../contexts/AutomationsContext.js", () => ({
    AutomationsContextProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("./hooks/useBuildAlertingDialogContext.js", () => ({
    useBuildAlertingDialogContext: () => ({}),
}));

vi.mock("./hooks/useBuildAlertingManagementDialogContext.js", () => ({
    useBuildAlertingManagementDialogContext: () => ({
        dashboardId: "current-dashboard",
        isEmbedded: false,
        canManageWorkspace: true,
        currentUser: { login: "user" },
        dashboardTitle: "Current Dashboard",
        isAlertDialogOpen: false,
        managementDialogContext: {},
        enableAccessibilityMode: false,
        getWidgetByRef: () => undefined,
        getInsightByWidgetRef: () => undefined,
        pauseAlert: vi.fn(),
        resumeAlert: vi.fn(),
    }),
}));

vi.mock("./hooks/useBuildAutomationsContext.js", () => ({
    useBuildAutomationsContext: () => ({}),
}));

import { AlertingConnector } from "./AlertingConnector.js";

describe("AlertingConnector", () => {
    beforeEach(() => {
        fixtures.buildAutomationUrl.mockClear();
        fixtures.navigate.mockClear();
        fixtures.onAlertingManagementEdit.mockClear();
        fixtures.managementDialogProps = undefined;
        fixtures.dialogProps = undefined;
        fixtures.automationsError = undefined;
        fixtures.alertsState.isAlertDialogOpen = false;
        fixtures.alertsState.isAlertManagementDialogOpen = true;
    });

    it("uses host routes when editing an alert on another dashboard in shell mode", () => {
        render(<AlertingConnector />);

        const onEdit = fixtures.managementDialogProps?.["onEdit"] as
            | ((alert: IAutomationMetadataObject) => void)
            | undefined;
        expect(onEdit).toBeDefined();

        onEdit?.({
            id: "alert-1",
            dashboard: { id: "other-dashboard" },
        } as IAutomationMetadataObject);

        expect(fixtures.buildAutomationUrl).toHaveBeenCalledWith({
            workspaceId: "workspace-id",
            dashboardId: "other-dashboard",
            automationId: "alert-1",
            isEmbedded: false,
            useHostRoute: true,
            queryParams: { recipient: "recipient@example.com" },
        });
        expect(fixtures.navigate).toHaveBeenCalledWith("/target-url");
        expect(fixtures.onAlertingManagementEdit).not.toHaveBeenCalled();
    });

    it("falls back to local edit when the target dashboard id is missing", () => {
        render(<AlertingConnector />);

        const onEdit = fixtures.managementDialogProps?.["onEdit"] as
            | ((alert: IAutomationMetadataObject) => void)
            | undefined;

        onEdit?.({
            id: "alert-2",
            dashboard: undefined,
        } as IAutomationMetadataObject);

        expect(fixtures.navigate).not.toHaveBeenCalled();
        expect(fixtures.buildAutomationUrl).not.toHaveBeenCalled();
        expect(fixtures.onAlertingManagementEdit).toHaveBeenCalledWith({
            id: "alert-2",
            dashboard: undefined,
        });
    });

    it("does not supply the deprecated data props to the create/edit dialog", () => {
        fixtures.alertsState.isAlertDialogOpen = true;
        fixtures.alertsState.isAlertManagementDialogOpen = false;

        render(<AlertingConnector />);

        expect(fixtures.dialogProps).toBeDefined();
        for (const prop of [
            "alertToEdit",
            "users",
            "usersError",
            "notificationChannels",
            "widget",
            "insight",
            "isLoading",
        ]) {
            expect(fixtures.dialogProps?.[prop]).toBeUndefined();
        }
    });

    it("renders the management dialog without the deprecated data props", () => {
        fixtures.automationsError = new Error("automations failed to load");

        render(<AlertingConnector />);

        expect(fixtures.managementDialogProps).toBeDefined();
        expect(fixtures.managementDialogProps?.["automations"]).toBeUndefined();
        expect(fixtures.managementDialogProps?.["notificationChannels"]).toBeUndefined();
        expect(fixtures.managementDialogProps?.["alertDataError"]).toBeUndefined();
        expect(fixtures.managementDialogProps?.["isLoadingAlertingData"]).toBeUndefined();
    });
});
