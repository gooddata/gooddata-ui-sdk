// (C) 2022-2025 GoodData Corporation
import { useCallback } from "react";

import { IAutomationMetadataObject, IWidget } from "@gooddata/sdk-model";
import { GoodDataSdkError } from "@gooddata/sdk-ui";
import { useToastMessage } from "@gooddata/sdk-ui-kit";

import { useDashboardAlertsCommands } from "./useDashboardAlertsCommands.js";
import { messages } from "../../../locales.js";
import {
    selectDashboardRef,
    selectEnableAutomationManagement,
    selectIsAlertingManagementDialogContext,
} from "../../store/index.js";
import { useDashboardSelector } from "../DashboardStoreProvider.js";
import { useDashboardAutomations } from "../useDashboardAutomations/useDashboardAutomations.js";

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
    const enableAutomationManagement = useDashboardSelector(selectEnableAutomationManagement);
    const managementDialogContext = useDashboardSelector(selectIsAlertingManagementDialogContext);

    const { closeAlertDialog, closeAlertsManagementDialog, openAlertDialog, openAlertsManagementDialog } =
        useDashboardAlertsCommands();

    const { refreshAutomations, refreshAutomationManagementItems } = useDashboardAutomations();

    const handleRefreshAutomations = useCallback(() => {
        if (enableAutomationManagement) {
            refreshAutomationManagementItems();
        }
        refreshAutomations();
    }, [enableAutomationManagement, refreshAutomations, refreshAutomationManagementItems]);

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
    const onAlertingManagementOpen = useCallback(
        (widget?: IWidget) => {
            openAlertsManagementDialog(widget);
        },
        [openAlertsManagementDialog],
    );

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
        (targetWidget?: IWidget) => {
            const contextWidget = managementDialogContext.widgetRef
                ? ({ ref: managementDialogContext.widgetRef } as IWidget)
                : undefined;
            const widget = contextWidget ?? targetWidget;

            closeAlertDialog();
            openAlertDialog(widget);
        },
        [closeAlertDialog, openAlertDialog, managementDialogContext],
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
        handleRefreshAutomations();
    }, [addSuccess, closeAlertDialog, handleRefreshAutomations]);

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
            handleRefreshAutomations();
        },
        [closeAlertDialog, addSuccess, handleRefreshAutomations],
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
