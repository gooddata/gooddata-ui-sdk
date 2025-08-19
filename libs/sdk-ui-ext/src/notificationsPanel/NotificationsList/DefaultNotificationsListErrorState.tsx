// (C) 2024-2025 GoodData Corporation
import React from "react";

import { defineMessages, useIntl } from "react-intl";

import { GoodDataSdkError } from "@gooddata/sdk-ui";

import { bem } from "../bem.js";

const { b } = bem("gd-ui-ext-notifications-list-error-state");

/**
 * Props for the NotificationsListErrorState component.
 *
 * @public
 */
export interface INotificationsListErrorStateComponentProps {
    /**
     * Error to display.
     */
    error?: GoodDataSdkError;
}

const messages = defineMessages({
    errorLoadingNotifications: {
        id: "notifications.panel.error.loading",
    },
});

/**
 * Default implementation of the NotificationsListErrorState component.
 *
 * @public
 */
export function DefaultNotificationsListErrorState({ error }: INotificationsListErrorStateComponentProps) {
    const intl = useIntl();
    return (
        <div className={b()}>{error?.message ?? intl.formatMessage(messages.errorLoadingNotifications)}</div>
    );
}
