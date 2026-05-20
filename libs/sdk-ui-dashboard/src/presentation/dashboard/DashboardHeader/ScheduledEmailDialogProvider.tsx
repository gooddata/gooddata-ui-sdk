// (C) 2022-2026 GoodData Corporation

import {
    getAutomationDashboardFilters,
    getAutomationVisualizationFilters,
} from "../../../_staging/automation/index.js";
import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { useDashboardScheduledEmails } from "../../../model/react/useDasboardScheduledEmails/useDashboardScheduledEmails.js";
import { useWorkspaceUsers } from "../../../model/react/useWorkspaceUsers.js";
import {
    selectAutomationDefaultSelectedFilters,
    selectDashboardHiddenFilters,
} from "../../../model/store/filtering/dashboardFilterSelectors.js";
import { useWidgetAutomationFilters } from "../../scheduledEmail/hooks/useWidgetAutomationFilters.js";
import { ScheduledEmailDialog } from "../../scheduledEmail/ScheduledEmailDialog.js";
import { ScheduledEmailManagementDialog } from "../../scheduledEmail/ScheduledEmailManagementDialog.js";
import { type IScheduledEmailDialogProps } from "../../scheduledEmail/types.js";
import { getAppliedDashboardFilters } from "../../scheduledEmail/utils/filters.js";

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

    const automationDefaultSelectedFilters = useDashboardSelector(selectAutomationDefaultSelectedFilters);
    const dashboardHiddenFilters = useDashboardSelector(selectDashboardHiddenFilters);
    const { executionFilters: savedWidgetFilters } = getAutomationVisualizationFilters(scheduledExportToEdit);
    const savedDashboardFilters = getAutomationDashboardFilters(scheduledExportToEdit);
    const {
        result: liveWidgetFilters,
        status: widgetFiltersStatus,
        error: widgetFiltersError,
    } = useWidgetAutomationFilters(widget, insight);

    const widgetFilters = savedWidgetFilters ?? liveWidgetFilters;
    const shouldLoadWidgetFilters = !!widget && !savedWidgetFilters;

    const dashboardFilters =
        savedDashboardFilters ??
        getAppliedDashboardFilters(automationDefaultSelectedFilters, dashboardHiddenFilters, true);

    const isLoading =
        automationsLoading ||
        (shouldLoadWidgetFilters && (widgetFiltersStatus === "pending" || widgetFiltersStatus === "running"));
    const loadingError = (shouldLoadWidgetFilters ? widgetFiltersError : undefined) ?? automationsError;

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
