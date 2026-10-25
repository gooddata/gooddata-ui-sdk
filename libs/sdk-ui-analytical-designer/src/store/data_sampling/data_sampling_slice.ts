// (C) 2026 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit";
import { type Reducer } from "redux";

import {
    deleteDataSamplingPercentage,
    updateDataSamplingPercentage,
} from "../../actions/data_sample_actions.js";

import { type IDataSamplingState, dataSamplingInitialState } from "./data_sampling_state.js";

/**
 * The `dataSamplingPercentage` root-leaf slice. The `sessionStorage.removeItem` side effect on
 * DELETE lives where side effects belong — the domain saga (sagas/data_sample_sagas.ts), which
 * already watches the same action for telemetry.
 */
const dataSamplingSlice = createSlice({
    name: "dataSampling",
    initialState: dataSamplingInitialState as IDataSamplingState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(
                updateDataSamplingPercentage,
                (_state, action): IDataSamplingState => action.payload ?? null,
            )
            .addCase(deleteDataSamplingPercentage, (): IDataSamplingState => null);
    },
});

export const dataSamplingSliceReducer: Reducer<IDataSamplingState> = dataSamplingSlice.reducer;
