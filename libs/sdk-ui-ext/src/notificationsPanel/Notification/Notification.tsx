// (C) 2024-2025 GoodData Corporation
import React, { useCallback } from "react";

import compact from "lodash/compact.js";
import { FormattedDate, FormattedMessage, FormattedTime, defineMessages, useIntl } from "react-intl";

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
    IDateConfig,
    UiButton,
    UiIcon,
    UiIconButton,
    getDateTimeConfig,
    isActionKey,
    useToastMessage,
} from "@gooddata/sdk-ui-kit";

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

    const exports = compact([
        notification.details.data.visualExports,
        notification.details.data.tabularExports,
        notification.details.data.imageExports,
        notification.details.data.rawExports,
        notification.details.data.slidesExports,
        notification.details.data.dashboardTabularExports,
    ]).flatMap((arr) => arr ?? []);

    const hasExports = exports.length > 0;

    const fileExpiresAt = exports?.[0]?.expiresAt ?? null;
    const isExpired = fileExpiresAt != null && new Date(fileExpiresAt) < new Date();

    const { isError, errorTitle, errorMessage, traceId } = getNotificationErrorInfo(notification, exports);

    const actions = compact([
        hasFilters && isAlertNotification && <NotificationFiltersDetail filters={filters} />,
        hasTriggers && isSliced && <NotificationTriggerDetail notification={notification} />,
        hasExports && <FileLink notification={notification} />,
        hasExports && fileExpiresAt && <FileExpiration fileExpiresAt={fileExpiresAt} isExpired={isExpired} />,
    ]);

    const handleNotificationClick = useCallback(() => {
        if (!notification.isRead) {
            markNotificationAsRead(notification.id);
        }
        if (notification.notificationType === "scheduleNotification") {
            if (isExpired) {
                addWarning(messages.notificationExpired);
                return;
            }
            const downloadableExports = compact(exports.map(mapToDownloadableFile));
            if (downloadableExports.length > 0) {
                downloadFiles(downloadableExports);
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
        exports,
    ]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (isActionKey(event)) {
            event.preventDefault();
            handleNotificationClick();
        }
    };

    return (
        <BubbleHoverTrigger enabled={hasExports && !isExpired ? !isError : null}>
            <div
                className={b({ isRead: notification.isRead })}
                onClick={handleNotificationClick}
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
                                {errorTitle}{" "}
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
                                        <UiButton
                                            dataId="notification-error"
                                            id={id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggle();
                                            }}
                                            onKeyDown={(e) => {
                                                e.stopPropagation();
                                            }}
                                            variant="tertiary"
                                            size="small"
                                            label={intl.formatMessage({
                                                id: "notifications.panel.error.learnMore",
                                            })}
                                        />
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
                        <UiIconButton
                            onClick={(e) => {
                                e.stopPropagation();
                                markNotificationAsRead(notification.id);
                            }}
                            onKeyDown={(e) => {
                                e.stopPropagation();
                            }}
                            icon="check"
                            size="small"
                            variant="tertiary"
                            label={intl.formatMessage(messages.markAsRead)}
                        />
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

function getNotificationErrorInfo(
    notification: IAlertNotification | IScheduleNotification,
    exports: IExportResult[],
) {
    if (
        notification.notificationType === "alertNotification" &&
        notification.details.data.alert?.status !== "SUCCESS"
    ) {
        return {
            isError: true,
            errorTitle: <FormattedMessage id="notifications.panel.error.alert.title" />,
            errorMessage: notification.details.data.alert.errorMessage ?? "",
            traceId: notification.details.data.alert.traceId,
        };
    }
    if (exports.some((exportResult) => exportResult.status !== "SUCCESS")) {
        return {
            isError: true,
            errorTitle: <FormattedMessage id="notifications.panel.error.schedule.title" />,
            errorMessage:
                exports.find((exportResult) => exportResult.status !== "SUCCESS")?.errorMessage ?? "",
            traceId: exports.find((exportResult) => exportResult.status !== "SUCCESS")?.traceId,
        };
    }
    if (notification.details.webhookMessageType === "automation-task.limit-exceeded") {
        return {
            isError: true,
            errorTitle: <FormattedMessage id="notifications.panel.error.schedule.title" />,
            errorMessage: <FormattedMessage id="notifications.panel.error.limitExceeded.message" />,
            traceId: undefined,
        };
    }
    return { isError: false, errorTitle: undefined, errorMessage: undefined, traceId: undefined };
}

function NotificationTime({ config }: { config: IDateConfig }) {
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
}

function FileLink({ notification }: { notification: IAlertNotification | IScheduleNotification }) {
    return (
        <BubbleHoverTrigger eventsOnBubble={true}>
            <a
                href={notification.details.data.automation.dashboardURL}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
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
}

function FileExpiration({ fileExpiresAt, isExpired }: { fileExpiresAt: string; isExpired: boolean }) {
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
}

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
