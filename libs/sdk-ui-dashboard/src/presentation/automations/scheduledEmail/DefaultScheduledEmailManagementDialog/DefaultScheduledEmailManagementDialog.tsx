// (C) 2022-2026 GoodData Corporation

import { useCallback } from "react";

import { type IAutomationMetadataObject } from "@gooddata/sdk-model";

import { type IScheduledEmailManagementDialogProps } from "../types.js";

import { DefaultScheduledEmailManagementDialogContent } from "./DefaultScheduledEmailManagementDialogContent.js";

/**
 * @alpha
 */
export function ScheduledEmailManagementDialog({
    onAdd,
    onEdit,
    onClose,
    isLoadingScheduleData,
    automations,
}: IScheduledEmailManagementDialogProps) {
    const handleScheduleEdit = useCallback(
        (scheduledEmail: IAutomationMetadataObject) => {
            onEdit?.(scheduledEmail);
        },
        [onEdit],
    );

    return (
        <DefaultScheduledEmailManagementDialogContent
            onAdd={onAdd}
            onClose={onClose}
            onEdit={handleScheduleEdit}
            isLoadingScheduleData={isLoadingScheduleData}
            automations={automations}
        />
    );
}
