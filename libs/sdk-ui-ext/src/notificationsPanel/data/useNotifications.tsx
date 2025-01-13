// (C) 2024-2025 GoodData Corporation

import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { UnexpectedSdkError, useWorkspace } from "@gooddata/sdk-ui";

import { useCallback, useMemo, useState } from "react";
import { useOrganization } from "../@staging/OrganizationContext/OrganizationContext.js";
import { useFetchNotifications } from "./useFetchNotifications.js";

/**
 * Hook for fetching all and unread notifications.
 *
 * @internal
 */
export interface IUseNotificationsProps {
    /**
     * Workspace to fetch notifications from.
     *
     * - If not provided, the workspace from WorkspaceProvider is used.
     * - If not provided and there is no WorkspaceProvider, notifications will be loaded from all workspaces.
     */
    workspace?: string;

    /**
     * Backend to fetch notifications from.
     */
    backend?: IAnalyticalBackend;

    /**
     * Refresh interval in milliseconds.
     */
    refreshInterval: number;

    /**
     * Number of items per page.
     */
    itemsPerPage: number;
}

/**
 * @internal
 */
export function useNotifications({ workspace, refreshInterval, itemsPerPage }: IUseNotificationsProps) {
    const effectiveWorkspace = useWorkspace(workspace);

    const {
        notifications,
        hasNextPage: notificationsHasNextPage,
        error: notificationsError,
        loadNextPage: notificationsLoadNextPage,
        status: notificationsStatus,
        reset: notificationsReset,
    } = useFetchNotifications({
        workspace: effectiveWorkspace,
        refreshInterval,
        itemsPerPage,
    });
    const {
        error: unreadNotificationsError,
        hasNextPage: unreadNotificationsHasNextPage,
        loadNextPage: unreadNotificationsLoadNextPage,
        notifications: unreadNotifications,
        status: unreadNotificationsStatus,
        totalNotificationsCount: unreadNotificationsCount,
        reset: unreadNotificationsReset,
    } = useFetchNotifications({
        workspace: effectiveWorkspace,
        readStatus: "unread",
        refreshInterval,
        itemsPerPage,
    });

    const { result: organizationService, status: organizationStatus } = useOrganization();

    const [markedAsReadNotifications, setMarkedAsReadNotifications] = useState<string[]>([]);

    const markNotificationAsRead = useCallback(
        async (notificationId: string) => {
            if (organizationStatus === "error") {
                throw new UnexpectedSdkError("Cannot call markAsRead - organization load failed.");
            }

            if (organizationStatus === "pending" || organizationStatus === "loading") {
                throw new UnexpectedSdkError("Cannot call markAsRead - organization is not initialized.");
            }

            await organizationService.notifications().markNotificationAsRead(notificationId);
            setMarkedAsReadNotifications((prev) => [...prev, notificationId]);
        },
        [organizationStatus, organizationService, setMarkedAsReadNotifications],
    );

    const markAllNotificationsAsRead = useCallback(async () => {
        if (organizationStatus === "error") {
            throw new UnexpectedSdkError("Cannot call markAllAsRead - organization load failed.");
        }

        if (organizationStatus === "pending" || organizationStatus === "loading") {
            throw new UnexpectedSdkError("Cannot call markAllAsRead - organization is not initialized.");
        }

        if (notificationsStatus === "error") {
            throw new UnexpectedSdkError("Cannot call markAllAsRead - notifications load failed.");
        }

        if (notificationsStatus === "pending" || notificationsStatus === "loading") {
            throw new UnexpectedSdkError("Cannot call markAllAsRead - notifications are not initialized.");
        }

        await organizationService.notifications().markAllNotificationsAsRead();

        notificationsReset();
        unreadNotificationsReset();
    }, [
        organizationService,
        organizationStatus,
        notificationsStatus,
        notificationsReset,
        unreadNotificationsReset,
    ]);

    const effectiveNotifications = useMemo(() => {
        if (!notifications) {
            return notifications;
        }

        return notifications.map((notification) => {
            if (markedAsReadNotifications.includes(notification.id)) {
                return { ...notification, isRead: true };
            }
            return notification;
        });
    }, [notifications, markedAsReadNotifications]);

    const effectiveUnreadNotifications = useMemo(() => {
        if (!unreadNotifications) {
            return unreadNotifications;
        }

        return unreadNotifications
            .map((notification) => {
                if (markedAsReadNotifications.includes(notification.id)) {
                    return { ...notification, isRead: true };
                }
                return notification;
            })
            .filter((x) => !x.isRead);
    }, [unreadNotifications, markedAsReadNotifications]);

    return {
        notifications: effectiveNotifications,
        notificationsStatus,
        notificationsError,
        notificationsHasNextPage,
        notificationsLoadNextPage,
        notificationsReset,
        unreadNotifications: effectiveUnreadNotifications,
        unreadNotificationsStatus: unreadNotificationsStatus,
        unreadNotificationsError: unreadNotificationsError,
        unreadNotificationsHasNextPage: unreadNotificationsHasNextPage,
        unreadNotificationsLoadNextPage: unreadNotificationsLoadNextPage,
        unreadNotificationsReset,
        unreadNotificationsCount: Math.max(0, unreadNotificationsCount - markedAsReadNotifications.length),
        markNotificationAsRead,
        markAllNotificationsAsRead,
    };
}
