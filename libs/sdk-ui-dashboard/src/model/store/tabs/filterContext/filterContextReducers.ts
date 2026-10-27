// (C) 2021-2026 GoodData Corporation

import { type Action, type CaseReducer, type PayloadAction } from "@reduxjs/toolkit";
import { invariant } from "ts-invariant";

import { type IAttributeWithReferences } from "@gooddata/sdk-backend-spi";
import {
    type DashboardAttributeFilterItem,
    type DashboardAttributeFilterSelectionMode,
    type DashboardTextAttributeFilter,
    type DateFilterGranularity,
    type DateFilterType,
    type DateString,
    type EmptyValues,
    type FilterContextItem,
    type IAttributeDisplayFormMetadataObject,
    type IAttributeElements,
    type IDashboardAttributeFilter,
    type IDashboardAttributeFilterByDate,
    type IDashboardAttributeFilterParent,
    type IDashboardDateFilter,
    type IDashboardMeasureValueFilter,
    type IDashboardObjectIdentity,
    type IFilterContextDefinition,
    type ILowerBoundedFilter,
    type IUpperBoundedFilter,
    type MeasureValueFilterCondition,
    type ObjRef,
    areObjRefsEqual,
    attributeElementsIsEmpty,
    dashboardAttributeFilterItemDisplayForm,
    dashboardAttributeFilterItemLocalIdentifier,
    dashboardFilterLocalIdentifier,
    isAttributeElementsByRef,
    isDashboardArbitraryAttributeFilter,
    isDashboardAttributeFilter,
    isDashboardAttributeFilterItem,
    isDashboardCommonDateFilter,
    isDashboardDateFilter,
    isDashboardDateFilterWithDimension,
    isDashboardMatchAttributeFilter,
    isDashboardMeasureValueFilter,
    isIdentifierRef,
    newAllTimeDashboardDateFilter,
} from "@gooddata/sdk-model";

import { isDisplayFormMetadataReferencedBy } from "../../../utils/attributeFilterMatching.js";
import {
    generateFilterLocalIdentifier,
    generateMeasureValueFilterLocalIdentifier,
} from "../../_infra/generators.js";
import { type ITabState, type ITabsState, getActiveTab, getTabOrActive } from "../tabsState.js";

import {
    type FilterContextState,
    type WorkingDashboardMeasureValueFilter,
    filterContextInitialState,
} from "./filterContextState.js";
import { applyFilterContext, initializeFilterContext } from "./filterContextUtils.js";
import { findOriginalFilter, preserveFilterDependencies } from "./filterSync.js";

type FilterContextReducer<A extends Action> = CaseReducer<ITabsState, A>;

interface IEditableFilterContext {
    readonly tab: ITabState;
    readonly filterContext: FilterContextState;
    readonly definition: IFilterContextDefinition;
}

/**
 * Filter context of the tab addressed by `tabLocalIdentifier`, or of the active tab when omitted.
 * Initializes an empty filter context on a tab that has none.
 */
function getTabFilterContext(
    state: ITabsState,
    tabLocalIdentifier: string | undefined,
): { readonly tab: ITabState; readonly filterContext: FilterContextState } | undefined {
    const tab = getTabOrActive(state, tabLocalIdentifier);
    if (!tab) {
        return undefined;
    }
    if (!tab.filterContext) {
        tab.filterContext = { ...filterContextInitialState };
    }
    return { tab, filterContext: tab.filterContext };
}

function getEditableFilterContext(
    state: ITabsState,
    tabLocalIdentifier: string | undefined,
): IEditableFilterContext | undefined {
    const target = getTabFilterContext(state, tabLocalIdentifier);
    if (!target) {
        return undefined;
    }
    const definition = target.filterContext.filterContextDefinition;
    invariant(definition, "Attempt to edit uninitialized filter context");
    return { ...target, definition };
}

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

/**
 * @internal
 */
export interface IRemoveAttributeFilterDisplayFormsPayload {
    readonly displayForm: ObjRef;
    /**
     * Optional tab local identifier to target a specific tab.
     * If not provided, the active tab will be used.
     */
    readonly tabLocalIdentifier?: string;
}

const removeAttributeFilterDisplayForms: FilterContextReducer<
    PayloadAction<IRemoveAttributeFilterDisplayFormsPayload>
> = (state, action) => {
    const { displayForm, tabLocalIdentifier } = action.payload;
    const target = getTabFilterContext(state, tabLocalIdentifier);
    if (!target) {
        return;
    }
    const { filterContext } = target;
    invariant(filterContext.attributeFilterDisplayForms, "attempting to work with uninitialized state");

    // A cross-filtering virtual filter shares its display form with the dashboard filter it duplicates.
    const usedDisplayForms = (filterContext.filterContextDefinition?.filters ?? [])
        .filter(isDashboardAttributeFilterItem)
        .map(dashboardAttributeFilterItemDisplayForm);
    filterContext.attributeFilterDisplayForms = filterContext.attributeFilterDisplayForms.filter(
        (df) =>
            !isDisplayFormMetadataReferencedBy(df, displayForm) ||
            usedDisplayForms.some((used) => isDisplayFormMetadataReferencedBy(df, used)),
    );
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

    const target = getTabFilterContext(state, tabLocalIdentifier);
    if (!target) {
        return;
    }
    const { filterContext } = target;
    invariant(filterContext.attributeFilterDisplayForms, "attempting to work with uninitialized state");

    // if there is already a display form with the same ref, replace it
    filterContext.attributeFilterDisplayForms = filterContext.attributeFilterDisplayForms.filter(
        (df) => !isDisplayFormMetadataReferencedBy(df, displayForm.ref),
    );
    filterContext.attributeFilterDisplayForms.push(displayForm);
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
    readonly emptyValueHandling?: EmptyValues;
    /**
     * Optional tab local identifier to target a specific tab.
     * If not provided, the active tab will be used.
     */
    readonly tabLocalIdentifier?: string;
    /**
     * When true, tabs this change is synced to restore their own saved initial date filter instead of this payload.
     */
    readonly restoreTargetOriginal?: boolean;
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
    readonly emptyValueHandling?: EmptyValues;
    /**
     * Optional tab local identifier to target a specific tab.
     * If not provided, the active tab will be used.
     */
    readonly tabLocalIdentifier?: string;
    /**
     * When true, tabs this change is synced to restore their own saved initial date filter instead of this payload.
     */
    readonly restoreTargetOriginal?: boolean;
}

/**
 * @internal
 */
export type IUpsertDateFilterPayload = IUpsertDateFilterAllTimePayload | IUpsertDateFilterNonAllTimePayload;

