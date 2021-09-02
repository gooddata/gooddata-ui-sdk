// (C) 2021 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit";
import { widgetExecutionsAdapter } from "./widgetExecutionsEntityAdapter";

const widgetExecutionsSlice = createSlice({
    name: "widgetExecutions",
    initialState: widgetExecutionsAdapter.getInitialState(),
    reducers: {
        upsertExecution: widgetExecutionsAdapter.upsertOne,
        clearAllExecutions: widgetExecutionsAdapter.removeAll,
    },
});

export const widgetExecutionsSliceReducer = widgetExecutionsSlice.reducer;
export const widgetExecutionsActions = widgetExecutionsSlice.actions;
