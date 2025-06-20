// (C) 2023-2025 GoodData Corporation

import {
    INotificationChannelTestResponse,
    INotificationChannelMetadataObject,
    INotificationChannelMetadataObjectDefinition,
    INotificationChannelExternalRecipient,
} from "@gooddata/sdk-model";
import { INotificationChannelsQuery } from "./query.js";

/**
 * This service provides access to organization notifications channels.
 *
 * @beta
 */
export interface IOrganizationNotificationChannelService {
    /**
     * Test notification channel
     *
     * @param channel - definition of the channel
     * @param notificationId - id of the notification to test if its already created
     * @param externalRecipients - external recipients of the test result
     * @returns Promise resolved with test response.
     */
    testNotificationChannel(
        channel: INotificationChannelMetadataObjectDefinition,
        externalRecipients?: INotificationChannelExternalRecipient[],
    ): Promise<INotificationChannelTestResponse>;

    /*
     * Get notification channel by id
     *
     * @param id - id of the notification channel
     * @returns Promise resolved with notification channel.
     */
    getNotificationChannel(id: string): Promise<INotificationChannelMetadataObject>;

    /*
     * Create new notification channel
     *
     * @param notificationChannel - definition of the notification channel
     * @returns Promise resolved with created notification channel.
     */
    createNotificationChannel(
        notificationChannel: INotificationChannelMetadataObjectDefinition,
    ): Promise<INotificationChannelMetadataObject>;

    /**
     * Update existing notification channel
     *
     * @param notificationChannel - definition of the notification channel
     * @returns Promise resolved with updated notification channel.
     */
    updateNotificationChannel(
        notificationChannel: INotificationChannelMetadataObject,
    ): Promise<INotificationChannelMetadataObject>;

    /**
     * Delete notification channel
     *
     * @param id - id of the notification channel
     * @returns Promise resolved when the notification channel is deleted.
     */
    deleteNotificationChannel(id: string): Promise<void>;

    /**
     * Query list of notification channels
     */
    getNotificationChannelsQuery(): INotificationChannelsQuery;
}
