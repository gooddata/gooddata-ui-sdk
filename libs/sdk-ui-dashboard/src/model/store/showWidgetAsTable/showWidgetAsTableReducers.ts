// (C) 2025 GoodData Corporation
import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";

import { ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";

import { ShowWidgetAsTableState } from "./showWidgetAsTableState.js";

type ShowWidgetAsTableReducer<A extends Action> = CaseReducer<ShowWidgetAsTableState, A>;

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
