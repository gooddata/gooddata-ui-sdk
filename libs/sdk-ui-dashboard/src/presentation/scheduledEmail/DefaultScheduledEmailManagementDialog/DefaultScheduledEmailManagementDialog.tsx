// (C) 2022-2025 GoodData Corporation

import React, { useCallback, useState } from "react";
import { FormattedMessage, defineMessage, useIntl } from "react-intl";
import { AddButton, Button, Dialog, Hyperlink, Typography } from "@gooddata/sdk-ui-kit";
import { IAutomationMetadataObject } from "@gooddata/sdk-model";

import { ScheduledEmails } from "./components/ScheduledEmailsList.js";
import { DeleteScheduleConfirmDialog } from "./components/DeleteScheduleConfirmDialog.js";

import { IScheduledEmailManagementDialogProps } from "../types.js";
import {
    selectCurrentUser,
    selectEntitlementMaxAutomations,
    selectEntitlementUnlimitedAutomations,
    useDashboardSelector,
    DEFAULT_MAX_AUTOMATIONS,
    selectCanCreateAutomation,
    selectIsWhiteLabeled,
} from "../../../model/index.js";
import { messages } from "../../../locales.js";
import { isMobileView } from "../utils/responsive.js";

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
        notificationChannels,
    } = props;
    const [scheduledEmailToDelete, setScheduledEmailToDelete] = useState<IAutomationMetadataObject | null>(
        null,
    );
    const canCreateAutomation = useDashboardSelector(selectCanCreateAutomation);
    const currentUser = useDashboardSelector(selectCurrentUser);
    const maxAutomationsEntitlement = useDashboardSelector(selectEntitlementMaxAutomations);
    const unlimitedAutomationsEntitlement = useDashboardSelector(selectEntitlementUnlimitedAutomations);
    const isWhiteLabeled = useDashboardSelector(selectIsWhiteLabeled);
    const maxAutomations = parseInt(maxAutomationsEntitlement?.value ?? DEFAULT_MAX_AUTOMATIONS, 10);
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

    const maxAutomationsReached = automations.length >= maxAutomations && !unlimitedAutomationsEntitlement;

    const helpTextId = isMobileView()
        ? defineMessage({ id: "dialogs.schedule.email.footer.title.short" }).id
        : defineMessage({ id: "dialogs.schedule.email.footer.title" }).id;

    return (
        <>
            <Dialog
                displayCloseButton={true}
                onCancel={onClose}
                className="gd-notifications-channels-management-dialog s-scheduled-email-management-dialog"
            >
                <div className="gd-notifications-channels-management-dialog-title">
                    <Typography tagName="h3" className="gd-dialog-header">
                        <FormattedMessage id="dialogs.schedule.management.title" />
                    </Typography>
                </div>
                <div className="gd-notifications-channels-content">
                    <div className="gd-notifications-channels-content-header">
                        <Typography tagName="h3">
                            <FormattedMessage id={messages.scheduleManagementListTitle.id!} />
                        </Typography>
                        {canCreateAutomation ? (
                            <AddButton
                                onClick={onAdd}
                                isDisabled={isLoadingScheduleData || maxAutomationsReached}
                                title={<FormattedMessage id={messages.scheduleManagementCreate.id!} />}
                                tooltip={
                                    maxAutomationsReached ? (
                                        <FormattedMessage id={messages.scheduleManagementCreateTooMany.id!} />
                                    ) : undefined
                                }
                            />
                        ) : null}
                    </div>
                    <ScheduledEmails
                        onDelete={handleScheduleDelete}
                        onEdit={handleScheduleEdit}
                        isLoading={isLoadingScheduleData}
                        scheduledEmails={automations}
                        currentUserEmail={currentUser?.email}
                        noSchedulesMessageId={messages.scheduleManagementNoSchedules.id!}
                        notificationChannels={notificationChannels}
                    />
                </div>
                <div className="gd-content-divider"></div>
                <div className="gd-buttons">
                    {!isWhiteLabeled ? (
                        <Hyperlink
                            text={intl.formatMessage({ id: helpTextId })}
                            href="https://www.gooddata.com/docs/cloud/create-dashboards/automation/scheduled-exports/#ScheduleExportsinDashboards-ScheduleExport"
                            iconClass="gd-icon-circle-question"
                        />
                    ) : null}
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
