// (C) 2024-2026 GoodData Corporation

import { type ITigerClientBase } from "@gooddata/api-client-tiger";
import {
    AutomationApi_MarkAsReadNotification,
    AutomationApi_MarkAsReadNotificationAll,
} from "@gooddata/api-client-tiger/endpoints/automation";
import { type INotificationsQuery, type IOrganizationNotificationService } from "@gooddata/sdk-backend-spi";

import { NotificationsQuery } from "./notificationsQuery.js";
import { type TigerAuthenticatedCallGuard } from "../../types/index.js";

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
        return this.authCall(async (client: ITigerClientBase) => {
            await AutomationApi_MarkAsReadNotification(client.axios, client.basePath, { notificationId });
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
        return this.authCall(async (client: ITigerClientBase) => {
            await AutomationApi_MarkAsReadNotificationAll(client.axios, client.basePath, {});
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
