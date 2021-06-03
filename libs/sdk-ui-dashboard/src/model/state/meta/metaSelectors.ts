// (C) 2021 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { DashboardState } from "../dashboardStore";
import invariant from "ts-invariant";

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
