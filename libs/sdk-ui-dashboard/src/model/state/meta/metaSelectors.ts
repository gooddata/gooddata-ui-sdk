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
 * Returns dashboard's metadata. It is expected that the selector is called only after the filter
 * context state is correctly initialized. Invocations before initialization lead to invariant errors.
 *
 * @alpha
 */
const selectDashboardMetadata = createSelector(selectSelf, (state) => {
    invariant(state.meta, "attempting to access uninitialized meta state");

    return state.meta!;
});

/**
 * Returns current dashboard ref.
 *
 * @alpha
 */
export const selectDashboardRef = createSelector(selectDashboardMetadata, (state) => {
    return state.ref;
});

/**
 * Returns current dashboard identifier.
 *
 * @alpha
 */
export const selectDashboardId = createSelector(selectDashboardMetadata, (state) => {
    return state.identifier;
});

/**
 * Returns current dashboard uri.
 *
 * @alpha
 */
const selectDashboardUri = createSelector(selectDashboardMetadata, (state) => {
    return state.uri;
});

/**
 * Returns current dashboard id ref.
 *
 * @alpha
 */
export const selectDashboardIdRef = createSelector(selectDashboardId, (id) => {
    return idRef(id, "analyticalDashboard");
});

/**
 * Returns current dashboard uri ref.
 *
 * @alpha
 */
export const selectDashboardUriRef = createSelector(selectDashboardUri, (uri) => {
    return uriRef(uri);
});

/**
 * Returns current dashboard title.
 *
 * @alpha
 */
export const selectDashboardTitle = createSelector(selectDashboardMetadata, (state) => {
    return state.title;
});
