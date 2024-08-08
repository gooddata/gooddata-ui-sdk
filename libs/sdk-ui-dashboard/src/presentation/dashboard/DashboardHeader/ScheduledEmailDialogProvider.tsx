// (C) 2022-2024 GoodData Corporation

import React from "react";

import { ScheduledEmailDialog, ScheduledEmailManagementDialog } from "../../scheduledEmail/index.js";

import {
    useDashboardScheduledEmails,
    useDashboardSelector,
    selectDashboardId,
} from "../../../model/index.js";

export const ScheduledEmailDialogProvider = () => {
    const dashboard = useDashboardSelector(selectDashboardId);
    const {
        users,
        webhooks,
        automations,
        schedulingLoadError,
        isScheduleLoading,
        isScheduleEmailingDialogOpen,
        scheduleEmailingDialogContext,
        isScheduleEmailingManagementDialogOpen,
        scheduleEmailingManagementDialogContext,
        onScheduleEmailingCancel,
        onScheduleEmailingCreateError,
        onScheduleEmailingCreateSuccess,
        onScheduleEmailingManagementAdd,
        onScheduleEmailingManagementEdit,
        scheduledEmailToEdit,
        onScheduleEmailingSaveError,
        onScheduleEmailingSaveSuccess,
        onScheduleEmailingManagementClose,
        onScheduleEmailingManagementDeleteSuccess,
        onScheduleEmailingManagementDeleteError,
    } = useDashboardScheduledEmails({
        dashboard,
    });

    return (
        <>
            {isScheduleEmailingManagementDialogOpen ? (
                <ScheduledEmailManagementDialog
                    isVisible={isScheduleEmailingManagementDialogOpen}
                    context={scheduleEmailingManagementDialogContext}
                    onAdd={onScheduleEmailingManagementAdd}
                    onEdit={onScheduleEmailingManagementEdit}
                    onClose={onScheduleEmailingManagementClose}
                    onDeleteSuccess={onScheduleEmailingManagementDeleteSuccess}
                    onDeleteError={onScheduleEmailingManagementDeleteError}
                    isLoadingScheduleData={isScheduleLoading}
                    automations={automations}
                    webhooks={webhooks}
                    scheduleDataError={schedulingLoadError}
                />
            ) : null}
            {isScheduleEmailingDialogOpen ? (
                <ScheduledEmailDialog
                    isVisible={isScheduleEmailingDialogOpen}
                    context={scheduleEmailingDialogContext}
                    onCancel={onScheduleEmailingCancel}
                    onError={onScheduleEmailingCreateError}
                    onSuccess={onScheduleEmailingCreateSuccess}
                    editSchedule={scheduledEmailToEdit}
                    onSaveError={onScheduleEmailingSaveError}
                    onSaveSuccess={onScheduleEmailingSaveSuccess}
                    onDeleteSuccess={onScheduleEmailingManagementDeleteSuccess}
                    onDeleteError={onScheduleEmailingManagementDeleteError}
                    users={users}
                    webhooks={webhooks}
                    automations={automations}
                />
            ) : null}
        </>
    );
};
