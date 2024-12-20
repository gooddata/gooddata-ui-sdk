// (C) 2024 GoodData Corporation
import React from "react";
import { bem } from "../bem.js";
import { GoodDataSdkError } from "@gooddata/sdk-ui";
import { defineMessages, useIntl } from "react-intl";

const { b } = bem("gd-ui-ext-notifications-list-error-state");

/**
 * @alpha
 */
export interface INotificationsListErrorStateComponentProps {
    error?: GoodDataSdkError;
}

const messages = defineMessages({
    errorLoadingNotifications: {
        id: "notifications.panel.error.loading",
    },
});

/**
 * @internal
 */
export function DefaultNotificationsListErrorState({ error }: INotificationsListErrorStateComponentProps) {
    const intl = useIntl();
    return (
        <div className={b()}>{error?.message ?? intl.formatMessage(messages.errorLoadingNotifications)}</div>
    );
}
