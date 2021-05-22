// (C) 2021 GoodData Corporation

import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { FilterContextState } from "./filterContextState";

type FilterContextReducer<A extends Action> = CaseReducer<FilterContextState, A>;

const setFilterContext: FilterContextReducer<PayloadAction<any>> = (state, action) => {
    state.filterContext = action.payload;
};

export const filterContextReducers = {
    setFilterContext,
};
