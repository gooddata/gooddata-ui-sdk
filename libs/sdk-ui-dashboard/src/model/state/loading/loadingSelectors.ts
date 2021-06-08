// (C) 2021 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";
import { DashboardState } from "../types";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.loading,
);

/**
 * @internal
 */
export const selectDashboardLoading = selectSelf;
