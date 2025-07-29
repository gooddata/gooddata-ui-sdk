// (C) 2022-2025 GoodData Corporation
import { useCallback } from "react";
import { useToastMessage } from "@gooddata/sdk-ui-kit";
import { IAutomationMetadataObject, IWidget } from "@gooddata/sdk-model";
import { messages } from "../../../locales.js";
import { useDashboardScheduledEmailsCommands } from "./useDashboardScheduledEmailsCommands.js";
import { selectDashboardRef } from "../../store/index.js";
import { useDashboardSelector } from "../DashboardStoreProvider.js";
import { useDashboardAutomations } from "../useDashboardAutomations/useDashboardAutomations.js";

/**
 * @internal
 */
export interface IUseDashboardScheduledEmailsManagementDialogProps {
    setShouldReturnToManagementDialog: (value: boolean) => void;
}

/**
 * @internal
 */
export const useDashboardScheduledEmailsManagementDialog = ({
    setShouldReturnToManagementDialog,
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
        setShouldReturnToManagementDialog(false);
    }, [closeScheduleEmailingManagementDialog, setShouldReturnToManagementDialog]);

    // Loading
    const onScheduleEmailingManagementLoadingError = useCallback(() => {
        closeScheduleEmailingManagementDialog();
        addError(messages.scheduleManagementLoadError);
    }, [closeScheduleEmailingManagementDialog, addError]);

    // Create
    const onScheduleEmailingManagementAdd = useCallback(
        (widget?: IWidget) => {
            setShouldReturnToManagementDialog(true);
            closeScheduleEmailingManagementDialog();
            openScheduleEmailingDialog({ widget });
        },
        [
            setShouldReturnToManagementDialog,
            closeScheduleEmailingManagementDialog,
            openScheduleEmailingDialog,
        ],
    );

    // Edit
    const onScheduleEmailingManagementEdit = useCallback(
        (schedule: IAutomationMetadataObject, widget?: IWidget) => {
            setShouldReturnToManagementDialog(true);
            closeScheduleEmailingManagementDialog();
            openScheduleEmailingDialog({ widget, schedule });
        },
        [
            closeScheduleEmailingManagementDialog,
            openScheduleEmailingDialog,
            setShouldReturnToManagementDialog,
        ],
    );

    // Delete
    const onScheduleEmailingManagementDeleteSuccess = useCallback(() => {
        closeScheduleEmailingDialog();
        addSuccess(messages.scheduleEmailDeleteSuccess);
        refreshAutomations();
    }, [addSuccess, closeScheduleEmailingDialog, refreshAutomations]);

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
