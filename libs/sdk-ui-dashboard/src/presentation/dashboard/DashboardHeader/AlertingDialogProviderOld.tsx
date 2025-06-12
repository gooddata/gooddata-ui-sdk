// (C) 2022-2025 GoodData Corporation

import React from "react";

import { DefaultAlertingDialogOld, DefaultAlertingManagementDialogOld } from "../../alerting/index.js";
import { useDashboardAlertsOld } from "../../../model/index.js";

export const AlertingDialogProviderOld = () => {
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
    } = useDashboardAlertsOld();

    if (!isInitialized) {
        return null;
    }

    return (
        <>
            {isAlertingManagementDialogOpen ? (
                <DefaultAlertingManagementDialogOld
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
                <DefaultAlertingDialogOld
                    anchorEl={alertingToEdit?.anchor}
                    editAlert={alertingToEdit?.alert}
                    editWidget={alertingToEdit?.widget}
                    onCancel={onAlertingCancel}
                    onUpdate={onAlertingUpdate}
                />
            ) : null}
        </>
    );
};
