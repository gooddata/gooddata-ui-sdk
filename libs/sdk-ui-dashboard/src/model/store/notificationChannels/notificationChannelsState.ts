// (C) 2024 GoodData Corporation
import { INotificationChannelMetadataObject } from "@gooddata/sdk-model";

/**
 * @alpha
 */
export interface NotificationChannelsState {
    notiticationChannelsCount: number;
    notificationChannels: INotificationChannelMetadataObject[];
}

export const notificationChannelsInitialState: NotificationChannelsState = {
    notiticationChannelsCount: 0,
    notificationChannels: [],
};
