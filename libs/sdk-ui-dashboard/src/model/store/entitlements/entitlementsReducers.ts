// (C) 2023-2026 GoodData Corporation

import { type Action, type CaseReducer, type PayloadAction } from "@reduxjs/toolkit";

import { type IEntitlementsState } from "./entitlementsState.js";
import { type ResolvedEntitlements } from "../../types/commonTypes.js";

type EntitlementsReducer<A extends Action> = CaseReducer<IEntitlementsState, A>;

const setEntitlements: EntitlementsReducer<PayloadAction<ResolvedEntitlements>> = (state, action) => {
    state.entitlements = action.payload;
};

export const entitlementsReducers = {
    setEntitlements,
};
