// (C) 2021-2026 GoodData Corporation

import { type Action, type CaseReducer, type PayloadAction } from "@reduxjs/toolkit";
import { invariant } from "ts-invariant";

import { type IAttributeWithReferences } from "@gooddata/sdk-backend-spi";
import {
    type DashboardAttributeFilterSelectionMode,
    type DateFilterGranularity,
    type DateFilterType,
    type DateString,
    type FilterContextItem,
    type IAttributeDisplayFormMetadataObject,
    type IAttributeElements,
    type IDashboardAttributeFilter,
    type IDashboardAttributeFilterByDate,
    type IDashboardAttributeFilterParent,
    type IDashboardDateFilter,
    type IDashboardObjectIdentity,
    type IFilterContextDefinition,
    type ILowerBoundedFilter,
    type IUpperBoundedFilter,
    type ObjRef,
    areObjRefsEqual,
    attributeElementsIsEmpty,
    isAttributeElementsByRef,
    isDashboardAttributeFilter,
    isDashboardCommonDateFilter,
    isDashboardDateFilter,
    newAllTimeDashboardDateFilter,
} from "@gooddata/sdk-model";

import { filterContextInitialState } from "./filterContextState.js";
import { applyFilterContext, initializeFilterContext } from "./filterContextUtils.js";
import { type IAddDateFilterPayload } from "../../../commands/index.js";
import { generateFilterLocalIdentifier } from "../../_infra/generators.js";
import { type ITabsState, getActiveTab, getTabOrActive } from "../tabsState.js";

type FilterContextReducer<A extends Action> = CaseReducer<ITabsState, A>;

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
    const activeTab = getActiveTab(state);
    if (!activeTab) {
        return;
    }

    const {
        filterContextDefinition,
        originalFilterContextDefinition,
        filterContextIdentity,
        attributeFilterDisplayForms,
    } = action.payload;

    // Use the helper function to initialize the filter context
    activeTab.filterContext = initializeFilterContext(
        filterContextDefinition,
        originalFilterContextDefinition,
        attributeFilterDisplayForms,
        filterContextIdentity,
    );
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
    const activeTab = getActiveTab(state);
    if (!activeTab) {
        return;
    }
    if (!activeTab.filterContext) {
        activeTab.filterContext = { ...filterContextInitialState };
    }

    activeTab.filterContext.filterContextIdentity = action.payload.filterContextIdentity;
};

/**
 * Payload for updating filter context identity for a specific tab.
 */
type UpdateFilterContextIdentityForTabPayload = {
    tabId: string;
    filterContextIdentity?: IDashboardObjectIdentity;
};

/**
 * Updates filter context identity for a specific tab after a dashboard save.
 * This ensures that the filter context gets the correct identity from the backend.
 *
 * @param state - The tabs state
 * @param action - Object containing tabId and the filter context identity
 */
const updateFilterContextIdentityForTab: FilterContextReducer<
    PayloadAction<UpdateFilterContextIdentityForTabPayload>
> = (state, action) => {
    if (!state.tabs) {
        return;
    }

    const { tabId, filterContextIdentity } = action.payload;
    const tab = state.tabs.find((t) => t.localIdentifier === tabId);

    if (!tab) {
        return;
    }

    if (!tab.filterContext) {
        tab.filterContext = { ...filterContextInitialState };
    }

    tab.filterContext.filterContextIdentity = filterContextIdentity;
};

//
//
//

const removeAttributeFilterDisplayForms: FilterContextReducer<PayloadAction<ObjRef>> = (state, action) => {
    const activeTab = getActiveTab(state);
    if (!activeTab) {
        return;
    }
    if (!activeTab.filterContext) {
        activeTab.filterContext = { ...filterContextInitialState };
    }

    invariant(
        activeTab.filterContext.attributeFilterDisplayForms,
        "attempting to work with uninitialized state",
    );

    activeTab.filterContext.attributeFilterDisplayForms =
        activeTab.filterContext.attributeFilterDisplayForms.filter((df) => {
            return !areObjRefsEqual(df, action.payload);
        });
};

/**
 * @internal
 */
export interface IAddAttributeFilterDisplayFormPayload {
    readonly displayForm: IAttributeDisplayFormMetadataObject;
    /**
     * Optional tab local identifier to target a specific tab.
     * If not provided, the active tab will be used.
     */
    readonly tabLocalIdentifier?: string;
}

