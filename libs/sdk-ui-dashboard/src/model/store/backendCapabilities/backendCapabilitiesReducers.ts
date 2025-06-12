// (C) 2021 GoodData Corporation

import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { BackendCapabilitiesState } from "./backendCapabilitiesState.js";
import { IBackendCapabilities } from "@gooddata/sdk-backend-spi";

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
