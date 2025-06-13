// (C) 2024-2025 GoodData Corporation
import { INotificationChannelIdentifier, INotificationChannelMetadataObject } from "@gooddata/sdk-model";

/**
 * @alpha
 */
export interface NotificationChannelsState {
    notificationChannelsCount: number;
    notificationChannels: INotificationChannelIdentifier[] | INotificationChannelMetadataObject[];
}

export const notificationChannelsInitialState: NotificationChannelsState = {
    notificationChannelsCount: 0,
    notificationChannels: [],
};