const addAttributeFilterDisplayForm: FilterContextReducer<
    PayloadAction<IAttributeDisplayFormMetadataObject | IAddAttributeFilterDisplayFormPayload>
> = (state, action) => {
    // Handle both old and new payload formats for backward compatibility
    const displayForm = "displayForm" in action.payload ? action.payload.displayForm : action.payload;
    const tabLocalIdentifier =
        "tabLocalIdentifier" in action.payload ? action.payload.tabLocalIdentifier : undefined;

    const targetTab = getTabOrActive(state, tabLocalIdentifier);
    if (!targetTab) {
        return;
    }
    if (!targetTab.filterContext) {
        targetTab.filterContext = { ...filterContextInitialState };
    }

    invariant(
        targetTab.filterContext.attributeFilterDisplayForms,
        "attempting to work with uninitialized state",
    );

    // if there is already a display form with the same ref, replace it
    const existing = targetTab.filterContext.attributeFilterDisplayForms.find((df) =>
        areObjRefsEqual(df, displayForm.ref),
    );
    if (existing) {
        targetTab.filterContext.attributeFilterDisplayForms =
            targetTab.filterContext.attributeFilterDisplayForms.filter(
                (df) => !areObjRefsEqual(df, displayForm),
            );
    }
    targetTab.filterContext.attributeFilterDisplayForms.push(displayForm);
};

//
//
//

const setPreloadedAttributesWithReferences: FilterContextReducer<
    PayloadAction<IAttributeWithReferences[]>
> = (state, action) => {
    // Store attributesWithReferences at TabsState level (shared across all tabs)
    // The payload already contains merged attributes from all filters across all tabs
    state.attributesWithReferences = action.payload;
};

//
//
//

/**
 * @internal
 */
export interface IUpsertDateFilterAllTimePayload {
    readonly type: "allTime";
    readonly dataSet?: ObjRef;
    readonly isWorkingSelectionChange?: boolean;
    readonly localIdentifier?: string;
    /**
     * Optional tab local identifier to target a specific tab.
     * If not provided, the active tab will be used.
     */
    readonly tabLocalIdentifier?: string;
}

/**
 * @internal
 */
export interface IUpsertDateFilterNonAllTimePayload {
    readonly type: DateFilterType;
    readonly granularity: DateFilterGranularity;
    readonly dataSet?: ObjRef;
    readonly from?: DateString | number;
    readonly to?: DateString | number;
    readonly isWorkingSelectionChange?: boolean;
    readonly localIdentifier?: string;
    readonly boundedFilter?: IUpperBoundedFilter | ILowerBoundedFilter;
    /**
     * Optional tab local identifier to target a specific tab.
     * If not provided, the active tab will be used.
     */
    readonly tabLocalIdentifier?: string;
}

/**
 * @internal
 */
export type IUpsertDateFilterPayload = IUpsertDateFilterAllTimePayload | IUpsertDateFilterNonAllTimePayload;

