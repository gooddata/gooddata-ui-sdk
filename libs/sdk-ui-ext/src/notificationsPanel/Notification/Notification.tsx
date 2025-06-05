// (C) 2024-2025 GoodData Corporation
import {
    IAlertDescription,
    IAlertNotification,
    IExportResult,
    INotification,
    IScheduleNotification,
} from "@gooddata/sdk-model";
import {
    Bubble,
    BubbleHoverTrigger,
    getDateTimeConfig,
    IDateConfig,
    isActionKey,
    UiIcon,
    useToastMessage,
} from "@gooddata/sdk-ui-kit";

import compact from "lodash/compact.js";
import React, { useCallback } from "react";
import { defineMessages, FormattedDate, FormattedMessage, FormattedTime, useIntl } from "react-intl";
import { bem } from "../bem.js";
import { Popup } from "../components/Popup.js";
import { Tooltip } from "../components/Tooltip.js";
import { NotificationFiltersDetail } from "../NotificationFiltersDetail/NotificationFiltersDetail.js";
import { NotificationTriggerDetail } from "../NotificationTriggersDetail/NotificationTriggersDetail.js";
import { downloadFiles } from "../utils/downloadFiles.js";

/**
 * @internal
 */
export interface INotificationsProps {
    notification: IAlertNotification | IScheduleNotification;
    markNotificationAsRead: (id: string) => void;
    onNotificationClick?: (notification: IAlertNotification | IScheduleNotification) => void;
    closeNotificationsPanel: () => void;
}

const { b, e } = bem("gd-ui-ext-notification");

/**
 * @internal
 */
export function Notification({
    notification,
    markNotificationAsRead,
    onNotificationClick,
    closeNotificationsPanel,
}: INotificationsProps) {
    const intl = useIntl();
    const { addWarning } = useToastMessage();

    const notificationTitle = getNotificationTitle(notification);

    const filters = notification.details.data.filters;
    const hasFilters = !!filters?.length;

    const isAlertNotification = notification.notificationType === "alertNotification";
    const isScheduleNotification = notification.notificationType === "scheduleNotification";

    const isSliced = isAlertNotification && !!notification.details.data.alert.attribute;
    const hasTriggers = isAlertNotification && !!notification.details.data.alert.totalValueCount;

    const isError = isAlertNotification && notification.details.data.alert.status !== "SUCCESS";
    const errorMessage = isAlertNotification && notification.details.data.alert.errorMessage;
    const traceId = isAlertNotification && notification.details.data.alert.traceId;

    const hasFile =
        (notification.details.data.visualExports?.length ?? 0) > 0 ||
        (notification.details.data.tabularExports?.length ?? 0) > 0;

    const fileExpiresAt =
        notification.details.data.tabularExports?.[0]?.expiresAt ??
        notification.details.data.visualExports?.[0]?.expiresAt;

    const isExpired = fileExpiresAt != null && new Date(fileExpiresAt) < new Date();

    const actions = compact([
        hasFilters && isAlertNotification && <NotificationFiltersDetail filters={filters} />,
        hasTriggers && isSliced && <NotificationTriggerDetail notification={notification} />,
        hasFile && <FileLink notification={notification} />,
        hasFile && fileExpiresAt && <FileExpiration fileExpiresAt={fileExpiresAt} isExpired={isExpired} />,
    ]);

    const onMarkAsReadClick = (e: React.MouseEvent<HTMLSpanElement>) => {
        e.stopPropagation();
        markNotificationAsRead(notification.id);
    };

    const clickNotification = useCallback(() => {
        if (!notification.isRead) {
            markNotificationAsRead(notification.id);
        }
        if (notification.notificationType === "scheduleNotification") {
            if (isExpired) {
                addWarning(messages.notificationExpired);
                return;
            }
            const tabularExportUrls =
                notification.details.data.tabularExports?.map(mapToDownloadableFile) ?? [];
            const visualExportUrls =
                notification.details.data.visualExports?.map(mapToDownloadableFile) ?? [];
            const allExports = compact([...tabularExportUrls, ...visualExportUrls]);
            if (allExports.length > 0) {
                downloadFiles(allExports);
            }
        } else {
            closeNotificationsPanel();
            onNotificationClick?.(notification);
        }
    }, [
        onNotificationClick,
        notification,
        isExpired,
        markNotificationAsRead,
        closeNotificationsPanel,
        addWarning,
    ]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (isActionKey(event)) {
            event.preventDefault();
            clickNotification();
        }
    };

    return (
        <BubbleHoverTrigger enabled={hasFile && !isExpired}>
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
                    {isAlertNotification ? (
                        <UiIcon type="alert" size={14} color="complementary-6" ariaHidden />
                    ) : (
                        <UiIcon type="download" size={14} color="complementary-6" ariaHidden />
                    )}
                </div>
                <div className={e("details")}>
                    <div className={e("title", { isRead: notification.isRead })} title={notificationTitle}>
                        {isScheduleNotification ? (
                            <FormattedMessage id="notifications.panel.download" />
                        ) : null}{" "}
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
                                            <FormattedMessage id="notifications.panel.error.traceId" />:{" "}
                                            {traceId}
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
            <Bubble alignPoints={[{ align: "bc tc" }]}>
                <FormattedMessage id="notifications.panel.downloadFilesHint" />
            </Bubble>
        </BubbleHoverTrigger>
    );
}

function mapToDownloadableFile(exportFile: IExportResult) {
    if (!exportFile.fileUri) {
        return undefined;
    }
    return {
        url: exportFile.fileUri,
        fileName: exportFile.fileName,
    };
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

const FileLink = ({ notification }: { notification: IAlertNotification | IScheduleNotification }) => {
    return (
        <BubbleHoverTrigger eventsOnBubble={true}>
            <a
                href={notification.details.data.automation.dashboardURL}
                onClick={(e) => e.stopPropagation()}
                className={e("link")}
            >
                <FormattedMessage
                    id="notifications.panel.dashboardLink"
                    values={{ dashboardTitle: notification.details.data.automation.dashboardTitle }}
                />
            </a>
            <Bubble alignPoints={[{ align: "bc tc" }]}>
                {" "}
                <FormattedMessage id="notifications.panel.dashboardLinkHint" />{" "}
            </Bubble>
        </BubbleHoverTrigger>
    );
};

const FileExpiration = ({ fileExpiresAt, isExpired }: { fileExpiresAt: string; isExpired: boolean }) => {
    if (isExpired) {
        return (
            <span>
                <FormattedMessage id="notifications.panel.linkHasExpired" />
            </span>
        );
    }
    return (
        <BubbleHoverTrigger eventsOnBubble={true}>
            <span>
                <FormattedMessage
                    id="notifications.panel.expiresOn"
                    values={{
                        date: (
                            <FormattedDate
                                value={getDateTimeConfig(fileExpiresAt).date}
                                format="shortWithoutYear"
                            />
                        ),
                    }}
                />
            </span>
            <Bubble alignPoints={[{ align: "bc tc" }]}>
                {" "}
                <FormattedTime value={getDateTimeConfig(fileExpiresAt).date} format="hhmm" />{" "}
            </Bubble>
        </BubbleHoverTrigger>
    );
};

const messages = defineMessages({
    markAsRead: {
        id: "notifications.panel.markAsRead",
    },
    alertNotificationTypeLabel: {
        id: "notifications.panel.alert.notification.type.label",
    },
    notificationExpired: {
        id: "notifications.panel.toast.warning.filesExpired",
        values: {
            strong: (text: string) => <strong>{text}</strong>,
        },
    },
});
