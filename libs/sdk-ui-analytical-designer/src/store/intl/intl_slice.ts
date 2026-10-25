// (C) 2026 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit";
import { type Reducer } from "redux";

import {
    type IBootstrapDataAction,
    type setIntlMessages,
    type setLocale,
} from "../../actions/app_context_actions.js";
import { ActionTypeKeys } from "../../constants/actions.js";
import { validateLocale } from "../../utils/translations.js";

import { type IIntlState, intlInitialState } from "./intl_state.js";

const intlSlice = createSlice({
    name: "intl",
    initialState: intlInitialState,
    // Cases are wired by their frozen enum STRING with type-only creator imports on purpose:
    // a value import of actions/app_context_actions.js would drag jquery + jquery.browser
    // (a window read at import time) into the reducer graph and break node-env consumers.
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(ActionTypeKeys.BOOTSTRAP_DATA, (state, action: IBootstrapDataAction) => {
                state.locale = validateLocale(action.payload.data.user.language);
            })
            // the locale is stored verbatim, without validation — readers
            // resolve message lookups through validateLocale on the way out
            .addCase(ActionTypeKeys.SET_LOCALE, (state, action: ReturnType<typeof setLocale>) => {
                state.locale = action.payload.locale;
            })
            .addCase(
                ActionTypeKeys.SET_INTL_MESSAGES,
                (state, action: ReturnType<typeof setIntlMessages>) => {
                    state.messages[action.payload.locale] = action.payload.messages;
                },
            );
    },
});

/** The appState.intl slice reducer, mounted via intl_reducer.ts. */
export const intlSliceReducer: Reducer<IIntlState> = intlSlice.reducer;