const upsertDateFilter: FilterContextReducer<PayloadAction<IUpsertDateFilterPayload>> = (state, action) => {
    const targetTab = getTabOrActive(state, action.payload.tabLocalIdentifier);
    if (!targetTab) {
        return;
    }
    if (!targetTab.filterContext) {
        targetTab.filterContext = { ...filterContextInitialState };
    }

    const filterContextDefinition = action.payload.isWorkingSelectionChange
        ? targetTab.filterContext.workingFilterContextDefinition
        : targetTab.filterContext.filterContextDefinition;
    invariant(filterContextDefinition?.filters, "Attempt to edit uninitialized filter context");

    const dateDataSet = action.payload.dataSet;

    let existingFilterIndex: number = -1;

    if (dateDataSet) {
        existingFilterIndex = filterContextDefinition.filters.findIndex(
            (item) => isDashboardDateFilter(item) && areObjRefsEqual(item.dateFilter.dataSet, dateDataSet),
        );
    } else {
        existingFilterIndex = filterContextDefinition.filters.findIndex((item) =>
            isDashboardCommonDateFilter(item),
        );
    }

    if (action.payload.isWorkingSelectionChange && action.payload.type === "allTime") {
        // we need to allways set working filter to distinguish between "not changed" and "all time" filter
        if (existingFilterIndex >= 0) {
            const dateFilter = filterContextDefinition.filters[existingFilterIndex];
            if (isDashboardDateFilter(dateFilter)) {
                filterContextDefinition.filters[existingFilterIndex] = newAllTimeDashboardDateFilter(
                    dateFilter.dateFilter.dataSet,
                    dateFilter.dateFilter.localIdentifier,
                );
            }
        } else {
            filterContextDefinition.filters.unshift(
                newAllTimeDashboardDateFilter(action.payload.dataSet, action.payload.localIdentifier),
            );
        }
    } else if (action.payload.type === "allTime") {
        if (existingFilterIndex >= 0) {
            if (dateDataSet) {
                const dateFilter = filterContextDefinition.filters[existingFilterIndex];

                if (isDashboardDateFilter(dateFilter)) {
                    filterContextDefinition.filters[existingFilterIndex] = newAllTimeDashboardDateFilter(
                        dateFilter.dateFilter.dataSet,
                        dateFilter.dateFilter.localIdentifier,
                    );
                }
            } else {
                //if allTime common DF remove the date filter altogether
                filterContextDefinition.filters.splice(existingFilterIndex, 1);
            }
        }
    } else if (existingFilterIndex >= 0) {
        const { type, granularity, from, to, localIdentifier, boundedFilter } = action.payload;
        const dateFilter = filterContextDefinition.filters[existingFilterIndex];

        if (isDashboardDateFilter(dateFilter)) {
            dateFilter.dateFilter.type = type;
            dateFilter.dateFilter.granularity = granularity;
            dateFilter.dateFilter.from = from;
            dateFilter.dateFilter.to = to;

            if (localIdentifier) {
                dateFilter.dateFilter.localIdentifier = localIdentifier;
            }

            if (boundedFilter) {
                dateFilter.dateFilter.boundedFilter = boundedFilter;
            } else {
                delete dateFilter.dateFilter.boundedFilter;
            }
        }
    } else {
        const { type, granularity, from, to, dataSet, localIdentifier, boundedFilter } = action.payload;
        filterContextDefinition.filters.unshift({
            dateFilter: {
                granularity,
                type,
                from,
                to,
                ...(dataSet ? { dataSet } : {}),
                ...(localIdentifier ? { localIdentifier } : {}),
                ...(boundedFilter ? { boundedFilter } : {}),
            },
        });
    }
};

//
//
//

/**
 * @internal
 */
export interface IUpdateAttributeFilterSelectionPayload {
    readonly filterLocalId: string;
    readonly elements: IAttributeElements;
    readonly negativeSelection: boolean;
    readonly isWorkingSelectionChange?: boolean;
    readonly enableImmediateAttributeFilterDisplayAsLabelMigration?: boolean;
    readonly isResultOfMigration?: boolean;
    readonly isSelectionInvalid?: boolean;
    /**
     * Optional tab local identifier to target a specific tab.
     * If not provided, the active tab will be used.
     */
    readonly tabLocalIdentifier?: string;
}

const updateAttributeFilterSelection: FilterContextReducer<
    PayloadAction<IUpdateAttributeFilterSelectionPayload>
