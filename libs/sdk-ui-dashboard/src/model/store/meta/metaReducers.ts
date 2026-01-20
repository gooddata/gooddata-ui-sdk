// (C) 2021-2026 GoodData Corporation

import { type Action, type CaseReducer, type PayloadAction } from "@reduxjs/toolkit";
import { invariant } from "ts-invariant";

import { type IDashboard, type ObjRef } from "@gooddata/sdk-model";

import { EmptyDashboardDescriptor, type IDashboardMetaState } from "./metaState.js";

type MetaReducer<A extends Action> = CaseReducer<IDashboardMetaState, A>;

type SetMetaPayload = {
    dashboard?: IDashboard;
    initialContent?: boolean;
};
const setMeta: MetaReducer<PayloadAction<SetMetaPayload>> = (state, action) => {
    const { dashboard, initialContent } = action.payload;

    state.persistedDashboard = dashboard;
    state.descriptor = dashboard
        ? {
              title: dashboard.title,
              description: dashboard.description,
              tags: dashboard.tags,
              shareStatus: dashboard.shareStatus,
              evaluationFrequency: dashboard.evaluationFrequency,
              isUnderStrictControl: dashboard.isUnderStrictControl,
              isLocked: dashboard.isLocked,
              disableCrossFiltering: dashboard.disableCrossFiltering,
              disableUserFilterReset: dashboard.disableUserFilterReset,
              disableUserFilterSave: dashboard.disableUserFilterSave,
              disableFilterViews: dashboard.disableFilterViews,
              sectionHeadersDateDataSet: dashboard.sectionHeadersDateDataSet,
          }
        : { ...EmptyDashboardDescriptor };
    state.initialContent = initialContent;
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

const setEvaluationFrequency: MetaReducer<PayloadAction<string | undefined>> = (state, action) => {
    invariant(state.descriptor);

    state.descriptor.evaluationFrequency = action.payload || undefined;
};

const setSectionHeadersDateDataSet: MetaReducer<PayloadAction<ObjRef | undefined>> = (state, action) => {
    invariant(state.descriptor);

    state.descriptor.sectionHeadersDateDataSet = action.payload;
};

export const metaReducers = {
    setMeta,
    setDashboardTitle,
    setDisableCrossFiltering,
    setDisableUserFilterReset,
    setDisableUserFilterSave,
    setDisableFilterViews,
    setEvaluationFrequency,
    setSectionHeadersDateDataSet,
};
