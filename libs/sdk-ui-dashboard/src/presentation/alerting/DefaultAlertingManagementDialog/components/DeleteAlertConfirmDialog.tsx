// (C) 2022-2024 GoodData Corporation

import React, { ReactNode } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { IAutomationMetadataObject, IAutomationMetadataObjectDefinition } from "@gooddata/sdk-model";
import { GoodDataSdkError, useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { ConfirmDialog } from "@gooddata/sdk-ui-kit";

interface IDeleteAlertConfirmDialogProps {
    alert: IAutomationMetadataObject | IAutomationMetadataObjectDefinition;
    onCancel: () => void;
    onSuccess?: (alert: IAutomationMetadataObject | IAutomationMetadataObjectDefinition) => void;
    onError?: (error: GoodDataSdkError) => void;
}

export const DeleteAlertConfirmDialog: React.FC<IDeleteAlertConfirmDialogProps> = (props) => {
    const { alert, onCancel, onSuccess, onError } = props;

    const effectiveBackend = useBackendStrict();
    const effectiveWorkspace = useWorkspaceStrict();
    const intl = useIntl();

    const handleDeleteAlert = async () => {
        try {
            await effectiveBackend.workspace(effectiveWorkspace).automations().deleteAutomation(alert.id!);
            onSuccess?.(alert);
        } catch (err) {
            onError?.(err as GoodDataSdkError);
        }
    };

    return (
        <ConfirmDialog
            displayCloseButton={true}
            isPositive={false}
            headline={intl.formatMessage({ id: "dialogs.alerting.management.delete.dialog" })}
            cancelButtonText={intl.formatMessage({ id: "cancel" })}
            submitButtonText={intl.formatMessage({ id: "delete" })}
            onSubmit={handleDeleteAlert}
            onClose={onCancel}
            onCancel={onCancel}
            className="gd-scheduled-email-delete-dialog s-alert-delete-dialog"
            containerClassName="gd-scheduled-email-delete-dialog-overlay"
        >
            <span className="s-alert-delete-dialog-content">
                <FormattedMessage
                    id="dialogs.alerting.management.delete.dialog.confirm"
                    values={{
                        b: (chunks: ReactNode) => (
                            <span className="gd-scheduled-email-delete-dialog-text">
                                {chunks} <strong>{alert.title}</strong>
                            </span>
                        ),
                    }}
                />
            </span>
        </ConfirmDialog>
    );
};
