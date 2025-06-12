// (C) 2022-2025 GoodData Corporation
import { useState } from "react";
import { IAutomationMetadataObject } from "@gooddata/sdk-model";
import { useDashboardScheduledEmailsData } from "./useDashboardScheduledEmailsData.js";
import { useDashboardScheduledEmailsDialog } from "./useDashboardScheduledEmailsDialog.js";
import { useDashboardScheduledEmailsManagementDialog } from "./useDashboardScheduledEmailsManagementDialog.js";

/**
 * Hook that handles schedule emailing dialogs.
 *
 * @alpha
 */
export const useDashboardScheduledEmails = () => {
    /**
     * Active selected scheduled export to be edited in the dialog (is available only for editing, is not used for creation)
     */
    const [scheduledExportToEdit, setScheduledExportToEdit] = useState<IAutomationMetadataObject>();

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
        // Single Schedule Dialog
        isScheduledEmailingVisible,
        isScheduleEmailingDialogOpen,
        // List / Management Dialog
        isScheduledManagementEmailingVisible,
        isScheduleEmailingManagementDialogOpen,
    } = useDashboardScheduledEmailsData({ scheduledExportToEdit });

    const {
        defaultOnScheduleEmailing,
        onScheduleEmailingCancel,
        onScheduleEmailingBack,
        onScheduleEmailingCreateError,
        onScheduleEmailingCreateSuccess,
        onScheduleEmailingOpen,
        onScheduleEmailingSaveError,
        onScheduleEmailingSaveSuccess,
        setShouldReturnToManagementDialog,
    } = useDashboardScheduledEmailsDialog({ setScheduledExportToEdit });

    const {
        defaultOnScheduleEmailingManagement,
        onScheduleEmailingManagementAdd,
        onScheduleEmailingManagementClose,
        onScheduleEmailingManagementDeleteError,
        onScheduleEmailingManagementDeleteSuccess,
        onScheduleEmailingManagementEdit,
        onScheduleEmailingManagementLoadingError,
        onScheduleEmailingManagementOpen,
    } = useDashboardScheduledEmailsManagementDialog({
        setShouldReturnToManagementDialog,
        setScheduledExportToEdit,
    });

    return {
        // Local state
        scheduledExportToEdit,
        // Data
        isInitialized,
        notificationChannels,
        automations,
        automationsCount,
        numberOfAvailableDestinations,
        widget,
        insight,
        automationsLoading,
        automationsError,
        // Single Schedule Dialog
        isScheduledEmailingVisible,
        isScheduleEmailingDialogOpen,
        defaultOnScheduleEmailing,
        onScheduleEmailingOpen,
        onScheduleEmailingCancel,
        onScheduleEmailingBack,
        onScheduleEmailingCreateError,
        onScheduleEmailingCreateSuccess,
        onScheduleEmailingSaveError,
        onScheduleEmailingSaveSuccess,
        // List / Management Dialog
        isScheduledManagementEmailingVisible,
        isScheduleEmailingManagementDialogOpen,
        defaultOnScheduleEmailingManagement,
        onScheduleEmailingManagementOpen,
        onScheduleEmailingManagementEdit,
        onScheduleEmailingManagementAdd,
        onScheduleEmailingManagementClose,
        onScheduleEmailingManagementLoadingError,
        onScheduleEmailingManagementDeleteSuccess,
        onScheduleEmailingManagementDeleteError,
    };
};
