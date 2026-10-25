// (C) 2026 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit";
import { type Reducer } from "redux";

import { openReportFinished } from "../../actions/open_actions.js";
import { setVisualizationClasses } from "../../actions/visualization_class_actions.js";
import {
    applicationResetCarrierOf,
    isApplicationResetEvent,
} from "../app_context/application_reset_events.js";
import { visualizationTypeSelected } from "../buckets/buckets_operation_events.js";
import { recommendationApplied } from "../recommendations/recommendations_operation_events.js";
import { shortcutPostponed } from "../shortcuts/shortcuts_operation_events.js";

import { getDefaultVisualizationClass } from "./visualization_classes_helpers.js";
import {
    type IVisualizationClassState,
    type IVisualizationClassesState,
    visualizationClassInitialState,
    visualizationClassesInitialState,
} from "./visualization_classes_state.js";

const visualizationClassesSlice = createSlice({
    name: "visualizationClasses",
    initialState: visualizationClassesInitialState,
    reducers: {},
    extraReducers: (builder) => {
        // stored VERBATIM off the API loader's payload
        builder.addCase(
            setVisualizationClasses,
            (_state, action): IVisualizationClassesState => action.payload.visualizationClasses,
        );
    },
});

const visualizationClassSlice = createSlice({
    name: "visualizationClass",
    initialState: visualizationClassInitialState,
    reducers: {},
    extraReducers: (builder) => {
        // storing the class list also (re)selects the default one, and the
        // did. The default is an element OF the payload list, so on this path the two mini-slices
        // share references — readers still compare by VALUE, never by reference,
        // because the external writers re-derive the class (visualization_classes_state.ts).
        builder
            .addCase(
                setVisualizationClasses,
                (_state, action): IVisualizationClassState =>
                    getDefaultVisualizationClass(action.payload.visualizationClasses) ?? null,
            )
            /**
             * The user picking a visualization type is a BUCKETS-family operation, because it clears the
             * extended reference point and invalidates the metadata object at the same time — three
             * domains in one gesture, which is why it is a semantic event and not a case on the
             * trigger. This slice takes the class out of that event's payload; the other two
             * domains are `buckets_operation_leaves.ts`.
             *
             * `BUCKETS_SELECT_VISUALIZATION_TYPE` is the frozen trigger and it writes NOTHING now —
             * `sagas/select_visualization_type_sagas.ts` and the telemetry watcher still key on it.
             */
            .addCase(
                visualizationTypeSelected,
                (_state, action): IVisualizationClassState => action.payload.visualizationClass,
            )
            /**
             * Contribution-in-percents switches the chart to `local:bar` — the recommendation
             * operation composes the same type selection, and the event carries the class
             * UNCONDITIONALLY (the other four parameterizations answer the stored value by
             * reference, so this case is a no-op for them).
             */
            .addCase(
                recommendationApplied,
                (_state, action): IVisualizationClassState => action.payload.visualizationClass,
            )
            // a postponed shortcut switches to the workspace's column class
            .addCase(
                shortcutPostponed,
                (_state, action): IVisualizationClassState => action.payload.visualizationClass,
            )
            // opening a report selects the insight's class (or the workspace default
            // when the insight's is deleted/deprecated) — resolved at the open-report boundary
            .addCase(
                openReportFinished,
                (_state, action): IVisualizationClassState => action.payload.result.visualizationClass,
            )
            /**
             * The application resets re-DEFAULT the class rather than clearing it, and
             * the default is derived from the sibling `visualizationClasses` list this slice must
             * not cross-read — so every reset-scope event CARRIES it, built at the dispatch
             * boundary (store/app_context/application_reset_events.ts).
             */
            .addMatcher(
                isApplicationResetEvent,
                (_state, action): IVisualizationClassState =>
                    applicationResetCarrierOf(action).defaultVisualizationClass,
            );
    },
});

export const visualizationClassesSliceReducer: Reducer<IVisualizationClassesState> =
    visualizationClassesSlice.reducer;
export const visualizationClassSliceReducer: Reducer<IVisualizationClassState> =
    visualizationClassSlice.reducer;
