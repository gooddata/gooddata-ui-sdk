// (C) 2024 GoodData Corporation
import React, { useCallback } from "react";
import { IAlertDescription, IAlertNotification, INotification } from "@gooddata/sdk-model";
import { getDateTimeConfig, IDateConfig, UiIcon } from "@gooddata/sdk-ui-kit";
import { bem } from "../bem.js";
import { Tooltip } from "../components/Tooltip.js";
// import { NotificationFiltersDetail } from "../NotificationFiltersDetail/NotificationFiltersDetail.js";
import { NotificationTriggerDetail } from "../NotificationTriggersDetail/NotificationTriggersDetail.js";
import { defineMessages, FormattedDate, FormattedMessage, FormattedTime, useIntl } from "react-intl";

/**
 * @internal
 */
export interface IAlertNotificationsProps {
    notification: IAlertNotification;
    markAsRead: (id: string) => void;
    onNotificationClick: (notification: IAlertNotification) => void;
}

const { b, e } = bem("gd-ui-ext-notification");

/**
 * @internal
 */
export function AlertNotification({
    notification,
    markAsRead,
    onNotificationClick,
}: IAlertNotificationsProps) {
    const intl = useIntl();

    const onMarkAsReadClick = (e: React.MouseEvent<HTMLSpanElement>) => {
        e.stopPropagation();
        markAsRead(notification.id);
    };

    const clickNotification = useCallback(
        (event: React.MouseEvent<HTMLDivElement>) => {
            const target = event.target;
            const targetIsElement = target instanceof Element;
            const isNotificationsDetailsLink =
                targetIsElement && target.closest(`[data-id="notification-detail"]`);
            if (isNotificationsDetailsLink) {
                return;
            }
            onNotificationClick(notification);
        },
        [onNotificationClick, notification],
    );

    // Hide filters for now, as there is lot of unresolved cases to consider
    // const filterCount = notification.details.data.alert.filterCount;
    // const isSliced = notification.details.data.alert.attribute;
    // const showSeparator = filterCount && filterCount > 0 && isSliced;
    const notificationTitle = getNotificationTitle(notification);

    return (
        <div className={b({ isRead: notification.isRead })} onClick={clickNotification}>
            <div className={e("icon")}>
                {!notification.isRead && <div className={e("unread-status")} />}
                <UiIcon type="alert" size={14} color="complementary-6" />
            </div>
            <div className={e("details")}>
                <div className={e("title", { isRead: notification.isRead })} title={notificationTitle}>
                    {notificationTitle}
                </div>
                <div className={e("links")}>
                    {/* <NotificationFiltersDetail notification={notification} />
                    {showSeparator ? "・" : null} */}
                    <NotificationTriggerDetail notification={notification} />
                </div>
            </div>
            <div className={e("time")}>
                <NotificationTime config={getDateTimeConfig(notification.createdAt)} />
            </div>
            <div className={e("mark-as-read-button")}>
                <Tooltip tooltip={intl.formatMessage(messages.markAsRead)}>
                    <span onClick={onMarkAsReadClick}>
                        <UiIcon
                            type="check"
                            size={14}
                            color="complementary-7"
                            label={intl.formatMessage(messages.markAsRead)}
                        />
                    </span>
                </Tooltip>
            </div>
        </div>
    );
}

function getNotificationTitle(notification: INotification) {
    if (notification.notificationType === "alertNotification") {
        return getAlertNotificationTitle(notification.details.data.alert);
    } else if (notification.notificationType === "scheduleNotification") {
        return notification.details.data.automation.title;
    }

    return notification.details.message;
}

function getAlertNotificationTitle(alertDescription: IAlertDescription) {
    const metric = alertDescription.metric;
    const condition = alertDescription.condition;
    const formattedThreshold = alertDescription.formattedThreshold;

    // TODO: translate (backend is currently returning English, should return translation strings)
    return `${metric} is ${condition} ${formattedThreshold}`;
}

const NotificationTime = ({ config }: { config: IDateConfig }) => {
    if (config.isToday) {
        return <FormattedTime value={config.date} format="hhmm" hour12={false} />;
    } else if (config.isYesterday) {
        return (
            <span>
                <FormattedMessage id="gs.date.yesterday" />
            </span>
        );
    }

    return <FormattedDate value={config.date} format="shortWithYear" />;
};

const messages = defineMessages({
    markAsRead: {
        id: "notifications.panel.markAsRead",
    },
});
