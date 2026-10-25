// (C) 2026 GoodData Corporation

import { type IAppState } from "../types.js";

import {
    type IInsightLayersOwnerState,
    type IInsightLayersState,
    type IInsightSummaryState,
    type IInsightTagsState,
    type IInsightTitleState,
    insightLayersInitialState,
    insightTagsInitialState,
} from "./insight_state.js";

/**
 * The array-valued leaves get an explicit collection-KIND check, not a `??` guard: a wrong-kind
 * value must fall back rather than leak through and fail silently downstream.
 */
const arrayOrFallback = <T>(value: unknown, fallback: T[]): T[] => {
    return Array.isArray(value) ? value : fallback;
};

const insightTitleState = (state: IAppState) => state.data.title;
const insightTagsState = (state: IAppState) => state.data.tags;
const insightSummaryState = (state: IAppState) => state.data.summary;
const insightLayersState = (state: IAppState) => state.data.layers;
const insightLayersOwnerState = (state: IAppState) => state.data.layersOwner;

/** The current insight's title — what the user typed, "" until a report is opened or named. */
export const getInsightTitle = (state: IAppState): IInsightTitleState => insightTitleState(state);

export const getInsightTags = (state: IAppState): IInsightTagsState =>
    arrayOrFallback(insightTagsState(state), insightTagsInitialState);

export const getInsightSummary = (state: IAppState): IInsightSummaryState => insightSummaryState(state);

export const getInsightLayers = (state: IAppState): IInsightLayersState =>
    arrayOrFallback(insightLayersState(state), insightLayersInitialState);

export const getInsightLayersOwner = (state: IAppState): IInsightLayersOwnerState =>
    insightLayersOwnerState(state);
