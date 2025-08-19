// (C) 2022-2025 GoodData Corporation

import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";

import { IDashboardPermissions } from "@gooddata/sdk-model";

import { DashboardPermissionsState } from "./dashboardPermissionsState.js";

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