const upsertDateFilter: FilterContextReducer<PayloadAction<IUpsertDateFilterPayload>> = (state, action) => {
    const tab = getTabOrActive(state, action.payload.tabLocalIdentifier);
    if (!tab) {
        return;
    }
    upsertDateFilterOnTab(tab, action.payload);
};

function upsertDateFilterOnTab(targetTab: ITabState, payload: IUpsertDateFilterPayload): void {
    if (!targetTab.filterContext) {
        targetTab.filterContext = { ...filterContextInitialState };
    }

    const filterContextDefinition = payload.isWorkingSelectionChange
        ? targetTab.filterContext.workingFilterContextDefinition
        : targetTab.filterContext.filterContextDefinition;
    invariant(filterContextDefinition?.filters, "Attempt to edit uninitialized filter context");

    const dateDataSet = payload.dataSet;

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

    if (payload.isWorkingSelectionChange && payload.type === "allTime") {
        // we need to allways set working filter to distinguish between "not changed" and "all time" filter
        if (existingFilterIndex >= 0) {
            const dateFilter = filterContextDefinition.filters[existingFilterIndex];
            if (isDashboardDateFilter(dateFilter)) {
                filterContextDefinition.filters[existingFilterIndex] = newAllTimeDashboardDateFilter(
                    dateFilter.dateFilter.dataSet,
                    dateFilter.dateFilter.localIdentifier,
                    payload.emptyValueHandling,
                );
            }
        } else {
            filterContextDefinition.filters.unshift(
                newAllTimeDashboardDateFilter(
                    payload.dataSet,
                    payload.localIdentifier,
                    payload.emptyValueHandling,
                ),
            );
        }
    } else if (payload.type === "allTime") {
        if (existingFilterIndex >= 0) {
            if (dateDataSet) {
                const dateFilter = filterContextDefinition.filters[existingFilterIndex];

                if (isDashboardDateFilter(dateFilter)) {
                    filterContextDefinition.filters[existingFilterIndex] = newAllTimeDashboardDateFilter(
                        dateFilter.dateFilter.dataSet,
                        dateFilter.dateFilter.localIdentifier,
                        payload.emptyValueHandling,
                    );
                }
            } else {
                if (payload.emptyValueHandling) {
                    // Preserve all-time common DF when it carries additional config (e.g. emptyValueHandling).
                    filterContextDefinition.filters[existingFilterIndex] = newAllTimeDashboardDateFilter(
                        undefined,
                        payload.localIdentifier,
                        payload.emptyValueHandling,
                    );
                } else {
                    // if allTime common DF remove the date filter altogether
                    filterContextDefinition.filters.splice(existingFilterIndex, 1);
                }
            }
        } else if (!dateDataSet && payload.emptyValueHandling) {
            // No common date filter existed (all time was represented by absence); create it to preserve extra config.
            filterContextDefinition.filters.unshift(
                newAllTimeDashboardDateFilter(undefined, payload.localIdentifier, payload.emptyValueHandling),
            );
        }
    } else if (existingFilterIndex >= 0) {
        const { type, granularity, from, to, localIdentifier, boundedFilter, emptyValueHandling } = payload;
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

            if (emptyValueHandling) {
                dateFilter.dateFilter.emptyValueHandling = emptyValueHandling;
            } else {
                delete dateFilter.dateFilter.emptyValueHandling;
            }
        }
    } else {
        const { type, granularity, from, to, dataSet, localIdentifier, boundedFilter, emptyValueHandling } =
            payload;
        filterContextDefinition.filters.unshift({
            dateFilter: {
                granularity,
                type,
                from,
                to,
                ...(dataSet ? { dataSet } : {}),
                ...(localIdentifier ? { localIdentifier } : {}),
                ...(boundedFilter ? { boundedFilter } : {}),
                ...(emptyValueHandling ? { emptyValueHandling } : {}),
            },
        });
    }
}

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
    /**
     * When true, tabs this change is synced to restore their own saved initial selection instead of this payload.
     */
    readonly restoreTargetOriginal?: boolean;
}

const updateAttributeFilterSelection: FilterContextReducer<
    PayloadAction<IUpdateAttributeFilterSelectionPayload>
> = (state, action) => {
    const tab = getTabOrActive(state, action.payload.tabLocalIdentifier);
    if (!tab) {
        return;
    }
    updateAttributeFilterSelectionOnTab(tab, action.payload);
};

