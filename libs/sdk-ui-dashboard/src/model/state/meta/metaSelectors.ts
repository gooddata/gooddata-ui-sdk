// (C) 2021 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { uriRef } from "@gooddata/sdk-model";
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
 * @internal
 */
const selectDashboardMetadata = createSelector(selectSelf, (state) => {
    invariant(state.meta, "attempting to access uninitialized meta state");

    return state.meta!;
});

/**
 * Returns current dashboard ref.
 *
 * @internal
 */
export const selectDashboardRef = createSelector(selectDashboardMetadata, (state) => {
    return state.ref;
});

/**
 * Returns current dashboard identifier.
 *
 * @internal
 */
export const selectDashboardId = createSelector(selectDashboardMetadata, (state) => {
    return state.identifier;
});

/**
 * Returns current dashboard uri.
 *
 * @internal
 */
const selectDashboardUri = createSelector(selectDashboardMetadata, (state) => {
    return state.uri;
});

/**
 * Returns current dashboard uri ref.
 *
 * @internal
 */
export const selectDashboardUriRef = createSelector(selectDashboardUri, (uri) => {
    return uriRef(uri);
});

/**
 * Returns current dashboard title.
 *
 * @internal
 */
export const selectDashboardTitle = createSelector(selectDashboardMetadata, (state) => {
    return state.title;
});
