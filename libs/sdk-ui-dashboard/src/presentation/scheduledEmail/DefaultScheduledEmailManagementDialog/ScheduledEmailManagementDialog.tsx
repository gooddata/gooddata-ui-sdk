// (C) 2022 GoodData Corporation

import React, { useCallback, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Button, Dialog, Typography } from "@gooddata/sdk-ui-kit";
import { IScheduledMail } from "@gooddata/sdk-backend-spi";
import { IScheduledEmailManagementDialogProps } from "../types";
import { ScheduledEmails } from "./ScheduledEmails";
import { useScheduledEmailManagement } from "./useScheduledEmailManagement";
import { DeleteScheduleConfirmDialog } from "./DeleteScheduleConfirmDialog";
import { selectCurrentUser, useDashboardSelector } from "../../../model";

/**
 * @alpha
 */
export const ScheduledEmailManagementDialog: React.FC<IScheduledEmailManagementDialogProps> = (props) => {
    const { onAdd, onDeleteSuccess: onDelete, onClose, onLoadError, onDeleteError } = props;
    const [scheduledEmailToDelete, setScheduledEmailToDelete] = useState<IScheduledMail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [scheduledEmails, setScheduledEmails] = useState<IScheduledMail[]>([]);
    const currentUser = useDashboardSelector(selectCurrentUser);
    const intl = useIntl();

    const onLoadSuccess = useCallback((scheduledEmails: IScheduledMail[]) => {
        setIsLoading(false);
        setScheduledEmails(scheduledEmails);
    }, []);

    const handleScheduleDelete = useCallback((scheduledEmail: IScheduledMail) => {
        setScheduledEmailToDelete(scheduledEmail);
    }, []);

    const handleScheduleDeleteSuccess = useCallback(() => {
        onDelete?.();
        setScheduledEmailToDelete(null);
        setIsLoading(true);
    }, []);

    useScheduledEmailManagement({
        loadScheduledMails: isLoading,
        onError: onLoadError,
        onSuccess: onLoadSuccess,
    });

    return (
        <>
            <Dialog
                displayCloseButton={true}
                onCancel={onClose}
                className="gd-scheduled-email-management-dialog s-scheduled-email-management-dialog"
            >
                <div>
                    <Typography tagName="h3">
                        <FormattedMessage id="dialogs.schedule.management.title" />
                    </Typography>
                </div>
                <div className="gd-scheduled-emails-content">
                    <ScheduledEmails
                        onDelete={handleScheduleDelete}
                        isLoading={isLoading}
                        scheduledEmails={scheduledEmails}
                        currentUserEmail={currentUser?.email}
                    />
                </div>
                <div className="gd-content-divider"></div>
                <div className="gd-buttons">
                    <Button
                        onClick={onAdd}
                        className="gd-button-secondary gd-add-button s-add-button"
                        iconLeft="gd-icon-plus"
                        value={intl.formatMessage({ id: "dialogs.schedule.management.addSchedule" })}
                    />
                    <Button
                        onClick={onClose}
                        className="gd-button-secondary s-close-button"
                        value={intl.formatMessage({ id: "close" })}
                    />
                </div>
            </Dialog>
            {scheduledEmailToDelete && (
                <DeleteScheduleConfirmDialog
                    scheduledEmail={scheduledEmailToDelete}
                    onCancel={() => setScheduledEmailToDelete(null)}
                    onSuccess={handleScheduleDeleteSuccess}
                    onError={onDeleteError}
                />
            )}
        </>
    );
};
