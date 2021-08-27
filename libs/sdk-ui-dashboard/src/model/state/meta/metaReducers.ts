// (C) 2021 GoodData Corporation

import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { DashboardMetaState, EmptyDashboardDescriptor } from "./metaState";
import { IDashboard } from "@gooddata/sdk-backend-spi";

type MetaReducer<A extends Action> = CaseReducer<DashboardMetaState, A>;

type SetMetaPayload = {
    dashboard?: IDashboard;
};
const setMeta: MetaReducer<PayloadAction<SetMetaPayload>> = (state, action) => {
    const { dashboard } = action.payload;

    state.persistedDashboard = dashboard;
    state.descriptor = dashboard
        ? {
              title: dashboard.title,
              description: dashboard.description,
              tags: dashboard.tags,
          }
        : EmptyDashboardDescriptor;
};

export const metaReducers = {
    setMeta,
};
