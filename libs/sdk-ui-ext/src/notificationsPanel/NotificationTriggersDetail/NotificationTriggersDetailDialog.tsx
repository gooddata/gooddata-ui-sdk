// (C) 2024-2025 GoodData Corporation
import { IAlertNotification } from "@gooddata/sdk-model";
import React from "react";
import { DetailsDialog } from "../components/DetailsDialog.js";
import { bem } from "../bem.js";
import { useIntl, defineMessages } from "react-intl";

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
});

/**
 * @internal
 */
export function NotificationTriggersDetailDialog({
    notification,
    onClose,
}: INotificationTriggersDetailDialogProps) {
    const intl = useIntl();
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
                            {notification.details.data.alert.currentValues?.map((item, i) => (
                                <div key={i} className={e("values-label")}>
                                    {item.labelValue}
                                </div>
                            ))}
                        </div>
                        <div className={e("values")}>
                            {notification.details.data.alert.currentValues?.map((item, i) => (
                                <div key={i} className={e("values-value")}>
                                    {item.primaryMetric!.formattedValue}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            }
            onClose={onClose}
        />
    );
}