function updateAttributeFilterSelectionOnTab(
    targetTab: ITabState,
    payload: IUpdateAttributeFilterSelectionPayload,
): void {
    if (!targetTab.filterContext) {
        targetTab.filterContext = { ...filterContextInitialState };
    }

    const {
        filterLocalId,
        elements,
        negativeSelection,
        isWorkingSelectionChange,
        enableImmediateAttributeFilterDisplayAsLabelMigration,
        isResultOfMigration,
        isSelectionInvalid,
    } = payload;
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
        } as IDashboardAttributeFilter;
    } else if (isWorkingSelectionChange) {
        filterContextDefinition.filters.push({
            attributeFilter: {
                localIdentifier: filterLocalId,
                attributeElements: elements,
                negativeSelection,
            },
        } as IDashboardAttributeFilter);
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

    if (!targetTab.filterContext.filtersWithInvalidSelection) {
        targetTab.filterContext.filtersWithInvalidSelection = [];
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
}

function findAppliedFilterByLocalId(tab: ITabState, localIdentifier: string): FilterContextItem | undefined {
    return tab.filterContext?.filterContextDefinition?.filters.find(
        (item) => dashboardFilterLocalIdentifier(item) === localIdentifier,
    );
}

//
//
//

/**
 * Payload for replacing an attribute filter item (standard, arbitrary, or match) in the filter context.
 * @internal
 */
export interface IReplaceAttributeFilterItemPayload {
    readonly filterLocalId: string;
    readonly filter: DashboardAttributeFilterItem;
    readonly isWorkingSelectionChange?: boolean;
    readonly isSelectionInvalid?: boolean;
    /**
     * Optional tab local identifier to target a specific tab.
     * If not provided, the active tab will be used.
     */
    readonly tabLocalIdentifier?: string;
    /**
     * When true, tabs this change is synced to restore their own saved initial filter instead of this payload.
     */
    readonly restoreTargetOriginal?: boolean;
}

const replaceAttributeFilterItem: FilterContextReducer<PayloadAction<IReplaceAttributeFilterItemPayload>> = (
    state,
    action,
) => {
    const tab = getTabOrActive(state, action.payload.tabLocalIdentifier);
    if (!tab) {
        return;
    }
    replaceAttributeFilterItemOnTab(tab, action.payload);
};

function replaceAttributeFilterItemOnTab(
    targetTab: ITabState,
    payload: IReplaceAttributeFilterItemPayload,
): void {
    if (!targetTab.filterContext) {
        targetTab.filterContext = { ...filterContextInitialState };
    }

    const { filterLocalId, filter, isWorkingSelectionChange, isSelectionInvalid } = payload;

    const filterContextDefinition = isWorkingSelectionChange
        ? targetTab.filterContext.workingFilterContextDefinition
        : targetTab.filterContext.filterContextDefinition;
    invariant(filterContextDefinition?.filters, "Attempt to edit uninitialized filter context");

    const existingFilterIndex = filterContextDefinition.filters.findIndex(
        (item) =>
            isDashboardAttributeFilterItem(item) &&
            dashboardAttributeFilterItemLocalIdentifier(item) === filterLocalId,
    );

    // Preserve parent filter relationships from the existing filter when replacing.
    // The replacement filter typically only carries selection data, not dependency configuration.
    const replacementFilter =
        existingFilterIndex >= 0
            ? preserveFilterDependencies(
                  filterContextDefinition.filters[existingFilterIndex] as DashboardAttributeFilterItem,
                  filter,
              )
            : filter;

    // Type assertion: filterContextDefinition.filters is either FilterContextItem[] or
    // WorkingFilterContextItem[] depending on isWorkingSelectionChange. We cast to FilterContextItem[]
    // since DashboardAttributeFilterItem is a subtype of FilterContextItem.
    const filters = filterContextDefinition.filters as FilterContextItem[];
    if (isWorkingSelectionChange && existingFilterIndex >= 0) {
        filters[existingFilterIndex] = replacementFilter;
    } else if (isWorkingSelectionChange) {
        filters.push(replacementFilter);
    } else if (existingFilterIndex >= 0) {
        filters[existingFilterIndex] = replacementFilter;
    }

    if (!targetTab.filterContext.filtersWithInvalidSelection) {
        targetTab.filterContext.filtersWithInvalidSelection = [];
    }
    // Handle isSelectionInvalid flag to update filtersWithInvalidSelection array
    if (isSelectionInvalid) {
        if (!targetTab.filterContext.filtersWithInvalidSelection.includes(filterLocalId)) {
            targetTab.filterContext.filtersWithInvalidSelection.push(filterLocalId);
        }
    } else {
        targetTab.filterContext.filtersWithInvalidSelection =
            targetTab.filterContext.filtersWithInvalidSelection.filter((id) => id !== filterLocalId);
    }
}

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
    /**
     * Optional tab local identifier to target a specific tab.
     * If not provided, the active tab will be used.
     */
    readonly tabLocalIdentifier?: string;
}

const addAttributeFilter: FilterContextReducer<PayloadAction<IAddAttributeFilterPayload>> = (
    state,
    action,
) => {
    const target = getEditableFilterContext(state, action.payload.tabLocalIdentifier);
    if (!target) {
        return;
    }

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
    const { definition } = target;

    // Filters are indexed just for attribute filters, if DateFilter is present should be always first item
    const isDateFilterPresent = definition.filters.findIndex(isDashboardDateFilter) >= 0;
    const hasSelection = initialSelection && !attributeElementsIsEmpty(initialSelection);
    const isNegative = selectionMode !== "single" && (initialIsNegativeSelection || !hasSelection);
    // If DateFilter is present we have to move index by 1 because index of filter is calculated just for AttributeFilers array
    const attributeFilterIndex = isDateFilterPresent ? index + 1 : index;

    const filter: IDashboardAttributeFilter = {
        attributeFilter: {
            attributeElements: initialSelection ?? { uris: [] },
            displayForm,
            negativeSelection: isNegative,
            localIdentifier: resolveAttributeFilterLocalIdentifier(
                definition,
                displayForm,
                attributeFilterIndex,
                localIdentifier,
            ),
            filterElementsBy: parentFilters ? [...parentFilters] : undefined,
            ...(selectionMode === undefined ? {} : { selectionMode }),
            title,
        },
    };

    if (index === -1) {
        definition.filters.push(filter);
    } else {
        definition.filters.splice(attributeFilterIndex, 0, filter);
    }
};

//
//
//

/**
 * @internal
 */
export interface IAddTextAttributeFilterReducerPayload {
    readonly filter: DashboardTextAttributeFilter;
    readonly index: number;
    /**
     * Optional tab local identifier to target a specific tab.
     * If not provided, the active tab will be used.
     */
    readonly tabLocalIdentifier?: string;
}

const addTextAttributeFilter: FilterContextReducer<PayloadAction<IAddTextAttributeFilterReducerPayload>> = (
    state,
    action,
) => {
    const target = getEditableFilterContext(state, action.payload.tabLocalIdentifier);
    if (!target) {
        return;
    }

    const { filter, index } = action.payload;
    const { definition } = target;

    // Filters are indexed just for attribute filters, if DateFilter is present should be always first item
    const isDateFilterPresent = definition.filters.findIndex(isDashboardDateFilter) >= 0;
    const attributeFilterIndex = isDateFilterPresent ? index + 1 : index;
    const filterWithLocalIdentifier = withAttributeFilterLocalIdentifier(
        filter,
        resolveAttributeFilterLocalIdentifier(
            definition,
            dashboardAttributeFilterItemDisplayForm(filter),
            attributeFilterIndex,
            dashboardAttributeFilterItemLocalIdentifier(filter),
        ),
    );
    if (!filterWithLocalIdentifier) {
        return;
    }

    if (index === -1) {
        definition.filters.push(filterWithLocalIdentifier);
    } else {
        definition.filters.splice(attributeFilterIndex, 0, filterWithLocalIdentifier);
    }
};

function withAttributeFilterLocalIdentifier(
    filter: DashboardTextAttributeFilter,
    localIdentifier: string,
): DashboardTextAttributeFilter | undefined {
    if (isDashboardArbitraryAttributeFilter(filter)) {
        return {
            arbitraryAttributeFilter: {
                ...filter.arbitraryAttributeFilter,
                localIdentifier,
            },
        };
    }
    if (isDashboardMatchAttributeFilter(filter)) {
        return {
            matchAttributeFilter: {
                ...filter.matchAttributeFilter,
                localIdentifier,
            },
        };
    }
    return undefined;
}

/**
 * Keeps `preferred` unless another filter on the tab already uses it, otherwise generates
 * the first free identifier. A filter mirrored from another tab can collide with a local one.
 */
