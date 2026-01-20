// (C) 2024-2026 GoodData Corporation

import { type Reducer, createSlice } from "@reduxjs/toolkit";

import { notificationChannelsReducers } from "./notificationChannelsReducers.js";
import {
    type INotificationChannelsState,
    notificationChannelsInitialState,
} from "./notificationChannelsState.js";

const notificationChannelsSlice = createSlice({
    name: "notificationChannels",
    initialState: notificationChannelsInitialState,
    reducers: notificationChannelsReducers,
});

export const notificationChannelsSliceReducer: Reducer<INotificationChannelsState> =
    notificationChannelsSlice.reducer;

// Spread "fixes" TS2742 error
export const notificationChannelsActions = { ...notificationChannelsSlice.actions };
