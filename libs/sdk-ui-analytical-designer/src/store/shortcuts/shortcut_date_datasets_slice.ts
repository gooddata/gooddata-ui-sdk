// (C) 2007-2026 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit";
import { type Reducer } from "redux";

import {
    loadShortcutDateDatasets,
    shortcutDateDatasetsError,
    shortcutDateDatasetsUpdated,
} from "../../actions/shortcuts_actions.js";

import {
    type IShortcutDateDatasetsState,
    shortcutDateDatasetsInitialState,
} from "./shortcut_date_datasets_state.js";

const shortcutDateDatasetsSlice = createSlice({
    name: "shortcutDateDatasets",
    initialState: shortcutDateDatasetsInitialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(loadShortcutDateDatasets, (state) => {
                state.loaded = false;
            })
            .addCase(shortcutDateDatasetsUpdated, (state, action) => {
                // shallow merge: the payload's keys (available/unavailable/…)
                // replace the current ones, everything else is kept
                Object.assign(state, action.payload);
                state.loaded = true;
                state.error = null;
            })
            .addCase(shortcutDateDatasetsError, (state, action) => {
                state.loaded = true;
                state.error = action.payload;
            });
    },
});

export const shortcutDateDatasetsSliceReducer: Reducer<IShortcutDateDatasetsState> =
    shortcutDateDatasetsSlice.reducer;
