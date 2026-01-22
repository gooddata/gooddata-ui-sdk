// (C) 2022-2026 GoodData Corporation

import { useDashboardAlertsOld } from "../../../model/react/useDashboardAlertsOld.js";
import { DefaultAlertingDialogOld } from "../../alerting/DefaultAlertingDialog/DefaultAlertingDialogOld.js";
import { DefaultAlertingManagementDialogOld } from "../../alerting/DefaultAlertingManagementDialog/DefaultAlertingManagementDialogOld.js";

export function AlertingDialogProviderOld() {
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
}
