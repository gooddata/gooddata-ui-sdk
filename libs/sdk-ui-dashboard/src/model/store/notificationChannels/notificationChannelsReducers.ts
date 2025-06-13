// (C) 2024-2025 GoodData Corporation

import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { NotificationChannelsState } from "./notificationChannelsState.js";
import { INotificationChannelIdentifier, INotificationChannelMetadataObject } from "@gooddata/sdk-model";

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
