// (C) 2023-2025 GoodData Corporation
import { createSlice } from "@reduxjs/toolkit/dist/redux-toolkit.esm.js";
import { attributeFilterConfigsInitialState } from "./attributeFilterConfigsState.js";
import { attributeFilterConfigsReducers } from "./attributeFilterConfigsReducers.js";

const configSlice = createSlice({
    name: "attributeFilterConfigs",
    initialState: attributeFilterConfigsInitialState,
    reducers: attributeFilterConfigsReducers,
});

export const attributeFilterConfigsSliceReducer = configSlice.reducer;
export const attributeFilterConfigsActions = configSlice.actions;
