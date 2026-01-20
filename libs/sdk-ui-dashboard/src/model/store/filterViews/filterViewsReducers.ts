// (C) 2024-2026 GoodData Corporation

import { type Action, type CaseReducer, type PayloadAction } from "@reduxjs/toolkit";

import { areObjRefsEqual } from "@gooddata/sdk-model";

import { type IFilterViews, type IFilterViewsState } from "./filterViewsState.js";

type FilterViewsReducer<A extends Action> = CaseReducer<IFilterViewsState, A>;

const setFilterViews: FilterViewsReducer<PayloadAction<IFilterViews>> = (state, action) => {
    state.filterViews = [
        ...state.filterViews.filter((item) => !areObjRefsEqual(item.dashboard, action.payload.dashboard)),
        action.payload,
    ];
    state.isLoading = false;
};

const setFilterLoading: FilterViewsReducer<PayloadAction<boolean>> = (state, action) => {
    state.isLoading = action.payload;
};

export const filterViewsReducers = {
    setFilterViews,
    setFilterLoading,
};
