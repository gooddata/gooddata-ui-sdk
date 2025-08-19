// (C) 2024-2025 GoodData Corporation

import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";

import { areObjRefsEqual } from "@gooddata/sdk-model";

import { FilterViewsState, IFilterViews } from "./filterViewsState.js";

type FilterViewsReducer<A extends Action> = CaseReducer<FilterViewsState, A>;

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
