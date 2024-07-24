// (C) 2024 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";
import { GoodDataSdkError } from "@gooddata/sdk-ui";
import { DashboardSelector, DashboardState } from "../types.js";
import { Webhooks } from "../../types/commonTypes.js";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.webhooks,
);

/**
 * Returns organization webhooks.
 *
 * @alpha
 */
export const selectWebhooks: DashboardSelector<Webhooks> = createSelector(selectSelf, (state) => {
    return state.webhooks;
});

/**
 * Returns organization webhooks loading
 *
 * @alpha
 */
export const selectWebhooksIsLoading: DashboardSelector<boolean> = createSelector(selectSelf, (state) => {
    return state.loading;
});

/**
 * Returns organization webhooks error
 *
 * @alpha
 */
export const selectWebhooksError: DashboardSelector<GoodDataSdkError | undefined> = createSelector(
    selectSelf,
    (state) => {
        return state.error;
    },
);
