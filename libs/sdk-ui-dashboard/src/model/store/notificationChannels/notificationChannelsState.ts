// (C) 2024-2026 GoodData Corporation

import {
    type INotificationChannelIdentifier,
    type INotificationChannelMetadataObject,
} from "@gooddata/sdk-model";

/**
 * @alpha
 */
export interface INotificationChannelsState {
    notificationChannelsCount: number;
    notificationChannels: INotificationChannelIdentifier[] | INotificationChannelMetadataObject[];
}

export const notificationChannelsInitialState: INotificationChannelsState = {
    notificationChannelsCount: 0,
    notificationChannels: [],
};
