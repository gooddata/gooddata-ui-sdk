// (C) 2026 GoodData Corporation

import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { IAutomationMetadataObject } from "@gooddata/sdk-model";

const fixtures = vi.hoisted(() => {
    const buildAutomationUrl = vi.fn(() => "/target-url");
    const navigate = vi.fn();
    const onScheduleEmailingManagementEdit = vi.fn();
    let managementDialogProps: Record<string, unknown> | undefined;
    let dialogProps: Record<string, unknown> | undefined;
    let automationsError: Error | undefined;
    const seState = {
        isScheduleEmailingDialogOpen: false,
        isScheduleEmailingManagementDialogOpen: true,
    };

    return {
        buildAutomationUrl,
        navigate,
        onScheduleEmailingManagementEdit,
        seState,
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

vi.mock("../../../model/react/useDasboardScheduledEmails/useDashboardScheduledEmails.js", () => ({
    useDashboardScheduledEmails: () => ({
        isInitialized: true,
        get isScheduleEmailingDialogOpen() {
            return fixtures.seState.isScheduleEmailingDialogOpen;
        },
        get isScheduleEmailingManagementDialogOpen() {
            return fixtures.seState.isScheduleEmailingManagementDialogOpen;
        },
        scheduledExportToEdit: { id: "se-existing", title: "Existing schedule" },
        automations: [],
        get automationsError() {
            return fixtures.automationsError;
        },
        automationsLoading: false,
        notificationChannels: [],
        onScheduleEmailingCancel: vi.fn(),
        onScheduleEmailingBack: vi.fn(),
        onScheduleEmailingCreateSuccess: vi.fn(),
        onScheduleEmailingCreateError: vi.fn(),
        onScheduleEmailingSaveSuccess: vi.fn(),
        onScheduleEmailingSaveError: vi.fn(),
        onScheduleEmailingManagementClose: vi.fn(),
        onScheduleEmailingManagementAdd: vi.fn(),
        onScheduleEmailingManagementEdit: fixtures.onScheduleEmailingManagementEdit,
        onScheduleEmailingManagementDeleteSuccess: vi.fn(),
        onScheduleEmailingManagementDeleteError: vi.fn(),
        widget: { type: "insight", ref: { identifier: "widget-1" } },
        insight: { insight: { identifier: "insight-1", title: "Insight" } },
    }),
}));

vi.mock("../../../model/store/config/configSelectors.js", () => ({
    selectExternalRecipient: () => "recipient@example.com",
    selectIsEmbedded: () => false,
    selectSettings: () => ({
        enableShellApplication: true,
        enableShellApplication_dashboards: true,
    }),
    selectEnableAccessibilityMode: () => false,
}));

vi.mock("../../../model/store/meta/metaSelectors.js", () => ({
    selectDashboardId: () => "current-dashboard",
    selectDashboardTitle: () => "Current Dashboard",
}));

vi.mock("../../../model/store/filtering/dashboardFilterSelectors.js", () => ({
    selectAutomationDefaultSelectedFilters: () => [],
    selectDashboardHiddenFilters: () => [],
}));

vi.mock("../../../model/store/insights/insightsSelectors.js", () => ({
    selectInsightsMap: () => ({ get: () => undefined }),
}));

vi.mock("../../../model/store/tabs/layout/layoutSelectors.js", () => ({
    selectWidgetsMap: () => ({ get: () => undefined }),
}));

vi.mock("../../../model/store/ui/uiSelectors.js", () => ({
    selectIsScheduleEmailDialogOpen: () => false,
    selectScheduleEmailDialogReturnFocusTo: () => undefined,
    selectAutomationsInvalidationId: () => 0,
}));

vi.mock("../scheduledEmail/ScheduledEmailDialog.js", () => ({
    ScheduledEmailDialog: (props: Record<string, unknown>) => {
        fixtures.dialogProps = props;
        return null;
    },
}));

vi.mock("../scheduledEmail/ScheduledEmailManagementDialog.js", () => ({
    ScheduledEmailManagementDialog: (props: Record<string, unknown>) => {
        fixtures.managementDialogProps = props;
        return null;
    },
}));

vi.mock("../contexts/AutomationsContext.js", () => ({
    AutomationsContextProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("../contexts/ScheduledEmailDialogContext.js", () => ({
    ScheduledEmailDialogContextProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("../contexts/ScheduledEmailManagementDialogContext.js", () => ({
    ScheduledEmailManagementDialogContextProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("./hooks/useBuildAutomationsContext.js", () => ({
    useBuildAutomationsContext: () => ({}),
}));

vi.mock("./hooks/useBuildScheduledEmailDialogContext.js", () => ({
    useBuildScheduledEmailDialogContext: () => ({}),
}));

vi.mock("./hooks/useBuildScheduledEmailManagementDialogContext.js", () => ({
    useBuildScheduledEmailManagementDialogContext: () => ({}),
}));

vi.mock("./hooks/useWidgetAutomationFilters.js", () => ({
    useWidgetAutomationFilters: () => ({ result: undefined, status: "success", error: undefined }),
}));

vi.mock("../../../_staging/automation/index.js", () => ({
    getAutomationDashboardFilters: () => undefined,
    getAutomationVisualizationFilters: () => ({ executionFilters: [] }),
}));

vi.mock("../shared/filters/index.js", () => ({
    getAppliedDashboardFilters: () => [],
}));

import { ScheduledEmailConnector } from "./ScheduledEmailConnector.js";

describe("ScheduledEmailConnector", () => {
    beforeEach(() => {
        fixtures.buildAutomationUrl.mockClear();
        fixtures.navigate.mockClear();
        fixtures.onScheduleEmailingManagementEdit.mockClear();
        fixtures.managementDialogProps = undefined;
        fixtures.dialogProps = undefined;
        fixtures.automationsError = undefined;
        fixtures.seState.isScheduleEmailingDialogOpen = false;
        fixtures.seState.isScheduleEmailingManagementDialogOpen = true;
    });

    it("navigates cross-dashboard when editing a schedule on another dashboard in shell mode", () => {
        render(<ScheduledEmailConnector />);

        const onEdit = fixtures.managementDialogProps?.["onEdit"] as
            | ((se: IAutomationMetadataObject) => void)
            | undefined;
        expect(onEdit).toBeDefined();

        onEdit?.({
            id: "se-1",
            dashboard: { id: "other-dashboard" },
        } as IAutomationMetadataObject);

        expect(fixtures.buildAutomationUrl).toHaveBeenCalledWith({
            workspaceId: "workspace-id",
            dashboardId: "other-dashboard",
            automationId: "se-1",
            isEmbedded: false,
            useHostRoute: true,
            queryParams: { recipient: "recipient@example.com" },
        });
        expect(fixtures.navigate).toHaveBeenCalledWith("/target-url");
        expect(fixtures.onScheduleEmailingManagementEdit).not.toHaveBeenCalled();
    });

    it("falls back to local edit when the target dashboard id is missing", () => {
        render(<ScheduledEmailConnector />);

        const onEdit = fixtures.managementDialogProps?.["onEdit"] as
            | ((se: IAutomationMetadataObject) => void)
            | undefined;

        onEdit?.({
            id: "se-2",
            dashboard: undefined,
        } as IAutomationMetadataObject);

        expect(fixtures.navigate).not.toHaveBeenCalled();
        expect(fixtures.buildAutomationUrl).not.toHaveBeenCalled();
        expect(fixtures.onScheduleEmailingManagementEdit).toHaveBeenCalledWith({
            id: "se-2",
            dashboard: undefined,
        });
    });

    it("does not supply the deprecated data props to the create/edit dialog", () => {
        fixtures.seState.isScheduleEmailingDialogOpen = true;
        fixtures.seState.isScheduleEmailingManagementDialogOpen = false;

        render(<ScheduledEmailConnector />);

        expect(fixtures.dialogProps).toBeDefined();
        for (const prop of [
            "scheduledExportToEdit",
            "users",
            "usersError",
            "notificationChannels",
            "widget",
            "insight",
            "dashboardFilters",
            "widgetFilters",
            "isLoading",
        ]) {
            expect(fixtures.dialogProps?.[prop]).toBeUndefined();
        }
    });

    it("does not supply the deprecated data props to the management dialog", () => {
        fixtures.automationsError = new Error("automations failed to load");

        render(<ScheduledEmailConnector />);

        expect(fixtures.managementDialogProps).toBeDefined();
        for (const prop of [
            "automations",
            "isLoadingScheduleData",
            "notificationChannels",
            "scheduleDataError",
        ]) {
            expect(fixtures.managementDialogProps?.[prop]).toBeUndefined();
        }
    });
});
