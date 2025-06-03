// (C) 2024-2025 GoodData Corporation
import React from "react";
import { useElementSize, UiPagedVirtualList } from "@gooddata/sdk-ui-kit";
import { GoodDataSdkError, UseCancelablePromiseStatus } from "@gooddata/sdk-ui";
import { INotificationComponentProps } from "../Notification/DefaultNotification.js";
import { bem } from "../bem.js";
import { INotification } from "@gooddata/sdk-model";
import { INotificationsPanelView } from "../types.js";
import { INotificationsListEmptyStateComponentProps } from "./DefaultNotificationsListEmptyState.js";
import { INotificationsListErrorStateComponentProps } from "./DefaultNotificationsListErrorState.js";
import { INotificationSkeletonItemComponentProps } from "./DefaultSkeletonItem.js";
import { useIntl, defineMessages } from "react-intl";

const { b } = bem("gd-ui-ext-notifications-list");

/**
 * Props for the NotificationsList component.
 *
 * @public
 */
export interface INotificationsListComponentProps {
    /**
     * Component to render when the notifications list is empty.
     */
    NotificationsListEmptyState: React.ComponentType<INotificationsListEmptyStateComponentProps>;

    /**
     * Component to render when the notifications list is in error state.
     */
    NotificationsListErrorState: React.ComponentType<INotificationsListErrorStateComponentProps>;

    /**
     * Component to render each notification.
     */
    Notification: React.ComponentType<INotificationComponentProps>;

    /**
     * Component to render each skeleton item.
     */
    NotificationSkeletonItem: React.ComponentType<INotificationSkeletonItemComponentProps>;

    /**
     * Active view of the notifications list.
     */
    activeView: INotificationsPanelView;

    /**
     * Status of the notifications list.
     */
    status: UseCancelablePromiseStatus;

    /**
     * Error to display.
     */
    error?: GoodDataSdkError;

    /**
     * Loaded notifications relevant to the active view.
     */
    activeNotifications?: INotification[];

    /**
     * Callback function to mark notification as read.
     */
    markNotificationAsRead: (notificationId: string) => Promise<void>;

    /**
     * Callback function to handle notification click.
     */
    onNotificationClick?: (notification: INotification) => void;

    /**
     * Whether there is a next page of notifications.
     */
    hasNextPage: boolean;

    /**
     * Load next page of notifications.
     */
    loadNextPage: () => void;

    /**
     * Height of the notification item in pixels.
     */
    itemHeight: number;

    /**
     * Gap between notification items in pixels.
     */
    itemsGap: number;

    /**
     * Padding of the notification item (from left/right) in pixels.
     */
    itemPadding: number;

    /**
     * Number of skeleton items to render when loading notifications.
     */
    skeletonItemsCount: number;

    /**
     * Maximum height of the notifications list in pixels.
     */
    maxListHeight?: number;

    /**
     * Callback function to close the notifications panel.
     */
    closeNotificationsPanel: () => void;
}

/**
 * Default implementation of the NotificationsList component.
 *
 * @public
 */
export function DefaultNotificationsList({
    Notification,
    NotificationsListEmptyState,
    NotificationsListErrorState,
    NotificationSkeletonItem,
    activeView,
    status,
    error,
    activeNotifications,
    markNotificationAsRead,
    onNotificationClick,
    hasNextPage,
    loadNextPage,
    itemHeight,
    itemsGap,
    itemPadding,
    skeletonItemsCount,
    maxListHeight = 0,
    closeNotificationsPanel,
}: INotificationsListComponentProps) {
    const isError = status === "error";
    const isEmpty = status === "success" && activeNotifications?.length === 0;
    const isLoading = status === "loading" || status === "pending";
    const isSuccess = status === "success" && (activeNotifications?.length ?? 0) > 0;

    const { height, ref } = useElementSize();

    const { formatMessage } = useIntl();

    return (
        <div
            className={b()}
            ref={(node) => {
                ref.current = node;
            }}
            role="list"
            aria-label={formatMessage(messages.notificationsListLabel)}
        >
            {isError ? <NotificationsListErrorState error={error} /> : null}
            {isEmpty ? <NotificationsListEmptyState activeView={activeView} /> : null}
            {isLoading || isSuccess ? (
                <UiPagedVirtualList
                    items={activeNotifications}
                    itemHeight={itemHeight}
                    itemsGap={itemsGap}
                    itemPadding={itemPadding}
                    skeletonItemsCount={skeletonItemsCount}
                    hasNextPage={hasNextPage}
                    loadNextPage={loadNextPage}
                    isLoading={isLoading}
                    maxHeight={Math.max(maxListHeight, height, (itemHeight + itemsGap) * skeletonItemsCount)}
                    SkeletonItem={NotificationSkeletonItem}
                >
                    {(notification) => (
                        <Notification
                            notification={notification}
                            markNotificationAsRead={markNotificationAsRead}
                            onNotificationClick={onNotificationClick}
                            closeNotificationsPanel={closeNotificationsPanel}
                        />
                    )}
                </UiPagedVirtualList>
            ) : null}
        </div>
    );
}

const messages = defineMessages({
    notificationsListLabel: {
        id: "notifications.panel.notifications.list.label",
    },
});
