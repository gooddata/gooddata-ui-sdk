// (C) 2026 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit";
import { type Reducer } from "redux";

import {
    dateDatasetsUpdated,
    setDateDatasetsDropdownLoaded,
    setDateDatasetsLoaded,
    setDateDatasetsUpdating,
} from "../../actions/data_actions.js";
import { openReportFinished } from "../../actions/open_actions.js";
import { wholeApplicationReset } from "../app_context/application_reset_events.js";
import { metricOverTimeShortcutApplied } from "../shortcuts/shortcuts_operation_events.js";

import { type IDateDatasetsState, dateDatasetsInitialState } from "./date_datasets_state.js";

const dateDatasetsSlice = createSlice({
    name: "dateDatasets",
    initialState: dateDatasetsInitialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // A SHALLOW merge: the payload's lists REPLACE the stored ones, and keys absent from
            // the payload survive (e.g. dropdownLoaded). The values are stored VERBATIM.
            // Unguarded, because the action is saga-dispatched and never reached from a render path.
            .addCase(dateDatasetsUpdated, (state, action) => {
                Object.entries(action.payload.dateDatasets ?? {}).forEach(([key, value]) => {
                    (state as Record<string, unknown>)[key] = value;
                });
                state.loaded = true;
                state.updating = false;
            })
            .addCase(setDateDatasetsLoaded, (state, action) => {
                state.loaded = action.payload.isLoaded;
            })
            .addCase(setDateDatasetsUpdating, (state, action) => {
                state.updating = action.payload.isUpdating;
            })
            .addCase(setDateDatasetsDropdownLoaded, (state, action) => {
                state.dropdownLoaded = action.payload.isLoaded;
            })
            // the metric-over-time shortcut copies the shortcut date datasets across —
            // the operation shallow-merged them over this value, so the payload replaces it whole
            // (an unchanged value arrives by reference and this case is a no-op)
            .addCase(metricOverTimeShortcutApplied, (_state, action) => action.payload.dateDatasets)
            // opening a report writes the loaded available/unavailable lists ONLY when the insight
            // selects a date dataset — the operation answers the previous value BY REFERENCE
            // otherwise, so this unconditional case is a no-op in that case
            // (open_report_operation.ts)
            .addCase(openReportFinished, (_state, action) => action.payload.result.dateDatasets)
            /**
             * ONLY the whole-application reset (a navigation that left the workspace or cleared the
             * open report) resets this subtree. The narrower resets deliberately do not:
             * RESET_APPLICATION keeps the loaded values and re-FETCHES them instead
             * (sagas/reset_sagas.ts).
             */
            .addCase(wholeApplicationReset, (): IDateDatasetsState => dateDatasetsInitialState);
    },
});

export const dateDatasetsSliceReducer: Reducer<IDateDatasetsState> = dateDatasetsSlice.reducer;
