// (C) 2024-2025 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";

import { INotificationChannelIdentifier, INotificationChannelMetadataObject } from "@gooddata/sdk-model";

// import { GoodDataSdkError } from "@gooddata/sdk-ui";
import { DashboardSelector, DashboardState } from "../types.js";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.notificationChannels,
);

/**
 * Returns organization notification channels.
 *
 * @alpha
 */
export const selectNotificationChannels: DashboardSelector<
    INotificationChannelIdentifier[] | INotificationChannelMetadataObject[]
> = createSelector(selectSelf, (state) => {
    return state.notificationChannels;
});

/**
 * Returns notification channels suitable for scheduled exports.
 *
 * @alpha
 */
export const selectNotificationChannelsWithoutInPlatform: DashboardSelector<
    INotificationChannelIdentifier[] | INotificationChannelMetadataObject[]
> = createSelector(selectSelf, (state) => {
    return state.notificationChannels.filter((channel) => channel.destinationType !== "inPlatform");
});

/**
 * Returns notification channels suitable for scheduled exports.
 *
 * @alpha
 */
export const selectNotificationChannelsCountWithoutInPlatform: DashboardSelector<number> = createSelector(
    selectNotificationChannelsWithoutInPlatform,
    (notificationChannels) => {
        return notificationChannels.length;
    },
);

/**
 * Returns organization notification channels count.
 *
 * @alpha
 */
export const selectNotificationChannelsCount: DashboardSelector<number> = createSelector(
    selectSelf,
    (state) => {
        return state.notificationChannelsCount;
    },
);