function resolveAttributeFilterLocalIdentifier(
    definition: IFilterContextDefinition,
    displayForm: ObjRef,
    index: number,
    preferred?: string,
): string {
    return resolveFilterLocalIdentifier(
        definition,
        (candidateIndex) => generateFilterLocalIdentifier(displayForm, candidateIndex),
        index,
        preferred,
    );
}

function resolveFilterLocalIdentifier(
    definition: IFilterContextDefinition,
    generate: (index: number) => string,
    index: number,
    preferred?: string,
): string {
    const used = new Set<string>();
    for (const item of definition.filters) {
        const localIdentifier = dashboardFilterLocalIdentifier(item);
        if (localIdentifier) {
            used.add(localIdentifier);
        }
    }
    if (preferred && !used.has(preferred)) {
        return preferred;
    }
    let candidateIndex = Math.max(0, index);
    let localIdentifier = generate(candidateIndex);
    while (used.has(localIdentifier)) {
        candidateIndex += 1;
        localIdentifier = generate(candidateIndex);
    }
    return localIdentifier;
}

//
//
//

/**
 * @internal
 */
export interface IRemoveAttributeFilterPayload {
    readonly filterLocalId: string;
    /**
     * Optional tab local identifier to target a specific tab.
     * If not provided, the active tab will be used.
     */
    readonly tabLocalIdentifier?: string;
}

const removeAttributeFilter: FilterContextReducer<PayloadAction<IRemoveAttributeFilterPayload>> = (
    state,
    action,
) => {
    const target = getEditableFilterContext(state, action.payload.tabLocalIdentifier);
    if (!target) {
        return;
    }

    const { filterLocalId } = action.payload;
    const { filterContext, definition } = target;

    filterContext.filterContextDefinition = {
        ...definition,
        filters: definition.filters.filter(
            (item) =>
                isDashboardDateFilter(item) ||
                !isDashboardAttributeFilterItem(item) ||
                dashboardAttributeFilterItemLocalIdentifier(item) !== filterLocalId,
        ),
    };
    removeAttributeFilterParentReferences(filterContext.filterContextDefinition, filterLocalId);
};

/**
 * Drops parent references to a removed filter, including children that exist only on this tab.
 */
function removeAttributeFilterParentReferences(
    definition: IFilterContextDefinition,
    removedLocalId: string,
): void {
    for (const item of definition.filters) {
        if (isDashboardAttributeFilter(item) && item.attributeFilter.filterElementsBy) {
            const remaining = item.attributeFilter.filterElementsBy.filter(
                (parent) => parent.filterLocalIdentifier !== removedLocalId,
            );
            if (remaining.length !== item.attributeFilter.filterElementsBy.length) {
                item.attributeFilter.filterElementsBy = remaining;
            }
        } else if (
            isDashboardArbitraryAttributeFilter(item) &&
            item.arbitraryAttributeFilter.filterElementsBy
        ) {
            const remaining = item.arbitraryAttributeFilter.filterElementsBy.filter(
                (parent) => parent.filterLocalIdentifier !== removedLocalId,
            );
            if (remaining.length !== item.arbitraryAttributeFilter.filterElementsBy.length) {
                item.arbitraryAttributeFilter.filterElementsBy = remaining;
            }
        }
    }
}

//
//
//

/**
 * @internal
 */
export interface IMoveAttributeFilterPayload {
    readonly filterLocalId: string;
    readonly index: number;
    /**
     * Optional tab local identifier to target a specific tab.
     * If not provided, the active tab will be used.
     */
    readonly tabLocalIdentifier?: string;
}

const moveAttributeFilter: FilterContextReducer<PayloadAction<IMoveAttributeFilterPayload>> = (
    state,
    action,
) => {
    const target = getEditableFilterContext(state, action.payload.tabLocalIdentifier);
    if (!target) {
        return;
    }

    const { filterLocalId, index } = action.payload;
    const filters = target.definition.filters;
    const currentFilterIndex = filters.findIndex(
        (item) =>
            isDashboardAttributeFilterItem(item) &&
            dashboardAttributeFilterItemLocalIdentifier(item) === filterLocalId,
    );
    invariant(currentFilterIndex >= 0, "Attempt to move non-existing filter");

    const filter = filters[currentFilterIndex];
    filters.splice(currentFilterIndex, 1);

    // Filters are indexed just for attribute filters, if DateFilter is present should be always first item
    const isDateFilterPresent = filters.findIndex(isDashboardDateFilter) >= 0;
    if (index === -1) {
        filters.push(filter);
    } else {
        // If DateFilter is present we have to move index by 1 because index of filter is calculated just for AttributeFilers array
        const attributeFilterIndex = isDateFilterPresent ? index + 1 : index;
        filters.splice(attributeFilterIndex, 0, filter);
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
    /**
     * Optional tab local identifier to target a specific tab.
     * If not provided, the active tab will be used.
     */
    readonly tabLocalIdentifier?: string;
}

const setAttributeFilterParents: FilterContextReducer<PayloadAction<ISetAttributeFilterParentsPayload>> = (
    state,
    action,
) => {
    const target = getEditableFilterContext(state, action.payload.tabLocalIdentifier);
    if (!target) {
        return;
    }

    const { filterLocalId, parentFilters } = action.payload;
    const filter = findAttributeFilterItem(target.definition, filterLocalId);
    invariant(filter, "Attempt to set parent of a non-existing filter");

    // silently ignore when targeting match filter, will have no effect
    if (isDashboardAttributeFilter(filter)) {
        filter.attributeFilter.filterElementsBy = [...parentFilters];
    } else if (isDashboardArbitraryAttributeFilter(filter)) {
        filter.arbitraryAttributeFilter.filterElementsBy = [...parentFilters];
    }
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
    /**
     * Optional tab local identifier to target a specific tab.
     * If not provided, the active tab will be used.
     */
    readonly tabLocalIdentifier?: string;
}

const setAttributeFilterDependentDateFilters: FilterContextReducer<
    PayloadAction<ISetAttributeFilterDependentDateFiltersPayload>
> = (state, action) => {
    const target = getEditableFilterContext(state, action.payload.tabLocalIdentifier);
    if (!target) {
        return;
    }

    const { filterLocalId, dependentDateFilters } = action.payload;
    const filter = findAttributeFilterItem(target.definition, filterLocalId);
    invariant(filter, "Attempt to set dependent date filter of a non-existing filter");

    if (isDashboardAttributeFilter(filter)) {
        filter.attributeFilter.filterElementsByDate = [...dependentDateFilters];
    } else if (isDashboardArbitraryAttributeFilter(filter)) {
        filter.arbitraryAttributeFilter.filterElementsByDate = [...dependentDateFilters];
    }
    // Match filters do not support filterElementsByDate
};

function findAttributeFilterItem(
    definition: IFilterContextDefinition,
    localIdentifier: string,
): DashboardAttributeFilterItem | undefined {
    return definition.filters.find(
        (item): item is DashboardAttributeFilterItem =>
            isDashboardAttributeFilterItem(item) &&
            dashboardAttributeFilterItemLocalIdentifier(item) === localIdentifier,
    );
}

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
    /**
     * When true, tabs this change is synced to restore their own saved initial selection instead of clearing to All.
     */
    readonly restoreTargetOriginal?: boolean;
    /**
     * When true, each filter is set to the saved initial selection of this tab instead of All.
     * A filter without a saved initial selection is left unchanged.
     */
    readonly restoreOriginal?: boolean;
}

