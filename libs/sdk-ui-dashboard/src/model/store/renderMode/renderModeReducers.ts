// (C) 2021-2026 GoodData Corporation

import { type Action, type AnyAction, type CaseReducer, type PayloadAction } from "@reduxjs/toolkit";

import { type IRenderModeState } from "./renderModeState.js";
import { type RenderMode } from "../../../types.js";

type RenderModeReducer<A extends Action = AnyAction> = CaseReducer<IRenderModeState, A>;

const setRenderMode: RenderModeReducer<PayloadAction<RenderMode>> = (state, action) => {
    state.renderMode = action.payload;
};

const setEditRenderMode: RenderModeReducer = (state) => {
    state.renderMode = "edit";
};

const setExportRenderMode: RenderModeReducer = (state) => {
    state.renderMode = "export";
};

const setViewRenderMode: RenderModeReducer = (state) => {
    state.renderMode = "view";
};

export const renderModeReducers = {
    setRenderMode,
    setEditRenderMode,
    setExportRenderMode,
    setViewRenderMode,
};
