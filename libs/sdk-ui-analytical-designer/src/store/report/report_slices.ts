// (C) 2026 GoodData Corporation

import { createSlice, current } from "@reduxjs/toolkit";
import { isEqual } from "lodash-es";
import { type Reducer } from "redux";

import { savedInsightPermissionsLoaded } from "../../actions/insight_access_actions.js";
import { openReportFailed, openReportFinished, openReportStarted } from "../../actions/open_actions.js";
import { reportExecutionStarted } from "../../actions/report_actions.js";
import { saveReportError, saveReportFinished, saveReportStarted } from "../../actions/save_actions.js";
import { isApplicationResetEvent } from "../app_context/application_reset_events.js";
import { currentReportExecutionSettled } from "../execution/execution_coordination_events.js";

import { buildLastSavedCompatibleReport } from "./report_helpers.js";
import {
    type IReportLastSavedObjectState,
    type IReportLoadingErrorState,
    type IReportNowOpenState,
    type IReportOpeningState,
    type IReportSavingAsNewState,
    type IReportSavingState,
    lastSavedObjectInitialState,
    reportLoadingErrorInitialState,
    reportNowOpenInitialState,
    reportOpeningInitialState,
    reportSavingAsNewInitialState,
    reportSavingInitialState,
} from "./report_state.js";

/**
 * The report leaves, case by case:
 *
 * - the SAVE_REPORT_* trio drives `saving` OR `savingAsNew`, keyed by the action's `saveAsNew`
 *   payload flag — one action never touches the other flag.
 * - OPEN_REPORT_FAILED is one of the APPLICATION RESETS
 *   (store/app_context/application_reset_events.ts): the reset matchers below write
 *   nowOpen/opening/lastSavedObject, and the loading-error case still writes the `reason` when
 *   one is carried (a missing reason means the insight was not found — that lands in
 *   `report.execution` as NOT_FOUND, see store/execution/execution_slice.ts).
 * - the loading-error clear on REPORT_EXECUTION_STARTED was absorbed from
 *   execution_apply_reducer (a fresh execution invalidates the error the previous one may have
 *   left on screen).
 * - a draft open keeps `lastSavedObject` untouched — there is nothing saved to compare against.
 *
 * The lastSavedObject cases guard with a deep `isEqual` before replacing the value: without it an
 * identical re-save would produce a new root, and a render.
 */

const savingSlice = createSlice({
    name: "reportSaving",
    initialState: reportSavingInitialState as IReportSavingState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(saveReportStarted, (state, action) => (action.payload.saveAsNew ? state : true))
            .addCase(saveReportFinished, (state, action) => (action.payload.saveAsNew ? state : false))
            .addCase(saveReportError, (state, action) => (action.payload.saveAsNew ? state : false));
    },
});

const savingAsNewSlice = createSlice({
    name: "reportSavingAsNew",
    initialState: reportSavingAsNewInitialState as IReportSavingAsNewState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(saveReportStarted, (state, action) => (action.payload.saveAsNew ? true : state))
            .addCase(saveReportFinished, (state, action) => (action.payload.saveAsNew ? false : state))
            .addCase(saveReportError, (state, action) => (action.payload.saveAsNew ? false : state));
    },
});

const openingSlice = createSlice({
    name: "reportOpening",
    initialState: reportOpeningInitialState as IReportOpeningState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(openReportStarted, () => true)
            .addCase(openReportFinished, () => false)
            // the application resets, OPEN_REPORT_FAILED among them
            .addMatcher(isApplicationResetEvent, (): IReportOpeningState => reportOpeningInitialState);
    },
});

const nowOpenSlice = createSlice({
    name: "reportNowOpen",
    initialState: reportNowOpenInitialState as IReportNowOpenState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(openReportFinished, () => true)
            /**
             * The just-opened report has rendered — the execution domain's coordination event. The
             * current-execution guard lives with the WATCHER that emits it
             * (store/execution/execution_coordination_saga.ts); this slice only owns the close.
             */
            .addCase(currentReportExecutionSettled, () => false)
            // the application resets, OPEN_REPORT_FAILED among them
            .addMatcher(isApplicationResetEvent, (): IReportNowOpenState => false);
    },
});

const loadingErrorSlice = createSlice({
    name: "reportLoadingError",
    initialState: reportLoadingErrorInitialState as IReportLoadingErrorState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(openReportStarted, () => null)
            .addCase(openReportFinished, () => null)
            .addCase(openReportFailed, (state, action) =>
                action.payload.reason === undefined ? state : action.payload.reason,
            )
            .addCase(reportExecutionStarted, () => null);
    },
});

const lastSavedObjectSlice = createSlice({
    name: "reportLastSavedObject",
    initialState: lastSavedObjectInitialState as IReportLastSavedObjectState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(openReportFinished, (state, action) => {
                if (action.payload.isDraft) {
                    return state;
                }
                const next: IReportLastSavedObjectState = {
                    visualizationObject: buildLastSavedCompatibleReport(action.payload.insight),
                };
                // current(): the equality guard must compare the real value, not the draft proxy
                return isEqual(current(state), next) ? state : next;
            })
            .addCase(saveReportFinished, (state, action) => {
                const next: IReportLastSavedObjectState = {
                    visualizationObject: action.payload.reportMDObject.visualizationObject,
                };
                return isEqual(current(state), next) ? state : next;
            })
            .addCase(savedInsightPermissionsLoaded, (state, action) => {
                const { meta } = state.visualizationObject;
                if (meta.identifier === action.payload.identifier) {
                    meta.permissions = action.payload.permissions;
                }
            })
            // the application resets — the initial state is a module constant, so a
            // reset over an already-pristine value keeps the same reference
            .addMatcher(
                isApplicationResetEvent,
                (): IReportLastSavedObjectState => lastSavedObjectInitialState,
            );
    },
});

export const reportSavingSliceReducer: Reducer<IReportSavingState> = savingSlice.reducer;
export const reportSavingAsNewSliceReducer: Reducer<IReportSavingAsNewState> = savingAsNewSlice.reducer;
export const reportOpeningSliceReducer: Reducer<IReportOpeningState> = openingSlice.reducer;
export const reportNowOpenSliceReducer: Reducer<IReportNowOpenState> = nowOpenSlice.reducer;
export const reportLoadingErrorSliceReducer: Reducer<IReportLoadingErrorState> = loadingErrorSlice.reducer;
export const reportLastSavedObjectSliceReducer: Reducer<IReportLastSavedObjectState> =
    lastSavedObjectSlice.reducer;
