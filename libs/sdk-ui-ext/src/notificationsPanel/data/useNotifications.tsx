// (C) 2024 GoodData Corporation

import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { UnexpectedSdkError, useWorkspaceStrict } from "@gooddata/sdk-ui";

import { useCallback, useMemo, useState } from "react";
import { useOrganization } from "../@staging/OrganizationContext/OrganizationContext.js";
import { useFetchNotifications } from "./useFetchNotifications.js";
/**
 * @alpha
 */
export interface IUseNotificationsProps {
    workspace?: string;
    backend?: IAnalyticalBackend;
}

/**
 * @alpha
 */
export function useNotifications({ workspace }: IUseNotificationsProps) {
    const effectiveWorkspace = useWorkspaceStrict(workspace, "useNotifications");
    const {
        notifications,
        hasNextPage: notificationsHasNextPage,
        error: notificationsError,
        loadNextPage: notificationsLoadNextPage,
        status: notificationsStatus,
    } = useFetchNotifications({
        workspace: effectiveWorkspace,
    });
    const {
        error: unreadNotificationsError,
        hasNextPage: unreadNotificationsHasNextPage,
        loadNextPage: unreadNotificationsLoadNextPage,
        notifications: unreadNotifications,
        status: unreadNotificationsStatus,
        totalNotificationsCount: unreadNotificationsCount,
    } = useFetchNotifications({
        workspace: effectiveWorkspace,
        readStatus: "unread",
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

        setMarkedAsReadNotifications(notifications.map((notification) => notification.id) ?? []);
    }, [
        organizationService,
        organizationStatus,
        notifications,
        notificationsStatus,
        setMarkedAsReadNotifications,
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
        unreadNotifications: effectiveUnreadNotifications,
        unreadNotificationsStatus: unreadNotificationsStatus,
        unreadNotificationsError: unreadNotificationsError,
        unreadNotificationsHasNextPage: unreadNotificationsHasNextPage,
        unreadNotificationsLoadNextPage: unreadNotificationsLoadNextPage,
        unreadNotificationsCount: Math.max(0, unreadNotificationsCount - markedAsReadNotifications.length),
        markNotificationAsRead,
        markAllNotificationsAsRead,
    };
}
