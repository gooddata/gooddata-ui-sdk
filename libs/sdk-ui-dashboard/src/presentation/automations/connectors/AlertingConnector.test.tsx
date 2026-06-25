// (C) 2026 GoodData Corporation

import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { IAutomationMetadataObject } from "@gooddata/sdk-model";

const fixtures = vi.hoisted(() => {
    const buildAutomationUrl = vi.fn(() => "/target-url");
    const navigate = vi.fn();
    const onAlertingManagementEdit = vi.fn();
    let managementDialogProps: Record<string, unknown> | undefined;

    return {
        buildAutomationUrl,
        navigate,
        onAlertingManagementEdit,
        get managementDialogProps() {
            return managementDialogProps;
        },
        set managementDialogProps(value: Record<string, unknown> | undefined) {
            managementDialogProps = value;
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
        isAlertDialogOpen: false,
        isAlertManagementDialogOpen: true,
        alertToEdit: undefined,
        automations: [],
        automationsError: undefined,
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

vi.mock("../../../model/react/useWorkspaceUsers.js", () => ({
    useWorkspaceUsers: () => ({ users: [], status: "success", usersError: undefined }),
}));

vi.mock("../../../model/store/config/configSelectors.js", () => ({
    selectEnableAutomationManagement: () => true,
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
    AlertingDialog: () => null,
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
});
