// (C) 2024-2025 GoodData Corporation

import { useCallback, useMemo, useState } from "react";

import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { INotification, isAlertNotification } from "@gooddata/sdk-model";
import { UnexpectedSdkError, useWorkspace } from "@gooddata/sdk-ui";

import { useFetchNotifications } from "./useFetchNotifications.js";
import { useOrganization } from "../@staging/OrganizationContext/OrganizationContext.js";

type OrganizationStatus = "pending" | "loading" | "success" | "error";
type NotificationsStatus = "pending" | "loading" | "success" | "error";

function assertOrganizationReady(status: OrganizationStatus, action: string): void {
    if (status === "error") {
        throw new UnexpectedSdkError(`Cannot call ${action} - organization load failed.`);
    }
    if (status === "pending" || status === "loading") {
        throw new UnexpectedSdkError(`Cannot call ${action} - organization is not initialized.`);
    }
}

function assertNotificationsReady(status: NotificationsStatus, action: string): void {
    if (status === "error") {
        throw new UnexpectedSdkError(`Cannot call ${action} - notifications load failed.`);
    }
    if (status === "pending" || status === "loading") {
        throw new UnexpectedSdkError(`Cannot call ${action} - notifications are not initialized.`);
    }
}

function filterNotificationsByType(
    notifications: INotification[],
    enableScheduleNotifications: boolean,
): INotification[] {
    return enableScheduleNotifications ? notifications : notifications.filter(isAlertNotification);
}

function applyReadStatus(notifications: INotification[], markedAsReadIds: string[]): INotification[] {
    return notifications.map((notification) => {
        if (markedAsReadIds.includes(notification.id)) {
            return { ...notification, isRead: true };
        }
        return notification;
    });
}

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
            assertOrganizationReady(organizationStatus, "markAsRead");

            await organizationService.notifications().markNotificationAsRead(notificationId);
            setMarkedAsReadNotifications((prev) => [...prev, notificationId]);
        },
        [organizationStatus, organizationService, setMarkedAsReadNotifications],
    );

    const markAllNotificationsAsRead = useCallback(async () => {
        assertOrganizationReady(organizationStatus, "markAllAsRead");
        assertNotificationsReady(notificationsStatus, "markAllAsRead");

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

        const filteredNotifications = filterNotificationsByType(notifications, enableScheduleNotifications);
        return applyReadStatus(filteredNotifications, markedAsReadNotifications);
    }, [notifications, markedAsReadNotifications, enableScheduleNotifications]);

    const effectiveUnreadNotifications = useMemo(() => {
        if (!unreadNotifications) {
            return unreadNotifications;
        }

        const filteredUnreadNotifications = filterNotificationsByType(
            unreadNotifications,
            enableScheduleNotifications,
        );
        const withReadStatus = applyReadStatus(filteredUnreadNotifications, markedAsReadNotifications);
        return withReadStatus.filter((x) => !x.isRead);
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
