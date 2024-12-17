// (C) 2024 GoodData Corporation
import React from "react";
import { GoodDataSdkError, UseCancelablePromiseStatus } from "@gooddata/sdk-ui";
import { INotificationComponentProps } from "../Notification/DefaultNotification.js";
import { bem } from "../bem.js";
import { INotification } from "@gooddata/sdk-model";
import { INotificationsPanelView } from "../types.js";
import { PagedVirtualList } from "../components/VirtualList.js";
import {
    DefaultNotificationsListEmptyState,
    INotificationsListEmptyStateComponentProps,
} from "./DefaultNotificationsListEmptyState.js";
import {
    DefaultNotificationsListErrorState,
    INotificationsListErrorStateComponentProps,
} from "./DefaultNotificationsListErrorState.js";

const NOTIFICATION_ITEM_HEIGHT = 52;

/**
 * @alpha
 */
export interface INotificationsListComponentProps {
    NotificationsListEmptyState: React.ComponentType<INotificationsListEmptyStateComponentProps>;
    NotificationsListErrorState: React.ComponentType<INotificationsListErrorStateComponentProps>;
    Notification: React.ComponentType<INotificationComponentProps>;
    activeView: INotificationsPanelView;
    status: UseCancelablePromiseStatus;
    error?: GoodDataSdkError;
    notifications?: INotification[];
    markNotificationAsRead: (notificationId: string) => Promise<void>;
    onNotificationClick: (notification: INotification) => void;
    hasNextPage: boolean;
    loadNextPage: () => void;
}

const { b, e } = bem("gd-ui-ext-notifications-list");

/**
 * @internal
 */
export function DefaultNotificationsList({
    Notification,
    activeView,
    status,
    error,
    notifications,
    markNotificationAsRead,
    onNotificationClick,
    hasNextPage,
    loadNextPage,
}: INotificationsListComponentProps) {
    const isError = status === "error";
    const isEmpty = status === "success" && notifications?.length === 0;
    const isLoading = status === "loading" || status === "pending";
    const isSuccess = status === "success" && (notifications?.length ?? 0) > 0;

    return (
        <div className={b()}>
            {isError ? <DefaultNotificationsListErrorState error={error} /> : null}
            {isEmpty ? <DefaultNotificationsListEmptyState activeView={activeView} /> : null}
            {isLoading || isSuccess ? (
                <PagedVirtualList
                    items={notifications}
                    itemHeight={NOTIFICATION_ITEM_HEIGHT}
                    itemsGap={10}
                    itemPadding={15}
                    skeletonItemsCount={5}
                    hasNextPage={hasNextPage}
                    loadNextPage={loadNextPage}
                    isLoading={isLoading}
                >
                    {(notification) => (
                        <div className={e("notification")}>
                            <Notification
                                notification={notification}
                                markAsRead={markNotificationAsRead}
                                onNotificationClick={onNotificationClick}
                            />
                        </div>
                    )}
                </PagedVirtualList>
            ) : null}
        </div>
    );
}
