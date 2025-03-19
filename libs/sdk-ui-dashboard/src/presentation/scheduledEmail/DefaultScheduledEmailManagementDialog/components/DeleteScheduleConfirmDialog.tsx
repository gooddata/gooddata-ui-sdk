// (C) 2022-2024 GoodData Corporation

import React, { ReactNode } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { IAutomationMetadataObject, IAutomationMetadataObjectDefinition } from "@gooddata/sdk-model";
import { convertError, GoodDataSdkError, useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { ConfirmDialog } from "@gooddata/sdk-ui-kit";
import {
    selectCanManageWorkspace,
    selectCurrentUser,
    useDashboardSelector,
} from "../../../../model/index.js";

interface IDeleteScheduleConfirmDialogProps {
    scheduledEmail: IAutomationMetadataObject | IAutomationMetadataObjectDefinition;
    onCancel: () => void;
    onSuccess?: () => void;
    onError?: (error: GoodDataSdkError) => void;
}

export const DeleteScheduleConfirmDialog: React.FC<IDeleteScheduleConfirmDialogProps> = (props) => {
    const { scheduledEmail, onCancel, onSuccess, onError } = props;

    const effectiveBackend = useBackendStrict();
    const effectiveWorkspace = useWorkspaceStrict();
    const intl = useIntl();
    const currentUser = useDashboardSelector(selectCurrentUser);
    const canManageAutomations = useDashboardSelector(selectCanManageWorkspace);

    const handleDeleteScheduledMail = async () => {
        const alertCreatorId = scheduledEmail.createdBy?.login;
        const currentUserId = currentUser?.login;
        const isAlertCreatedByCurrentUser =
            !!alertCreatorId && !!currentUserId && alertCreatorId === currentUserId;
        const automationService = effectiveBackend.workspace(effectiveWorkspace).automations();

        // If schedule is created by current user, or user has permissions to manage automations, delete it, otherwise unsubscribe
        const deleteMethod =
            canManageAutomations || isAlertCreatedByCurrentUser
                ? automationService.deleteAutomation.bind(automationService)
                : automationService.unsubscribeAutomation.bind(automationService);

        try {
            await deleteMethod(scheduledEmail.id!);
            onSuccess?.();
        } catch (err) {
            onError?.(convertError(err));
        }
    };

    return (
        <ConfirmDialog
            displayCloseButton={true}
            isPositive={false}
            headline={intl.formatMessage({ id: "dialogs.schedule.management.delete.dialog" })}
            cancelButtonText={intl.formatMessage({ id: "cancel" })}
            submitButtonText={intl.formatMessage({ id: "delete" })}
            onSubmit={handleDeleteScheduledMail}
            onClose={onCancel}
            onCancel={onCancel}
            className="gd-notifications-channel-delete-dialog s-scheduled-email-delete-dialog"
            containerClassName="gd-notifications-channel-delete-dialog-overlay"
        >
            <span className="s-notifications-channel-delete-dialog-content">
                <FormattedMessage
                    id="dialogs.schedule.management.delete.dialog.confirm"
                    values={{
                        b: (chunks: ReactNode) => (
                            <span className="gd-notifications-channel-delete-dialog-text">
                                {chunks} <strong>{scheduledEmail.title}</strong>
                            </span>
                        ),
                    }}
                />
            </span>
        </ConfirmDialog>
    );
};
