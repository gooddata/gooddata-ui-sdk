// (C) 2026 GoodData Corporation

import { type ReactElement, type ReactNode } from "react";

import {
    type IAutomationMetadataObject,
    type IInsight,
    type INotificationChannelIdentifier,
    type INotificationChannelMetadataObject,
    type IWidget,
    type IWorkspaceUser,
    isWidget,
} from "@gooddata/sdk-model";
import { type GoodDataSdkError } from "@gooddata/sdk-ui";

import { useDashboardAlerts } from "../../../model/react/useDashboardAlerting/useDashboardAlerts.js";
import { useWorkspaceUsers } from "../../../model/react/useWorkspaceUsers.js";
import { AlertingDialog } from "../alerting/AlertingDialog.js";
import { AlertingManagementDialog } from "../alerting/AlertingManagementDialog.js";
import { AlertingDialogContextProvider } from "../contexts/AlertingDialogContext.js";
import { AlertingManagementDialogContextProvider } from "../contexts/AlertingManagementDialogContext.js";
import { AutomationsContextProvider } from "../contexts/AutomationsContext.js";

import { useAutomationManagementEditRouting } from "./hooks/useAutomationManagementEditRouting.js";
import { useBuildAlertingDialogContext } from "./hooks/useBuildAlertingDialogContext.js";
import { useBuildAlertingManagementDialogContext } from "./hooks/useBuildAlertingManagementDialogContext.js";
import { useBuildAutomationsContext } from "./hooks/useBuildAutomationsContext.js";

type AlertsProps = ReturnType<typeof useDashboardAlerts>;

const EMPTY_USERS: IWorkspaceUser[] = [];

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
 * This is the primary bridge between dashboard store state and the alerting dialog tree. One
 * transitive exception remains: `useAutomationAlertParameters` (in `shared/automationFilters`) still
 * reads the store via `useDashboardSelector`, so alerting is not yet fully decoupled. That coupling is
 * an explicit carve-out frozen in the `automationFilters` allowlist of `.dependency-cruiser.js` (see
 * the note there); moving it behind this connector is tracked on GDP-3167.
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

    const managementCtx = useBuildAlertingManagementDialogContext();

    return (
        <AlertingManagementDialogContextProvider value={managementCtx}>
            {isAlertManagementDialogOpen ? (
                <AlertingManagementDialog
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
                <AlertingCreateEditConnector
                    alertToEdit={alertToEdit}
                    notificationChannels={notificationChannels}
                    widget={insightWidget}
                    insight={insight}
                    automationsLoading={automationsLoading}
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
    );
}

/**
 * Data and callbacks `AlertingCreateEditConnector` needs. These are the connector's own props, not
 * `IAlertingDialogProps` members: the data fields feed `useBuildAlertingDialogContext` (the dialog itself
 * now reads them from `AlertingDialogContext`), and the callbacks are forwarded to `AlertingDialog`
 * unchanged.
 */
interface IAlertingCreateEditConnectorProps {
    alertToEdit?: IAutomationMetadataObject;
    notificationChannels: INotificationChannelIdentifier[] | INotificationChannelMetadataObject[];
    widget?: IWidget;
    insight?: IInsight;
    automationsLoading: boolean;
    onCancel?: () => void;
    onError?: (error: GoodDataSdkError) => void;
    onSuccess?: (alertDefinition: IAutomationMetadataObject) => void;
    onSaveError?: (error: GoodDataSdkError) => void;
    onSaveSuccess?: (alert: IAutomationMetadataObject) => void;
    onDeleteSuccess?: (alert: IAutomationMetadataObject) => void;
    onDeleteError?: (error: GoodDataSdkError) => void;
}

/**
 * Loads workspace users and hydrates the alerting create/edit context. Both live here rather than in
 * the parent so that opening only the management dialog — which consumes neither — never dispatches the
 * workspace-users load.
 */
function AlertingCreateEditConnector(props: IAlertingCreateEditConnectorProps): ReactElement {
    const {
        alertToEdit,
        notificationChannels,
        widget,
        insight,
        automationsLoading,
        onCancel,
        onError,
        onSuccess,
        onSaveError,
        onSaveSuccess,
        onDeleteSuccess,
        onDeleteError,
    } = props;

    const { users, status: usersStatus, usersError } = useWorkspaceUsers();
    const isLoading = automationsLoading || usersStatus === "pending" || usersStatus === "loading";
    const effectiveUsers = users ?? EMPTY_USERS;

    const alertingCtx = useBuildAlertingDialogContext({
        mode: alertToEdit ? "edit" : "create",
        widget,
        insight,
        alertToEdit,
        users: effectiveUsers,
        usersError,
        notificationChannels,
        isLoading,
    });

    return (
        <AlertingDialogContextProvider value={alertingCtx}>
            <AlertingDialog
                onCancel={onCancel}
                onError={onError}
                onSuccess={onSuccess}
                onSaveError={onSaveError}
                onSaveSuccess={onSaveSuccess}
                onDeleteSuccess={onDeleteSuccess}
                onDeleteError={onDeleteError}
            />
        </AlertingDialogContextProvider>
    );
}