> = (state, action) => {
    const targetTab = getTabOrActive(state, action.payload.tabLocalIdentifier);
    if (!targetTab) {
        return;
    }
    if (!targetTab.filterContext) {
        targetTab.filterContext = { ...filterContextInitialState };
    }

    const {
        elements,
        filterLocalId,
        negativeSelection,
        isWorkingSelectionChange,
        enableImmediateAttributeFilterDisplayAsLabelMigration,
        isResultOfMigration,
        isSelectionInvalid,
    } = action.payload;
    const filterContextDefinition = isWorkingSelectionChange
        ? targetTab.filterContext.workingFilterContextDefinition
        : targetTab.filterContext.filterContextDefinition;
    invariant(filterContextDefinition?.filters, "Attempt to edit uninitialized filter context");

    const existingFilterIndex = filterContextDefinition.filters.findIndex(
        (item) => isDashboardAttributeFilter(item) && item.attributeFilter.localIdentifier === filterLocalId,
    );

    invariant(existingFilterIndex >= 0 || isWorkingSelectionChange, "Attempt to update non-existing filter");

    if (isWorkingSelectionChange && existingFilterIndex >= 0) {
        filterContextDefinition.filters[existingFilterIndex] = {
            attributeFilter: {
                localIdentifier: filterLocalId,
                attributeElements: elements,
                negativeSelection,
            },
        };
    } else if (isWorkingSelectionChange) {
        filterContextDefinition.filters.push({
            attributeFilter: {
                localIdentifier: filterLocalId,
                attributeElements: elements,
                negativeSelection,
            },
        });
    } else if (existingFilterIndex >= 0) {
        filterContextDefinition.filters[existingFilterIndex] = {
            attributeFilter: {
                ...(filterContextDefinition.filters[existingFilterIndex] as IDashboardAttributeFilter)
                    .attributeFilter,
                attributeElements: elements,
                negativeSelection,
            },
        };
    }

    // update original filters to not show "reset filters" button, that will revert filter to the wrong state
    if (enableImmediateAttributeFilterDisplayAsLabelMigration && isResultOfMigration) {
        const originalFilter = targetTab.filterContext.originalFilterContextDefinition?.filters.find(
            (item: FilterContextItem) =>
                isDashboardAttributeFilter(item) && item.attributeFilter.localIdentifier === filterLocalId,
        );
        if (isDashboardAttributeFilter(originalFilter)) {
            originalFilter.attributeFilter = {
                ...originalFilter.attributeFilter,
                attributeElements: elements,
                negativeSelection,
            };
        }
    }

    // Handle isSelectionInvalid flag to update filtersWithInvalidSelection array
    if (isSelectionInvalid) {
        // Add filterLocalId to the array if not already present
        if (!targetTab.filterContext.filtersWithInvalidSelection.includes(filterLocalId)) {
            targetTab.filterContext.filtersWithInvalidSelection.push(filterLocalId);
        }
    } else {
        // Remove filterLocalId from the array if present
        targetTab.filterContext.filtersWithInvalidSelection =
            targetTab.filterContext.filtersWithInvalidSelection.filter((id) => id !== filterLocalId);
    }
};

//
//
//

/**
 * @internal
 */
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
    const activeTab = getActiveTab(state);
    if (!activeTab) {
        return;
    }
    if (!activeTab.filterContext) {
        activeTab.filterContext = { ...filterContextInitialState };
    }

    invariant(
        activeTab.filterContext.filterContextDefinition,
        "Attempt to edit uninitialized filter context",
    );

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
    const isDateFilterPresent =
        activeTab.filterContext.filterContextDefinition.filters.findIndex(isDashboardDateFilter) >= 0;

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
            ...(selectionMode === undefined ? {} : { selectionMode }),
            title,
        },
    };

    if (index === -1) {
        activeTab.filterContext.filterContextDefinition.filters.push(filter);
    } else {
        activeTab.filterContext.filterContextDefinition.filters.splice(attributeFilterIndex, 0, filter);
    }
};

//
//
//

/**
 * @internal
 */
export interface IRemoveAttributeFilterPayload {
    readonly filterLocalId: string;
}

const removeAttributeFilter: FilterContextReducer<PayloadAction<IRemoveAttributeFilterPayload>> = (
    state,
    action,
) => {
    const activeTab = getActiveTab(state);
    if (!activeTab) {
        return;
    }
    if (!activeTab.filterContext) {
        activeTab.filterContext = { ...filterContextInitialState };
    }

    invariant(
        activeTab.filterContext.filterContextDefinition,
        "Attempt to edit uninitialized filter context",
    );

    const { filterLocalId } = action.payload;

    const newFilters = activeTab.filterContext.filterContextDefinition.filters.filter(
        (item) => isDashboardDateFilter(item) || item.attributeFilter.localIdentifier !== filterLocalId,
    );

    activeTab.filterContext.filterContextDefinition = {
        ...activeTab.filterContext.filterContextDefinition,
        filters: newFilters,
    };
};

//
//
//

/**
 * @internal
 */
export interface IMoveAttributeFilterPayload {
    readonly filterLocalId: string;
    readonly index: number;
}

