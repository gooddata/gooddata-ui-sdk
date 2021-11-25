// (C) 2021 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { DashboardState } from "../types";
import invariant from "ts-invariant";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.backendCapabilities,
);

/**
 * This selector returns capabilities of the backend with which the dashboard works.
 *
 * @public
 */
export const selectBackendCapabilities = createSelector(selectSelf, (state) => {
    invariant(state.backendCapabilities, "attempting to access uninitialized backend capabilities");

    return state.backendCapabilities!;
});
