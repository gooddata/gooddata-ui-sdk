// (C) 2022-2025 GoodData Corporation

import React from "react";

import { AlertingDialog, AlertingManagementDialog, IAlertingDialogProps } from "../../alerting/index.js";
import { useDashboardAlerts, useAlertFilters, useWorkspaceUsers } from "../../../model/index.js";

export const AlertingDialogProviderNew = () => {
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

    const { widgetFilters, widgetFiltersError, widgetFiltersLoading } = useAlertFilters({
        alertToEdit,
        widget,
        insight,
    });

    const isLoading = [widgetFiltersLoading, automationsLoading].some(Boolean);
    const loadingError = [widgetFiltersError, automationsError].find(Boolean);

    if (!isInitialized) {
        return null;
    }

    return (
        <>
            {isAlertManagementDialogOpen ? (
                <AlertingManagementDialog
                    automations={automations}
                    notificationChannels={notificationChannels}
                    alertDataError={loadingError}
                    isLoadingAlertingData={isLoading}
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
                    widgetFilters={widgetFilters}
                    isLoading={isLoading}
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
};

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
