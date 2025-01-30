// (C) 2021-2025 GoodData Corporation

import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { invariant } from "ts-invariant";
import partition from "lodash/partition.js";
import { FilterContextState } from "./filterContextState.js";
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
    DashboardAttributeFilterSelectionMode,
    IDashboardDateFilter,
    isDashboardCommonDateFilter,
    newAllTimeDashboardDateFilter,
    IDashboardAttributeFilterByDate,
} from "@gooddata/sdk-model";
import { IParentWithConnectingAttributes } from "../../types/attributeFilterTypes.js";
import { AddDateFilterPayload } from "../../commands/index.js";
import { generateFilterLocalIdentifier } from "../_infra/generators.js";
import { IAttributeWithReferences } from "@gooddata/sdk-backend-spi";

type FilterContextReducer<A extends Action> = CaseReducer<FilterContextState, A>;

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

    // make sure attribute filters always have localId
    const filtersWithLocalId = filterContextDefinition.filters?.map((filter: FilterContextItem, i) =>
        isDashboardAttributeFilter(filter)
            ? {
                  attributeFilter: {
                      ...filter.attributeFilter,
                      localIdentifier:
                          filter.attributeFilter.localIdentifier ??
                          generateFilterLocalIdentifier(filter.attributeFilter.displayForm, i),
                  },
              }
            : filter,
    );

    // make sure that common date filter is always first if present (when DateFilter is set to all time than is missing in filterContextDefinition and originalFilterContextDefinition)
    // we have to keep order of rest of array (attributeFilters and date filters with dimension) it represent order of filters in filter bar
    const [commonDateFilter, otherFilters] = partition(filtersWithLocalId, isDashboardCommonDateFilter);
    const filters = [...commonDateFilter, ...otherFilters];

    state.filterContextDefinition = {
        ...filterContextDefinition,

        filters: filters,
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

const setPreloadedAttributesWithReferences: FilterContextReducer<
    PayloadAction<IAttributeWithReferences[]>
> = (state, action) => {
    state.attributesWithReferences = action.payload;
};

//
//
//

export interface IUpsertDateFilterAllTimePayload {
    readonly type: "allTime";
    readonly dataSet?: ObjRef;
}

export interface IUpsertDateFilterNonAllTimePayload {
    readonly type: DateFilterType;
    readonly granularity: DateFilterGranularity;
    readonly dataSet?: ObjRef;
    readonly from?: DateString | number;
    readonly to?: DateString | number;
}

export type IUpsertDateFilterPayload = IUpsertDateFilterAllTimePayload | IUpsertDateFilterNonAllTimePayload;

const upsertDateFilter: FilterContextReducer<PayloadAction<IUpsertDateFilterPayload>> = (state, action) => {
    invariant(state.filterContextDefinition, "Attempt to edit uninitialized filter context");

    const dateDataSet = action.payload.dataSet;

    let existingFilterIndex;

    if (dateDataSet) {
        existingFilterIndex = state.filterContextDefinition.filters.findIndex(
            (item) => isDashboardDateFilter(item) && areObjRefsEqual(item.dateFilter.dataSet, dateDataSet),
        );
    } else {
        existingFilterIndex = state.filterContextDefinition.filters.findIndex((item) =>
            isDashboardCommonDateFilter(item),
        );
    }

    if (action.payload.type === "allTime") {
        if (existingFilterIndex >= 0) {
            if (dateDataSet) {
                const dateFilter = state.filterContextDefinition.filters[existingFilterIndex];

                if (isDashboardDateFilter(dateFilter)) {
                    state.filterContextDefinition.filters[existingFilterIndex] =
                        newAllTimeDashboardDateFilter(dateFilter.dateFilter.dataSet);
                }
            } else {
                //if allTime common DF remove the date filter altogether
                state.filterContextDefinition.filters.splice(existingFilterIndex, 1);
            }
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
        const { type, granularity, from, to, dataSet } = action.payload;
        state.filterContextDefinition.filters.unshift({
            dateFilter: {
                granularity,
                type,
                from,
                to,
                ...(dataSet ? { dataSet } : {}),
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
    readonly selectionMode?: DashboardAttributeFilterSelectionMode;
    readonly localIdentifier?: string;
    readonly title?: string;
}

const addAttributeFilter: FilterContextReducer<PayloadAction<IAddAttributeFilterPayload>> = (
    state,
    action,
) => {
    invariant(state.filterContextDefinition, "Attempt to edit uninitialized filter context");

    const {
        displayForm,
        index,
        initialIsNegativeSelection,
        initialSelection,
        parentFilters,
        selectionMode,
        localIdentifier,
        title,
    } = action.payload;

    // Filters are indexed just for attribute filters, if DateFilter is present should be always first item
    const isDateFilterPresent = state.filterContextDefinition.filters.findIndex(isDashboardDateFilter) >= 0;

    const hasSelection = initialSelection && !attributeElementsIsEmpty(initialSelection);

    const isNegative = selectionMode !== "single" && (initialIsNegativeSelection || !hasSelection);
    // If DateFilter is present we have to move index by 1 because index of filter is calculated just for AttributeFilers array
    const attributeFilterIndex = isDateFilterPresent ? index + 1 : index;

    const filter: IDashboardAttributeFilter = {
        attributeFilter: {
            attributeElements: initialSelection ?? { uris: [] },
            displayForm,
            negativeSelection: isNegative,
            localIdentifier:
                localIdentifier ??
                generateFilterLocalIdentifier(displayForm, Math.max(0, attributeFilterIndex)),
            filterElementsBy: parentFilters ? [...parentFilters] : undefined,
            ...(selectionMode !== undefined ? { selectionMode } : {}),
            title,
        },
    };

    if (index === -1) {
        state.filterContextDefinition.filters.push(filter);
    } else {
        state.filterContextDefinition.filters.splice(attributeFilterIndex, 0, filter);
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

    // Filters are indexed just for attribute filters, if DateFilter is present should be always first item
    const isDateFilterPresent = state.filterContextDefinition.filters.findIndex(isDashboardDateFilter) >= 0;

    if (index === -1) {
        state.filterContextDefinition.filters.push(filter);
    } else {
        // If DateFilter is present we have to move index by 1 because index of filter is calculated just for AttributeFilers array
        const attributeFilterIndex = isDateFilterPresent ? index + 1 : index;
        state.filterContextDefinition.filters.splice(attributeFilterIndex, 0, filter);
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

export interface ISetAttributeFilterDependentDateFiltersPayload {
    readonly filterLocalId: string;
    readonly dependentDateFilters: ReadonlyArray<IDashboardAttributeFilterByDate>;
}

const setAttributeFilterDependentDateFilters: FilterContextReducer<
    PayloadAction<ISetAttributeFilterDependentDateFiltersPayload>
> = (state, action) => {
    invariant(state.filterContextDefinition, "Attempt to edit uninitialized filter context");

    const { filterLocalId, dependentDateFilters } = action.payload;

    const currentFilterIndex = state.filterContextDefinition.filters.findIndex(
        (item) => isDashboardAttributeFilter(item) && item.attributeFilter.localIdentifier === filterLocalId,
    );

    invariant(currentFilterIndex >= 0, "Attempt to set dependent date filter of a non-existing filter");

    (
        state.filterContextDefinition.filters[currentFilterIndex] as IDashboardAttributeFilter
    ).attributeFilter.filterElementsByDate = [...dependentDateFilters];
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

        const isMultiSelect = currentFilter.attributeFilter.selectionMode !== "single";
        currentFilter.attributeFilter.negativeSelection = isMultiSelect;
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
    readonly supportsElementUris?: boolean;
    readonly enableDuplicatedLabelValuesInAttributeFilter?: boolean;
}

/**
 * Changes the display form for the filter given by its local identifier.
 */
const changeAttributeDisplayForm: FilterContextReducer<PayloadAction<IChangeAttributeDisplayFormPayload>> = (
    state,
    action,
) => {
    invariant(state.filterContextDefinition, "Attempt to edit uninitialized filter context");

    const { filterLocalId, displayForm, supportsElementUris, enableDuplicatedLabelValuesInAttributeFilter } =
        action.payload;

    const currentFilterIndex = state.filterContextDefinition.filters.findIndex(
        (item) => isDashboardAttributeFilter(item) && item.attributeFilter.localIdentifier === filterLocalId,
    );

    invariant(currentFilterIndex >= 0, "Attempt to set parent of a non-existing filter");

    const currentFilter = state.filterContextDefinition.filters[
        currentFilterIndex
    ] as IDashboardAttributeFilter;

    currentFilter.attributeFilter.displayForm = { ...displayForm };
    const isMultiSelect = currentFilter.attributeFilter.selectionMode !== "single";

    if (!supportsElementUris && !enableDuplicatedLabelValuesInAttributeFilter) {
        currentFilter.attributeFilter.negativeSelection = isMultiSelect;
        currentFilter.attributeFilter.attributeElements = isAttributeElementsByRef(
            currentFilter.attributeFilter.attributeElements,
        )
            ? { uris: [] }
            : { values: [] };
    }
};

export interface IUpdateConnectingAttributesOnFilterAddedPayload {
    addedFilterLocalId: string;
    connectingAttributes: IParentWithConnectingAttributes[];
}

export interface IChangeAttributeTitlePayload {
    readonly filterLocalId: string;
    readonly title?: string;
}

/**
 * Changes the title for the filter given by its local identifier.
 */
const changeAttributeTitle: FilterContextReducer<PayloadAction<IChangeAttributeTitlePayload>> = (
    state,
    action,
) => {
    invariant(state.filterContextDefinition, "Attempt to edit uninitialized filter context");

    const { filterLocalId, title } = action.payload;

    const findFilter = state.filterContextDefinition.filters.find(
        (item) => isDashboardAttributeFilter(item) && item.attributeFilter.localIdentifier === filterLocalId,
    );

    invariant(findFilter, "Attempt to change title of a non-existing filter");

    (findFilter as IDashboardAttributeFilter).attributeFilter.title = title;
};

export interface IChangeAttributeSelectionModePayload {
    readonly filterLocalId: string;
    readonly selectionMode: DashboardAttributeFilterSelectionMode;
}

/**
 * Changes the selection mode for the filter given by its local identifier.
 */
const changeSelectionMode: FilterContextReducer<PayloadAction<IChangeAttributeSelectionModePayload>> = (
    state,
    action,
) => {
    invariant(state.filterContextDefinition, "Attempt to edit uninitialized filter context");

    const { filterLocalId, selectionMode } = action.payload;

    const findFilter = state.filterContextDefinition.filters.find(
        (item) => isDashboardAttributeFilter(item) && item.attributeFilter.localIdentifier === filterLocalId,
    );

    invariant(findFilter, "Attempt to change selection mode of a non-existing filter");

    (findFilter as IDashboardAttributeFilter).attributeFilter.selectionMode = selectionMode;
};

const addDateFilter: FilterContextReducer<PayloadAction<AddDateFilterPayload>> = (state, action) => {
    invariant(state.filterContextDefinition, "Attempt to edit uninitialized filter context");

    const { index, dateDataset } = action.payload;

    const filter: IDashboardDateFilter = {
        dateFilter: {
            dataSet: dateDataset,
            type: "relative",
            granularity: "GDC.time.date",
        },
    };

    // Only draggable filters are indexed, if DateFilter is present should be always first item
    const isCommonDateFilterPresent =
        state.filterContextDefinition.filters.findIndex(isDashboardCommonDateFilter) >= 0;

    if (index === -1) {
        state.filterContextDefinition.filters.push(filter);
    } else {
        // If CommonDateFilter is present we have to move index by 1 because index of filter is calculated just for AttributeFilers array
        const newFilterIndex = isCommonDateFilterPresent ? index + 1 : index;
        state.filterContextDefinition.filters.splice(newFilterIndex, 0, filter);
    }
};

//
//
//

export interface IRemoveDateFilterPayload {
    readonly dataSet: ObjRef;
}

const removeDateFilter: FilterContextReducer<PayloadAction<IRemoveDateFilterPayload>> = (state, action) => {
    invariant(state.filterContextDefinition, "Attempt to edit uninitialized filter context");

    const { dataSet } = action.payload;

    state.filterContextDefinition.filters = state.filterContextDefinition.filters.filter(
        (item) => isDashboardAttributeFilter(item) || !areObjRefsEqual(item.dateFilter.dataSet!, dataSet),
    );
};

//
//
//
export interface IMoveDateFilterPayload {
    readonly dataSet: ObjRef;
    readonly index: number;
}

const moveDateFilter: FilterContextReducer<PayloadAction<IMoveDateFilterPayload>> = (state, action) => {
    invariant(state.filterContextDefinition, "Attempt to edit uninitialized filter context");

    const { dataSet, index } = action.payload;

    const currentFilterIndex = state.filterContextDefinition.filters.findIndex(
        (item) => isDashboardDateFilter(item) && areObjRefsEqual(item.dateFilter.dataSet!, dataSet),
    );

    invariant(currentFilterIndex >= 0, "Attempt to move non-existing filter");

    const filter = state.filterContextDefinition.filters[currentFilterIndex];

    state.filterContextDefinition.filters.splice(currentFilterIndex, 1);

    // Filters are indexed just for attribute filters, if DateFilter is present should be always first item
    const isCommonDateFilterPresent =
        state.filterContextDefinition.filters.findIndex(isDashboardCommonDateFilter) >= 0;

    if (index === -1) {
        state.filterContextDefinition.filters.push(filter);
    } else {
        // If DateFilter is present we have to move index by 1 because index of filter is calculated just for DraggableFilters array
        const dateFilterIndex = isCommonDateFilterPresent ? index + 1 : index;
        state.filterContextDefinition.filters.splice(dateFilterIndex, 0, filter);
    }
};

//
//
//

export interface IChangeAttributeLimitingItemsPayload {
    readonly filterLocalId: string;
    readonly limitingItems: ObjRef[];
}

/**
 * Changes the element limiting items for the filter given by its local identifier.
 */
const changeLimitingItems: FilterContextReducer<PayloadAction<IChangeAttributeLimitingItemsPayload>> = (
    state,
    action,
) => {
    invariant(state.filterContextDefinition, "Attempt to edit uninitialized filter context");

    const { filterLocalId, limitingItems } = action.payload;

    const findFilter = state.filterContextDefinition.filters.find(
        (item) => isDashboardAttributeFilter(item) && item.attributeFilter.localIdentifier === filterLocalId,
    );

    invariant(findFilter, "Attempt to change limiting items of a non-existing filter");

    (findFilter as IDashboardAttributeFilter).attributeFilter.validateElementsBy = limitingItems;
};

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
    addDateFilter,
    removeDateFilter,
    moveDateFilter,
    updateAttributeFilterSelection,
    setAttributeFilterParents,
    setAttributeFilterDependentDateFilters,
    clearAttributeFiltersSelection,
    upsertDateFilter,
    changeAttributeDisplayForm,
    changeAttributeTitle,
    changeSelectionMode,
    changeLimitingItems,
    setPreloadedAttributesWithReferences,
};
