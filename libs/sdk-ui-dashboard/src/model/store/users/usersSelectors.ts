// (C) 2024 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";
import { DashboardSelector, DashboardState } from "../types.js";
import { IWorkspaceUser } from "@gooddata/sdk-model";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.users,
);

/**
 * Returns workspace users.
 *
 * @alpha
 */
export const selectUsers: DashboardSelector<IWorkspaceUser[]> = createSelector(selectSelf, (state) => {
    return state.users;
});
