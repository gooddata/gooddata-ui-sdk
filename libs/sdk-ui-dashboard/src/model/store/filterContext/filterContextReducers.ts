// (C) 2021-2022 GoodData Corporation

import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import invariant from "ts-invariant";
import { FilterContextState } from "./filterContextState";
import {
    areObjRefsEqual,
    attributeElementsIsEmpty,
    IAttributeElements,
    isAttributeElementsByRef,
    ObjRef,
    DateString,
    DateFilterGranularity,
    IDashboardObjectIdentity,
    DateFilterType,
    FilterContextItem,
    IDashboardAttributeFilter,
    IDashboardAttributeFilterParent,
    IFilterContextDefinition,
    isDashboardAttributeFilter,
    isDashboardDateFilter,
    IAttributeDisplayFormMetadataObject,
} from "@gooddata/sdk-model";
import { IParentWithConnectingAttributes } from "../../types/attributeFilterTypes";

type FilterContextReducer<A extends Action> = CaseReducer<FilterContextState, A>;

const generateFilterLocalIdentifier = (): string => uuidv4().replace(/-/g, "");

//
//
//

type SetFilterContextPayload = {
    filterContextDefinition: IFilterContextDefinition;
    originalFilterContextDefinition?: IFilterContextDefinition;
    attributeFilterDisplayForms: IAttributeDisplayFormMetadataObject[];
    filterContextIdentity?: IDashboardObjectIdentity;
};

const setFilterContext: FilterContextReducer<PayloadAction<SetFilterContextPayload>> = (state, action) => {
    const {
        filterContextDefinition,
        originalFilterContextDefinition,
        filterContextIdentity,
        attributeFilterDisplayForms,
    } = action.payload;

    state.filterContextDefinition = {
        ...filterContextDefinition,
        // make sure attribute filters always have localId
        filters: filterContextDefinition.filters?.map((filter: FilterContextItem) =>
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

    state.originalFilterContextDefinition = originalFilterContextDefinition;

    state.filterContextIdentity = filterContextIdentity;
    state.attributeFilterDisplayForms = attributeFilterDisplayForms;
};

//
//
//

type SetFilterContextIdentityPayload = {
    filterContextIdentity?: IDashboardObjectIdentity;
};

const updateFilterContextIdentity: FilterContextReducer<PayloadAction<SetFilterContextIdentityPayload>> = (
    state,
    action,
) => {
    state.filterContextIdentity = action.payload.filterContextIdentity;
};

//
//
//

const removeAttributeFilterDisplayForms: FilterContextReducer<PayloadAction<ObjRef>> = (state, action) => {
    invariant(state.attributeFilterDisplayForms, "attempting to work with uninitialized state");

    state.attributeFilterDisplayForms = state.attributeFilterDisplayForms.filter((df) => {
        return !areObjRefsEqual(df, action.payload);
    });
};

const addAttributeFilterDisplayForm: FilterContextReducer<
    PayloadAction<IAttributeDisplayFormMetadataObject>
> = (state, action) => {
    invariant(state.attributeFilterDisplayForms, "attempting to work with uninitialized state");

    // if there is already a display form with the same ref, replace it
    const existing = state.attributeFilterDisplayForms.find((df) => areObjRefsEqual(df, action.payload.ref));
    if (existing) {
        state.attributeFilterDisplayForms = state.attributeFilterDisplayForms.filter(
            (df) => !areObjRefsEqual(df, action.payload),
        );
    }
    state.attributeFilterDisplayForms.push(action.payload);
};

//
//
//

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
    invariant(state.filterContextDefinition, "Attempt to edit uninitialized filter context");

    const existingFilterIndex = state.filterContextDefinition.filters.findIndex((item) =>
        isDashboardDateFilter(item),
    );

    /**
     * TODO: This will cause problems once we support dateDataset-specific date filters (then, we might want
     * to keep even the all time filters to carry the information about the selected dateDataset).
     */
    if (action.payload.type === "allTime") {
        if (existingFilterIndex >= 0) {
            // if allTime remove the date filter altogether
            state.filterContextDefinition.filters.splice(existingFilterIndex, 1);
        }
    } else if (existingFilterIndex >= 0) {
        const { type, granularity, from, to } = action.payload;
        const dateFilter = state.filterContextDefinition.filters[existingFilterIndex];

        if (isDashboardDateFilter(dateFilter)) {
            dateFilter.dateFilter.type = type;
            dateFilter.dateFilter.granularity = granularity;
            dateFilter.dateFilter.from = from;
            dateFilter.dateFilter.to = to;
        }
    } else {
        const { type, granularity, from, to } = action.payload;
        state.filterContextDefinition.filters.unshift({
            dateFilter: {
                granularity,
                type,
                from,
                to,
            },
        });
    }
};

//
//
//

export interface IUpdateAttributeFilterSelectionPayload {
    readonly filterLocalId: string;
    readonly elements: IAttributeElements;
    readonly negativeSelection: boolean;
}

const updateAttributeFilterSelection: FilterContextReducer<
    PayloadAction<IUpdateAttributeFilterSelectionPayload>
> = (state, action) => {
    invariant(state.filterContextDefinition, "Attempt to edit uninitialized filter context");

    const { elements, filterLocalId, negativeSelection } = action.payload;

    const existingFilterIndex = state.filterContextDefinition.filters.findIndex(
        (item) => isDashboardAttributeFilter(item) && item.attributeFilter.localIdentifier === filterLocalId,
    );

    invariant(existingFilterIndex >= 0, "Attempt to update non-existing filter");

    state.filterContextDefinition.filters[existingFilterIndex] = {
        attributeFilter: {
            ...(state.filterContextDefinition.filters[existingFilterIndex] as IDashboardAttributeFilter)
                .attributeFilter,
            attributeElements: elements,
            negativeSelection,
        },
    };
};

//
//
//

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
    invariant(state.filterContextDefinition, "Attempt to edit uninitialized filter context");

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
        state.filterContextDefinition.filters.push(filter);
    } else {
        state.filterContextDefinition.filters.splice(index, 0, filter);
    }
};

