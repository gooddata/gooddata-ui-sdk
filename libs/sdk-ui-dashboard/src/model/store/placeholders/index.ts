// (C) 2021-2022 GoodData Corporation
import { createSlice } from "@reduxjs/toolkit";
import { placeholdersInitialState } from "./placeholdersState";
import { placeholdersReducers } from "./placeholdersReducers";

const placeholdersSlice = createSlice({
    name: "placeholdersSlice",
    initialState: placeholdersInitialState,
    reducers: placeholdersReducers,
});

export const placeholdersSliceReducer = placeholdersSlice.reducer;

/**
 * Actions to control placeholders state of the dashboard.
 *
 * @internal
 */
export const placeholdersActions = placeholdersSlice.actions;