const clearAttributeFiltersSelection: FilterContextReducer<
    PayloadAction<IClearAttributeFiltersSelectionPayload>
> = (state, action) => {
    const { tabLocalIdentifier, filterLocalIds, restoreOriginal } = action.payload;
    const tab = getTabOrActive(state, tabLocalIdentifier);
    if (!tab) {
        return;
    }
    if (!tab.filterContext) {
        tab.filterContext = { ...filterContextInitialState };
    }

    for (const filterLocalId of filterLocalIds) {
        if (restoreOriginal) {
            restoreAttributeFilterSelectionOnTab(tab, filterLocalId);
        } else {
            clearAttributeFilterSelectionOnTab(tab, filterLocalId);
        }
    }
};

function restoreAttributeFilterSelectionOnTab(tab: ITabState, filterLocalId: string): void {
    const filter = findAppliedFilterByLocalId(tab, filterLocalId);
    const original = filter ? findOriginalFilter(tab, filter) : undefined;
    if (!isDashboardAttributeFilter(original)) {
        return;
    }
    updateAttributeFilterSelectionOnTab(tab, {
        filterLocalId,
        elements: original.attributeFilter.attributeElements,
        negativeSelection: original.attributeFilter.negativeSelection,
    });
}

function clearAttributeFilterSelectionOnTab(tab: ITabState, filterLocalId: string): void {
    invariant(tab.filterContext?.filterContextDefinition, "Attempt to edit uninitialized filter context");
    const currentFilterIndex = tab.filterContext.filterContextDefinition.filters.findIndex(
        (item) => isDashboardAttributeFilter(item) && item.attributeFilter.localIdentifier === filterLocalId,
    );
    invariant(currentFilterIndex >= 0, "Attempt to clear selection of a non-existing filter");

    const currentFilter = tab.filterContext.filterContextDefinition.filters[
        currentFilterIndex
    ] as IDashboardAttributeFilter;

    currentFilter.attributeFilter.negativeSelection =
        currentFilter.attributeFilter.selectionMode !== "single";
    currentFilter.attributeFilter.attributeElements = isAttributeElementsByRef(
        currentFilter.attributeFilter.attributeElements,
    )
        ? { uris: [] }
        : { values: [] };
}

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
    /**
     * When true, tabs this change is synced to restore their own saved display form instead of this payload.
     */
    readonly restoreTargetOriginal?: boolean;
}

/**
 * Changes the display form for the filter given by its local identifier.
 */
