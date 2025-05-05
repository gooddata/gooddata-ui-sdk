// (C) 2022-2025 GoodData Corporation
import { useCallback } from "react";
import { useToastMessage } from "@gooddata/sdk-ui-kit";
import { IAutomationMetadataObject, IWidget } from "@gooddata/sdk-model";
import { messages } from "../../../locales.js";
import { useDashboardAlertsCommands } from "./useDashboardAlertsCommands.js";
import { selectDashboardRef } from "../../store/index.js";
import { useDashboardSelector } from "../DashboardStoreProvider.js";
import { useDashboardAutomations } from "../useDashboardAutomations/useDashboardAutomations.js";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

/**
 * @internal
 */
export interface IUseDashboardAlertsManagementDialogProps {
    setAlertToEdit?: (automation?: IAutomationMetadataObject) => void;
}

/**
 * @internal
 */
export const useDashboardAlertsManagementDialog = () => {
    const { addSuccess, addError } = useToastMessage();

    const dashboardRef = useDashboardSelector(selectDashboardRef);

    const { closeAlertDialog, closeAlertsManagementDialog, openAlertDialog, openAlertsManagementDialog } =
        useDashboardAlertsCommands();

    const { refreshAutomations } = useDashboardAutomations();

    /*
     * exports and scheduling are not available when rendering a dashboard that is not persisted.
     * this can happen when a new dashboard is created and is being edited.
     *
     * the setup of menu items available in the menu needs to reflect this.
     */
    const defaultOnAlertingManagement = useCallback(() => {
        if (!dashboardRef) {
            return;
        }

        openAlertsManagementDialog();
    }, [dashboardRef, openAlertsManagementDialog]);

    // Open / Close
    const onAlertingManagementOpen = useCallback(() => {
        openAlertsManagementDialog();
    }, [openAlertsManagementDialog]);

    const onAlertingManagementClose = useCallback(() => {
        closeAlertsManagementDialog();
    }, [closeAlertsManagementDialog]);

    // Loading
    const onAlertingManagementLoadingError = useCallback(() => {
        closeAlertsManagementDialog();
        addError(messages.alertingManagementLoadError);
    }, [closeAlertsManagementDialog, addError]);

    // Create
    const onAlertingManagementAdd = useCallback(
        (widget?: IWidget) => {
            closeAlertDialog();
            openAlertDialog(widget);
        },
        [closeAlertDialog, openAlertDialog],
    );

    // Edit
    const onAlertingManagementEdit = useCallback(
        (alert: IAutomationMetadataObject, widget?: IWidget) => {
            closeAlertDialog();
            openAlertDialog(widget, alert);
        },
        [closeAlertDialog, openAlertDialog],
    );

    // Delete
    const onAlertingManagementDeleteSuccess = useCallback(() => {
        closeAlertDialog();
        addSuccess(messages.alertingDeleteSuccess);
        refreshAutomations();
    }, [addSuccess, closeAlertDialog, refreshAutomations]);

    const onAlertingManagementDeleteError = useCallback(() => {
        closeAlertDialog();
        addError(messages.alertingManagementDeleteError);
    }, [closeAlertDialog, addError]);

    // Pause
    const onAlertingManagementPauseSuccess = useCallback(
        (_alert: IAutomationMetadataObject, pause: boolean) => {
            closeAlertDialog();
            if (pause) {
                addSuccess(messages.alertingManagementPauseSuccess);
            } else {
                addSuccess(messages.alertingManagementActivateSuccess);
            }
            refreshAutomations();
        },
        [closeAlertDialog, addSuccess, refreshAutomations],
    );

    const onAlertingManagementPauseError = useCallback(
        (_error: GoodDataSdkError, pause: boolean) => {
            closeAlertDialog();
            if (pause) {
                addError(messages.alertingManagementPauseError);
            } else {
                addError(messages.alertingManagementActivateError);
            }
        },
        [closeAlertDialog, addError],
    );

    return {
        defaultOnAlertingManagement,
        onAlertingManagementOpen,
        onAlertingManagementClose,
        onAlertingManagementLoadingError,
        onAlertingManagementAdd,
        onAlertingManagementEdit,
        onAlertingManagementDeleteSuccess,
        onAlertingManagementDeleteError,
        onAlertingManagementPauseSuccess,
        onAlertingManagementPauseError,
    };
};
