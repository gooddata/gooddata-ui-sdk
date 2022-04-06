// (C) 2022 GoodData Corporation

import React from "react";
import { ScheduledEmailDialog, ScheduledEmailManagementDialog } from "../../scheduledEmail";
import { useDashboardScheduledEmails } from "../../../model";

export const ScheduledEmailDialogProvider = () => {
    const {
        isScheduleEmailingDialogOpen,
        isScheduleEmailingManagementDialogOpen,
        onScheduleEmailingCancel,
        onScheduleEmailingError,
        onScheduleEmailingSuccess,
        onScheduleEmailingManagementAdd,
        onScheduleEmailingManagementClose,
        onScheduleEmailingManagementLoadingError,
        onScheduleEmailingManagementDeleteSuccess,
        onScheduleEmailingManagementDeleteError,
    } = useDashboardScheduledEmails();

    return (
        <>
            {isScheduleEmailingManagementDialogOpen && (
                <ScheduledEmailManagementDialog
                    isVisible={isScheduleEmailingManagementDialogOpen}
                    onAdd={onScheduleEmailingManagementAdd}
                    onClose={onScheduleEmailingManagementClose}
                    onDeleteSuccess={onScheduleEmailingManagementDeleteSuccess}
                    onLoadError={onScheduleEmailingManagementLoadingError}
                    onDeleteError={onScheduleEmailingManagementDeleteError}
                />
            )}
            {isScheduleEmailingDialogOpen && (
                <ScheduledEmailDialog
                    isVisible={isScheduleEmailingDialogOpen}
                    onCancel={onScheduleEmailingCancel}
                    onError={onScheduleEmailingError}
                    onSuccess={onScheduleEmailingSuccess}
                />
            )}
        </>
    );
};
