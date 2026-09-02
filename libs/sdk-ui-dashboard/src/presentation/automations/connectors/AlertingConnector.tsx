// (C) 2026 GoodData Corporation

import { type ReactElement, type ReactNode } from "react";

import {
    type IAutomationMetadataObject,
    type IInsight,
    type INotificationChannelIdentifier,
    type INotificationChannelMetadataObject,
    type IWidget,
    isWidget,
} from "@gooddata/sdk-model";
import { type GoodDataSdkError } from "@gooddata/sdk-ui";

import { useDashboardAlerts } from "../../../model/react/useDashboardAlerting/useDashboardAlerts.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/DashboardComponentsContext.js";
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

/**
 * Provides AutomationsContext to its children, built from dashboard Redux state, with the
 * resolved context decorator mounted directly inside — so everything in the alerting dialog
 * subtree (both the create/edit and management dialogs) reads the decorated value.
 *
 * @internal
 */
export function AlertingAutomationsProvider({ children }: { children: ReactNode }): ReactElement {
    const automationsCtx = useBuildAutomationsContext();
    const { AutomationsContextDecoratorComponent } = useDashboardComponentsContext();
    return (
        <AutomationsContextProvider value={automationsCtx}>
            <AutomationsContextDecoratorComponent>{children}</AutomationsContextDecoratorComponent>
        </AutomationsContextProvider>
    );
}

/**
 * Connector component that reads from the dashboard Redux store and wires up
 * the alerting dialog tree (create/edit and management) via context providers.
 *
 * This is the bridge between dashboard store state and the alerting dialog tree, with no exceptions:
 * the shared `automationFilters` hooks read AutomationsContext and take their widget-scoped values as
 * props from this connector's `AlertingDialogContext`. The `automationFilters` allowlist in
 * `.dependency-cruiser.js` no longer permits any store selector.
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

    // Defer store reads until at least one dialog is open.
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
 * Hydrates the alerting create/edit context. Lives here rather than in the parent so that opening only
 * the management dialog — which does not consume it — skips the work.
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

    const alertingCtx = useBuildAlertingDialogContext({
        mode: alertToEdit ? "edit" : "create",
        widget,
        insight,
        alertToEdit,
        notificationChannels,
        isLoading: automationsLoading,
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
