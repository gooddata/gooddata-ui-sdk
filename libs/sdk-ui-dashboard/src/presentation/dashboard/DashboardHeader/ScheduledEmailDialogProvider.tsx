// (C) 2022-2024 GoodData Corporation

import React, { useState } from "react";

import { ScheduledEmailDialog, ScheduledEmailManagementDialog } from "../../scheduledEmail/index.js";

import { useDashboardScheduledEmails, useDashboardScheduledEmailsData } from "../../../model/index.js";

export const ScheduledEmailDialogProvider = () => {
    const [reloadId, setReloadId] = useState(0);

    const reloadAutomations = () => {
        setReloadId((prev) => prev + 1);
    };

    const {
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
        onScheduleEmailingManagementLoadingError,
    } = useDashboardScheduledEmails({ onReload: reloadAutomations });

    const { webhooks, users, automations, isLoading, loadError } = useDashboardScheduledEmailsData({
        reloadId,
        onLoadError: onScheduleEmailingManagementLoadingError,
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
                    isLoadingScheduleData={isLoading}
                    automations={automations}
                    webhooks={webhooks}
                    scheduleDataError={loadError}
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
