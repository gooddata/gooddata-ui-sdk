// (C) 2021 GoodData Corporation
import { Action, AnyAction, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { SavingState } from "./savingState.js";

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
