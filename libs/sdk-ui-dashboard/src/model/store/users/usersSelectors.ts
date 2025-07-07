// (C) 2024-2025 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";
import { IWorkspaceUser } from "@gooddata/sdk-model";
import { GoodDataSdkError } from "@gooddata/sdk-ui";
import { DashboardSelector, DashboardState } from "../types.js";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.users,
);

/**
 * Returns true if users are loading.
 *
 * @alpha
 */
export const selectUsersLoadingStatus: DashboardSelector<"pending" | "loading" | "success" | "error"> =
    createSelector(selectSelf, (state) => {
        return state.status;
    });

/**
 * Returns error if users loading failed.
 *
 * @alpha
 */
export const selectErrorUsers: DashboardSelector<GoodDataSdkError | undefined> = createSelector(
    selectSelf,
    (state) => {
        return state.error;
    },
);

/**
 * Returns workspace users.
 *
 * @alpha
 */
export const selectUsers: DashboardSelector<undefined | IWorkspaceUser[]> = createSelector(
    selectSelf,
    (state) => {
        return state.users;
    },
);
