// (C) 2026 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit";
import { type Reducer } from "redux";

import { insightId, insightLayers, insightSummary, insightTags, insightTitle } from "@gooddata/sdk-model";

import { openReportFinished, openReportStarted } from "../../actions/open_actions.js";
import { reportDescriptionChange, reportTitleChange } from "../../actions/report_actions.js";
import { saveReportFinished } from "../../actions/save_actions.js";
import {
    isApplicationResetEvent,
    isInsightContentResetEvent,
} from "../app_context/application_reset_events.js";

import {
    type IInsightLayersOwnerState,
    type IInsightLayersState,
    type IInsightSummaryState,
    type IInsightTagsState,
    type IInsightTitleState,
    insightLayersInitialState,
    insightLayersOwnerInitialState,
    insightSummaryInitialState,
    insightTagsInitialState,
    insightTitleInitialState,
} from "./insight_state.js";

/**
 * The insight metadata leaves, case by case:
 *
 * - OPEN_REPORT_STARTED clears the meta leaves (title/tags/summary) but not the layers.
 * - OPEN_REPORT_FINISHED writes the meta leaves only for a NON-draft open (a draft keeps the cleared
 *   values), while `layers`/`layersOwner` are written for drafts too — they identify the opened
 *   insight.
 * - SAVE_REPORT_FINISHED updates what the backend save changed (tags/summary/layersOwner); the title
 *   is what the user typed and is left alone. Only save-as-new adopts the saved insight's layers.
 * - REPORT_TITLE_CHANGE / REPORT_DESCRIPTION_CHANGE are the user edits.
 *
 * The application resets are matcher cases (store/app_context/application_reset_events.ts is the
 * single module that says which actions reset what scope): the meta leaves (title/tags/summary) reset
 * on the APPLICATION scope, while `layers`/`layersOwner` reset on the INSIGHT-CONTENT scope too.
 */

const titleSlice = createSlice({
    name: "insightTitle",
    initialState: insightTitleInitialState as IInsightTitleState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(openReportStarted, () => "")
            .addCase(openReportFinished, (state, action) =>
                action.payload.isDraft ? state : insightTitle(action.payload.insight),
            )
            .addCase(reportTitleChange, (_state, action) => action.payload.title)
            .addMatcher(isApplicationResetEvent, (): IInsightTitleState => insightTitleInitialState);
    },
});

const tagsSlice = createSlice({
    name: "insightTags",
    initialState: insightTagsInitialState as IInsightTagsState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(openReportStarted, () => [])
            .addCase(openReportFinished, (state, action) =>
                action.payload.isDraft ? state : insightTags(action.payload.insight),
            )
            .addCase(
                saveReportFinished,
                (_state, action) => action.payload.reportMDObject.visualizationObject.meta?.tags ?? [],
            )
            .addMatcher(isApplicationResetEvent, (): IInsightTagsState => insightTagsInitialState);
    },
});

const summarySlice = createSlice({
    name: "insightSummary",
    initialState: insightSummaryInitialState as IInsightSummaryState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(openReportStarted, () => "")
            .addCase(openReportFinished, (state, action) =>
                action.payload.isDraft ? state : insightSummary(action.payload.insight),
            )
            .addCase(
                saveReportFinished,
                (_state, action) => action.payload.reportMDObject.visualizationObject.meta?.summary ?? "",
            )
            .addCase(reportDescriptionChange, (_state, action) => action.payload.description)
            .addMatcher(isApplicationResetEvent, (): IInsightSummaryState => insightSummaryInitialState);
    },
});

const layersSlice = createSlice({
    name: "insightLayers",
    initialState: insightLayersInitialState as IInsightLayersState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(
                openReportFinished,
                (_state, action) => insightLayers(action.payload.insight) as IInsightLayersState,
            )
            .addCase(saveReportFinished, (state, action) =>
                action.payload.saveAsNew
                    ? (action.payload.reportMDObject.visualizationObject.content?.layers ?? [])
                    : state,
            )
            .addMatcher(isInsightContentResetEvent, (): IInsightLayersState => insightLayersInitialState);
    },
});

const layersOwnerSlice = createSlice({
    name: "insightLayersOwner",
    initialState: insightLayersOwnerInitialState as IInsightLayersOwnerState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(openReportFinished, (_state, action) => insightId(action.payload.insight))
            .addCase(
                saveReportFinished,
                (_state, action) =>
                    action.payload.reportMDObject.visualizationObject.meta?.identifier ?? null,
            )
            .addMatcher(
                isInsightContentResetEvent,
                (): IInsightLayersOwnerState => insightLayersOwnerInitialState,
            );
    },
});

export const insightTitleSliceReducer: Reducer<IInsightTitleState> = titleSlice.reducer;
export const insightTagsSliceReducer: Reducer<IInsightTagsState> = tagsSlice.reducer;
export const insightSummarySliceReducer: Reducer<IInsightSummaryState> = summarySlice.reducer;
export const insightLayersSliceReducer: Reducer<IInsightLayersState> = layersSlice.reducer;
export const insightLayersOwnerSliceReducer: Reducer<IInsightLayersOwnerState> = layersOwnerSlice.reducer;
