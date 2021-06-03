// (C) 2021 GoodData Corporation

import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { DashboardMeta, DashboardMetaState } from "./metaState";

type MetaReducer<A extends Action> = CaseReducer<DashboardMetaState, A>;

const setMeta: MetaReducer<PayloadAction<DashboardMeta>> = (state, action) => {
    state.meta = action.payload;
};

export const metaReducers = {
    setMeta,
};
