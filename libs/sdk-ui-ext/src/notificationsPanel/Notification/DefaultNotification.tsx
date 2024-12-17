// (C) 2024 GoodData Corporation
import React from "react";
import { INotification } from "@gooddata/sdk-model";
import { bem } from "../bem.js";
import { defineMessages, FormattedMessage } from "react-intl";
import { AlertNotification } from "./AlertNotification.js";

/**
 * @alpha
 */
export interface INotificationComponentProps {
    notification: INotification;
    markAsRead: (id: string) => void;
    onNotificationClick: (notification: INotification) => void;
}

const { b, e } = bem("gd-ui-ext-notification");

/**
 * @internal
 */
export function DefaultNotification({
    notification,
    markAsRead,
    onNotificationClick,
}: INotificationComponentProps) {
    if (notification.notificationType !== "alertNotification") {
        return <UnsupportedNotificationType />;
    }

    return (
        <AlertNotification
            notification={notification}
            markAsRead={markAsRead}
            onNotificationClick={onNotificationClick}
        />
    );
}

function UnsupportedNotificationType() {
    return (
        <div className={b({ isUnsupported: true })}>
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