const changeAttributeDisplayForm: FilterContextReducer<PayloadAction<IChangeAttributeDisplayFormPayload>> = (
    state,
    action,
) => {
    const target = getTabFilterContext(state, action.payload.tabLocalIdentifier);
    if (!target) {
        return;
    }

    const {
        filterLocalId,
        displayForm,
        isWorkingSelectionChange,
        enableImmediateAttributeFilterDisplayAsLabelMigration,
        isResultOfMigration,
    } = action.payload;
    const { filterContext } = target;
    const filterContextDefinition = isWorkingSelectionChange
        ? filterContext.workingFilterContextDefinition
        : filterContext.filterContextDefinition;
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
        const originalFilter = filterContext.originalFilterContextDefinition?.filters.find(
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
export interface IChangeTextFilterDisplayFormPayload {
    readonly filterLocalId: string;
    readonly displayForm: ObjRef;
    readonly tabLocalIdentifier?: string;
}

/**
 * Updates the displayForm on a text filter (arbitrary or match) definition.
 * This is needed when displayAsLabel changes on a text filter, because the label
 * must be written to the filter's own definition, not only to the filter config.
 */
const changeTextFilterDisplayForm: FilterContextReducer<
    PayloadAction<IChangeTextFilterDisplayFormPayload>
> = (state, action) => {
    const targetTab = getTabOrActive(state, action.payload.tabLocalIdentifier);
    const filterContextDefinition = targetTab?.filterContext?.filterContextDefinition;
    if (!filterContextDefinition?.filters) {
        return;
    }

    const { filterLocalId, displayForm } = action.payload;
    const filter = findAttributeFilterItem(filterContextDefinition, filterLocalId);
    if (isDashboardArbitraryAttributeFilter(filter)) {
        filter.arbitraryAttributeFilter.displayForm = { ...displayForm };
    } else if (isDashboardMatchAttributeFilter(filter)) {
        filter.matchAttributeFilter.displayForm = { ...displayForm };
    }
};

/**
 * @internal
 */
export interface IChangeAttributeTitlePayload {
    readonly filterLocalId: string;
    readonly title?: string;
    /**
     * Optional tab local identifier to target a specific tab.
     * If not provided, the active tab will be used.
     */
    readonly tabLocalIdentifier?: string;
}

/**
 * Changes the title for the filter given by its local identifier.
 */
const changeAttributeTitle: FilterContextReducer<PayloadAction<IChangeAttributeTitlePayload>> = (
    state,
    action,
) => {
    const target = getEditableFilterContext(state, action.payload.tabLocalIdentifier);
    if (!target) {
        return;
    }

    const { filterLocalId, title } = action.payload;
    const findFilter = findAttributeFilterItem(target.definition, filterLocalId);
    invariant(findFilter, "Attempt to change title of a non-existing filter");

    if (isDashboardAttributeFilter(findFilter)) {
        findFilter.attributeFilter.title = title;
    } else if (isDashboardArbitraryAttributeFilter(findFilter)) {
        findFilter.arbitraryAttributeFilter.title = title;
    } else if (isDashboardMatchAttributeFilter(findFilter)) {
        findFilter.matchAttributeFilter.title = title;
    }
};

/**
 * @internal
 */
export interface IChangeAttributeSelectionModePayload {
    readonly filterLocalId: string;
    readonly selectionMode: DashboardAttributeFilterSelectionMode;
    /**
     * Optional tab local identifier to target a specific tab.
     * If not provided, the active tab will be used.
     */
    readonly tabLocalIdentifier?: string;
}

/**
 * Changes the selection mode for the filter given by its local identifier.
 */
const changeSelectionMode: FilterContextReducer<PayloadAction<IChangeAttributeSelectionModePayload>> = (
    state,
    action,
) => {
    const target = getEditableFilterContext(state, action.payload.tabLocalIdentifier);
    if (!target) {
        return;
    }

    const { filterLocalId, selectionMode } = action.payload;
    const findFilter = findAttributeFilterItem(target.definition, filterLocalId);
    invariant(findFilter, "Attempt to change selection mode of a non-existing filter");

    // Text filters (arbitrary, match) do not have selectionMode; no-op for them
    if (isDashboardAttributeFilter(findFilter)) {
        findFilter.attributeFilter.selectionMode = selectionMode;
    }
};

/**
 * @internal
 */
export interface IAddDateFilterReducerPayload {
    readonly index: number;
    readonly dateDataset: ObjRef;
    /**
     * Optional tab local identifier to target a specific tab.
     * If not provided, the active tab will be used.
     */
    readonly tabLocalIdentifier?: string;
}

const addDateFilter: FilterContextReducer<PayloadAction<IAddDateFilterReducerPayload>> = (state, action) => {
    const target = getEditableFilterContext(state, action.payload.tabLocalIdentifier);
    if (!target) {
        return;
    }

    const { index, dateDataset } = action.payload;
    const { definition } = target;
    const filter: IDashboardDateFilter = {
        dateFilter: {
            dataSet: dateDataset,
            type: "relative",
            granularity: "GDC.time.date",
        },
    };

    // Only draggable filters are indexed, if DateFilter is present should be always first item
    const isCommonDateFilterPresent = definition.filters.findIndex(isDashboardCommonDateFilter) >= 0;

    if (index === -1) {
        definition.filters.push(filter);
    } else {
        // If CommonDateFilter is present we have to move index by 1 because index of filter is calculated just for AttributeFilers array
        const newFilterIndex = isCommonDateFilterPresent ? index + 1 : index;
        definition.filters.splice(newFilterIndex, 0, filter);
    }
};

//
//
//

/**
 * @internal
 */
export interface IAddMeasureValueFilterReducerPayload {
    readonly index: number;
    readonly measure: ObjRef;
    readonly localIdentifier?: string;
    readonly title?: string;
    /**
     * Optional tab local identifier to target a specific tab.
     * If not provided, the active tab will be used.
     */
    readonly tabLocalIdentifier?: string;
}

const addMeasureValueFilter: FilterContextReducer<PayloadAction<IAddMeasureValueFilterReducerPayload>> = (
    state,
    action,
) => {
    const target = getEditableFilterContext(state, action.payload.tabLocalIdentifier);
    if (!target) {
        return;
    }

    const { index, measure, localIdentifier, title } = action.payload;
    const { definition } = target;
    const filter: IDashboardMeasureValueFilter = {
        dashboardMeasureValueFilter: {
            measure,
            localIdentifier: resolveFilterLocalIdentifier(
                definition,
                (candidateIndex) => generateMeasureValueFilterLocalIdentifier(measure, candidateIndex),
                index,
                localIdentifier,
            ),
            title,
        },
    };

    const isCommonDateFilterPresent = definition.filters.findIndex(isDashboardCommonDateFilter) >= 0;

    if (index === -1) {
        definition.filters.push(filter);
    } else {
        const newFilterIndex = isCommonDateFilterPresent ? index + 1 : index;
        definition.filters.splice(newFilterIndex, 0, filter);
    }
};

/**
 * @internal
 */
export interface IRemoveMeasureValueFilterReducerPayload {
    readonly localIdentifier: string;
    /**
     * Optional tab local identifier to target a specific tab.
     * If not provided, the active tab will be used.
     */
    readonly tabLocalIdentifier?: string;
}

const removeMeasureValueFilter: FilterContextReducer<
    PayloadAction<IRemoveMeasureValueFilterReducerPayload>
> = (state, action) => {
    const target = getEditableFilterContext(state, action.payload.tabLocalIdentifier);
    if (!target) {
        return;
    }

    const { localIdentifier } = action.payload;
    target.filterContext.filterContextDefinition = {
        ...target.definition,
        filters: target.definition.filters.filter(
            (item) =>
                !(
                    isDashboardMeasureValueFilter(item) &&
                    dashboardFilterLocalIdentifier(item) === localIdentifier
                ),
        ),
    };
};

/**
 * @internal
 */
export interface IMoveMeasureValueFilterPayload {
    readonly localIdentifier: string;
    readonly index: number;
    /**
     * Optional tab local identifier to target a specific tab.
     * If not provided, the active tab will be used.
     */
    readonly tabLocalIdentifier?: string;
}

const moveMeasureValueFilter: FilterContextReducer<PayloadAction<IMoveMeasureValueFilterPayload>> = (
    state,
    action,
) => {
    const target = getEditableFilterContext(state, action.payload.tabLocalIdentifier);
    if (!target) {
        return;
    }

    const { localIdentifier, index } = action.payload;
    const filters = target.definition.filters;
    const currentFilterIndex = filters.findIndex(
        (item) =>
            isDashboardMeasureValueFilter(item) && dashboardFilterLocalIdentifier(item) === localIdentifier,
    );

    invariant(currentFilterIndex >= 0, "Attempt to move non-existing measure value filter");

    const filter = filters[currentFilterIndex];
    filters.splice(currentFilterIndex, 1);

    const isCommonDateFilterPresent = filters.findIndex(isDashboardCommonDateFilter) >= 0;

    if (index === -1) {
        filters.push(filter);
    } else {
        const newFilterIndex = isCommonDateFilterPresent ? index + 1 : index;
        filters.splice(newFilterIndex, 0, filter);
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
    /**
     * Optional tab local identifier to target a specific tab.
     * If not provided, the active tab will be used.
     */
    readonly tabLocalIdentifier?: string;
}

const removeDateFilter: FilterContextReducer<PayloadAction<IRemoveDateFilterPayload>> = (state, action) => {
    const target = getEditableFilterContext(state, action.payload.tabLocalIdentifier);
    if (!target) {
        return;
    }

    const { dataSet } = action.payload;
    const { filterContext, definition } = target;
    const removed = definition.filters.find(
        (item) =>
            isDashboardDateFilterWithDimension(item) && areObjRefsEqual(item.dateFilter.dataSet, dataSet),
    );
    const removedLocalIdentifier = isDashboardDateFilter(removed)
        ? removed.dateFilter.localIdentifier
        : undefined;

    filterContext.filterContextDefinition = {
        ...definition,
        filters: definition.filters.filter(
            (item) => !isDashboardDateFilter(item) || !areObjRefsEqual(item.dateFilter.dataSet!, dataSet),
        ),
    };
    removeDimensionDateFilterDependencies(
        filterContext.filterContextDefinition,
        dataSet,
        removedLocalIdentifier,
    );
};

/**
 * Drops attribute-filter dependencies that point at the removed dimension date filter, including
 * filters that exist only on this tab. Matches both the filter local identifier and the legacy
 * dataset-identifier form.
 */
function removeDimensionDateFilterDependencies(
    definition: IFilterContextDefinition,
    dataSet: ObjRef,
    removedLocalIdentifier: string | undefined,
): void {
    const datasetIdentifier = isIdentifierRef(dataSet) ? dataSet.identifier : undefined;
    for (const item of definition.filters) {
        if (isDashboardAttributeFilter(item)) {
            const next = withoutRemovedDateDependency(
                item.attributeFilter.filterElementsByDate,
                removedLocalIdentifier,
                datasetIdentifier,
            );
            if (next !== item.attributeFilter.filterElementsByDate) {
                item.attributeFilter.filterElementsByDate = next;
            }
        } else if (isDashboardArbitraryAttributeFilter(item)) {
            const next = withoutRemovedDateDependency(
                item.arbitraryAttributeFilter.filterElementsByDate,
                removedLocalIdentifier,
                datasetIdentifier,
            );
            if (next !== item.arbitraryAttributeFilter.filterElementsByDate) {
                item.arbitraryAttributeFilter.filterElementsByDate = next;
            }
        }
    }
}

function withoutRemovedDateDependency(
    dependencies: IDashboardAttributeFilterByDate[] | undefined,
    removedLocalIdentifier: string | undefined,
    datasetIdentifier: string | undefined,
): IDashboardAttributeFilterByDate[] | undefined {
    if (!dependencies?.length) {
        return dependencies;
    }
    const remaining = dependencies.filter((dependency) => {
        if (dependency.isCommonDate) {
            return true;
        }
        const matchesLocalIdentifier =
            removedLocalIdentifier !== undefined &&
            dependency.filterLocalIdentifier === removedLocalIdentifier;
        const matchesDatasetIdentifier =
            datasetIdentifier !== undefined && dependency.filterLocalIdentifier === datasetIdentifier;
        return !matchesLocalIdentifier && !matchesDatasetIdentifier;
    });
    return remaining.length === dependencies.length ? dependencies : remaining;
}

//
//
//
/**
 * @internal
 */
export interface IMoveDateFilterPayload {
    readonly dataSet: ObjRef;
    readonly index: number;
    /**
     * Optional tab local identifier to target a specific tab.
     * If not provided, the active tab will be used.
     */
    readonly tabLocalIdentifier?: string;
}

const moveDateFilter: FilterContextReducer<PayloadAction<IMoveDateFilterPayload>> = (state, action) => {
    const target = getEditableFilterContext(state, action.payload.tabLocalIdentifier);
    if (!target) {
        return;
    }

    const { dataSet, index } = action.payload;
    const filters = target.definition.filters;
    const currentFilterIndex = filters.findIndex(
        (item) => isDashboardDateFilter(item) && areObjRefsEqual(item.dateFilter.dataSet!, dataSet),
    );
    invariant(currentFilterIndex >= 0, "Attempt to move non-existing filter");

    const filter = filters[currentFilterIndex];
    filters.splice(currentFilterIndex, 1);

    // Filters are indexed just for attribute filters, if DateFilter is present should be always first item
    const isCommonDateFilterPresent = filters.findIndex(isDashboardCommonDateFilter) >= 0;

    if (index === -1) {
        filters.push(filter);
    } else {
        // If DateFilter is present we have to move index by 1 because index of filter is calculated just for DraggableFilters array
        const dateFilterIndex = isCommonDateFilterPresent ? index + 1 : index;
        filters.splice(dateFilterIndex, 0, filter);
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
    /**
     * Optional tab local identifier to target a specific tab.
     * If not provided, the active tab will be used.
     */
    readonly tabLocalIdentifier?: string;
}

/**
 * Changes the element limiting items for the filter given by its local identifier.
 */
const changeLimitingItems: FilterContextReducer<PayloadAction<IChangeAttributeLimitingItemsPayload>> = (
    state,
    action,
) => {
    const target = getEditableFilterContext(state, action.payload.tabLocalIdentifier);
    if (!target) {
        return;
    }

    const { filterLocalId, limitingItems } = action.payload;
    const findFilter = findAttributeFilterItem(target.definition, filterLocalId);
    invariant(findFilter, "Attempt to change limiting items of a non-existing filter");

    if (isDashboardAttributeFilter(findFilter)) {
        findFilter.attributeFilter.validateElementsBy = limitingItems;
    } else if (isDashboardArbitraryAttributeFilter(findFilter)) {
        findFilter.arbitraryAttributeFilter.validateElementsBy = limitingItems;
    }
    // Match filters do not support validateElementsBy
};

//
//
//

/**
 * Folds the tab's staged filters into the applied filter context and clears the staging overlay.
 * No-op when the tab has no initialized filter context, so parameter-only staging can commit.
 *
 * @internal
 */
export function commitFilterContextWorkingValues(
    tab: ITabState,
    enableImmediateAttributeFilterDisplayAsLabelMigration?: boolean,
): void {
    if (!tab.filterContext?.filterContextDefinition) {
        return;
    }

    tab.filterContext.filterContextDefinition = applyFilterContext(
        tab.filterContext.filterContextDefinition,
        tab.filterContext.workingFilterContextDefinition,
        enableImmediateAttributeFilterDisplayAsLabelMigration,
    );
    tab.filterContext.workingFilterContextDefinition = { filters: [] };
}

/**
 * Drops the tab's staged filters without applying them. No-op when the tab has no initialized
 * filter context.
 *
 * @internal
 */
export function clearFilterContextWorkingValues(tab: ITabState): void {
    if (!tab.filterContext?.workingFilterContextDefinition) {
        return;
    }

    tab.filterContext.workingFilterContextDefinition = { filters: [] };
}

const resetWorkingFilterSelection: FilterContextReducer<PayloadAction> = (state) => {
    const activeTab = getActiveTab(state);
    if (activeTab) {
        clearFilterContextWorkingValues(activeTab);
    }
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

/**
 * @internal
 */
export type IChangeMeasureValueFilterConditionReducerPayload = {
    readonly localIdentifier: string;
    readonly conditions?: MeasureValueFilterCondition[];
    readonly isWorkingSelectionChange?: boolean;
    /**
     * Optional tab local identifier to target a specific tab.
     * If not provided, the active tab will be used.
     */
    readonly tabLocalIdentifier?: string;
    /**
     * When true, tabs this change is synced to restore their own saved initial condition instead of this payload.
     */
    readonly restoreTargetOriginal?: boolean;
};

const changeMeasureValueFilterCondition: FilterContextReducer<
    PayloadAction<IChangeMeasureValueFilterConditionReducerPayload>
> = (state, action) => {
    const tab = getTabOrActive(state, action.payload.tabLocalIdentifier);
    if (!tab) {
        return;
    }
    changeMeasureValueFilterConditionOnTab(tab, action.payload);
};

function changeMeasureValueFilterConditionOnTab(
    tab: ITabState,
    payload: IChangeMeasureValueFilterConditionReducerPayload,
): void {
    if (!tab.filterContext) {
        tab.filterContext = { ...filterContextInitialState };
    }
    const { localIdentifier, conditions, isWorkingSelectionChange } = payload;
    const filterContextDefinition = isWorkingSelectionChange
        ? tab.filterContext?.workingFilterContextDefinition
        : tab.filterContext?.filterContextDefinition;
    invariant(filterContextDefinition?.filters, "Attempt to edit uninitialized filter context");

    const filters = filterContextDefinition.filters;
    const index = filters.findIndex(
        (item) =>
            isDashboardMeasureValueFilter(item) && dashboardFilterLocalIdentifier(item) === localIdentifier,
    );

    const hasConditions = !!conditions && conditions.length > 0;
    invariant(
        index >= 0 || isWorkingSelectionChange,
        `Attempt to change condition of measure value filter ${localIdentifier} that does not exist`,
    );

    if (isWorkingSelectionChange && index < 0) {
        const workingFilter: WorkingDashboardMeasureValueFilter = {
            dashboardMeasureValueFilter: {
                localIdentifier,
                conditions: hasConditions ? conditions : undefined,
            },
        };
        tab.filterContext.workingFilterContextDefinition!.filters.push(workingFilter);
        return;
    }

    const filter = filters[index] as IDashboardMeasureValueFilter;
    filters[index] = {
        dashboardMeasureValueFilter: {
            ...filter.dashboardMeasureValueFilter,
            conditions: hasConditions ? conditions : undefined,
        },
    };
}

/**
 * @internal
 */
export interface IChangeMeasureValueFilterTitleReducerPayload {
    readonly filterLocalId: string;
    readonly title?: string;
    /**
     * Optional tab local identifier to target a specific tab.
     * If not provided, the active tab will be used.
     */
    readonly tabLocalIdentifier?: string;
}

type ISetMeasureValueFilterDimensionalityReducerPayload = {
    readonly localIdentifier: string;
    readonly dimensionality?: ObjRef[];
    /**
     * Optional tab local identifier to target a specific tab.
     * If not provided, the active tab will be used.
     */
    readonly tabLocalIdentifier?: string;
    /**
     * When true, tabs this change is synced to restore their own saved initial dimensionality instead of this payload.
     */
    readonly restoreTargetOriginal?: boolean;
};

const setMeasureValueFilterDimensionality: FilterContextReducer<
    PayloadAction<ISetMeasureValueFilterDimensionalityReducerPayload>
> = (state, action) => {
    const tab = getTabOrActive(state, action.payload.tabLocalIdentifier);
    if (!tab) {
        return;
    }
    setMeasureValueFilterDimensionalityOnTab(tab, action.payload);
};

function setMeasureValueFilterDimensionalityOnTab(
    tab: ITabState,
    payload: ISetMeasureValueFilterDimensionalityReducerPayload,
): void {
    const { localIdentifier } = payload;
    const filters = tab.filterContext?.filterContextDefinition?.filters;
    invariant(filters, "Attempt to edit uninitialized filter context");

    const index = filters.findIndex(
        (item) =>
            isDashboardMeasureValueFilter(item) && dashboardFilterLocalIdentifier(item) === localIdentifier,
    );
    invariant(
        index >= 0,
        `Attempt to change dimensionality of measure value filter ${localIdentifier} that does not exist`,
    );

    const filter = filters[index] as IDashboardMeasureValueFilter;
    const dimensionality =
        payload.dimensionality && payload.dimensionality.length > 0 ? payload.dimensionality : undefined;
    filters[index] = {
        dashboardMeasureValueFilter: {
            ...filter.dashboardMeasureValueFilter,
            dimensionality,
        },
    };
}

const changeMeasureValueFilterTitle: FilterContextReducer<
    PayloadAction<IChangeMeasureValueFilterTitleReducerPayload>
> = (state, action) => {
    const { filterLocalId, title, tabLocalIdentifier } = action.payload;
    const targetTab = getTabOrActive(state, tabLocalIdentifier);
    if (!targetTab) {
        return;
    }
    const filters = targetTab.filterContext?.filterContextDefinition?.filters;
    invariant(filters, "Attempt to edit uninitialized filter context");

    const index = filters.findIndex(
        (item) =>
            isDashboardMeasureValueFilter(item) && dashboardFilterLocalIdentifier(item) === filterLocalId,
    );
    invariant(
        index >= 0,
        `Attempt to change title of measure value filter ${filterLocalId} that does not exist`,
    );

    const filter = filters[index] as IDashboardMeasureValueFilter;
    filters[index] = {
        dashboardMeasureValueFilter: {
            ...filter.dashboardMeasureValueFilter,
            title,
        },
    };
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
    addTextAttributeFilter,
    addMeasureValueFilter,
    removeMeasureValueFilter,
    moveMeasureValueFilter,
    removeAttributeFilter,
    moveAttributeFilter,
    addDateFilter,
    removeDateFilter,
    moveDateFilter,
    updateAttributeFilterSelection,
    replaceAttributeFilterItem,
    setAttributeFilterParents,
    setAttributeFilterDependentDateFilters,
    clearAttributeFiltersSelection,
    upsertDateFilter,
    changeAttributeDisplayForm,
    changeTextFilterDisplayForm,
    changeAttributeTitle,
    changeSelectionMode,
    changeLimitingItems,
    setPreloadedAttributesWithReferences,
    resetWorkingFilterSelection,
    setDefaultFilterOverrides,
    changeMeasureValueFilterCondition,
    setMeasureValueFilterDimensionality,
    changeMeasureValueFilterTitle,
};
