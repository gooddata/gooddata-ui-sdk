// (C) 2022 GoodData Corporation

import { IDashboardPermissions } from "@gooddata/sdk-model";
import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { DashboardPermissionsState } from "./dashboardPermissionsState";

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
