// (C) 2022-2024 GoodData Corporation

import React from "react";

import {
    IScheduledEmailDialogProps,
    ScheduledEmailDialog,
    ScheduledEmailManagementDialog,
} from "../../scheduledEmail/index.js";

import {
    useDashboardScheduledEmails,
    useDashboardScheduledEmailsFilters,
    useWorkspaceUsers,
} from "../../../model/index.js";

export const ScheduledEmailDialogProvider = () => {
    const {
        // Shared Local State
        scheduledExportToEdit,
        // Data
        isInitialized,
        widget,
        insight,
        automations,
        automationsLoading,
        automationsError,
        notificationChannels,
        // Single Schedule Dialog
        isScheduleEmailingDialogOpen,
        onScheduleEmailingCancel,
        onScheduleEmailingCreateSuccess,
        onScheduleEmailingCreateError,
        onScheduleEmailingSaveSuccess,
        onScheduleEmailingSaveError,
        // Management / List Dialog
        isScheduleEmailingManagementDialogOpen,
        onScheduleEmailingManagementClose,
        onScheduleEmailingManagementAdd,
        onScheduleEmailingManagementEdit,
        onScheduleEmailingManagementDeleteSuccess,
        onScheduleEmailingManagementDeleteError,
    } = useDashboardScheduledEmails();

    const { widgetFilters, dashboardFilters, widgetFiltersError, widgetFiltersLoading } =
        useDashboardScheduledEmailsFilters({
            scheduledExportToEdit,
            widget,
            insight,
        });

    const isLoading = [widgetFiltersLoading, automationsLoading].some(Boolean);
    const loadingError = [widgetFiltersError, automationsError].find(Boolean);

    if (!isInitialized) {
        return null;
    }
    return (
        <>
            {isScheduleEmailingManagementDialogOpen ? (
                <ScheduledEmailManagementDialog
                    automations={automations}
                    notificationChannels={notificationChannels}
                    scheduleDataError={loadingError}
                    isLoadingScheduleData={isLoading}
                    onAdd={onScheduleEmailingManagementAdd}
                    onEdit={onScheduleEmailingManagementEdit}
                    onClose={onScheduleEmailingManagementClose}
                    onDeleteSuccess={onScheduleEmailingManagementDeleteSuccess}
                    onDeleteError={onScheduleEmailingManagementDeleteError}
                />
            ) : null}
            {isScheduleEmailingDialogOpen ? (
                <ScheduledEmailDialogWithUsers
                    scheduledExportToEdit={scheduledExportToEdit}
                    notificationChannels={notificationChannels}
                    widget={widget}
                    insight={insight}
                    widgetFilters={widgetFilters}
                    dashboardFilters={dashboardFilters}
                    isLoading={isLoading}
                    onCancel={onScheduleEmailingCancel}
                    onError={onScheduleEmailingCreateError}
                    onSuccess={onScheduleEmailingCreateSuccess}
                    onSaveError={onScheduleEmailingSaveError}
                    onSaveSuccess={onScheduleEmailingSaveSuccess}
                    onDeleteSuccess={onScheduleEmailingManagementDeleteSuccess}
                    onDeleteError={onScheduleEmailingManagementDeleteError}
                />
            ) : null}
        </>
    );
};

/**
 * Load users only if dialog is open
 */
function ScheduledEmailDialogWithUsers(props: Omit<IScheduledEmailDialogProps, "users">) {
    const { users, status: usersStatus } = useWorkspaceUsers();

    return (
        <ScheduledEmailDialog
            {...props}
            users={users ?? []}
            isLoading={props.isLoading || usersStatus === "pending" || usersStatus === "loading"}
        />
    );
}
