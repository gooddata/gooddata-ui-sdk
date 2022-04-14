// (C) 2021-2022 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { DashboardState } from "../types";
import invariant from "ts-invariant";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.user,
);

/**
 * This selector returns current logged in user.
 *
 * @remarks
 * It is expected that the selector is called only after the permission state is correctly initialized.
 * Invocations before initialization lead to invariant errors.
 *
 * NOTE: The GoodData.CN backends returns only `name`, `userId`, `organization` and `links` properties.
 *
 * @example - on how to use `selectCurrentUser` selector within a Dashboard Plugin.
 * ```
 * // create the component using current user selector
 * const Greetings: React.FC = () => {
 *      // read the currently logged in user information
 *      const user = useDashboardSelector(selectCurrentUser);
 *
 *      return <div>Hello, {user.fullName}</div>;
 * }
 *
 * // in a plugin's register function just use the component as a custom widget type
 * customize.customWidgets().addCustomWidget("greetingsWidget", Greetings);
 *
 *  customize.layout().customizeFluidLayout((_layout, customizer) => {
 *          customizer.addSection(
 *              0,
 *              newDashboardSection(
 *                  "Greetings by Plugin",
 *                  newDashboardItem(newCustomWidget("greetings", "greetingsWidget"), {
 *                      xl: {
 *                          // all 12 columns of the grid will be 'allocated' for this this new item
 *                          gridWidth: 12,
 *                          // minimum height since the custom widget now has just some one-liner text
 *                          gridHeight: 1,
 *                      },
 *                  }),
 *              ),
 *          );
 *      });
 *
 * ```
 *
 * @returns - an {@link @gooddata/sdk-model#IUser} object for logged in user.
 * @public
 */
export const selectCurrentUser = createSelector(selectSelf, (state) => {
    invariant(state.user, "attempting to access uninitialized user state");

    return state.user!;
});

/**
 * This selector returns current logged in user ref.
 *
 * @remarks
 * It is expected that the selector is called only after the permission state is correctly initialized.
 * Invocations before initialization lead to invariant errors.
 *
 * @returns - an {@link @gooddata/sdk-model#ObjRef} of the logged in user.
 * @public
 */
export const selectCurrentUserRef = createSelector(selectCurrentUser, (user) => {
    return user.ref;
});
