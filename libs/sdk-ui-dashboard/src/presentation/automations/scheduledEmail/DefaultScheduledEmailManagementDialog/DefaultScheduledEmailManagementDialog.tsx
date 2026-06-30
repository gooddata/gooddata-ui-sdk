// (C) 2022-2026 GoodData Corporation

import { useCallback, useState } from "react";

import { type IAutomationMetadataObject } from "@gooddata/sdk-model";

import { useAutomationsContext } from "../../contexts/AutomationsContext.js";
import { type IScheduledEmailManagementDialogProps } from "../types.js";

import { DeleteScheduleConfirmDialog } from "./components/DeleteScheduleConfirmDialog.js";
import { DefaultScheduledEmailManagementDialogContentBasic } from "./DefaultScheduledEmailManagementDialogContentBasic.js";
import { DefaultScheduledEmailManagementDialogContentEnhanced } from "./DefaultScheduledEmailManagementDialogContentEnhanced.js";

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

    const {
        features: { enableAutomationManagement },
    } = useAutomationsContext();

    const handleScheduleEdit = useCallback(
        (scheduledEmail: IAutomationMetadataObject) => {
            onEdit?.(scheduledEmail);
        },
        [onEdit],
    );

    const handleScheduleDelete = useCallback((scheduledEmail: IAutomationMetadataObject) => {
        setScheduledEmailToDelete(scheduledEmail);
    }, []);

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
