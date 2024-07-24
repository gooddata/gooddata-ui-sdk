// (C) 2024 GoodData Corporation

import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { Automations } from "../../types/commonTypes.js";
import { AutomationsState } from "./automationsState.js";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

type AutomationsReducer<A extends Action> = CaseReducer<AutomationsState, A>;

const setAutomations: AutomationsReducer<PayloadAction<Automations>> = (state, action) => {
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

export const automationsReducers = {
    setAutomations,
    setAutomationsLoading,
    setAutomationsError,
};
