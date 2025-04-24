// (C) 2024-2025 GoodData Corporation
import { IAlertDescription, IAlertNotification, INotification } from "@gooddata/sdk-model";
import { getDateTimeConfig, IDateConfig, isActionKey, UiIcon } from "@gooddata/sdk-ui-kit";
import React, { useCallback } from "react";
import { bem } from "../bem.js";
import { Popup } from "../components/Popup.js";
import { Tooltip } from "../components/Tooltip.js";
// import { NotificationFiltersDetail } from "../NotificationFiltersDetail/NotificationFiltersDetail.js";
import { defineMessages, FormattedDate, FormattedMessage, FormattedTime, useIntl } from "react-intl";
import { NotificationFiltersDetail } from "../NotificationFiltersDetail/NotificationFiltersDetail.js";
import { NotificationTriggerDetail } from "../NotificationTriggersDetail/NotificationTriggersDetail.js";

/**
 * @internal
 */
export interface IAlertNotificationsProps {
    notification: IAlertNotification;
    markNotificationAsRead: (id: string) => void;
    onNotificationClick: (notification: IAlertNotification) => void;
}

const { b, e } = bem("gd-ui-ext-notification");

/**
 * @internal
 */
export function AlertNotification({
    notification,
    markNotificationAsRead,
    onNotificationClick,
}: IAlertNotificationsProps) {
    const intl = useIntl();

    const onMarkAsReadClick = (e: React.MouseEvent<HTMLSpanElement>) => {
        e.stopPropagation();
        markNotificationAsRead(notification.id);
    };

    const clickNotification = useCallback(
        (event: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>) => {
            const target = event.target;
            const targetIsElement = target instanceof Element;
            const isNotificationsDetailsLink =
                targetIsElement &&
                (target.closest(`[data-id="notification-detail"]`) ||
                    target.closest(`[data-id="notification-error"]`));
            if (isNotificationsDetailsLink) {
                return;
            }
            onNotificationClick(notification);
        },
        [onNotificationClick, notification],
    );

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (isActionKey(event)) {
            event.preventDefault();
            clickNotification(event);
        }
    };

    const notificationTitle = getNotificationTitle(notification);

    const filters = notification.details.data.filters;
    const hasFilters = !!filters?.length;

    const isSliced = notification.details.data.alert.attribute;
    const hasTriggers = !!notification.details.data.alert.totalValueCount;

    const isError = notification.details.data.alert.status !== "SUCCESS";
    const errorMessage = notification.details.data.alert.errorMessage;
    const traceId = notification.details.data.alert.traceId;

    const actions = [
        hasFilters && <NotificationFiltersDetail filters={filters} />,
        hasTriggers && isSliced && <NotificationTriggerDetail notification={notification} />,
    ].filter((x): x is React.JSX.Element => !!x);

    return (
        <div
            className={b({ isRead: notification.isRead })}
            onClick={clickNotification}
            onKeyDown={handleKeyDown}
            role="listitem"
            tabIndex={0}
            aria-label={intl.formatMessage(messages.alertNotificationTypeLabel)}
        >
            <div className={e("icon")}>
                {!notification.isRead && <div className={e("unread-status")} />}
                <UiIcon type="alert" size={14} color="complementary-6" ariaHidden />
            </div>
            <div className={e("details")}>
                <div className={e("title", { isRead: notification.isRead })} title={notificationTitle}>
                    {notificationTitle}
                </div>
                {isError ? (
                    <div className={e("error")}>
                        <div className={e("error-icon")}>
                            <UiIcon type="crossCircle" size={12} color="error" />
                        </div>
                        <div>
                            <FormattedMessage id="notifications.panel.error.message" />{" "}
                            <Popup
                                popup={
                                    <div className={e("error-popup")}>
                                        {errorMessage}
                                        <br />
                                        <FormattedMessage id="notifications.panel.error.traceId" />: {traceId}
                                    </div>
                                }
                            >
                                {({ toggle, id }) => (
                                    <u data-id="notification-error" id={id} onClick={toggle}>
                                        <FormattedMessage id="notifications.panel.error.learnMore" />
                                    </u>
                                )}
                            </Popup>
                        </div>
                    </div>
                ) : actions.length ? (
                    <div className={e("links")}>
                        {actions.map((action, index) => (
                            <React.Fragment key={index}>
                                {!!index && "・"}
                                {action}
                            </React.Fragment>
                        ))}
                    </div>
                ) : null}
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
    alertNotificationTypeLabel: {
        id: "notifications.panel.alert.notification.type.label",
    },
});
