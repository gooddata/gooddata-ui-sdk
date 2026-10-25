// (C) 2026 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit";
import { type Reducer } from "redux";

import { setDateDatasetsMeta } from "../../actions/data_actions.js";

import { type IDateDatasetsMetaState, dateDatasetsMetaInitialState } from "./date_datasets_meta_state.js";

const dateDatasetsMetaSlice = createSlice({
    name: "dateDatasetsMeta",
    initialState: dateDatasetsMetaInitialState,
    reducers: {},
    extraReducers: (builder) => {
        // the payload REPLACES the stored meta verbatim (the same action
        // also merges derived granularity entries into the itemCache slice)
        builder.addCase(
            setDateDatasetsMeta,
            (_state, action): IDateDatasetsMetaState => action.payload.dateDatasetsMeta,
        );
    },
});

export const dateDatasetsMetaSliceReducer: Reducer<IDateDatasetsMetaState> = dateDatasetsMetaSlice.reducer;