const moveAttributeFilter: FilterContextReducer<PayloadAction<IMoveAttributeFilterPayload>> = (
    state,
    action,
) => {
    const activeTab = getActiveTab(state);
    if (!activeTab) {
        return;
    }
    if (!activeTab.filterContext) {
        activeTab.filterContext = { ...filterContextInitialState };
    }

    invariant(
        activeTab.filterContext.filterContextDefinition,
        "Attempt to edit uninitialized filter context",
    );

    const { filterLocalId, index } = action.payload;

    const currentFilterIndex = activeTab.filterContext.filterContextDefinition.filters.findIndex(
        (item) => isDashboardAttributeFilter(item) && item.attributeFilter.localIdentifier === filterLocalId,
    );

    invariant(currentFilterIndex >= 0, "Attempt to move non-existing filter");

    const filter = activeTab.filterContext.filterContextDefinition.filters[currentFilterIndex];

    activeTab.filterContext.filterContextDefinition.filters.splice(currentFilterIndex, 1);

    // Filters are indexed just for attribute filters, if DateFilter is present should be always first item
    const isDateFilterPresent =
        activeTab.filterContext.filterContextDefinition.filters.findIndex(isDashboardDateFilter) >= 0;

    if (index === -1) {
        activeTab.filterContext.filterContextDefinition.filters.push(filter);
    } else {
        // If DateFilter is present we have to move index by 1 because index of filter is calculated just for AttributeFilers array
        const attributeFilterIndex = isDateFilterPresent ? index + 1 : index;
        activeTab.filterContext.filterContextDefinition.filters.splice(attributeFilterIndex, 0, filter);
    }
};

//
//
//

/**
 * @internal
 */
export interface ISetAttributeFilterParentsPayload {
    readonly filterLocalId: string;
    readonly parentFilters: ReadonlyArray<IDashboardAttributeFilterParent>;
}

const setAttributeFilterParents: FilterContextReducer<PayloadAction<ISetAttributeFilterParentsPayload>> = (
    state,
    action,
) => {
    const activeTab = getActiveTab(state);
    if (!activeTab) {
        return;
    }
    if (!activeTab.filterContext) {
        activeTab.filterContext = { ...filterContextInitialState };
    }

    invariant(
        activeTab.filterContext.filterContextDefinition,
        "Attempt to edit uninitialized filter context",
    );

    const { filterLocalId, parentFilters } = action.payload;

    const currentFilterIndex = activeTab.filterContext.filterContextDefinition.filters.findIndex(
        (item) => isDashboardAttributeFilter(item) && item.attributeFilter.localIdentifier === filterLocalId,
    );

    invariant(currentFilterIndex >= 0, "Attempt to set parent of a non-existing filter");

    (
        activeTab.filterContext.filterContextDefinition.filters[
            currentFilterIndex
        ] as IDashboardAttributeFilter
    ).attributeFilter.filterElementsBy = [...parentFilters];
};

//
//
//

/**
 * @internal
 */
export interface ISetAttributeFilterDependentDateFiltersPayload {
    readonly filterLocalId: string;
    readonly dependentDateFilters: ReadonlyArray<IDashboardAttributeFilterByDate>;
}

const setAttributeFilterDependentDateFilters: FilterContextReducer<
    PayloadAction<ISetAttributeFilterDependentDateFiltersPayload>
> = (state, action) => {
    const activeTab = getActiveTab(state);
    if (!activeTab) {
        return;
    }
    if (!activeTab.filterContext) {
        activeTab.filterContext = { ...filterContextInitialState };
    }

    invariant(
        activeTab.filterContext.filterContextDefinition,
        "Attempt to edit uninitialized filter context",
    );

    const { filterLocalId, dependentDateFilters } = action.payload;

    const currentFilterIndex = activeTab.filterContext.filterContextDefinition.filters.findIndex(
        (item) => isDashboardAttributeFilter(item) && item.attributeFilter.localIdentifier === filterLocalId,
    );

    invariant(currentFilterIndex >= 0, "Attempt to set dependent date filter of a non-existing filter");

    (
        activeTab.filterContext.filterContextDefinition.filters[
            currentFilterIndex
        ] as IDashboardAttributeFilter
    ).attributeFilter.filterElementsByDate = [...dependentDateFilters];
};

//
//
//

/**
 * @internal
 */
export interface IClearAttributeFiltersSelectionPayload {
    readonly filterLocalIds: string[];
    /**
     * Optional tab local identifier to target a specific tab.
     * If not provided, the active tab will be used.
     */
    readonly tabLocalIdentifier?: string;
}

