// (C) 2021-2022 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { DashboardState } from "../types";
import invariant from "ts-invariant";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.user,
);

/**
 * This selector returns current logged in user. It is expected that the
 * selector is called only after the permission state is correctly initialized. Invocations before initialization lead to invariant errors.
 *
 * @returns - an {@link @gooddata/sdk-model#IUser} object for logged in user.
 * @public
 */
export const selectUser = createSelector(selectSelf, (state) => {
    invariant(state.user, "attempting to access uninitialized user state");

    return state.user!;
});

/**
 * This selector returns current logged in user ref. It is expected that the
 * selector is called only after the permission state is correctly initialized. Invocations before initialization lead to invariant errors.
 *
 * @returns - an {@link @gooddata/sdk-model#ObjRef} of the logged in user.
 * @public
 */
export const selectCurrentUserRef = createSelector(selectUser, (user) => {
    return user.ref;
});
