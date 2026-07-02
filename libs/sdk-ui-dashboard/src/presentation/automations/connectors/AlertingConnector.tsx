// (C) 2026 GoodData Corporation

import { type ReactElement, type ReactNode } from "react";

import { isWidget } from "@gooddata/sdk-model";

import { useDashboardAlerts } from "../../../model/react/useDashboardAlerting/useDashboardAlerts.js";
import { useWorkspaceUsers } from "../../../model/react/useWorkspaceUsers.js";
import { AlertingDialog } from "../alerting/AlertingDialog.js";
import { AlertingManagementDialog } from "../alerting/AlertingManagementDialog.js";
import { type IAlertingDialogProps } from "../alerting/types.js";
import { AlertingDialogContextProvider } from "../contexts/AlertingDialogContext.js";
import { AlertingManagementDialogContextProvider } from "../contexts/AlertingManagementDialogContext.js";
import { AutomationsContextProvider } from "../contexts/AutomationsContext.js";

import { useAutomationManagementEditRouting } from "./hooks/useAutomationManagementEditRouting.js";
import { useBuildAlertingDialogContext } from "./hooks/useBuildAlertingDialogContext.js";
import { useBuildAlertingManagementDialogContext } from "./hooks/useBuildAlertingManagementDialogContext.js";
import { useBuildAutomationsContext } from "./hooks/useBuildAutomationsContext.js";

type AlertsProps = ReturnType<typeof useDashboardAlerts>;

/**
 * Provides AutomationsContext to its children, built from dashboard Redux state.
 * Wraps the alerting dialog subtree (both the create/edit and management dialogs reach
 * AutomationsContext through this provider).
 *
 * @internal
 */
export function AlertingAutomationsProvider({ children }: { children: ReactNode }): ReactElement {
    const automationsCtx = useBuildAutomationsContext();
    return <AutomationsContextProvider value={automationsCtx}>{children}</AutomationsContextProvider>;
}

/**
 * Connector component that reads from the dashboard Redux store and wires up
 * the alerting dialog tree (create/edit and management) via context providers.
 *
 * This is the primary bridge between dashboard store state and the alerting
 * dialog tree. One transitive exception remains: useAutomationAlertParameters
 * (in shared/automationFilters) still reads the store via useDashboardSelector,
 * so alerting is not yet fully decoupled. That coupling is an explicit
 * carve-out frozen in the `automationFilters` allowlist of .dependency-cruiser.js
 * (see the GDP-3167 note there) and is tracked for a Phase 3 move behind this
 * connector.
 *
 * AutomationsContext is provided by AlertingAutomationsProvider, which wraps this
 * connector (see AlertingDialogProvider).
 *
 * @internal
 */
export function AlertingConnector(): ReactElement | null {
    const alerts = useDashboardAlerts();
    if (!alerts.isInitialized) {
        return null;
    }
    return <AlertingConnectorInitialized {...alerts} />;
}

function AlertingConnectorInitialized(alerts: AlertsProps): ReactElement | null {
    const { isAlertDialogOpen, isAlertManagementDialogOpen } = alerts;

    // Defer store reads and user loading until at least one dialog is open.
    if (!isAlertDialogOpen && !isAlertManagementDialogOpen) {
        return null;
    }
    return <AlertingConnectorWithData alerts={alerts} />;
}

function AlertingConnectorWithData({ alerts }: { alerts: AlertsProps }): ReactElement {
    const {
        // Shared Local State
        alertToEdit,
        // Data
        automations,
        automationsError,
        automationsLoading,
        notificationChannels,
        // Single Alert Dialog
        isAlertDialogOpen,
        onAlertingCancel,
        onAlertingCreateSuccess,
        onAlertingCreateError,
        onAlertingSaveSuccess,
        onAlertingSaveError,
        // Management / List Dialog
        isAlertManagementDialogOpen,
        onAlertingManagementClose,
        onAlertingManagementAdd,
        onAlertingManagementEdit,
        onAlertingManagementDeleteSuccess,
        onAlertingManagementDeleteError,
        onAlertingManagementPauseSuccess,
        onAlertingManagementPauseError,
        widget,
        insight,
    } = alerts;

    const handleManagementEdit = useAutomationManagementEditRouting(onAlertingManagementEdit);

    const insightWidget = isWidget(widget) ? widget : undefined;

    const alertingCtx = useBuildAlertingDialogContext({
        mode: alertToEdit ? "edit" : "create",
        widget: insightWidget,
        insight,
    });

    const managementCtx = useBuildAlertingManagementDialogContext();

    const isManagementLoading = automationsLoading;

    return (
        <AlertingDialogContextProvider value={alertingCtx}>
            <AlertingManagementDialogContextProvider value={managementCtx}>
                {isAlertManagementDialogOpen ? (
                    // TODO(GDP-3167 phase3): automations, notificationChannels, and alertDataError
                    // are still prop-threaded here because DefaultAlertingManagementDialog reads
                    // them from props, not from AutomationsContext. Once all dialog fields are
                    // migrated to read from context, remove these props and the corresponding prop types.
                    <AlertingManagementDialog
                        automations={automations}
                        notificationChannels={notificationChannels}
                        alertDataError={automationsError}
                        isLoadingAlertingData={isManagementLoading}
                        onAdd={onAlertingManagementAdd}
                        onEdit={handleManagementEdit}
                        onClose={onAlertingManagementClose}
                        onDeleteSuccess={onAlertingManagementDeleteSuccess}
                        onDeleteError={onAlertingManagementDeleteError}
                        onPauseSuccess={onAlertingManagementPauseSuccess}
                        onPauseError={onAlertingManagementPauseError}
                    />
                ) : null}
                {isAlertDialogOpen ? (
                    // TODO(GDP-3167 phase3): notificationChannels, users, usersError, and isLoading
                    // are still prop-threaded here because DefaultAlertingDialog reads them from props,
                    // not from AutomationsContext. Once all dialog fields are migrated to read from
                    // context, remove these props and the corresponding prop types.
                    <AlertingDialogWithUsers
                        alertToEdit={alertToEdit}
                        notificationChannels={notificationChannels}
                        widget={insightWidget}
                        insight={insight}
                        isLoading={automationsLoading}
                        onCancel={onAlertingCancel}
                        onError={onAlertingCreateError}
                        onSuccess={onAlertingCreateSuccess}
                        onSaveError={onAlertingSaveError}
                        onSaveSuccess={onAlertingSaveSuccess}
                        onDeleteSuccess={onAlertingManagementDeleteSuccess}
                        onDeleteError={onAlertingManagementDeleteError}
                    />
                ) : null}
            </AlertingManagementDialogContextProvider>
        </AlertingDialogContextProvider>
    );
}

/**
 * Loads workspace users only while the create/edit dialog is mounted. Keeping the
 * `useWorkspaceUsers()` call in this child (rather than in AlertingConnectorWithData) means that
 * opening only the management dialog — which does not consume users — never dispatches the
 * workspace-users load, matching the pre-separation behavior.
 */
function AlertingDialogWithUsers(props: Omit<IAlertingDialogProps, "users" | "usersError">): ReactElement {
    const { users, status: usersStatus, usersError } = useWorkspaceUsers();

    return (
        <AlertingDialog
            {...props}
            users={users ?? []}
            usersError={usersError}
            isLoading={props.isLoading || usersStatus === "pending" || usersStatus === "loading"}
        />
    );
}
