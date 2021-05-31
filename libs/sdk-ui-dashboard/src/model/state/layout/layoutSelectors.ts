// (C) 2021 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { DashboardState } from "../dashboardStore";
import { LayoutState } from "./layoutState";
import invariant from "ts-invariant";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.layout,
);

/**
 * This selector returns dashboard's layout. It is expected that the selector is called only after the layout state
 * is correctly initialized. Invocations before initialization lead to invariant errors.
 *
 * @internal
 */
export const selectLayout = createSelector(selectSelf, (layoutState: LayoutState) => {
    invariant(layoutState.layout, "attempting to access uninitialized layout state");

    return layoutState.layout;
});
