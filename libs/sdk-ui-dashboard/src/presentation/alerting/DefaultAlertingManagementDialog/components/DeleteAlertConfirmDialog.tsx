// (C) 2022-2025 GoodData Corporation

import { ReactNode } from "react";

import { FormattedMessage, useIntl } from "react-intl";

import { IAutomationMetadataObject } from "@gooddata/sdk-model";
import { GoodDataSdkError, convertError, useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { ConfirmDialog } from "@gooddata/sdk-ui-kit";

import {
    selectCanManageWorkspace,
    selectCurrentUser,
    useDashboardSelector,
} from "../../../../model/index.js";

interface IDeleteAlertConfirmDialogProps {
    alert: IAutomationMetadataObject;
    onCancel: () => void;
    onSuccess?: (alert: IAutomationMetadataObject) => void;
    onError?: (error: GoodDataSdkError) => void;
}

export function DeleteAlertConfirmDialog(props: IDeleteAlertConfirmDialogProps) {
    const { alert, onCancel, onSuccess, onError } = props;

    const effectiveBackend = useBackendStrict();
    const effectiveWorkspace = useWorkspaceStrict();
    const intl = useIntl();
    const currentUser = useDashboardSelector(selectCurrentUser);
    const canManageAutomations = useDashboardSelector(selectCanManageWorkspace);

    const handleDeleteAlert = async () => {
        try {
            const alertCreatorId = alert.createdBy?.login;
            const currentUserId = currentUser?.login;
            const isAlertCreatedByCurrentUser =
                !!alertCreatorId && !!currentUserId && alertCreatorId === currentUserId;
            const automationService = effectiveBackend.workspace(effectiveWorkspace).automations();

            // If alert is created by current user, or user has permissions to manage automations, delete it, otherwise unsubscribe
            const deleteMethod =
                canManageAutomations || isAlertCreatedByCurrentUser
                    ? automationService.deleteAutomation.bind(automationService)
                    : automationService.unsubscribeAutomation.bind(automationService);

            await deleteMethod(alert.id!);
            onSuccess?.(alert);
        } catch (err) {
            onError?.(convertError(err));
        }
    };

    return (
        <ConfirmDialog
            displayCloseButton
            isPositive={false}
            headline={intl.formatMessage({ id: "dialogs.alerting.management.delete.dialog" })}
            cancelButtonText={intl.formatMessage({ id: "cancel" })}
            submitButtonText={intl.formatMessage({ id: "delete" })}
            onSubmit={handleDeleteAlert}
            onClose={onCancel}
            onCancel={onCancel}
            className="gd-notifications-channel-delete-dialog s-alert-delete-dialog"
            containerClassName="gd-notifications-channel-delete-dialog-overlay"
        >
            <span className="s-alert-delete-dialog-content">
                <FormattedMessage
                    id="dialogs.alerting.management.delete.dialog.confirm"
                    values={{
                        b: (chunks: ReactNode) => (
                            <span className="gd-notifications-channel-delete-dialog-text">
                                {chunks} <strong>{alert.title}</strong>
                            </span>
                        ),
                    }}
                />
            </span>
        </ConfirmDialog>
    );
}
