// (C) 2022-2024 GoodData Corporation
import { useCallback } from "react";
import { useToastMessage } from "@gooddata/sdk-ui-kit";
import { IAutomationMetadataObject, IWidget } from "@gooddata/sdk-model";
import { messages } from "../../../locales.js";
import { useDashboardScheduledEmailsCommands } from "./useDashboardScheduledEmailsCommands.js";
import { selectDashboardRef } from "../../store/index.js";
import { useDashboardSelector } from "../DashboardStoreProvider.js";
import { useDashboardAutomations } from "./useDashboardAutomations.js";

/**
 * @internal
 */
export interface IUseDashboardScheduledEmailsManagementDialogProps {
    setScheduledExportToEdit: (automation?: IAutomationMetadataObject) => void;
}

/**
 * @internal
 */
export const useDashboardScheduledEmailsManagementDialog = ({
    setScheduledExportToEdit,
}: IUseDashboardScheduledEmailsManagementDialogProps) => {
    const { addSuccess, addError } = useToastMessage();

    const dashboardRef = useDashboardSelector(selectDashboardRef);

    const {
        closeScheduleEmailingDialog,
        closeScheduleEmailingManagementDialog,
        openScheduleEmailingDialog,
        openScheduleEmailingManagementDialog,
    } = useDashboardScheduledEmailsCommands();

    const { refreshAutomations } = useDashboardAutomations();

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

            openScheduleEmailingManagementDialog(widget);
        },
        [dashboardRef, openScheduleEmailingManagementDialog],
    );

    // Open / Close
    const onScheduleEmailingManagementOpen = useCallback(
        (widget?: IWidget) => {
            openScheduleEmailingManagementDialog(widget);
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
        (widget?: IWidget) => {
            closeScheduleEmailingManagementDialog();
            openScheduleEmailingDialog(widget);
        },
        [closeScheduleEmailingManagementDialog, openScheduleEmailingDialog],
    );

    // Edit
    const onScheduleEmailingManagementEdit = useCallback(
        (schedule: IAutomationMetadataObject, widget?: IWidget) => {
            closeScheduleEmailingManagementDialog();
            setScheduledExportToEdit(schedule);
            openScheduleEmailingDialog(widget);
        },
        [closeScheduleEmailingManagementDialog, openScheduleEmailingDialog, setScheduledExportToEdit],
    );

    // Delete
    const onScheduleEmailingManagementDeleteSuccess = useCallback(() => {
        setScheduledExportToEdit(undefined);
        closeScheduleEmailingDialog();
        addSuccess(messages.scheduleEmailDeleteSuccess);
        refreshAutomations();
    }, [addSuccess, closeScheduleEmailingDialog, refreshAutomations, setScheduledExportToEdit]);

    const onScheduleEmailingManagementDeleteError = useCallback(() => {
        setScheduledExportToEdit(undefined);
        closeScheduleEmailingDialog();
        closeScheduleEmailingManagementDialog();
        addError(messages.scheduleManagementDeleteError);
    }, [
        setScheduledExportToEdit,
        closeScheduleEmailingDialog,
        closeScheduleEmailingManagementDialog,
        addError,
    ]);

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
