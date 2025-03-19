// (C) 2024-2025 GoodData Corporation
import React from "react";
import { GoodDataSdkError, UseCancelablePromiseStatus } from "@gooddata/sdk-ui";
import { INotification } from "@gooddata/sdk-model";
import { INotificationsPanelHeaderComponentProps } from "./DefaultNotificationsPanelHeader.js";
import { INotificationsListComponentProps } from "../NotificationsList/DefaultNotificationsList.js";
import { INotificationsListEmptyStateComponentProps } from "../NotificationsList/DefaultNotificationsListEmptyState.js";
import { INotificationsListErrorStateComponentProps } from "../NotificationsList/DefaultNotificationsListErrorState.js";
import { INotificationComponentProps } from "../Notification/DefaultNotification.js";
import { INotificationSkeletonItemComponentProps } from "../NotificationsList/DefaultSkeletonItem.js";
import { bem } from "../bem.js";
import { INotificationsPanelView } from "../types.js";

const { b } = bem("gd-ui-ext-notifications-panel");

export const NOTIFICATIONS_PANEL_ID = "gd-ui-ext-notifications-panel-id";

/**
 * NotificationsPanel component props.
 *
 * @public
 */
export interface INotificationsPanelComponentProps {
    /**
     * Custom notifications panel header component.
     */
    NotificationsPanelHeader: React.ComponentType<INotificationsPanelHeaderComponentProps>;

    /**
     * Custom notifications list component.
     */
    NotificationsList: React.ComponentType<INotificationsListComponentProps>;

    /**
     * Custom notifications list empty state component.
     */
    NotificationsListEmptyState: React.ComponentType<INotificationsListEmptyStateComponentProps>;

    /**
     * Custom notifications list error state component.
     */
    NotificationsListErrorState: React.ComponentType<INotificationsListErrorStateComponentProps>;

    /**
     * Custom notification component.
     */
    Notification: React.ComponentType<INotificationComponentProps>;

    /**
     * Custom notification skeleton item component.
     */
    NotificationSkeletonItem: React.ComponentType<INotificationSkeletonItemComponentProps>;

    /**
     * The callback to toggle the notifications panel.
     */
    toggleNotificationsPanel: () => void;

    /**
     * The callback to open the notifications panel.
     */
    openNotificationsPanel: () => void;

    /**
     * The callback to close the notifications panel.
     */
    closeNotificationsPanel: () => void;

    /**
     * The currently active view of the notifications panel.
     */
    activeView: INotificationsPanelView;

    /**
     * The callback to change the active view of the notifications panel.
     */
    changeActiveView: (view: INotificationsPanelView) => void;

    /**
     * The callback to mark a notification as read.
     */
    markNotificationAsRead: (notificationId: string) => Promise<void>;

    /**
     * The callback to mark all notifications as read.
     */
    markAllNotificationsAsRead: () => Promise<void>;

    /**
     * The number of unread notifications.
     */
    unreadNotificationsCount: number;

    /**
     * Indicates if there are unread notifications.
     */
    hasUnreadNotifications: boolean;

    /**
     * Loaded notifications, relevant for the currently active view.
     */
    activeNotifications: INotification[];

    /**
     * The callback to handle a notification click.
     */
    onNotificationClick: (notification: INotification) => void;

    /**
     * The status of the notifications loading.
     */
    status: UseCancelablePromiseStatus;

    /**
     * The error that occurred while loading notifications.
     */
    error?: GoodDataSdkError;

    /**
     * The callback to load the next page of notifications.
     */
    loadNextPage: () => void;

    /**
     * Indicates if there is a next page of notifications.
     */
    hasNextPage: boolean;

    /**
     * The height of the notification item in pixels.
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
}

/**
 * Default implementation of the NotificationsPanel component.
 *
 * @public
 */
export function DefaultNotificationsPanel({
    NotificationsPanelHeader,
    NotificationsList,
    NotificationsListEmptyState,
    NotificationsListErrorState,
    Notification,
    NotificationSkeletonItem,

    activeView,
    changeActiveView,

    markNotificationAsRead,
    markAllNotificationsAsRead,
    unreadNotificationsCount,
    hasUnreadNotifications,
    activeNotifications,
    onNotificationClick,

    status,
    error,
    loadNextPage,
    hasNextPage,

    itemHeight,
    itemsGap,
    itemPadding,
    skeletonItemsCount,
    maxListHeight,
}: INotificationsPanelComponentProps) {
    return (
        <div className={b()} id={NOTIFICATIONS_PANEL_ID}>
            <NotificationsPanelHeader
                activeView={activeView}
                changeActiveView={changeActiveView}
                markAllNotificationsAsRead={markAllNotificationsAsRead}
                hasUnreadNotifications={hasUnreadNotifications}
                unreadNotificationsCount={unreadNotificationsCount}
            />
            <NotificationsList
                NotificationsListEmptyState={NotificationsListEmptyState}
                NotificationsListErrorState={NotificationsListErrorState}
                Notification={Notification}
                NotificationSkeletonItem={NotificationSkeletonItem}
                activeView={activeView}
                onNotificationClick={onNotificationClick}
                activeNotifications={activeNotifications}
                markNotificationAsRead={markNotificationAsRead}
                status={status}
                error={error}
                loadNextPage={loadNextPage}
                hasNextPage={hasNextPage}
                itemHeight={itemHeight}
                itemsGap={itemsGap}
                itemPadding={itemPadding}
                skeletonItemsCount={skeletonItemsCount}
                maxListHeight={maxListHeight}
            />
        </div>
    );
}
