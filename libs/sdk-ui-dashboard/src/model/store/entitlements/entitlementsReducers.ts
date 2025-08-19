// (C) 2023-2025 GoodData Corporation

import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";

import { EntitlementsState } from "./entitlementsState.js";
import { ResolvedEntitlements } from "../../types/commonTypes.js";

type EntitlementsReducer<A extends Action> = CaseReducer<EntitlementsState, A>;

const setEntitlements: EntitlementsReducer<PayloadAction<ResolvedEntitlements>> = (state, action) => {
    state.entitlements = action.payload;
};

export const entitlementsReducers = {
    setEntitlements,
};
