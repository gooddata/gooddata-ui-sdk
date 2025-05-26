// (C) 2022-2025 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { IAutomationMetadataObject, INotificationChannelMetadataObject } from "@gooddata/sdk-model";
import { AutofocusOnMount, LoadingSpinner, useListWithActionsKeyboardNavigation } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import { ScheduledEmail } from "./ScheduledEmail.js";

interface IScheduledEmailsProps {
    onDelete: (scheduledEmail: IAutomationMetadataObject) => void;
    onEdit: (scheduledEmail: IAutomationMetadataObject) => void;
    isLoading: boolean;
    scheduledEmails: IAutomationMetadataObject[];
    currentUserEmail?: string;
    noSchedulesMessageId: string;
    notificationChannels: INotificationChannelMetadataObject[];
}

export const ScheduledEmails: React.FC<IScheduledEmailsProps> = (props) => {
    const { isLoading, scheduledEmails, onDelete, onEdit, noSchedulesMessageId, notificationChannels } =
        props;
    const theme = useTheme();

    const handleEdit = React.useCallback(
        (scheduledEmail: IAutomationMetadataObject) => () => {
            onEdit(scheduledEmail);
        },
        [onEdit],
    );

    const handleDelete = React.useCallback(
        (scheduledEmail: IAutomationMetadataObject) => () => {
            onDelete(scheduledEmail);
        },
        [onDelete],
    );

    const { onKeyboardNavigation, onBlur, focusedItem, focusedAction } = useListWithActionsKeyboardNavigation(
        {
            items: scheduledEmails,
            getItemAdditionalActions: () => ["scheduleEmail", "delete"],
            actionHandlers: {
                selectItem: handleEdit,
                delete: handleDelete,
                scheduleEmail: handleEdit,
            },
        },
    );

    if (isLoading) {
        return (
            <div className="gd-loading-equalizer-wrap gd-notifications-channels-message">
                <div className="gd-loading-equalizer gd-loading-equalizer-fade">
                    <LoadingSpinner
                        className="large gd-loading-equalizer-spinner"
                        color={theme?.palette?.complementary?.c9}
                    />
                </div>
            </div>
        );
    }

    if (scheduledEmails.length === 0) {
        return (
            <div className="gd-notifications-channels-message s-no-schedules-message">
                <FormattedMessage id={noSchedulesMessageId} values={{ br: <br /> }} />
            </div>
        );
    }

    return (
        <AutofocusOnMount>
            <div
                className="configuration-category gd-schedule-email__list"
                onKeyDown={onKeyboardNavigation}
                onBlur={onBlur}
                tabIndex={scheduledEmails.length > 0 ? 0 : -1}
            >
                {scheduledEmails.map((scheduledEmail) => (
                    <ScheduledEmail
                        key={scheduledEmail.id}
                        scheduledEmail={scheduledEmail}
                        focusedAction={scheduledEmail === focusedItem ? focusedAction : undefined}
                        onDelete={onDelete}
                        onEdit={handleEdit(scheduledEmail)}
                        notificationChannels={notificationChannels}
                    />
                ))}
            </div>
        </AutofocusOnMount>
    );
};
