// (C) 2022 GoodData Corporation

import React, { useCallback, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Button, Dialog, Typography, Tabs, ITab } from "@gooddata/sdk-ui-kit";
import { IScheduledEmailManagementDialogProps } from "../types";
import { ScheduledEmails } from "./ScheduledEmails";
import { useScheduledEmailManagement } from "./useScheduledEmailManagement";
import { DeleteScheduleConfirmDialog } from "./DeleteScheduleConfirmDialog";
import { selectCurrentUser, useDashboardSelector, selectCanManageScheduledMail } from "../../../model";
import { areObjRefsEqual, IScheduledMail } from "@gooddata/sdk-model";
import { messages } from "../../../locales";

/**
 * @alpha
 */
export const ScheduledEmailManagementDialog: React.FC<IScheduledEmailManagementDialogProps> = (props) => {
    const { onAdd, onEdit, onDeleteSuccess: onDelete, onClose, onLoadError, onDeleteError } = props;
    const [scheduledEmailToDelete, setScheduledEmailToDelete] = useState<IScheduledMail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [scheduledEmailsByUser, setScheduledEmailsByUser] = useState<IScheduledMail[]>([]);
    const [scheduledEmails, setScheduledEmails] = useState<IScheduledMail[]>([]);
    const [selectedTabId, setSelectedTabId] = useState(messages.scheduleManagementTabUser.id);
    const [isFirstLoaded, setIsFirstLoaded] = useState(true);
    const canManageScheduledMail = useDashboardSelector(selectCanManageScheduledMail);
    const currentUser = useDashboardSelector(selectCurrentUser);
    const intl = useIntl();

    const onLoadSuccess = useCallback((emails: IScheduledMail[]) => {
        const emailsByUser = emails.filter((email) => areObjRefsEqual(currentUser.ref, email.createdBy?.ref));

        setIsLoading(false);
        setScheduledEmails(emails);
        setScheduledEmailsByUser(canManageScheduledMail ? emailsByUser : emails);

        if (isFirstLoaded) {
            if (emailsByUser.length === 0 && canManageScheduledMail) {
                setSelectedTabId(messages.scheduleManagementTabAll.id);
            }
            setIsFirstLoaded(false);
        }
    }, []);

    const handleScheduleDelete = useCallback((scheduledEmail: IScheduledMail) => {
        setScheduledEmailToDelete(scheduledEmail);
    }, []);

    const handleScheduleEdit = useCallback((scheduledEmail: IScheduledMail) => {
        onEdit?.(scheduledEmail);
    }, []);

    const handleScheduleDeleteSuccess = useCallback(() => {
        onDelete?.();
        setScheduledEmailToDelete(null);
        setIsLoading(true);
    }, []);

    const handleTabChange = useCallback((tab: ITab) => {
        setSelectedTabId(tab.id);
    }, []);

    useScheduledEmailManagement({
        loadScheduledMails: isLoading,
        onError: onLoadError,
        onSuccess: onLoadSuccess,
    });

    const noSchedulesMessageId =
        selectedTabId === messages.scheduleManagementTabAll.id
            ? messages.scheduleManagementNoSchedules.id
            : messages.scheduleManagementNoSchedulesByUser.id;

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
                </div>
                {!isFirstLoaded && canManageScheduledMail && (
                    <Tabs
                        className="gd-scheduled-email-management-dialog-tabs"
                        tabs={[messages.scheduleManagementTabUser, messages.scheduleManagementTabAll]}
                        selectedTabId={selectedTabId}
                        onTabSelect={handleTabChange}
                    />
                )}
                <div className="gd-scheduled-emails-content">
                    <ScheduledEmails
                        onDelete={handleScheduleDelete}
                        onEdit={handleScheduleEdit}
                        isLoading={isLoading}
                        scheduledEmails={
                            selectedTabId === messages.scheduleManagementTabAll.id
                                ? scheduledEmails
                                : scheduledEmailsByUser
                        }
                        currentUserEmail={currentUser?.email}
                        noSchedulesMessageId={noSchedulesMessageId}
                        canManageScheduledMail={canManageScheduledMail}
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
