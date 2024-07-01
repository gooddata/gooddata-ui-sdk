// (C) 2024 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";
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
