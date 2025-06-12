// (C) 2024 GoodData Corporation

import { INotificationChannelMetadataObject } from "@gooddata/sdk-model";
import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { NotificationChannelsState } from "./notificationChannelsState.js";

type NotificationChannelsReducer<A extends Action> = CaseReducer<NotificationChannelsState, A>;

const setNotificationChannels: NotificationChannelsReducer<
    PayloadAction<INotificationChannelMetadataObject[]>
> = (state, action) => {
    state.notificationChannels = action.payload;
};

const setNotificationChannelsCount: NotificationChannelsReducer<PayloadAction<number>> = (state, action) => {
    state.notiticationChannelsCount = action.payload;
};

export const notificationChannelsReducers = {
    setNotificationChannels,
    setNotificationChannelsCount,
};
