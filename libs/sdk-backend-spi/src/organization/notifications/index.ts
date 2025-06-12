// (C) 2024-2025 GoodData Corporation
import { INotificationsQuery } from "./query.js";

/**
 * This service provides access to organization notifications.
 *
 * @public
 */
export interface IOrganizationNotificationService {
    /**
     * Mark notification as read
     *
     * @param notification - definition of the notification
     * @returns Promise resolved with updated notification.
     */
    markNotificationAsRead(notificationId: string): Promise<void>;

    /**
     * Mark all notifications as read
     */
    markAllNotificationsAsRead(): Promise<void>;

    /**
     * Query list of notifications
     */
    getNotificationsQuery(): INotificationsQuery;
}
