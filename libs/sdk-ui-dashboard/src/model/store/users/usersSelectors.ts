// (C) 2024 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";
import { DashboardSelector, DashboardState } from "../types.js";
import { Users } from "../../types/commonTypes.js";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.users,
);

/**
 * Returns workspace users.
 *
 * @alpha
 */
export const selectUsers: DashboardSelector<Users> = createSelector(selectSelf, (state) => {
    return state.users;
});
