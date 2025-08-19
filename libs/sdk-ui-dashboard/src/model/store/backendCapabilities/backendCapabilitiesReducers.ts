// (C) 2021-2025 GoodData Corporation

import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";

import { IBackendCapabilities } from "@gooddata/sdk-backend-spi";

import { BackendCapabilitiesState } from "./backendCapabilitiesState.js";

type BackendCapabilitiesReducer<A extends Action> = CaseReducer<BackendCapabilitiesState, A>;

const setBackendCapabilities: BackendCapabilitiesReducer<PayloadAction<IBackendCapabilities>> = (
    state,
    action,
) => {
    state.backendCapabilities = action.payload;
};

export const backendCapabilitiesReducers = {
    setBackendCapabilities,
};