const clearAttributeFiltersSelection: FilterContextReducer<
    PayloadAction<IClearAttributeFiltersSelectionPayload>
> = (state, action) => {
    const targetTab = getTabOrActive(state, action.payload.tabLocalIdentifier);
    if (!targetTab) {
        return;
    }
    if (!targetTab.filterContext) {
        targetTab.filterContext = { ...filterContextInitialState };
    }

    const { filterLocalIds } = action.payload;

    filterLocalIds.forEach((filterLocalId) => {
        invariant(
            targetTab.filterContext?.filterContextDefinition,
            "Attempt to edit uninitialized filter context",
        );
        const currentFilterIndex = targetTab.filterContext.filterContextDefinition.filters.findIndex(
            (item) =>
                isDashboardAttributeFilter(item) && item.attributeFilter.localIdentifier === filterLocalId,
        );

        invariant(currentFilterIndex >= 0, "Attempt to clear selection of a non-existing filter");

        const currentFilter = targetTab.filterContext.filterContextDefinition.filters[
            currentFilterIndex
        ] as IDashboardAttributeFilter;

        currentFilter.attributeFilter.negativeSelection =
            currentFilter.attributeFilter.selectionMode !== "single";
        currentFilter.attributeFilter.attributeElements = isAttributeElementsByRef(
            currentFilter.attributeFilter.attributeElements,
        )
            ? { uris: [] }
            : { values: [] };
    });
};

/**
 * @internal
 */
export interface IChangeAttributeDisplayFormPayload {
    readonly filterLocalId: string;
    readonly displayForm: ObjRef;
    readonly isWorkingSelectionChange?: boolean;
    readonly enableImmediateAttributeFilterDisplayAsLabelMigration?: boolean;
    readonly isResultOfMigration?: boolean;
    /**
     * Optional tab local identifier to target a specific tab.
     * If not provided, the active tab will be used.
     */
    readonly tabLocalIdentifier?: string;
}

/**
 * Changes the display form for the filter given by its local identifier.
 */
const changeAttributeDisplayForm: FilterContextReducer<PayloadAction<IChangeAttributeDisplayFormPayload>> = (
    state,
    action,
) => {
    const targetTab = getTabOrActive(state, action.payload.tabLocalIdentifier);
    if (!targetTab) {
        return;
    }
    if (!targetTab.filterContext) {
        targetTab.filterContext = { ...filterContextInitialState };
    }

    const {
        filterLocalId,
        displayForm,
        isWorkingSelectionChange,
        enableImmediateAttributeFilterDisplayAsLabelMigration,
        isResultOfMigration,
    } = action.payload;
    const filterContextDefinition = isWorkingSelectionChange
        ? targetTab.filterContext.workingFilterContextDefinition
        : targetTab.filterContext.filterContextDefinition;
    invariant(filterContextDefinition?.filters, "Attempt to edit uninitialized filter context");

    const currentFilterIndex = filterContextDefinition.filters.findIndex(
        (item) => isDashboardAttributeFilter(item) && item.attributeFilter.localIdentifier === filterLocalId,
    );

    invariant(
        currentFilterIndex >= 0 || isWorkingSelectionChange,
        "Attempt to set parent of a non-existing filter",
    );

    if (isWorkingSelectionChange && currentFilterIndex < 0) {
        filterContextDefinition.filters.push({
            attributeFilter: {
                displayForm,
                attributeElements: isAttributeElementsByRef(displayForm) ? { uris: [] } : { values: [] },
                negativeSelection: false,
            },
        });
        return;
    }

    const currentFilter = filterContextDefinition.filters[currentFilterIndex] as IDashboardAttributeFilter;

    currentFilter.attributeFilter.displayForm = { ...displayForm };

    // update original filters to not show "reset filters" button, that will revert filter to wrong state
    if (enableImmediateAttributeFilterDisplayAsLabelMigration && isResultOfMigration) {
        const originalFilter = targetTab.filterContext.originalFilterContextDefinition?.filters.find(
            (item: FilterContextItem) =>
                isDashboardAttributeFilter(item) && item.attributeFilter.localIdentifier === filterLocalId,
        );
        if (isDashboardAttributeFilter(originalFilter)) {
            originalFilter.attributeFilter.displayForm = { ...displayForm };
        }
    }
};

