// (C) 2025-2026 GoodData Corporation

import { type Action, type CaseReducer, type PayloadAction } from "@reduxjs/toolkit";

import { type ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";

import { type IShowWidgetAsTableState } from "./showWidgetAsTableState.js";

type ShowWidgetAsTableReducer<A extends Action> = CaseReducer<IShowWidgetAsTableState, A>;

const setShowWidgetAsTable: ShowWidgetAsTableReducer<PayloadAction<ObjRef[]>> = (state, action) => {
    state.widgetRefs = action.payload;
};

const clearShowWidgetAsTable: ShowWidgetAsTableReducer<PayloadAction<void>> = (state) => {
    state.widgetRefs = [];
};

const addWidgetToShowAsTable: ShowWidgetAsTableReducer<PayloadAction<ObjRef>> = (state, action) => {
    if (!state.widgetRefs.some((ref) => areObjRefsEqual(ref, action.payload))) {
        state.widgetRefs.push(action.payload);
    }
};
const removeWidgetToShowAsTable: ShowWidgetAsTableReducer<PayloadAction<ObjRef>> = (state, action) => {
    state.widgetRefs = state.widgetRefs.filter((ref) => !areObjRefsEqual(ref, action.payload));
};

export const showWidgetAsTableReducers = {
    setShowWidgetAsTable,
    clearShowWidgetAsTable,
    addWidgetToShowAsTable,
    removeWidgetToShowAsTable,
};
