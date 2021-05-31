// (C) 2021 GoodData Corporation

import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { IDashboardDateFilter, isDashboardDateFilter } from "@gooddata/sdk-backend-spi";
import invariant from "ts-invariant";
import { FilterContextState } from "./filterContextState";

type FilterContextReducer<A extends Action> = CaseReducer<FilterContextState, A>;

const setFilterContext: FilterContextReducer<PayloadAction<any>> = (state, action) => {
    state.filterContext = action.payload;
};

const upsertDateFilter: FilterContextReducer<PayloadAction<IDashboardDateFilter>> = (state, action) => {
    invariant(state.filterContext, "Attempt to edit uninitialized filter context");
    const existingFilterIndex = state.filterContext.filters.findIndex((item) => isDashboardDateFilter(item));
    if (existingFilterIndex >= 0) {
        state.filterContext.filters[existingFilterIndex] = action.payload;
    } else {
        state.filterContext.filters.unshift(action.payload);
    }
};

export const filterContextReducers = {
    setFilterContext,
    upsertDateFilter,
};
