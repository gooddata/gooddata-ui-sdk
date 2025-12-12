// (C) 2022-2025 GoodData Corporation

import { useDashboardAlerts, useWorkspaceUsers } from "../../../model/index.js";
import { AlertingDialog, AlertingManagementDialog, type IAlertingDialogProps } from "../../alerting/index.js";

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
