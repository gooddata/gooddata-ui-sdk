// (C) 2024-2025 GoodData Corporation

import { useCallback, useMemo, useState } from "react";

import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { isAlertNotification } from "@gooddata/sdk-model";
import { UnexpectedSdkError, useWorkspace } from "@gooddata/sdk-ui";

import { useFetchNotifications } from "./useFetchNotifications.js";
import { useOrganization } from "../@staging/OrganizationContext/OrganizationContext.js";

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

    /**
     * Whether export to document storage is enabled.
     */
    enableScheduleNotifications: boolean;
}

/**
 * @internal
 */
export function useNotifications({
    workspace,
    refreshInterval,
    itemsPerPage,
    enableScheduleNotifications,
}: IUseNotificationsProps) {
    const effectiveWorkspace = useWorkspace(workspace);

    const {
        notifications,
        error: notificationsError,
        status: notificationsStatus,
        hasNextPage: notificationsHasNextPage,
        loadNextPage: notificationsLoadNextPage,
        reset: notificationsReset,
    } = useFetchNotifications({
        workspace: effectiveWorkspace,
        refreshInterval,
        itemsPerPage,
    });
    const {
        notifications: unreadNotifications,
        error: unreadNotificationsError,
        status: unreadNotificationsStatus,
        hasNextPage: unreadNotificationsHasNextPage,
        loadNextPage: unreadNotificationsLoadNextPage,
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

        const filteredNotifications = enableScheduleNotifications
            ? notifications
            : notifications.filter(isAlertNotification);

        return filteredNotifications.map((notification) => {
            if (markedAsReadNotifications.includes(notification.id)) {
                return { ...notification, isRead: true };
            }
            return notification;
        });
    }, [notifications, markedAsReadNotifications, enableScheduleNotifications]);

    const effectiveUnreadNotifications = useMemo(() => {
        if (!unreadNotifications) {
            return unreadNotifications;
        }

        const filteredUnreadNotifications = enableScheduleNotifications
            ? unreadNotifications
            : unreadNotifications.filter(isAlertNotification);

        return filteredUnreadNotifications
            .map((notification) => {
                if (markedAsReadNotifications.includes(notification.id)) {
                    return { ...notification, isRead: true };
                }
                return notification;
            })
            .filter((x) => !x.isRead);
    }, [unreadNotifications, markedAsReadNotifications, enableScheduleNotifications]);

    /**
     * Generally, we filter out notifications that are not of type alert and here we prepare
     * the correction of the total count of unread notifications retrieved from the server.
     */
    const numberOfInvalidUnreadNotifications = useMemo(() => {
        return enableScheduleNotifications
            ? unreadNotifications.length
            : unreadNotifications.filter((notification) => !isAlertNotification(notification)).length;
    }, [unreadNotifications, enableScheduleNotifications]);

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
        unreadNotificationsCount: Math.max(
            0,
            unreadNotificationsCount -
                markedAsReadNotifications.length -
                (enableScheduleNotifications ? 0 : numberOfInvalidUnreadNotifications),
        ),
        markNotificationAsRead,
        markAllNotificationsAsRead,
    };
}
