// (C) 2022-2026 GoodData Corporation

import { useCallback, useState } from "react";

import { type IAutomationMetadataObject } from "@gooddata/sdk-model";
import { buildAutomationUrl, navigate, useWorkspace } from "@gooddata/sdk-ui";

import { useDashboardSelector } from "../../../../model/react/DashboardStoreProvider.js";
import {
    selectEnableAutomationManagement,
    selectExternalRecipient,
    selectIsEmbedded,
    selectSettings,
} from "../../../../model/store/config/configSelectors.js";
import { selectDashboardId } from "../../../../model/store/meta/metaSelectors.js";
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

    const workspace = useWorkspace();
    const enableAutomationManagement = useDashboardSelector(selectEnableAutomationManagement);
    const dashboardId = useDashboardSelector(selectDashboardId);
    const isEmbedded = useDashboardSelector(selectIsEmbedded);
    const externalRecipientOverride = useDashboardSelector(selectExternalRecipient);
    const settings = useDashboardSelector(selectSettings);
    const useHostRoute =
        Boolean(settings.enableShellApplication) && Boolean(settings.enableShellApplication_dashboards);

    const handleScheduleDelete = useCallback((scheduledEmail: IAutomationMetadataObject) => {
        setScheduledEmailToDelete(scheduledEmail);
    }, []);

    const handleScheduleEdit = useCallback(
        (scheduledEmail: IAutomationMetadataObject) => {
            if (enableAutomationManagement && scheduledEmail.dashboard?.id !== dashboardId) {
                navigate(
                    buildAutomationUrl({
                        workspaceId: workspace,
                        dashboardId: scheduledEmail.dashboard?.id,
                        automationId: scheduledEmail.id,
                        isEmbedded,
                        useHostRoute,
                        queryParams: externalRecipientOverride
                            ? { recipient: externalRecipientOverride }
                            : undefined,
                    }),
                );
                return;
            }
            onEdit?.(scheduledEmail);
        },
        [
            onEdit,
            enableAutomationManagement,
            dashboardId,
            workspace,
            isEmbedded,
            useHostRoute,
            externalRecipientOverride,
        ],
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
