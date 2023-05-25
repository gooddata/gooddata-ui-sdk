// (C) 2021 GoodData Corporation
import { Action, AnyAction, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { LoadingState } from "./loadingState.js";

type LoadingReducer<A extends Action = AnyAction> = CaseReducer<LoadingState, A>;

const setLoadingStart: LoadingReducer = (state) => {
    state.loading = true;
    state.result = undefined;
    state.error = undefined;
};

const setLoadingSuccess: LoadingReducer = (state) => {
    state.loading = false;
    state.result = true;
    state.error = undefined;
};

const setLoadingError: LoadingReducer<PayloadAction<Error>> = (state, action) => {
    state.loading = false;
    state.result = false;
    state.error = action.payload;
};

export const loadingReducers = {
    setLoadingStart,
    setLoadingSuccess,
    setLoadingError,
};