/**
 * @internal
 */
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
    const activeTab = getActiveTab(state);
    if (!activeTab) {
        return;
    }
    if (!activeTab.filterContext) {
        activeTab.filterContext = { ...filterContextInitialState };
    }

    invariant(
        activeTab.filterContext.filterContextDefinition,
        "Attempt to edit uninitialized filter context",
    );

    const { filterLocalId, title } = action.payload;

    const findFilter = activeTab.filterContext.filterContextDefinition.filters.find(
        (item) => isDashboardAttributeFilter(item) && item.attributeFilter.localIdentifier === filterLocalId,
    );

    invariant(findFilter, "Attempt to change title of a non-existing filter");

    (findFilter as IDashboardAttributeFilter).attributeFilter.title = title;
};

/**
 * @internal
 */
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
    const activeTab = getActiveTab(state);
    if (!activeTab) {
        return;
    }
    if (!activeTab.filterContext) {
        activeTab.filterContext = { ...filterContextInitialState };
    }

    invariant(
        activeTab.filterContext.filterContextDefinition,
        "Attempt to edit uninitialized filter context",
    );

    const { filterLocalId, selectionMode } = action.payload;

    const findFilter = activeTab.filterContext.filterContextDefinition.filters.find(
        (item) => isDashboardAttributeFilter(item) && item.attributeFilter.localIdentifier === filterLocalId,
    );

    invariant(findFilter, "Attempt to change selection mode of a non-existing filter");

    (findFilter as IDashboardAttributeFilter).attributeFilter.selectionMode = selectionMode;
};

const addDateFilter: FilterContextReducer<PayloadAction<IAddDateFilterPayload>> = (state, action) => {
    const activeTab = getActiveTab(state);
    if (!activeTab) {
        return;
    }
    if (!activeTab.filterContext) {
        activeTab.filterContext = { ...filterContextInitialState };
    }

    invariant(
        activeTab.filterContext.filterContextDefinition,
        "Attempt to edit uninitialized filter context",
    );

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
        activeTab.filterContext.filterContextDefinition.filters.findIndex(isDashboardCommonDateFilter) >= 0;

    if (index === -1) {
        activeTab.filterContext.filterContextDefinition.filters.push(filter);
    } else {
        // If CommonDateFilter is present we have to move index by 1 because index of filter is calculated just for AttributeFilers array
        const newFilterIndex = isCommonDateFilterPresent ? index + 1 : index;
        activeTab.filterContext.filterContextDefinition.filters.splice(newFilterIndex, 0, filter);
    }
};

//
//
//

/**
 * @internal
 */
export interface IRemoveDateFilterPayload {
    readonly dataSet: ObjRef;
}

const removeDateFilter: FilterContextReducer<PayloadAction<IRemoveDateFilterPayload>> = (state, action) => {
    const activeTab = getActiveTab(state);
    if (!activeTab) {
        return;
    }
    if (!activeTab.filterContext) {
        activeTab.filterContext = { ...filterContextInitialState };
    }

    invariant(
        activeTab.filterContext.filterContextDefinition,
        "Attempt to edit uninitialized filter context",
    );

    const { dataSet } = action.payload;

    const newFilters = activeTab.filterContext.filterContextDefinition.filters.filter(
        (item) => isDashboardAttributeFilter(item) || !areObjRefsEqual(item.dateFilter.dataSet!, dataSet),
    );

    activeTab.filterContext.filterContextDefinition = {
        ...activeTab.filterContext.filterContextDefinition,
        filters: newFilters,
    };
};

//
//
//
/**
 * @internal
 */
export interface IMoveDateFilterPayload {
    readonly dataSet: ObjRef;
    readonly index: number;
}

