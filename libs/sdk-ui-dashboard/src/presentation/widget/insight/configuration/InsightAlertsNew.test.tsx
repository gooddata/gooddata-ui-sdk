// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useAlertingManagementDialogContext } from "../../../automations/contexts/AlertingManagementDialogContext.js";
import { useAutomationsContext } from "../../../automations/contexts/AutomationsContext.js";

const fixtures = vi.hoisted(() => ({
    automationsContext: { locale: "en-US" },
    managementContext: {
        canManageWorkspace: true,
        currentUser: { login: "user" },
        dashboardId: "dashboard-1",
        dashboardTitle: "Dashboard",
        isAlertDialogOpen: false,
        managementDialogContext: {},
        enableAccessibilityMode: false,
        getWidgetByRef: () => undefined,
        getInsightByWidgetRef: () => undefined,
        pauseAlert: vi.fn(),
        resumeAlert: vi.fn(),
    },
}));

vi.mock("@gooddata/sdk-ui", () => ({
    fillMissingTitles: vi.fn((insight) => Promise.resolve(insight)),
    useBackendStrict: () => ({ workspace: () => ({ automations: () => ({}) }) }),
    useWorkspaceStrict: () => "workspace-id",
}));

vi.mock("@gooddata/sdk-ui-kit", async () => {
    const actual = await vi.importActual<Record<string, unknown>>("@gooddata/sdk-ui-kit");
    return {
        ...actual,
        OverlayController: { getInstance: () => ({}) },
        OverlayControllerProvider: ({ children }: { children: React.ReactNode }) => children,
        ScrollablePanel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
        useToastMessage: () => ({ addSuccess: vi.fn(), addError: vi.fn() }),
    };
});

vi.mock("../../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: vi.fn((selector: () => unknown) => selector()),
}));

vi.mock("../../../../model/react/useDashboardAlerting/useDashboardAlerts.js", () => ({
    useDashboardAlerts: () => ({ onAlertingOpen: vi.fn() }),
}));

vi.mock("../../../../model/react/useDashboardAutomations/useDashboardAutomations.js", () => ({
    useDashboardAutomations: () => ({ refreshAutomations: vi.fn() }),
}));

vi.mock("../../../../model/store/automations/automationsSelectors.js", () => ({
    selectAllAutomationsCount: () => 1,
    selectAutomationsIsLoading: () => false,
    selectDashboardUserAutomationAlertsInContext: () => () => [
        { id: "alert-1", title: "Alert 1", alert: { trigger: { state: "ACTIVE" } } },
    ],
}));

vi.mock("../../../../model/store/catalog/catalogSelectors.js", () => ({
    selectCatalogDateDatasets: () => [],
}));

vi.mock("../../../../model/store/config/configSelectors.js", () => ({
    selectEnableComparisonInAlerting: () => false,
    selectLocale: () => "en-US",
}));

vi.mock("../../../../model/store/entitlements/entitlementsSelectors.js", () => ({
    selectEntitlementMaxAutomations: () => ({ value: "10" }),
    selectEntitlementUnlimitedAutomations: () => false,
}));

vi.mock("../../../../model/store/insights/insightsSelectors.js", () => ({
    selectInsightByWidgetRef: () => () => ({ insight: { identifier: "insight-1" } }),
}));

vi.mock("../../../../model/store/permissions/permissionsSelectors.js", () => ({
    selectCanCreateAutomation: () => true,
    selectCanManageWorkspace: () => true,
}));

vi.mock("../../../../model/store/ui/uiSelectors.js", () => ({
    selectExecutionTimestamp: () => undefined,
}));

vi.mock("../../../../model/store/user/userSelectors.js", () => ({
    selectCurrentUser: () => ({ login: "user" }),
}));

vi.mock("../../../automations/alerting/DefaultAlertingDialog/components/AlertDeleteDialog.js", () => ({
    AlertDeleteDialog: () => null,
}));

vi.mock("../../../automations/alerting/DefaultAlertingDialog/messages.js", () => ({
    messages: {
        alertPauseSuccess: { id: "alert.pause.success" },
        alertResumeSuccess: { id: "alert.resume.success" },
        alertSaveError: { id: "alert.save.error" },
        alertDeleteSuccess: { id: "alert.delete.success" },
        alertDeleteError: { id: "alert.delete.error" },
    },
}));

vi.mock("../../../automations/alerting/DefaultAlertingDialog/utils/items.js", () => ({
    getSupportedInsightMeasuresByInsight: () => [{ id: "measure-1" }],
}));

vi.mock("../../../automations/contexts/AutomationsContext.js", () => ({
    useAutomationsContext: () => fixtures.automationsContext,
    AutomationsContextProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("../../../automations/contexts/AlertingManagementDialogContext.js", () => ({
    useAlertingManagementDialogContext: () => fixtures.managementContext,
    AlertingManagementDialogContextProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("./InsightAlertConfig/hooks/useSaveAlertToBackend.js", () => ({
    useSaveAlertToBackend: () => ({
        handlePauseAlert: vi.fn(),
        handleResumeAlert: vi.fn(),
        isSavingAlert: false,
    }),
}));

vi.mock("./InsightAlertConfig/AlertsList.js", () => ({
    AlertsList: () => {
        useAutomationsContext();
        useAlertingManagementDialogContext();

        return <div>alerts list</div>;
    },
}));

vi.mock("./InsightAlertConfig/NoAvailableAlerts.js", () => ({
    NoAvailableMeasures: () => <div>no measures</div>,
}));

import { InsightAlertsNew } from "./InsightAlertsNew.js";

describe("InsightAlertsNew", () => {
    it("renders the alerts list when automation contexts are provided", () => {
        render(
            <InsightAlertsNew
                widget={{ ref: { identifier: "widget-1" }, localIdentifier: "widget-1" } as never}
                onClose={vi.fn()}
                onGoBack={vi.fn()}
            />,
        );

        expect(screen.getByText("alerts list")).toBeInTheDocument();
    });
});
