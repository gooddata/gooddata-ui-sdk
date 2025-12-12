// (C) 2024-2025 GoodData Corporation

import { type Action, type CaseReducer, type PayloadAction } from "@reduxjs/toolkit";

import { type IAutomationMetadataObject } from "@gooddata/sdk-model";
import { type GoodDataSdkError } from "@gooddata/sdk-ui";

import { type AutomationsState } from "./automationsState.js";

type AutomationsReducer<A extends Action> = CaseReducer<AutomationsState, A>;

const setAllAutomationsCount: AutomationsReducer<PayloadAction<number>> = (state, action) => {
    state.allAutomationsCount = action.payload;
};

const setAutomationsInitialized: AutomationsReducer<Action> = (state) => {
    state.isInitialized = true;
};

const setUserAutomations: AutomationsReducer<PayloadAction<IAutomationMetadataObject[]>> = (
    state,
    action,
) => {
    state.userAutomations = action.payload;
};

const setAutomationsLoading: AutomationsReducer<PayloadAction<boolean>> = (state, action) => {
    state.isLoading = action.payload;
};

const setAutomationsError: AutomationsReducer<PayloadAction<GoodDataSdkError>> = (state, action) => {
    state.error = action.payload;
};

export const automationsReducers = {
    setAutomationsInitialized,
    setAllAutomationsCount,
    setUserAutomations,
    setAutomationsLoading,
    setAutomationsError,
};
