// (C) 2021 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { DashboardState } from "../types";
import invariant from "ts-invariant";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.permissions,
);

/**
 * This selector returns user's permissions in the workspace where the dashboard is stored. It is expected that the
 * selector is called only after the permission state is correctly initialized. Invocations before initialization lead to invariant errors.
 *
 * @internal
 */
export const selectPermissions = createSelector(selectSelf, (filterContextState) => {
    invariant(filterContextState.permissions, "attempting to access uninitialized permissions state");

    return filterContextState.permissions!;
});

/**
 * Returns whether the current user has permissions to list other users in the workspace.
 *
 * @internal
 */
export const selectCanListUsersInProject = createSelector(selectPermissions, (state) => {
    return state?.canListUsersInProject;
});
