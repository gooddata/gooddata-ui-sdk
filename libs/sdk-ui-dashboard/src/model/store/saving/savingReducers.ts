// (C) 2021-2025 GoodData Corporation
import { type Action, type AnyAction, type CaseReducer, type PayloadAction } from "@reduxjs/toolkit";

import { type SavingState } from "./savingState.js";

type SavingReducer<A extends Action = AnyAction> = CaseReducer<SavingState, A>;

const setSavingStart: SavingReducer = (state) => {
    state.saving = true;
    state.result = undefined;
    state.error = undefined;
};

const setSavingSuccess: SavingReducer = (state) => {
    state.saving = false;
    state.result = true;
    state.error = undefined;
};

const setSavingError: SavingReducer<PayloadAction<Error>> = (state, action) => {
    state.saving = false;
    state.result = false;
    state.error = action.payload;
};

export const savingReducers = {
    setSavingStart,
    setSavingSuccess,
    setSavingError,
};
