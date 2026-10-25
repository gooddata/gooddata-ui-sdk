// (C) 2022-2026 GoodData Corporation

import { createSelector } from "reselect";

import { type IAppState } from "../types.js";

import { type IApplicationContextState } from "./application_context_state.js";

const getApplicationContextState = (state: IAppState): IApplicationContextState =>
    state.data.applicationContext;

export const selectApiToken = createSelector(getApplicationContextState, (state) => state.apiToken);

export const selectApiTokenType = createSelector(getApplicationContextState, (state) => state.apiTokenType);

export const selectIsBackendInitialized = createSelector(
    getApplicationContextState,
    (state) => state.isBackendInitialized,
);
