// (C) 2022 GoodData Corporation

import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { IScheduledMail } from "@gooddata/sdk-model";
import { GoodDataSdkError, useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { ConfirmDialog } from "@gooddata/sdk-ui-kit";

interface IDeleteScheduleConfirmDialogProps {
    scheduledEmail: IScheduledMail;
    onCancel: () => void;
    onSuccess?: () => void;
    onError?: (error: GoodDataSdkError) => void;
}

export const DeleteScheduleConfirmDialog: React.FC<IDeleteScheduleConfirmDialogProps> = (props) => {
    const { scheduledEmail, onCancel, onSuccess, onError } = props;
    const { ref, subject } = scheduledEmail;

    const effectiveBackend = useBackendStrict();
    const effectiveWorkspace = useWorkspaceStrict();
    const intl = useIntl();

    const handleDeleteScheduledMail = async () => {
        try {
            await effectiveBackend.workspace(effectiveWorkspace).dashboards().deleteScheduledMail(ref);
            onSuccess?.();
        } catch (err) {
            onError?.(err);
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
            className="gd-scheduled-email-delete-dialog s-scheduled-email-delete-dialog"
            containerClassName="gd-scheduled-email-delete-dialog-overlay"
        >
            <span className="s-scheduled-email-delete-dialog-content">
                <FormattedMessage
                    id="dialogs.schedule.management.delete.dialog.confirm"
                    values={{
                        b: (chunks: string) => (
                            <span className="gd-scheduled-email-delete-dialog-text">
                                {chunks} <strong>{subject}</strong>
                            </span>
                        ),
                    }}
                />
            </span>
        </ConfirmDialog>
    );
};
