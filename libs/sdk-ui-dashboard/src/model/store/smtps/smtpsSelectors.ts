// (C) 2024 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";
import { GoodDataSdkError } from "@gooddata/sdk-ui";
import { DashboardSelector, DashboardState } from "../types.js";
import { Smtps } from "../../types/commonTypes.js";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.smtps,
);

/**
 * Returns organization smtps.
 *
 * @alpha
 */
export const selectSmtps: DashboardSelector<Smtps> = createSelector(selectSelf, (state) => {
    return state.smtps;
});

/**
 * Returns organization smtps loading
 *
 * @alpha
 */
export const selectSmtpsIsLoading: DashboardSelector<boolean> = createSelector(selectSelf, (state) => {
    return state.loading;
});

/**
 * Returns organization webhooks error
 *
 * @alpha
 */
export const selectSmtpsError: DashboardSelector<GoodDataSdkError | undefined> = createSelector(
    selectSelf,
    (state) => {
        return state.error;
    },
);
