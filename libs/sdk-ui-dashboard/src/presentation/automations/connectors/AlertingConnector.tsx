// (C) 2026 GoodData Corporation

import { type ReactElement, type ReactNode } from "react";

import { isWidget } from "@gooddata/sdk-model";

import { useDashboardAlerts } from "../../../model/react/useDashboardAlerting/useDashboardAlerts.js";
import { useWorkspaceUsers } from "../../../model/react/useWorkspaceUsers.js";
import { AlertingDialog } from "../alerting/AlertingDialog.js";
import { type IAlertingDialogProps } from "../alerting/types.js";
import { AlertingDialogContextProvider } from "../contexts/AlertingDialogContext.js";
import { AutomationsContextProvider } from "../contexts/AutomationsContext.js";

import { useBuildAlertingDialogContext } from "./hooks/useBuildAlertingDialogContext.js";
import { useBuildAutomationsContext } from "./hooks/useBuildAutomationsContext.js";

type AlertsProps = ReturnType<typeof useDashboardAlerts>;

/**
 * Provides AutomationsContext to its children, built from dashboard Redux state.
 * Use this to wrap alerting dialog subtrees that need access to automation data
 * (e.g. the management dialog bridge in AlertingDialogProvider).
 *
 * @internal
 */
export function AlertingAutomationsProvider({ children }: { children: ReactNode }): ReactElement {
    const automationsCtx = useBuildAutomationsContext();
    return <AutomationsContextProvider value={automationsCtx}>{children}</AutomationsContextProvider>;
}

/**
 * Connector component that reads from the dashboard Redux store and wires up
 * the alerting dialog tree via context providers.
 *
 * This is the primary bridge between dashboard store state and the alerting
 * dialog tree. One transitive exception remains: useAutomationAlertParameters
 * (in shared/automationFilters) still reads the store via useDashboardSelector,
 * so alerting is not yet fully decoupled. That coupling is an explicit
 * carve-out frozen in the `automationFilters` allowlist of .dependency-cruiser.js
 * (see the GDP-3167 note there) and is tracked for a Phase 3 move behind this
 * connector.
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
    if (!alerts.isAlertDialogOpen) {
        return null;
    }
    return <AlertingConnectorWithData alerts={alerts} />;
}

function AlertingConnectorWithData({ alerts }: { alerts: AlertsProps }): ReactElement {
    const {
        alertToEdit,
        automationsLoading,
        notificationChannels,
        isAlertDialogOpen,
        onAlertingCancel,
        onAlertingCreateSuccess,
        onAlertingCreateError,
        onAlertingSaveSuccess,
        onAlertingSaveError,
        onAlertingManagementDeleteSuccess,
        onAlertingManagementDeleteError,
        widget,
        insight,
    } = alerts;

    const insightWidget = isWidget(widget) ? widget : undefined;

    const alertingCtx = useBuildAlertingDialogContext({
        mode: alertToEdit ? "edit" : "create",
        widget: insightWidget,
        insight,
    });

    return (
        <AlertingDialogContextProvider value={alertingCtx}>
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
