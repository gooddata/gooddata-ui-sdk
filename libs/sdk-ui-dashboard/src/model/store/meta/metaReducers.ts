// (C) 2021-2024 GoodData Corporation

import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { DashboardMetaState, EmptyDashboardDescriptor } from "./metaState.js";
import { IDashboard } from "@gooddata/sdk-model";
import { invariant } from "ts-invariant";

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
              shareStatus: dashboard.shareStatus,
              isUnderStrictControl: dashboard.isUnderStrictControl,
              isLocked: dashboard.isLocked,
              disableCrossFiltering: dashboard.disableCrossFiltering,
              disableUserFilterReset: dashboard.disableUserFilterReset,
              disableUserFilterSave: dashboard.disableUserFilterSave,
              disableFilterViews: dashboard.disableFilterViews,
          }
        : { ...EmptyDashboardDescriptor };
};

const setDashboardTitle: MetaReducer<PayloadAction<string>> = (state, action) => {
    invariant(state.descriptor);

    state.descriptor.title = action.payload;
};

const setDisableCrossFiltering: MetaReducer<PayloadAction<boolean>> = (state, action) => {
    invariant(state.descriptor);

    state.descriptor.disableCrossFiltering = action.payload;
};

const setDisableUserFilterReset: MetaReducer<PayloadAction<boolean>> = (state, action) => {
    invariant(state.descriptor);

    state.descriptor.disableUserFilterReset = action.payload;
};

const setDisableUserFilterSave: MetaReducer<PayloadAction<boolean>> = (state, action) => {
    invariant(state.descriptor);

    state.descriptor.disableUserFilterSave = action.payload;
};

const setDisableFilterViews: MetaReducer<PayloadAction<boolean>> = (state, action) => {
    invariant(state.descriptor);

    state.descriptor.disableFilterViews = action.payload;
};

export const metaReducers = {
    setMeta,
    setDashboardTitle,
    setDisableCrossFiltering,
    setDisableUserFilterReset,
    setDisableUserFilterSave,
    setDisableFilterViews,
};