//
//
//

export interface IRemoveAttributeFilterPayload {
    readonly filterLocalId: string;
}

const removeAttributeFilter: FilterContextReducer<PayloadAction<IRemoveAttributeFilterPayload>> = (
    state,
    action,
) => {
    invariant(state.filterContextDefinition, "Attempt to edit uninitialized filter context");

    const { filterLocalId } = action.payload;

    state.filterContextDefinition.filters = state.filterContextDefinition.filters.filter(
        (item) => isDashboardDateFilter(item) || item.attributeFilter.localIdentifier !== filterLocalId,
    );
};

//
//
//

export interface IMoveAttributeFilterPayload {
    readonly filterLocalId: string;
    readonly index: number;
}

const moveAttributeFilter: FilterContextReducer<PayloadAction<IMoveAttributeFilterPayload>> = (
    state,
    action,
) => {
    invariant(state.filterContextDefinition, "Attempt to edit uninitialized filter context");

    const { filterLocalId, index } = action.payload;

    const currentFilterIndex = state.filterContextDefinition.filters.findIndex(
        (item) => isDashboardAttributeFilter(item) && item.attributeFilter.localIdentifier === filterLocalId,
    );

    invariant(currentFilterIndex >= 0, "Attempt to move non-existing filter");

    const filter = state.filterContextDefinition.filters[currentFilterIndex];

    state.filterContextDefinition.filters.splice(currentFilterIndex, 1);

    if (index === -1) {
        state.filterContextDefinition.filters.push(filter);
    } else {
        state.filterContextDefinition.filters.splice(index, 0, filter);
    }
};

//
//
//

export interface ISetAttributeFilterParentsPayload {
    readonly filterLocalId: string;
    readonly parentFilters: ReadonlyArray<IDashboardAttributeFilterParent>;
}

const setAttributeFilterParents: FilterContextReducer<PayloadAction<ISetAttributeFilterParentsPayload>> = (
    state,
    action,
) => {
    invariant(state.filterContextDefinition, "Attempt to edit uninitialized filter context");

    const { filterLocalId, parentFilters } = action.payload;

    const currentFilterIndex = state.filterContextDefinition.filters.findIndex(
        (item) => isDashboardAttributeFilter(item) && item.attributeFilter.localIdentifier === filterLocalId,
    );

    invariant(currentFilterIndex >= 0, "Attempt to set parent of a non-existing filter");

    (
        state.filterContextDefinition.filters[currentFilterIndex] as IDashboardAttributeFilter
    ).attributeFilter.filterElementsBy = [...parentFilters];
};

//
//
//

export interface IClearAttributeFiltersSelectionPayload {
    readonly filterLocalIds: string[];
}

const clearAttributeFiltersSelection: FilterContextReducer<
    PayloadAction<IClearAttributeFiltersSelectionPayload>
> = (state, action) => {
    const { filterLocalIds } = action.payload;

    filterLocalIds.forEach((filterLocalId) => {
        invariant(state.filterContextDefinition, "Attempt to edit uninitialized filter context");
        const currentFilterIndex = state.filterContextDefinition.filters.findIndex(
            (item) =>
                isDashboardAttributeFilter(item) && item.attributeFilter.localIdentifier === filterLocalId,
        );

        invariant(currentFilterIndex >= 0, "Attempt to clear selection of a non-existing filter");

        const currentFilter = state.filterContextDefinition.filters[
            currentFilterIndex
        ] as IDashboardAttributeFilter;

        currentFilter.attributeFilter.negativeSelection = true;
        currentFilter.attributeFilter.attributeElements = isAttributeElementsByRef(
            currentFilter.attributeFilter.attributeElements,
        )
            ? { uris: [] }
            : { values: [] };
    });
};

export interface IChangeAttributeDisplayFormPayload {
    readonly filterLocalId: string;
    readonly displayForm: ObjRef;
}

/**
 * Changes the display form for the filter given by its local identifier.
 */
const changeAttributeDisplayForm: FilterContextReducer<PayloadAction<IChangeAttributeDisplayFormPayload>> = (
    state,
    action,
) => {
    invariant(state.filterContextDefinition, "Attempt to edit uninitialized filter context");

    const { filterLocalId, displayForm } = action.payload;

    const currentFilterIndex = state.filterContextDefinition.filters.findIndex(
        (item) => isDashboardAttributeFilter(item) && item.attributeFilter.localIdentifier === filterLocalId,
    );

    invariant(currentFilterIndex >= 0, "Attempt to set parent of a non-existing filter");

    (
        state.filterContextDefinition.filters[currentFilterIndex] as IDashboardAttributeFilter
    ).attributeFilter.displayForm = { ...displayForm };
};

export interface IUpdateConnectingAttributesOnFilterAddedPayload {
    addedFilterLocalId: string;
    connectingAttributes: IParentWithConnectingAttributes[];
}

//
//
//

export const filterContextReducers = {
    setFilterContext,
    updateFilterContextIdentity,
    removeAttributeFilterDisplayForms,
    addAttributeFilterDisplayForm,
    addAttributeFilter,
    removeAttributeFilter,
    moveAttributeFilter,
    updateAttributeFilterSelection,
    setAttributeFilterParents,
    clearAttributeFiltersSelection,
    upsertDateFilter,
    changeAttributeDisplayForm,
};
