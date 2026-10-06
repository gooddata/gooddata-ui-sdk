// (C) 2021-2026 GoodData Corporation

import { type Action, type CaseReducer, type PayloadAction } from "@reduxjs/toolkit";
import { invariant } from "ts-invariant";

import {
    type IDashboard,
    type IDashboardTimezoneConfig,
    type ObjRef,
    normalizeDashboardTimezoneConfig,
} from "@gooddata/sdk-model";

import { EmptyDashboardDescriptor, type IDashboardMetaState } from "./metaState.js";

type MetaReducer<A extends Action> = CaseReducer<IDashboardMetaState, A>;

type SetMetaPayload = {
    dashboard?: IDashboard;
    descriptor?: IDashboard;
    initialContent?: boolean;
};
const setMeta: MetaReducer<PayloadAction<SetMetaPayload>> = (state, action) => {
    const { dashboard, descriptor: descriptorDashboard = dashboard, initialContent } = action.payload;

    state.persistedDashboard = dashboard;
    state.descriptor = descriptorDashboard
        ? {
              title: descriptorDashboard.title,
              description: descriptorDashboard.description,
              tags: descriptorDashboard.tags,
              shareStatus: descriptorDashboard.shareStatus,
              evaluationFrequency: descriptorDashboard.evaluationFrequency,
              isUnderStrictControl: descriptorDashboard.isUnderStrictControl,
              isLocked: descriptorDashboard.isLocked,
              disableCrossFiltering: descriptorDashboard.disableCrossFiltering,
              disableUserFilterReset: descriptorDashboard.disableUserFilterReset,
              disableUserFilterSave: descriptorDashboard.disableUserFilterSave,
              disableFilterViews: descriptorDashboard.disableFilterViews,
              disablePersistentFiltersAcrossTabs: descriptorDashboard.disablePersistentFiltersAcrossTabs,
              sectionHeadersDateDataSet: descriptorDashboard.sectionHeadersDateDataSet,
              timezoneConfig: descriptorDashboard.timezoneConfig,
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

const setDashboardTimezoneConfig: MetaReducer<PayloadAction<IDashboardTimezoneConfig | undefined>> = (
    state,
    action,
) => {
    invariant(state.descriptor);

    // normalize on write so that every producer (settings dialog, embedding APIs, future
    // ad-hoc commands) stores the canonical shape and "all defaults" is always undefined
    state.descriptor.timezoneConfig = normalizeDashboardTimezoneConfig(action.payload);
};

const setDisablePersistentFiltersAcrossTabs: MetaReducer<PayloadAction<boolean>> = (state, action) => {
    invariant(state.descriptor);

    state.descriptor.disablePersistentFiltersAcrossTabs = action.payload;
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
    setDashboardTimezoneConfig,
    setDisableCrossFiltering,
    setDisablePersistentFiltersAcrossTabs,
    setDisableUserFilterReset,
    setDisableUserFilterSave,
    setDisableFilterViews,
    setEvaluationFrequency,
    setSectionHeadersDateDataSet,
};
