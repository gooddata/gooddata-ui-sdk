// (C) 2024-2025 GoodData Corporation
import React from "react";

import { defineMessages, useIntl } from "react-intl";

import { IAlertNotification } from "@gooddata/sdk-model";

import { bem } from "../bem.js";
import { DetailsDialog } from "../components/DetailsDialog.js";

const { b, e } = bem("gd-ui-ext-notification-triggers-detail-dialog");

/**
 * @internal
 */
interface INotificationTriggersDetailDialogProps {
    notification: IAlertNotification;
    onClose: () => void;
}

const messages = defineMessages({
    triggersTitle: {
        id: "notifications.panel.triggers.dialog.title",
    },
    newValue: {
        id: "notifications.panel.triggers.dialog.newValue",
    },
    truncatedValues: {
        id: "notifications.panel.triggers.dialog.truncatedValues",
    },
});

/**
 * @internal
 */
export function NotificationTriggersDetailDialog({
    notification,
    onClose,
}: INotificationTriggersDetailDialogProps) {
    const intl = useIntl();
    const values = notification.details.data.alert?.currentValues;
    const hiddenValuesCount = (notification.details.data.alert?.triggeredCount ?? 0) - (values?.length ?? 0);

    return (
        <DetailsDialog
            title={intl.formatMessage(messages.triggersTitle)}
            content={
                <div className={b()}>
                    <div className={e("header")}>
                        <div className={e("header-title")}>{notification.details.data.alert!.metric}</div>
                        <div className={e("header-title")}>{intl.formatMessage(messages.newValue)}</div>
                    </div>
                    <div className={e("table")}>
                        <div className={e("values-labels")}>
                            {values?.map((item, i) => (
                                <div key={i} className={e("values-label")}>
                                    {item.labelValue}
                                </div>
                            ))}
                        </div>
                        <div className={e("values")}>
                            {values?.map((item, i) => (
                                <div key={i} className={e("values-value")}>
                                    {item.primaryMetric!.formattedValue}
                                </div>
                            ))}
                        </div>
                    </div>
                    {hiddenValuesCount > 0 && (
                        <div className={e("values-truncated")}>
                            {intl.formatMessage(messages.truncatedValues, {
                                count: hiddenValuesCount,
                            })}
                        </div>
                    )}
                </div>
            }
            onClose={onClose}
        />
    );
}
