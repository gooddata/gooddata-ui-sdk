// (C) 2024-2025 GoodData Corporation
import React from "react";
import { INotification } from "@gooddata/sdk-model";
import { bem } from "../bem.js";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import { AlertNotification } from "./AlertNotification.js";

/**
 * Props for the Notification component.
 *
 * @public
 */
export interface INotificationComponentProps {
    /**
     * Notification to display.
     */
    notification: INotification;

    /**
     * Function to mark notification as read.
     */
    markNotificationAsRead: (id: string) => void;

    /**
     * Function to handle notification click.
     */
    onNotificationClick: (notification: INotification) => void;
}

const { b, e } = bem("gd-ui-ext-notification");

/**
 * Default implementation of the Notification component.
 *
 * @public
 */
export function DefaultNotification({
    notification,
    markNotificationAsRead,
    onNotificationClick,
}: INotificationComponentProps) {
    if (notification.notificationType !== "alertNotification") {
        return <UnsupportedNotificationType />;
    }

    return (
        <AlertNotification
            notification={notification}
            markNotificationAsRead={markNotificationAsRead}
            onNotificationClick={onNotificationClick}
        />
    );
}

function UnsupportedNotificationType() {
    const { formatMessage } = useIntl();
    return (
        <div
            className={b({ isUnsupported: true })}
            role="listitem"
            tabIndex={0}
            aria-label={formatMessage(messages.unsupportedNotificationType)}
        >
            <div className={e("unsupported")}>
                <FormattedMessage id={messages.unsupportedNotificationType.id} />
            </div>
        </div>
    );
}

const messages = defineMessages({
    unsupportedNotificationType: {
        id: "notifications.panel.unsupported.notification.type",
    },
});
