// (C) 2022-2026 GoodData Corporation

import { type ReactElement } from "react";

import { useDashboardAlerts } from "../../../model/react/useDashboardAlerting/useDashboardAlerts.js";
import { AlertingManagementDialog } from "../../automations/_staging/alerting/AlertingManagementDialog.js";
import {
    AlertingAutomationsProvider,
    AlertingConnector,
} from "../../automations/connectors/AlertingConnector.js";

export function AlertingDialogProvider() {
    return (
        <AlertingAutomationsProvider>
            <StagedManagementBridge />
            <AlertingConnector />
        </AlertingAutomationsProvider>
    );
}

/**
 * Renders the staged management dialog directly from Redux state.
 * This bridge is removed in PR5 when management migrates out of _staging and into AlertingConnector.
 */
function StagedManagementBridge(): ReactElement | null {
    const {
        isInitialized,
        isAlertManagementDialogOpen,
        automations,
        automationsLoading,
        automationsError,
        notificationChannels,
        onAlertingManagementClose,
        onAlertingManagementAdd,
        onAlertingManagementEdit,
        onAlertingManagementDeleteSuccess,
        onAlertingManagementDeleteError,
        onAlertingManagementPauseSuccess,
        onAlertingManagementPauseError,
    } = useDashboardAlerts();

    if (!isInitialized || !isAlertManagementDialogOpen) {
        return null;
    }

    return (
        <AlertingManagementDialog
            automations={automations}
            notificationChannels={notificationChannels}
            alertDataError={automationsError}
            isLoadingAlertingData={automationsLoading}
            onAdd={onAlertingManagementAdd}
            onEdit={onAlertingManagementEdit}
            onClose={onAlertingManagementClose}
            onDeleteSuccess={onAlertingManagementDeleteSuccess}
            onDeleteError={onAlertingManagementDeleteError}
            onPauseSuccess={onAlertingManagementPauseSuccess}
            onPauseError={onAlertingManagementPauseError}
        />
    );
}
