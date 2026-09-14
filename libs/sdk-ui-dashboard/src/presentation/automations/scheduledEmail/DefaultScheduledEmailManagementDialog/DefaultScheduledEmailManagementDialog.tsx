// (C) 2022-2026 GoodData Corporation

import { useCallback } from "react";

import { type IAutomationMetadataObject } from "@gooddata/sdk-model";

import { type IScheduledEmailManagementDialogProps } from "../types.js";

import { DefaultScheduledEmailManagementDialogContent } from "./DefaultScheduledEmailManagementDialogContent.js";

/**
 * Default implementation of the scheduled-email management dialog: the list of the dashboard's
 * scheduled exports, with actions to add, edit, or delete one.
 *
 * @beta
 */
export function ScheduledEmailManagementDialog({
    onAdd,
    onEdit,
    onClose,
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
        />
    );
}
