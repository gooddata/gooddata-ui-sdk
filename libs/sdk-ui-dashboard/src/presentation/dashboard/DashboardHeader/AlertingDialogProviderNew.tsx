// (C) 2022-2026 GoodData Corporation

import { useDashboardAlerts } from "../../../model/react/useDashboardAlerting/useDashboardAlerts.js";
import { useWorkspaceUsers } from "../../../model/react/useWorkspaceUsers.js";
import { AlertingDialog } from "../../alerting/AlertingDialog.js";
import { AlertingManagementDialog } from "../../alerting/AlertingManagementDialog.js";
import { type IAlertingDialogProps } from "../../alerting/types.js";

export function AlertingDialogProviderNew() {
    const {
        // Shared Local State
        alertToEdit,
        // Data
        isInitialized,
        widget,
        insight,
        automations,
        automationsLoading,
        automationsError,
        notificationChannels,
        // Single Schedule Dialog
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
    } = useDashboardAlerts();

    if (!isInitialized) {
        return null;
    }

    return (
        <>
            {isAlertManagementDialogOpen ? (
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
            ) : null}
            {isAlertDialogOpen ? (
                <AlertingDialogWithUsers
                    alertToEdit={alertToEdit}
                    notificationChannels={notificationChannels}
                    widget={widget}
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
        </>
    );
}

/**
 * Load users only if dialog is open
 */
function AlertingDialogWithUsers(props: Omit<IAlertingDialogProps, "users">) {
    const { users, status: usersStatus, usersError } = useWorkspaceUsers();

    return (
        <AlertingDialog
            {...props}
            users={users ?? []}
            isLoading={props.isLoading || usersStatus === "pending" || usersStatus === "loading"}
            usersError={usersError}
        />
    );
}
