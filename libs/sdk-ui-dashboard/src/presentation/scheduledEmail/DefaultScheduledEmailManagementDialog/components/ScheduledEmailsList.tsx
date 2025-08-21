// (C) 2022-2025 GoodData Corporation
import React from "react";

import { FormattedMessage } from "react-intl";

import {
    IAutomationMetadataObject,
    INotificationChannelIdentifier,
    INotificationChannelMetadataObject,
} from "@gooddata/sdk-model";
import {
    LoadingSpinner,
    SELECT_ITEM_ACTION,
    UiAutofocus,
    useListWithActionsKeyboardNavigation,
} from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import { ScheduledEmail } from "./ScheduledEmail.js";

interface IScheduledEmailsProps {
    onDelete: (scheduledEmail: IAutomationMetadataObject) => void;
    onEdit: (scheduledEmail: IAutomationMetadataObject) => void;
    isLoading: boolean;
    scheduledEmails: IAutomationMetadataObject[];
    currentUserEmail?: string;
    noSchedulesMessageId: string;
    notificationChannels: INotificationChannelIdentifier[] | INotificationChannelMetadataObject[];
}

export function ScheduledEmails(props: IScheduledEmailsProps) {
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

    const { onKeyboardNavigation, onBlur, focusedItem, focusedAction, setFocusedAction } =
        useListWithActionsKeyboardNavigation({
            items: scheduledEmails,
            getItemAdditionalActions: () => ["delete"],
            actionHandlers: {
                selectItem: handleEdit,
                delete: handleDelete,
            },
            isNestedList: true,
        });

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === "ArrowRight" || event.key === "ArrowLeft")
            if (focusedAction === "delete") {
                setFocusedAction(SELECT_ITEM_ACTION);
            } else {
                setFocusedAction("delete");
            }

        onKeyboardNavigation(event);
    };

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
        <UiAutofocus>
            <div
                className="configuration-category gd-schedule-email__list"
                onKeyDown={handleKeyDown}
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
        </UiAutofocus>
    );
}
