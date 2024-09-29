// (C) 2022-2024 GoodData Corporation
import { useCallback } from "react";
import { useToastMessage } from "@gooddata/sdk-ui-kit";
import { IAutomationMetadataObject, IWidget } from "@gooddata/sdk-model";
import { messages } from "../../../locales.js";
import { useDashboardScheduledEmailsCommands } from "./useDashboardScheduledEmailsCommands.js";
import { useDashboardSelector } from "../DashboardStoreProvider.js";
import { selectDashboardRef } from "../../store/index.js";
import { useDashboardAutomations } from "./useDashboardAutomations.js";

/**
 * @internal
 */
export interface IUseDashboardScheduledEmailsDialogProps {
    setScheduledExportToEdit: (automation?: IAutomationMetadataObject) => void;
}

/**
 * @internal
 */
export const useDashboardScheduledEmailsDialog = ({
    setScheduledExportToEdit,
}: IUseDashboardScheduledEmailsDialogProps) => {
    const { addSuccess, addError } = useToastMessage();

    const dashboardRef = useDashboardSelector(selectDashboardRef);

    const { closeScheduleEmailingDialog, openScheduleEmailingDialog, openScheduleEmailingManagementDialog } =
        useDashboardScheduledEmailsCommands();

    const { refreshAutomations } = useDashboardAutomations();

    /*
     * exports and scheduling are not available when rendering a dashboard that is not persisted.
     * this can happen when a new dashboard is created and is being edited.
     *
     * the setup of menu items available in the menu needs to reflect this.
     */
    const defaultOnScheduleEmailing = useCallback(
        (widget?: IWidget) => {
            if (!dashboardRef) {
                return;
            }

            openScheduleEmailingDialog(widget);
        },
        [dashboardRef, openScheduleEmailingDialog],
    );

    // Open / Close
    const onScheduleEmailingOpen = useCallback(
        (widget?: IWidget) => {
            openScheduleEmailingDialog(widget);
        },
        [openScheduleEmailingDialog],
    );

    const onScheduleEmailingCancel = useCallback(
        (widget?: IWidget) => {
            closeScheduleEmailingDialog();
            setScheduledExportToEdit(undefined);
            openScheduleEmailingManagementDialog(widget);
        },
        [closeScheduleEmailingDialog, openScheduleEmailingManagementDialog, setScheduledExportToEdit],
    );

    // Create
    const onScheduleEmailingCreateSuccess = useCallback(
        (widget?: IWidget) => {
            closeScheduleEmailingDialog();
            openScheduleEmailingManagementDialog(widget);
            addSuccess(messages.scheduleEmailSubmitSuccess);
            refreshAutomations();
        },
        [closeScheduleEmailingDialog, openScheduleEmailingManagementDialog, addSuccess, refreshAutomations],
    );

    const onScheduleEmailingCreateError = useCallback(() => {
        closeScheduleEmailingDialog();
        addError(messages.scheduleEmailSubmitError);
    }, [closeScheduleEmailingDialog, addError]);

    // Edit
    const onScheduleEmailingSaveSuccess = useCallback(
        (widget?: IWidget) => {
            closeScheduleEmailingDialog();
            openScheduleEmailingManagementDialog(widget);
            addSuccess(messages.scheduleEmailSaveSuccess);
            setScheduledExportToEdit(undefined);
            refreshAutomations();
        },
        [
            closeScheduleEmailingDialog,
            openScheduleEmailingManagementDialog,
            addSuccess,
            setScheduledExportToEdit,
            refreshAutomations,
        ],
    );

    const onScheduleEmailingSaveError = useCallback(() => {
        closeScheduleEmailingDialog();
        addError(messages.scheduleEmailSaveError);
        setScheduledExportToEdit(undefined);
    }, [closeScheduleEmailingDialog, addError, setScheduledExportToEdit]);

    return {
        defaultOnScheduleEmailing,
        onScheduleEmailingOpen,
        onScheduleEmailingCancel,
        onScheduleEmailingCreateError,
        onScheduleEmailingCreateSuccess,
        onScheduleEmailingSaveError,
        onScheduleEmailingSaveSuccess,
    };
};
