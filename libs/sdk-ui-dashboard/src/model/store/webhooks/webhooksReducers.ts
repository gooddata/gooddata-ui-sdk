// (C) 2024 GoodData Corporation

import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { Webhooks } from "../../types/commonTypes.js";
import { WebhooksState } from "./webhooksState.js";

type WebhooksReducer<A extends Action> = CaseReducer<WebhooksState, A>;

const setWebhooks: WebhooksReducer<PayloadAction<Webhooks>> = (state, action) => {
    state.webhooks = action.payload;
    state.loading = false;
};

export const webhooksReducers = {
    setWebhooks,
};
