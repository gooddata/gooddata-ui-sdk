// (C) 2022-2024 GoodData Corporation

import React, { useCallback, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Button, Dialog, Hyperlink, Typography } from "@gooddata/sdk-ui-kit";
import { IAutomationMetadataObject } from "@gooddata/sdk-model";

import { ScheduledEmails } from "./components/ScheduledEmailsList.js";
import { DeleteScheduleConfirmDialog } from "./components/DeleteScheduleConfirmDialog.js";

import { IScheduledEmailManagementDialogProps } from "../types.js";
import { selectCurrentUser, useDashboardSelector } from "../../../model/index.js";
import { messages } from "../../../locales.js";
import { CreateButton } from "./components/CreateButton.js";

/**
 * @alpha
 */
export const ScheduledEmailManagementDialog: React.FC<IScheduledEmailManagementDialogProps> = (props) => {
    const {
        onAdd,
        onEdit,
        onDeleteSuccess: onDelete,
        onClose,
        onDeleteError,
        isLoadingScheduleData,
        automations,
        webhooks,
    } = props;
    const [scheduledEmailToDelete, setScheduledEmailToDelete] = useState<IAutomationMetadataObject | null>(
        null,
    );
    const currentUser = useDashboardSelector(selectCurrentUser);
    const intl = useIntl();

    const handleScheduleDelete = useCallback((scheduledEmail: IAutomationMetadataObject) => {
        setScheduledEmailToDelete(scheduledEmail);
    }, []);

    const handleScheduleEdit = useCallback(
        (scheduledEmail: IAutomationMetadataObject) => {
            onEdit?.(scheduledEmail);
        },
        [onEdit],
    );

    const handleScheduleDeleteSuccess = useCallback(() => {
        onDelete?.();
        setScheduledEmailToDelete(null);
    }, [onDelete]);

    return (
        <>
            <Dialog
                displayCloseButton={true}
                onCancel={onClose}
                className="gd-scheduled-email-management-dialog s-scheduled-email-management-dialog"
            >
                <div className="gd-scheduled-email-management-dialog-title">
                    <Typography tagName="h3" className="gd-dialog-header">
                        <FormattedMessage id="dialogs.schedule.management.title" />
                    </Typography>
                    <span className="gd-icon-circle-question" />
                </div>
                <div className="gd-scheduled-emails-content">
                    <div className="gd-scheduled-emails-content-header">
                        <Typography tagName="h3">
                            <FormattedMessage id={messages.scheduleManagementListTitle.id!} />
                        </Typography>
                        <CreateButton
                            onClick={onAdd}
                            isDisabled={isLoadingScheduleData}
                            titleId={messages.scheduleManagementCreate.id!}
                        />
                    </div>
                    <ScheduledEmails
                        onDelete={handleScheduleDelete}
                        onEdit={handleScheduleEdit}
                        isLoading={isLoadingScheduleData}
                        scheduledEmails={automations}
                        currentUserEmail={currentUser?.email}
                        noSchedulesMessageId={messages.scheduleManagementNoSchedules.id!}
                        webhooks={webhooks}
                    />
                </div>
                <div className="gd-content-divider"></div>
                <div className="gd-buttons">
                    <Hyperlink
                        text={intl.formatMessage({ id: "dialogs.schedule.email.footer.title" })}
                        href=""
                        iconClass="gd-icon-circle-question"
                    />
                    <Button
                        onClick={onClose}
                        className="gd-button-secondary s-close-button"
                        value={intl.formatMessage({ id: "close" })}
                    />
                </div>
            </Dialog>
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
};
