// (C) 2023-2025 GoodData Corporation

import { type Action, type CaseReducer, type PayloadAction } from "@reduxjs/toolkit";

import { type EntitlementsState } from "./entitlementsState.js";
import { type ResolvedEntitlements } from "../../types/commonTypes.js";

type EntitlementsReducer<A extends Action> = CaseReducer<EntitlementsState, A>;

const setEntitlements: EntitlementsReducer<PayloadAction<ResolvedEntitlements>> = (state, action) => {
    state.entitlements = action.payload;
};

export const entitlementsReducers = {
    setEntitlements,
};
