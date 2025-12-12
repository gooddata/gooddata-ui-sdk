// (C) 2024-2025 GoodData Corporation
import { type Reducer, createSlice } from "@reduxjs/toolkit";

import { notificationChannelsReducers } from "./notificationChannelsReducers.js";
import {
    type NotificationChannelsState,
    notificationChannelsInitialState,
} from "./notificationChannelsState.js";

const notificationChannelsSlice = createSlice({
    name: "notificationChannels",
    initialState: notificationChannelsInitialState,
    reducers: notificationChannelsReducers,
});

export const notificationChannelsSliceReducer: Reducer<NotificationChannelsState> =
    notificationChannelsSlice.reducer;

// Spread "fixes" TS2742 error
export const notificationChannelsActions = { ...notificationChannelsSlice.actions };
