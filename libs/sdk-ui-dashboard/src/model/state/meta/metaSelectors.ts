// (C) 2021 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { idRef, uriRef } from "@gooddata/sdk-model";
import invariant from "ts-invariant";
import { DashboardState } from "../types";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.meta,
);

/**
 * Selects dashboard's metadata.
 *
 * @alpha
 */
export const selectDashboardMetadata = createSelector(selectSelf, (state) => {
    invariant(state.meta, "attempting to access uninitialized meta state");

    return state.meta!;
});

/**
 * Selects current dashboard ref.
 *
 * @alpha
 */
export const selectDashboardRef = createSelector(selectDashboardMetadata, (state) => {
    return state.ref;
});

/**
 * Selects current dashboard identifier.
 *
 * @alpha
 */
export const selectDashboardId = createSelector(selectDashboardMetadata, (state) => {
    return state.identifier;
});

/**
 * Selects current dashboard uri.
 *
 * @alpha
 */
const selectDashboardUri = createSelector(selectDashboardMetadata, (state) => {
    return state.uri;
});

/**
 * Selects current dashboard id ref.
 *
 * @alpha
 */
export const selectDashboardIdRef = createSelector(selectDashboardId, (id) => {
    return idRef(id, "analyticalDashboard");
});

/**
 * Selects current dashboard uri ref.
 *
 * @alpha
 */
export const selectDashboardUriRef = createSelector(selectDashboardUri, (uri) => {
    return uriRef(uri);
});

/**
 * Selects current dashboard title.
 *
 * @alpha
 */
export const selectDashboardTitle = createSelector(selectDashboardMetadata, (state) => {
    return state.title;
});

/**
 * Selects dashboard tags.
 *
 * @alpha
 */
export const selectDashboardTags = createSelector(selectDashboardMetadata, (state) => {
    return state.tags;
});
