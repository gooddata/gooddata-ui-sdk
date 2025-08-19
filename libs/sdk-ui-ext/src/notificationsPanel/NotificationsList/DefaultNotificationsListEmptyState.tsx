// (C) 2024-2025 GoodData Corporation
import React from "react";

import { defineMessages, useIntl } from "react-intl";

import { bem } from "../bem.js";
import { INotificationsPanelView } from "../types.js";

const { b } = bem("gd-ui-ext-notifications-list-empty-state");

/**
 * Props for the NotificationsListEmptyState component.
 *
 * @public
 */
export interface INotificationsListEmptyStateComponentProps {
    /**
     * Active view of the notifications list.
     */
    activeView: INotificationsPanelView;
}

const messages = defineMessages({
    emptyStateAll: {
        id: "notifications.panel.empty.all",
    },
    emptyStateUnread: {
        id: "notifications.panel.empty.unread",
    },
});

/**
 * Default implementation of the NotificationsListEmptyState component.
 *
 * @public
 */
export function DefaultNotificationsListEmptyState({
    activeView,
}: INotificationsListEmptyStateComponentProps) {
    const intl = useIntl();
    return (
        <div className={b()}>
            {activeView === "all"
                ? intl.formatMessage(messages.emptyStateAll)
                : intl.formatMessage(messages.emptyStateUnread)}
        </div>
    );
}
