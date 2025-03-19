// (C) 2024 GoodData Corporation

import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { AutomationsState } from "./automationsState.js";
import { IAutomationMetadataObject } from "@gooddata/sdk-model";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

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
