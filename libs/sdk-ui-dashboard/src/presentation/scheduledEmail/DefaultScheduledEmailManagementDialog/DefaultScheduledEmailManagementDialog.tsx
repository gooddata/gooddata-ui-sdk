// (C) 2022-2025 GoodData Corporation

import { useCallback, useState } from "react";

import { IAutomationMetadataObject } from "@gooddata/sdk-model";
import { buildAutomationUrl, navigate, useWorkspace } from "@gooddata/sdk-ui";

import { DeleteScheduleConfirmDialog } from "./components/DeleteScheduleConfirmDialog.js";
import { DefaultScheduledEmailManagementDialogContentBasic } from "./DefaultScheduledEmailManagementDialogContentBasic.js";
import { DefaultScheduledEmailManagementDialogContentEnhanced } from "./DefaultScheduledEmailManagementDialogContentEnhanced.js";
import {
    selectDashboardId,
    selectEnableAutomationManagement,
    useDashboardSelector,
} from "../../../model/index.js";
import { IScheduledEmailManagementDialogProps } from "../types.js";

/**
 * @alpha
 */
export function ScheduledEmailManagementDialog({
    onAdd,
    onEdit,
    onDeleteSuccess: onDelete,
    onClose,
    onDeleteError,
    isLoadingScheduleData,
    automations,
    notificationChannels,
}: IScheduledEmailManagementDialogProps) {
    const [scheduledEmailToDelete, setScheduledEmailToDelete] = useState<IAutomationMetadataObject | null>(
        null,
    );

    const workspace = useWorkspace();
    const enableAutomationManagement = useDashboardSelector(selectEnableAutomationManagement);
    const dashboardId = useDashboardSelector(selectDashboardId);

    const handleScheduleDelete = useCallback((scheduledEmail: IAutomationMetadataObject) => {
        setScheduledEmailToDelete(scheduledEmail);
    }, []);

    const handleScheduleEdit = useCallback(
        (scheduledEmail: IAutomationMetadataObject) => {
            if (enableAutomationManagement && scheduledEmail.dashboard?.id !== dashboardId) {
                navigate(buildAutomationUrl(workspace, scheduledEmail.dashboard?.id, scheduledEmail.id));
                return;
            }
            onEdit?.(scheduledEmail);
        },
        [onEdit, enableAutomationManagement, dashboardId, workspace],
    );

    const handleScheduleDeleteSuccess = useCallback(() => {
        onDelete?.();
        setScheduledEmailToDelete(null);
    }, [onDelete]);

    return (
        <>
            {enableAutomationManagement ? (
                <DefaultScheduledEmailManagementDialogContentEnhanced
                    onAdd={onAdd}
                    onClose={onClose}
                    onEdit={handleScheduleEdit}
                    isLoadingScheduleData={isLoadingScheduleData}
                    automations={automations}
                />
            ) : (
                <DefaultScheduledEmailManagementDialogContentBasic
                    onAdd={onAdd}
                    onClose={onClose}
                    onDelete={handleScheduleDelete}
                    onEdit={handleScheduleEdit}
                    isLoadingScheduleData={isLoadingScheduleData}
                    automations={automations}
                    notificationChannels={notificationChannels}
                />
            )}
            {scheduledEmailToDelete ? (
                <DeleteScheduleConfirmDialog
                    scheduledEmail={scheduledEmailToDelete}
                    onCancel={() => setScheduledEmailToDelete(null)}
                    onSuccess={handleScheduleDeleteSuccess}
                    onError={onDeleteError}
                />
            ) : null}
        </>
    );
}