const moveDateFilter: FilterContextReducer<PayloadAction<IMoveDateFilterPayload>> = (state, action) => {
    const activeTab = getActiveTab(state);
    if (!activeTab) {
        return;
    }
    if (!activeTab.filterContext) {
        activeTab.filterContext = { ...filterContextInitialState };
    }

    invariant(
        activeTab.filterContext.filterContextDefinition,
        "Attempt to edit uninitialized filter context",
    );

    const { dataSet, index } = action.payload;

    const currentFilterIndex = activeTab.filterContext.filterContextDefinition.filters.findIndex(
        (item) => isDashboardDateFilter(item) && areObjRefsEqual(item.dateFilter.dataSet!, dataSet),
    );

    invariant(currentFilterIndex >= 0, "Attempt to move non-existing filter");

    const filter = activeTab.filterContext.filterContextDefinition.filters[currentFilterIndex];

    activeTab.filterContext.filterContextDefinition.filters.splice(currentFilterIndex, 1);

    // Filters are indexed just for attribute filters, if DateFilter is present should be always first item
    const isCommonDateFilterPresent =
        activeTab.filterContext.filterContextDefinition.filters.findIndex(isDashboardCommonDateFilter) >= 0;

    if (index === -1) {
        activeTab.filterContext.filterContextDefinition.filters.push(filter);
    } else {
        // If DateFilter is present we have to move index by 1 because index of filter is calculated just for DraggableFilters array
        const dateFilterIndex = isCommonDateFilterPresent ? index + 1 : index;
        activeTab.filterContext.filterContextDefinition.filters.splice(dateFilterIndex, 0, filter);
    }
};

//
//
//

/**
 * @internal
 */
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
    const activeTab = getActiveTab(state);
    if (!activeTab) {
        return;
    }
    if (!activeTab.filterContext) {
        activeTab.filterContext = { ...filterContextInitialState };
    }

    invariant(
        activeTab.filterContext.filterContextDefinition,
        "Attempt to edit uninitialized filter context",
    );

    const { filterLocalId, limitingItems } = action.payload;

    const findFilter = activeTab.filterContext.filterContextDefinition.filters.find(
        (item) => isDashboardAttributeFilter(item) && item.attributeFilter.localIdentifier === filterLocalId,
    );

    invariant(findFilter, "Attempt to change limiting items of a non-existing filter");

    (findFilter as IDashboardAttributeFilter).attributeFilter.validateElementsBy = limitingItems;
};

//
//
//

/**
 * @internal
 */
export interface IApplyWorkingSelectionPayload {
    readonly enableImmediateAttributeFilterDisplayAsLabelMigration?: boolean;
}

const applyWorkingSelection: FilterContextReducer<PayloadAction<IApplyWorkingSelectionPayload>> = (
    state,
    action,
) => {
    const activeTab = getActiveTab(state);
    if (!activeTab) {
        return;
    }
    if (!activeTab.filterContext) {
        activeTab.filterContext = { ...filterContextInitialState };
    }

    invariant(
        activeTab.filterContext.filterContextDefinition,
        "Attempt to edit uninitialized filter context",
    );
    const { enableImmediateAttributeFilterDisplayAsLabelMigration } = action.payload;
    activeTab.filterContext.filterContextDefinition = applyFilterContext(
        activeTab.filterContext.filterContextDefinition,
        activeTab.filterContext.workingFilterContextDefinition,
        enableImmediateAttributeFilterDisplayAsLabelMigration,
    );
    activeTab.filterContext.workingFilterContextDefinition = { filters: [] };
};

//
//
//

const resetWorkingSelection: FilterContextReducer<PayloadAction> = (state) => {
    const activeTab = getActiveTab(state);
    if (!activeTab) {
        return;
    }
    if (!activeTab.filterContext) {
        activeTab.filterContext = { ...filterContextInitialState };
    }

    invariant(
        activeTab.filterContext.workingFilterContextDefinition,
        "Attempt to edit uninitialized working filter context",
    );
    activeTab.filterContext.workingFilterContextDefinition = { filters: [] };
};

//
//
//

const setDefaultFilterOverrides: FilterContextReducer<PayloadAction<FilterContextItem[]>> = (
    state,
    action,
) => {
    const activeTab = getActiveTab(state);
    if (!activeTab) {
        return;
    }
    if (!activeTab.filterContext) {
        activeTab.filterContext = { ...filterContextInitialState };
    }

    activeTab.filterContext.defaultFilterOverrides = action.payload;
};

//
//
//

export const filterContextReducers = {
    setFilterContext,
    updateFilterContextIdentity,
    updateFilterContextIdentityForTab,
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
    applyWorkingSelection,
    resetWorkingSelection,
    setDefaultFilterOverrides,
};
