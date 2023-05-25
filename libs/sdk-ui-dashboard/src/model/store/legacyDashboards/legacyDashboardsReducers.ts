// (C) 2021-2022 GoodData Corporation
import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { LegacyDashboardsState } from "./legacyDashboardsState.js";
import { ILegacyDashboard } from "../../../types.js";

type LegacyDashboardsReducers<A extends Action> = CaseReducer<LegacyDashboardsState, A>;

const setLegacyDashboards: LegacyDashboardsReducers<PayloadAction<ILegacyDashboard[]>> = (state, action) => {
    state.legacyDashboards = action.payload;
};

export const legacyDashboardsReducers = {
    setLegacyDashboards,
};
