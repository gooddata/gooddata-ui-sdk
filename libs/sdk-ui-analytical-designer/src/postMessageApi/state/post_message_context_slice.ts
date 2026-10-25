// (C) 2026 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit";
import { type Reducer } from "redux";

import { setPostMessageContext } from "../actions/set_post_message_context_actions.js";

import {
    type IPostMessageContextState,
    postMessageContextInitialState,
} from "./post_message_context_state.js";

const postMessageContextSlice = createSlice({
    name: "postMessageContext",
    initialState: postMessageContextInitialState as IPostMessageContextState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(setPostMessageContext, (state, action) => {
            const next = action.payload.postMessageContext ?? null;
            // Equality guard: replaying the same contextId short-circuits, so the store does not
            // notify on a no-op. An absent contextId on either side compares as undefined, which
            // the accessor normalizes to the same fallback content.
            return state?.contextId === next?.contextId ? state : next;
        });
    },
});

export const postMessageContextSliceReducer: Reducer<IPostMessageContextState> =
    postMessageContextSlice.reducer;
