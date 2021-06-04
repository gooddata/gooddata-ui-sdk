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
        const { type, granularity, from, to } = action.payload;
        state.filterContext.filters[existingFilterIndex] = {
            dateFilter: {
                ...(state.filterContext.filters[existingFilterIndex] as IDashboardDateFilter),
                granularity,
                type,
                from,
                to,
            },
        };
    } else {
        const { type, granularity, from, to } = action.payload;
        state.filterContext.filters.unshift({
            dateFilter: {
                granularity,
                type,
                from,
                to,
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

    const { elements, filterLocalId, negativeSelection } = action.payload;

    const existingFilterIndex = state.filterContext.filters.findIndex(
        (item) => isDashboardAttributeFilter(item) && item.attributeFilter.localIdentifier === filterLocalId,
    );

    invariant(existingFilterIndex >= 0, "Attempt to update non-existing filter");

    state.filterContext.filters[existingFilterIndex] = {
        attributeFilter: {
            ...(state.filterContext.filters[existingFilterIndex] as IDashboardAttributeFilter)
                .attributeFilter,
            attributeElements: elements,
            negativeSelection,
        },
    };
};

export interface IAddAttributeFilterPayload {
    readonly displayForm: ObjRef;
    readonly index: number;
    readonly parentFilters?: ReadonlyArray<IDashboardAttributeFilterParent>;
    readonly initialSelection?: IAttributeElements;
    readonly initialIsNegativeSelection?: boolean;
}

const addAttributeFilter: FilterContextReducer<PayloadAction<IAddAttributeFilterPayload>> = (
    state,
    action,
) => {
    invariant(state.filterContext, "Attempt to edit uninitialized filter context");

    const { displayForm, index, initialIsNegativeSelection, initialSelection, parentFilters } =
        action.payload;

    const hasSelection = initialSelection && !attributeElementsIsEmpty(initialSelection);

    const isNegative = initialIsNegativeSelection || !hasSelection;

    const filter: IDashboardAttributeFilter = {
        attributeFilter: {
            attributeElements: initialSelection ?? { uris: [] },
            displayForm,
            negativeSelection: isNegative,
            localIdentifier: generateFilterLocalIdentifier(),
            filterElementsBy: parentFilters ? [...parentFilters] : undefined,
        },
    };

    if (index === -1) {
        state.filterContext.filters.push(filter);
    } else {
        state.filterContext.filters.splice(index, 0, filter);
    }
};

export interface IRemoveAttributeFilterPayload {
    readonly filterLocalId: string;
}

const removeAttributeFilter: FilterContextReducer<PayloadAction<IRemoveAttributeFilterPayload>> = (
    state,
    action,
) => {
    invariant(state.filterContext, "Attempt to edit uninitialized filter context");

    const { filterLocalId } = action.payload;

    state.filterContext.filters = state.filterContext.filters.filter(
        (item) => isDashboardDateFilter(item) || item.attributeFilter.localIdentifier !== filterLocalId,
    );
};

export interface IMoveAttributeFilterPayload {
    readonly filterLocalId: string;
    readonly index: number;
}

const moveAttributeFilter: FilterContextReducer<PayloadAction<IMoveAttributeFilterPayload>> = (
    state,
    action,
) => {
    invariant(state.filterContext, "Attempt to edit uninitialized filter context");

    const { filterLocalId, index } = action.payload;

    const currentFilterIndex = state.filterContext.filters.findIndex(
        (item) => isDashboardAttributeFilter(item) && item.attributeFilter.localIdentifier === filterLocalId,
    );

    invariant(currentFilterIndex >= 0, "Attempt to move non-existing filter");

    const filter = state.filterContext.filters[currentFilterIndex];

    state.filterContext.filters.splice(currentFilterIndex, 1);

    if (index === -1) {
        state.filterContext.filters.push(filter);
    } else {
        state.filterContext.filters.splice(index, 0, filter);
    }
};

export interface ISetAttributeFilterParentsPayload {
    readonly filterLocalId: string;
    readonly parentFilters: ReadonlyArray<IDashboardAttributeFilterParent>;
}

const setAttributeFilterParents: FilterContextReducer<PayloadAction<ISetAttributeFilterParentsPayload>> = (
    state,
    action,
) => {
    invariant(state.filterContext, "Attempt to edit uninitialized filter context");

    const { filterLocalId, parentFilters } = action.payload;

    const currentFilterIndex = state.filterContext.filters.findIndex(
        (item) => isDashboardAttributeFilter(item) && item.attributeFilter.localIdentifier === filterLocalId,
    );

    invariant(currentFilterIndex >= 0, "Attempt to set parent of a non-existing filter");

    (
        state.filterContext.filters[currentFilterIndex] as IDashboardAttributeFilter
    ).attributeFilter.filterElementsBy = [...parentFilters];
};

export const filterContextReducers = {
    setFilterContext,
    addAttributeFilter,
    removeAttributeFilter,
    moveAttributeFilter,
    updateAttributeFilterSelection,
    setAttributeFilterParents,
    upsertDateFilter,
};
