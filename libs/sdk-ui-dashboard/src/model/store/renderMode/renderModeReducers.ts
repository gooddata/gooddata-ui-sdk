// (C) 2021-2022 GoodData Corporation
import { Action, AnyAction, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { RenderModeState } from "./renderModeState.js";
import { RenderMode } from "../../../types.js";

type RenderModeReducer<A extends Action = AnyAction> = CaseReducer<RenderModeState, A>;

const setRenderMode: RenderModeReducer<PayloadAction<RenderMode>> = (state, action) => {
    state.renderMode = action.payload;
};

const setEditRenderMode: RenderModeReducer = (state) => {
    state.renderMode = "edit";
};

const setViewRenderMode: RenderModeReducer = (state) => {
    state.renderMode = "view";
};

export const renderModeReducers = {
    setRenderMode,
    setEditRenderMode,
    setViewRenderMode,
};
