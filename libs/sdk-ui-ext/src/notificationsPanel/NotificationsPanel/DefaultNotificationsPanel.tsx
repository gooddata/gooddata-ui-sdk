// (C) 2024 GoodData Corporation
import React from "react";
import { GoodDataSdkError, UseCancelablePromiseStatus } from "@gooddata/sdk-ui";
import { INotificationsPanelHeaderComponentProps } from "./DefaultNotificationsPanelHeader.js";
import { bem } from "../bem.js";
import { INotificationsListComponentProps } from "../NotificationsList/DefaultNotificationsList.js";
import { INotification } from "@gooddata/sdk-model";
import { INotificationsPanelView } from "../types.js";
import { INotificationsListEmptyStateComponentProps } from "../NotificationsList/DefaultNotificationsListEmptyState.js";
import { INotificationsListErrorStateComponentProps } from "../NotificationsList/DefaultNotificationsListErrorState.js";
import { INotificationComponentProps } from "../Notification/DefaultNotification.js";

const { b } = bem("gd-ui-ext-notifications-panel");

/**
 * @alpha
 */
export interface INotificationsPanelComponentProps {
    NotificationsPanelHeader: React.ComponentType<INotificationsPanelHeaderComponentProps>;
    NotificationsList: React.ComponentType<INotificationsListComponentProps>;
    NotificationsListEmptyState: React.ComponentType<INotificationsListEmptyStateComponentProps>;
    NotificationsListErrorState: React.ComponentType<INotificationsListErrorStateComponentProps>;
    Notification: React.ComponentType<INotificationComponentProps>;

    toggleNotificationsPanel: () => void;
    openNotificationsPanel: () => void;
    closeNotificationsPanel: () => void;

    activeView: INotificationsPanelView;
    changeActiveView: (view: INotificationsPanelView) => void;

    markNotificationAsRead: (notificationId: string) => Promise<void>;
    markAllNotificationsAsRead: () => Promise<void>;
    unreadNotificationsCount: number;
    activeNotifications: INotification[];
    onNotificationClick: (notification: INotification) => void;

    status: UseCancelablePromiseStatus;
    error?: GoodDataSdkError;
    loadNextPage: () => void;
    hasNextPage: boolean;
}

/**
 * @internal
 */
export function DefaultNotificationsPanel({
    NotificationsPanelHeader,
    NotificationsList,
    NotificationsListEmptyState,
    NotificationsListErrorState,
    Notification,

    activeView,
    changeActiveView,

    markNotificationAsRead,
    markAllNotificationsAsRead,
    unreadNotificationsCount,
    activeNotifications,
    onNotificationClick,

    status,
    error,
    loadNextPage,
    hasNextPage,
}: INotificationsPanelComponentProps) {
    return (
        <div className={b()}>
            <NotificationsPanelHeader
                activeView={activeView}
                changeActiveView={changeActiveView}
                markAllAsRead={markAllNotificationsAsRead}
                hasUnreadNotifications={unreadNotificationsCount > 0}
                unreadNotificationsCount={unreadNotificationsCount}
            />
            <NotificationsList
                NotificationsListEmptyState={NotificationsListEmptyState}
                NotificationsListErrorState={NotificationsListErrorState}
                Notification={Notification}
                activeView={activeView}
                onNotificationClick={onNotificationClick}
                notifications={activeNotifications}
                markNotificationAsRead={markNotificationAsRead}
                status={status}
                error={error}
                loadNextPage={loadNextPage}
                hasNextPage={hasNextPage}
            />
        </div>
    );
}
