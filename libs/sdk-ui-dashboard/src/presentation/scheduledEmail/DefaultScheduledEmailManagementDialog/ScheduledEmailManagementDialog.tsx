// (C) 2022 GoodData Corporation

import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Button, Dialog, Typography } from "@gooddata/sdk-ui-kit";
import { IScheduledEmailManagementDialogProps } from "../types";
import { ScheduledEmails } from "./ScheduledEmails";
import { useScheduledEmailManagement } from "./useScheduledEmailManagement";

/**
 * @alpha
 */
export const ScheduledEmailManagementDialog: React.FC<IScheduledEmailManagementDialogProps> = (props) => {
    const { onAdd, onClose, onError } = props;

    const { result } = useScheduledEmailManagement({ onError });
    const isLoading = !result;
    const scheduledEmails = result?.scheduledEmails.reverse() ?? [];
    const currentUserEmail = result?.currentUserEmail;
    const intl = useIntl();

    return (
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
                    isLoading={isLoading}
                    scheduledEmails={scheduledEmails}
                    currentUserEmail={currentUserEmail}
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
    );
};
