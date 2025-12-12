// (C) 2022-2025 GoodData Corporation

import { type Action, type CaseReducer, type PayloadAction } from "@reduxjs/toolkit";

import { type IDashboardPermissions } from "@gooddata/sdk-model";

import { type DashboardPermissionsState } from "./dashboardPermissionsState.js";

type PermissionsReducers<A extends Action> = CaseReducer<DashboardPermissionsState, A>;

const setDashboardPermissions: PermissionsReducers<PayloadAction<IDashboardPermissions>> = (
    state,
    action,
) => {
    state.dashboardPermissions = action.payload;
};

export const dashboardPermissionsReducers = {
    setDashboardPermissions,
};
