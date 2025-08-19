// (C) 2024-2025 GoodData Corporation

import { ITigerClient } from "@gooddata/api-client-tiger";
import { INotificationsQuery, IOrganizationNotificationService } from "@gooddata/sdk-backend-spi";

import { NotificationsQuery } from "./notificationsQuery.js";
import { TigerAuthenticatedCallGuard } from "../../types/index.js";

export class OrganizationNotificationService implements IOrganizationNotificationService {
    constructor(public readonly authCall: TigerAuthenticatedCallGuard) {}

    /**
     * Mark notification as read
     *
     * @param notificationId - id of the notification
     * @returns Promise resolved when the notification is marked as read.
     *
     * @beta
     */
    public markNotificationAsRead(notificationId: string): Promise<void> {
        return this.authCall(async (client: ITigerClient) => {
            await client.automation.markAsReadNotification({ notificationId });
        });
    }

    /**
     * Mark all notifications as read
     *
     * @returns Promise resolved when all notifications are marked as read.
     *
     * @beta
     */
    public markAllNotificationsAsRead(): Promise<void> {
        return this.authCall(async (client: ITigerClient) => {
            await client.automation.markAsReadNotificationAll({});
        });
    }

    /**
     * Query notifications
     *
     * @beta
     */
    public getNotificationsQuery = (): INotificationsQuery => {
        return new NotificationsQuery(this.authCall);
    };
}
