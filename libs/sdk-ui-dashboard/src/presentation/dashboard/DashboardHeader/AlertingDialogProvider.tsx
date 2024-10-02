// (C) 2022-2024 GoodData Corporation

import React from "react";

import { AlertingDialog, AlertingManagementDialog } from "../../alerting/index.js";

import { useDashboardAlerts } from "../../../model/index.js";

export const AlertingDialogProvider = () => {
    const {
        isInitialized,
        automations,
        alertingLoadError,
        alertingToEdit,
        isAlertingLoading,
        isAlertingManagementDialogOpen,
        isAlertingDialogOpen,
        onAlertingManagementEdit,
        onAlertingManagementClose,
        onAlertingManagementDeleteSuccess,
        onAlertingManagementDeleteError,
        onAlertingManagementPauseSuccess,
        onAlertingManagementPauseError,
        onAlertingCancel,
        onAlertingUpdate,
    } = useDashboardAlerts();

    if (!isInitialized) {
        return null;
    }

    return (
        <>
            {isAlertingManagementDialogOpen ? (
                <AlertingManagementDialog
                    isVisible={isAlertingManagementDialogOpen}
                    onEdit={onAlertingManagementEdit}
                    onClose={onAlertingManagementClose}
                    onDeleteSuccess={onAlertingManagementDeleteSuccess}
                    onDeleteError={onAlertingManagementDeleteError}
                    onPauseSuccess={onAlertingManagementPauseSuccess}
                    onPauseError={onAlertingManagementPauseError}
                    isLoadingAlertingData={isAlertingLoading}
                    automations={automations}
                    alertingDataError={alertingLoadError}
                />
            ) : null}
            {isAlertingDialogOpen ? (
                <AlertingDialog
                    anchorEl={alertingToEdit?.anchor}
                    editAlert={alertingToEdit?.alert}
                    editWidget={alertingToEdit?.widget}
                    isVisible={isAlertingDialogOpen}
                    onCancel={onAlertingCancel}
                    onUpdate={onAlertingUpdate}
                />
            ) : null}
        </>
    );
};
