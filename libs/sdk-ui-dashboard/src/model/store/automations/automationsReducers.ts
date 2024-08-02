// (C) 2024 GoodData Corporation

import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { AutomationsState } from "./automationsState.js";
import { GoodDataSdkError } from "@gooddata/sdk-ui";
import { v4 as uuid } from "uuid";

type AutomationsReducer<A extends Action> = CaseReducer<AutomationsState, A>;

const setAutomationsCount: AutomationsReducer<PayloadAction<number>> = (state, action) => {
    state.automations = action.payload;
    state.loading = false;
};

const setAutomationsLoading: AutomationsReducer<PayloadAction> = (state) => {
    state.loading = true;
};

const setAutomationsError: AutomationsReducer<PayloadAction<GoodDataSdkError>> = (state, action) => {
    state.loading = false;
    state.error = action.payload;
};

const refreshAutomationsFingerprint: AutomationsReducer<PayloadAction> = (state) => {
    state.fingerprint = uuid();
};

export const automationsReducers = {
    setAutomationsCount,
    setAutomationsLoading,
    setAutomationsError,
    refreshAutomationsFingerprint,
};
