// (C) 2021 GoodData Corporation

import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import {
    IDashboardAttributeFilter,
    IDashboardDateFilter,
    isDashboardAttributeFilter,
    isDashboardDateFilter,
} from "@gooddata/sdk-backend-spi";
import invariant from "ts-invariant";
import { FilterContextState } from "./filterContextState";
import { IAttributeElements } from "@gooddata/sdk-model";

type FilterContextReducer<A extends Action> = CaseReducer<FilterContextState, A>;

const setFilterContext: FilterContextReducer<PayloadAction<any>> = (state, action) => {
    state.filterContext = action.payload;
};

const removeDateFilter: FilterContextReducer<PayloadAction<void>> = (state) => {
    invariant(state.filterContext, "Attempt to edit uninitialized filter context");
    const existingFilterIndex = state.filterContext.filters.findIndex((item) => isDashboardDateFilter(item));
    state.filterContext.filters.splice(existingFilterIndex, 1);
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

const updateAttributeFilterSelection: FilterContextReducer<
    PayloadAction<{
        readonly filterLocalId: string;
        readonly elements: IAttributeElements;
        readonly negativeSelection: boolean;
    }>
> = (state, action) => {
    invariant(state.filterContext, "Attempt to edit uninitialized filter context");
    const existingFilterIndex = state.filterContext.filters.findIndex((item) => {
        isDashboardAttributeFilter(item) &&
            item.attributeFilter.localIdentifier === action.payload.filterLocalId;
    });

    invariant(existingFilterIndex >= 0, "Attempt to update non-existing filter");

    state.filterContext.filters[existingFilterIndex] = {
        attributeFilter: {
            ...(state.filterContext.filters[existingFilterIndex] as IDashboardAttributeFilter)
                .attributeFilter,
            attributeElements: action.payload.elements,
            negativeSelection: action.payload.negativeSelection,
        },
    };
};

export const filterContextReducers = {
    setFilterContext,
    updateAttributeFilterSelection,
    upsertDateFilter,
    removeDateFilter,
};
