// (C) 2026 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit";
import { type Reducer } from "redux";

import { openReportFinished } from "../../actions/open_actions.js";
import { visualizationPropertiesMetaChanged } from "../../actions/properties_actions.js";
import { isInsightContentResetEvent } from "../app_context/application_reset_events.js";

import { type IPropertiesMetaState, propertiesMetaInitialState } from "./properties_meta_state.js";

const propertiesMetaSlice = createSlice({
    name: "propertiesMeta",
    initialState: propertiesMetaInitialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(visualizationPropertiesMetaChanged, (state, action) => {
            // A SHALLOW merge, so the keys the payload does not mention survive.
            const patch = action.payload as IPropertiesMetaState;

            // Assigning through the draft keeps the merge identity-stable: immer does not mark
            // the state modified when every value is already equal, so the report visualization
            // does not re-render on an unchanged meta echo.
            Object.assign(state, patch);
        });
        // opening a report clears the bag
        builder.addCase(openReportFinished, (): IPropertiesMetaState => propertiesMetaInitialState);
        // the application resets (store/app_context/application_reset_events.ts)
        builder.addMatcher(
            isInsightContentResetEvent,
            (): IPropertiesMetaState => propertiesMetaInitialState,
        );
    },
});

export const propertiesMetaSliceReducer: Reducer<IPropertiesMetaState> = propertiesMetaSlice.reducer;
