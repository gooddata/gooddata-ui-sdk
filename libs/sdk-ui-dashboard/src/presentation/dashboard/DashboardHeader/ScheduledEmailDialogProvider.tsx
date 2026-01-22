// (C) 2022-2026 GoodData Corporation

import { useScheduledExportFilters } from "../../../model/react/filtering/useScheduledExportFilters.js";
import { useDashboardScheduledEmails } from "../../../model/react/useDasboardScheduledEmails/useDashboardScheduledEmails.js";
import { useWorkspaceUsers } from "../../../model/react/useWorkspaceUsers.js";
import { ScheduledEmailDialog } from "../../scheduledEmail/ScheduledEmailDialog.js";
import { ScheduledEmailManagementDialog } from "../../scheduledEmail/ScheduledEmailManagementDialog.js";
import { type IScheduledEmailDialogProps } from "../../scheduledEmail/types.js";

export function ScheduledEmailDialogProvider() {
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
        onScheduleEmailingBack,
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
        useScheduledExportFilters({
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
                    onBack={onScheduleEmailingBack}
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
}

/**
 * Load users only if dialog is open
 */
function ScheduledEmailDialogWithUsers(props: Omit<IScheduledEmailDialogProps, "users">) {
    const { users, status: usersStatus, usersError } = useWorkspaceUsers();

    return (
        <ScheduledEmailDialog
            {...props}
            users={users ?? []}
            isLoading={props.isLoading || usersStatus === "pending" || usersStatus === "loading"}
            usersError={usersError}
        />
    );
}
