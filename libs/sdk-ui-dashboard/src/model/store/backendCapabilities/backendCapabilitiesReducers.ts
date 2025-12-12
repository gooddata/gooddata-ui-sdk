// (C) 2021-2025 GoodData Corporation

import { type Action, type CaseReducer, type PayloadAction } from "@reduxjs/toolkit";

import { type IBackendCapabilities } from "@gooddata/sdk-backend-spi";

import { type BackendCapabilitiesState } from "./backendCapabilitiesState.js";

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
