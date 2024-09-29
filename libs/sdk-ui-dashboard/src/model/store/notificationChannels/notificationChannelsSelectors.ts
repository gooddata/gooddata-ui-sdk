// (C) 2024 GoodData Corporation
import { INotificationChannelMetadataObject } from "@gooddata/sdk-model";
import { createSelector } from "@reduxjs/toolkit";
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
