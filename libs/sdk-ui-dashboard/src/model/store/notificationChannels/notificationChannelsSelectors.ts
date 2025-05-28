// (C) 2024-2025 GoodData Corporation
import { INotificationChannelMetadataObject } from "@gooddata/sdk-model";
import { createSelector } from "@reduxjs/toolkit/dist/redux-toolkit.esm.js";
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
export const selectNotificationChannels: DashboardSelector<INotificationChannelMetadataObject[]> =
    createSelector(selectSelf, (state) => {
        return state.notificationChannels;
    });

/**
 * Returns notification channels suitable for scheduled exports.
 *
 * @alpha
 */
export const selectNotificationChannelsWithoutInPlatform: DashboardSelector<
    INotificationChannelMetadataObject[]
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
        return state.notiticationChannelsCount;
    },
);
