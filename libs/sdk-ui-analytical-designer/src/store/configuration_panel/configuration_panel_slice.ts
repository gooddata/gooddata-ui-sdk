// (C) 2026 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit";
import { type Reducer } from "redux";

import {
    storeConfigurationPanelCollapsed,
    storeConfigurationPanelCollapsedByDragging,
} from "../../actions/buckets_actions.js";
import { openReportFinished } from "../../actions/open_actions.js";
import { isInsightContentResetEvent } from "../app_context/application_reset_events.js";
import { bucketItemAdded } from "../buckets/buckets_operation_events.js";
import { recommendationApplied } from "../recommendations/recommendations_operation_events.js";
import {
    metricOverTimeShortcutApplied,
    metricShortcutApplied,
} from "../shortcuts/shortcuts_operation_events.js";

import {
    type IConfigurationPanelState,
    configurationPanelInitialState,
} from "./configuration_panel_state.js";

const configurationPanelSlice = createSlice({
    name: "configurationPanel",
    initialState: configurationPanelInitialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(storeConfigurationPanelCollapsed, (state, action) => {
                state.collapsed = action.payload.collapsed;
            })
            .addCase(storeConfigurationPanelCollapsedByDragging, (state, action) => {
                state.collapsedByDragging = action.payload.collapsedByDragging;
            })
            /**
             * A drop that LANDED pops the panel back open — the `collapsedByDragging` flag the drag
             * set is deleted. The buckets add operation decides it (it is the gesture that knows a
             * drop landed) and names the whole subtree value in its payload, so this case just takes
             * it; the operation answers the SAME value when no drag had collapsed anything, so the
             * case is a no-op there.
             */
            .addCase(bucketItemAdded, (_state, action) => action.payload.configurationPanel)
            // the recommendation composes the add operation, which pops the panel back open
            .addCase(recommendationApplied, (_state, action) => action.payload.configurationPanel)
            // so do the shortcut applies
            .addCase(metricShortcutApplied, (_state, action) => action.payload.configurationPanel)
            .addCase(metricOverTimeShortcutApplied, (_state, action) => action.payload.configurationPanel)
            // opening a report re-collapses the panel — the same single-leaf write the application
            // resets below perform
            .addCase(openReportFinished, (state) => {
                if (!state.collapsed) {
                    state.collapsed = true;
                }
            })
            // the application resets re-collapse the panel and touch NOTHING else —
            // only the `collapsed` leaf is written, so `collapsedByDragging` survives.
            // Guarded: an unguarded draft write would dirty the subtree on every reset replay.
            .addMatcher(isInsightContentResetEvent, (state) => {
                if (!state.collapsed) {
                    state.collapsed = true;
                }
            });
    },
});

export const configurationPanelSliceReducer: Reducer<IConfigurationPanelState> =
    configurationPanelSlice.reducer;
