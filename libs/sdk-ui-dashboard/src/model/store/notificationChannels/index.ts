// (C) 2024 GoodData Corporation
import { createSlice } from "@reduxjs/toolkit";
import { notificationChannelsReducers } from "./notificationChannelsReducers.js";
import { notificationChannelsInitialState } from "./notificationChannelsState.js";

const notificationChannelsSlice = createSlice({
    name: "notificationChannels",
    initialState: notificationChannelsInitialState,
    reducers: notificationChannelsReducers,
});

export const notificationChannelsSliceReducer = notificationChannelsSlice.reducer;
export const notificationChannelsActions = notificationChannelsSlice.actions;
