// (C) 2024 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";
import { GoodDataSdkError } from "@gooddata/sdk-ui";
import { DashboardSelector, DashboardState } from "../types.js";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.automations,
);

/**
 * Returns workspace automations.
 *
 * @alpha
 */
export const selectAutomationsCount: DashboardSelector<number> = createSelector(selectSelf, (state) => {
    return state.automations;
});

/**
 * Returns workspace automations loading
 *
 * @alpha
 */
export const selectAutomationsIsLoading: DashboardSelector<boolean> = createSelector(selectSelf, (state) => {
    return state.loading;
});

/**
 * Returns organization automations error
 *
 * @alpha
 */
export const selectAutomationsError: DashboardSelector<GoodDataSdkError | undefined> = createSelector(
    selectSelf,
    (state) => {
        return state.error;
    },
);

/**
 * Returns organization automations error
 *
 * @alpha
 */
export const selectAutomationsFingerprint: DashboardSelector<string> = createSelector(selectSelf, (state) => {
    return state.fingerprint;
});
