// (C) 2021 GoodData Corporation

import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import {
    DateFilterGranularity,
    DateFilterType,
    DateString,
    FilterContextItem,
    IDashboardAttributeFilter,
    IDashboardAttributeFilterParent,
    IDashboardDateFilter,
    isDashboardAttributeFilter,
    isDashboardDateFilter,
} from "@gooddata/sdk-backend-spi";
import invariant from "ts-invariant";
import { FilterContextState } from "./filterContextState";
import { attributeElementsIsEmpty, IAttributeElements, ObjRef } from "@gooddata/sdk-model";

type FilterContextReducer<A extends Action> = CaseReducer<FilterContextState, A>;

const generateFilterLocalIdentifier = (): string => uuidv4().replace(/-/g, "");

const setFilterContext: FilterContextReducer<PayloadAction<any>> = (state, action) => {
    state.filterContext = {
        ...action.payload,
        // make sure attribute filters always have localId
        filters: action.payload.filters?.map((filter: FilterContextItem) =>
            isDashboardAttributeFilter(filter)
                ? {
                      attributeFilter: {
                          ...filter.attributeFilter,
                          localIdentifier:
                              filter.attributeFilter.localIdentifier ?? generateFilterLocalIdentifier(),
                      },
                  }
                : filter,
        ),
    };
};

export interface IUpsertDateFilterAllTimePayload {
    readonly type: "allTime";
}

export interface IUpsertDateFilterNonAllTimePayload {
    readonly type: DateFilterType;
    readonly granularity: DateFilterGranularity;
    readonly from?: DateString | number;
    readonly to?: DateString | number;
}

export type IUpsertDateFilterPayload = IUpsertDateFilterAllTimePayload | IUpsertDateFilterNonAllTimePayload;

const upsertDateFilter: FilterContextReducer<PayloadAction<IUpsertDateFilterPayload>> = (state, action) => {
    invariant(state.filterContext, "Attempt to edit uninitialized filter context");
    const existingFilterIndex = state.filterContext.filters.findIndex((item) => isDashboardDateFilter(item));
    if (action.payload.type === "allTime") {
        if (existingFilterIndex >= 0) {
            // if allTime remove the date filter altogether
            state.filterContext.filters.splice(existingFilterIndex, 1);
        }
    } else if (existingFilterIndex >= 0) {
        state.filterContext.filters[existingFilterIndex] = {
            dateFilter: {
                ...(state.filterContext.filters[existingFilterIndex] as IDashboardDateFilter),
                granularity: action.payload.granularity,
                type: action.payload.type,
                from: action.payload.from,
                to: action.payload.to,
            },
        };
    } else {
        state.filterContext.filters.unshift({
            dateFilter: {
                granularity: action.payload.granularity,
                type: action.payload.type,
                from: action.payload.from,
                to: action.payload.to,
            },
        });
    }
};

export interface IUpdateAttributeFilterSelectionPayload {
    readonly filterLocalId: string;
    readonly elements: IAttributeElements;
    readonly negativeSelection: boolean;
}

const updateAttributeFilterSelection: FilterContextReducer<
    PayloadAction<IUpdateAttributeFilterSelectionPayload>
> = (state, action) => {
    invariant(state.filterContext, "Attempt to edit uninitialized filter context");
    const existingFilterIndex = state.filterContext.filters.findIndex(
        (item) =>
            isDashboardAttributeFilter(item) &&
            item.attributeFilter.localIdentifier === action.payload.filterLocalId,
    );

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

const addAttributeFilter: FilterContextReducer<
    PayloadAction<{
        readonly displayForm: ObjRef;
        readonly index: number;
        readonly parentFilters?: ReadonlyArray<IDashboardAttributeFilterParent>;
        readonly initialSelection?: IAttributeElements;
        readonly initialIsNegativeSelection?: boolean;
    }>
> = (state, action) => {
    invariant(state.filterContext, "Attempt to edit uninitialized filter context");

    const hasSelection =
        action.payload.initialSelection && !attributeElementsIsEmpty(action.payload.initialSelection);

    const isNegative = action.payload.initialIsNegativeSelection || !hasSelection;

    const filter: IDashboardAttributeFilter = {
        attributeFilter: {
            attributeElements: action.payload.initialSelection ?? { uris: [] },
            displayForm: action.payload.displayForm,
            negativeSelection: isNegative,
            localIdentifier: generateFilterLocalIdentifier(),
            filterElementsBy: action.payload.parentFilters ? [...action.payload.parentFilters] : undefined,
        },
    };

    state.filterContext.filters.splice(action.payload.index, 0, filter);
};

export const filterContextReducers = {
    setFilterContext,
    addAttributeFilter,
    updateAttributeFilterSelection,
    upsertDateFilter,
};
