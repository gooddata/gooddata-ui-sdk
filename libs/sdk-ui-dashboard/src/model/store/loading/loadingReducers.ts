// (C) 2021-2026 GoodData Corporation

import { type Action, type AnyAction, type CaseReducer, type PayloadAction } from "@reduxjs/toolkit";

import { type ILoadingState } from "./loadingState.js";

type LoadingReducer<A extends Action = AnyAction> = CaseReducer<ILoadingState, A>;

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
