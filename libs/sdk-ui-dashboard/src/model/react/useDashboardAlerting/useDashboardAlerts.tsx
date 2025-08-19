// (C) 2022-2025 GoodData Corporation
import { useDashboardAlertsData } from "./useDashboardAlertsData.js";
import { useDashboardAlertsDialog } from "./useDashboardAlertsDialog.js";
import { useDashboardAlertsManagementDialog } from "./useDashboardAlertsManagementDialog.js";
import { selectAlertingDialogContext } from "../../../model/store/ui/uiSelectors.js";
import { useDashboardSelector } from "../DashboardStoreProvider.js";

/**
 * Hook that handles alert dialogs.
 *
 * @alpha
 */
export const useDashboardAlerts = () => {
    const alertingContext = useDashboardSelector(selectAlertingDialogContext);
    const alertToEdit = alertingContext?.alert;

    const {
        // Data
        isInitialized,
        automations,
        automationsLoading,
        automationsError,
        automationsCount,
        notificationChannels,
        numberOfAvailableDestinations,
        widget,
        insight,
        // Single Alert Dialog
        isAlertingVisible,
        isAlertDialogOpen,
        // List / Management Dialog
        isAlertManagementVisible,
        isAlertManagementDialogOpen,
    } = useDashboardAlertsData({ alertToEdit });

    const {
        defaultOnAlerting,
        onAlertingOpen,
        onAlertingCancel,
        onAlertingCreateError,
        onAlertingCreateSuccess,
        onAlertingSaveError,
        onAlertingSaveSuccess,
    } = useDashboardAlertsDialog();

    const {
        defaultOnAlertingManagement,
        onAlertingManagementAdd,
        onAlertingManagementClose,
        onAlertingManagementDeleteError,
        onAlertingManagementDeleteSuccess,
        onAlertingManagementEdit,
        onAlertingManagementLoadingError,
        onAlertingManagementOpen,
        onAlertingManagementPauseSuccess,
        onAlertingManagementPauseError,
    } = useDashboardAlertsManagementDialog();

    return {
        // Data
        alertToEdit,
        isInitialized,
        notificationChannels,
        automations,
        automationsCount,
        numberOfAvailableDestinations,
        widget,
        insight,
        automationsLoading,
        automationsError,
        // Single Alert Dialog
        isAlertingVisible,
        isAlertDialogOpen,
        defaultOnAlerting,
        onAlertingOpen,
        onAlertingCancel,
        onAlertingCreateError,
        onAlertingCreateSuccess,
        onAlertingSaveError,
        onAlertingSaveSuccess,
        // List / Management Dialog
        isAlertManagementVisible,
        isAlertManagementDialogOpen,
        defaultOnAlertingManagement,
        onAlertingManagementOpen,
        onAlertingManagementClose,
        onAlertingManagementAdd,
        onAlertingManagementDeleteError,
        onAlertingManagementDeleteSuccess,
        onAlertingManagementEdit,
        onAlertingManagementLoadingError,
        onAlertingManagementPauseSuccess,
        onAlertingManagementPauseError,
    };
};
