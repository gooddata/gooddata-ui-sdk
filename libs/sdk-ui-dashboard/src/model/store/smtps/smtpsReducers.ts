// (C) 2024 GoodData Corporation

import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { Smtps } from "../../types/commonTypes.js";
import { SmtpsState } from "./smtpsState.js";

type SmtpsReducer<A extends Action> = CaseReducer<SmtpsState, A>;

const setSmtps: SmtpsReducer<PayloadAction<Smtps>> = (state, action) => {
    state.smtps = action.payload;
    state.loading = false;
};

export const smtpsReducers = {
    setSmtps,
};
