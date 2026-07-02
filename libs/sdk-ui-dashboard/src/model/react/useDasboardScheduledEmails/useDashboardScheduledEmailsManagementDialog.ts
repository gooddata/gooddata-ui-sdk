// (C) 2022-2026 GoodData Corporation

import { useCallback } from "react";

import { type IAutomationMetadataObject, type IWidget } from "@gooddata/sdk-model";
import { useToastMessage } from "@gooddata/sdk-ui-kit";

import { messages } from "../../../locales.js";
import { selectDashboardRef } from "../../store/meta/metaSelectors.js";
import { selectIsScheduleEmailManagementDialogContext } from "../../store/ui/uiSelectors.js";
import { useDashboardSelector } from "../DashboardStoreProvider.js";
import { useDashboardAutomations } from "../useDashboardAutomations/useDashboardAutomations.js";

import { useDashboardScheduledEmailsCommands } from "./useDashboardScheduledEmailsCommands.js";

/**
 * @internal
 */
export const useDashboardScheduledEmailsManagementDialog = () => {
    const { addSuccess, addError } = useToastMessage();

    const dashboardRef = useDashboardSelector(selectDashboardRef);
    const managementDialogContext = useDashboardSelector(selectIsScheduleEmailManagementDialogContext);

    const {
        closeScheduleEmailingDialog,
        closeScheduleEmailingManagementDialog,
        openScheduleEmailingDialog,
        openScheduleEmailingManagementDialog,
    } = useDashboardScheduledEmailsCommands();

    const { refreshAutomationManagementItems } = useDashboardAutomations();

    const handleRefreshAutomations = useCallback(() => {
        refreshAutomationManagementItems();
    }, [refreshAutomationManagementItems]);

    /*
     * exports and scheduling are not available when rendering a dashboard that is not persisted.
     * this can happen when a new dashboard is created and is being edited.
     *
     * the setup of menu items available in the menu needs to reflect this.
     */
    const defaultOnScheduleEmailingManagement = useCallback(
        (widget?: IWidget) => {
            if (!dashboardRef) {
                return;
            }

            openScheduleEmailingManagementDialog(widget, "dashboard");
        },
        [dashboardRef, openScheduleEmailingManagementDialog],
    );

    // Open / Close
    const onScheduleEmailingManagementOpen = useCallback(
        (widget?: IWidget) => {
            openScheduleEmailingManagementDialog(widget, "widget");
        },
        [openScheduleEmailingManagementDialog],
    );

    const onScheduleEmailingManagementClose = useCallback(() => {
        closeScheduleEmailingManagementDialog();
    }, [closeScheduleEmailingManagementDialog]);

    // Loading
    const onScheduleEmailingManagementLoadingError = useCallback(() => {
        closeScheduleEmailingManagementDialog();
        addError(messages.scheduleManagementLoadError);
    }, [closeScheduleEmailingManagementDialog, addError]);

    // Create
    const onScheduleEmailingManagementAdd = useCallback(
        (targetWidget?: IWidget) => {
            const contextWidget = managementDialogContext.widgetRef
                ? ({ ref: managementDialogContext.widgetRef } as IWidget)
                : undefined;
            const widget = contextWidget ?? targetWidget;

            openScheduleEmailingDialog({ widget });
        },
        [managementDialogContext, openScheduleEmailingDialog],
    );

    // Edit
    const onScheduleEmailingManagementEdit = useCallback(
        (schedule: IAutomationMetadataObject, widget?: IWidget) => {
            openScheduleEmailingDialog({ widget, schedule });
        },
        [openScheduleEmailingDialog],
    );

    // Delete
    const onScheduleEmailingManagementDeleteSuccess = useCallback(() => {
        closeScheduleEmailingDialog();
        addSuccess(messages.scheduleEmailDeleteSuccess);
        handleRefreshAutomations();
    }, [addSuccess, closeScheduleEmailingDialog, handleRefreshAutomations]);

    const onScheduleEmailingManagementDeleteError = useCallback(() => {
        closeScheduleEmailingDialog();
        closeScheduleEmailingManagementDialog();
        addError(messages.scheduleManagementDeleteError);
    }, [closeScheduleEmailingDialog, closeScheduleEmailingManagementDialog, addError]);

    return {
        defaultOnScheduleEmailingManagement,
        onScheduleEmailingManagementOpen,
        onScheduleEmailingManagementClose,
        onScheduleEmailingManagementLoadingError,
        onScheduleEmailingManagementAdd,
        onScheduleEmailingManagementEdit,
        onScheduleEmailingManagementDeleteSuccess,
        onScheduleEmailingManagementDeleteError,
    };
};
