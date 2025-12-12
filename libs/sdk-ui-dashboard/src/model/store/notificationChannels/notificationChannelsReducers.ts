// (C) 2024-2025 GoodData Corporation

import { type Action, type CaseReducer, type PayloadAction } from "@reduxjs/toolkit";

import {
    type INotificationChannelIdentifier,
    type INotificationChannelMetadataObject,
} from "@gooddata/sdk-model";

import { type NotificationChannelsState } from "./notificationChannelsState.js";

type NotificationChannelsReducer<A extends Action> = CaseReducer<NotificationChannelsState, A>;

const setNotificationChannels: NotificationChannelsReducer<
    PayloadAction<INotificationChannelIdentifier[] | INotificationChannelMetadataObject[]>
> = (state, action) => {
    state.notificationChannels = action.payload;
};

const setNotificationChannelsCount: NotificationChannelsReducer<PayloadAction<number>> = (state, action) => {
    state.notificationChannelsCount = action.payload;
};

export const notificationChannelsReducers = {
    setNotificationChannels,
    setNotificationChannelsCount,
};
