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
    dashboardAttributeFilterItemLocalIdentifier,
    dashboardFilterLocalIdentifier,
    isAllTimeDashboardDateFilter,
    isAttributeElementsByRef,
    isDashboardArbitraryAttributeFilter,
    isDashboardAttributeFilter,
    isDashboardAttributeFilterItem,
    isDashboardCommonDateFilter,
    isDashboardDateFilter,
    isDashboardMatchAttributeFilter,
    isDashboardMeasureValueFilter,
    newAllTimeDashboardDateFilter,
} from "@gooddata/sdk-model";

import { type IAddDateFilterPayload, type IAddMeasureValueFilterPayload } from "../../../commands/filters.js";
import {
    generateFilterLocalIdentifier,
    generateMeasureValueFilterLocalIdentifier,
} from "../../_infra/generators.js";
import {
    type ITabState,
    type ITabsState,
    getActiveTab,
    getTabOrActive,
    getTabsToMutate,
} from "../tabsState.js";

import { type WorkingDashboardMeasureValueFilter, filterContextInitialState } from "./filterContextState.js";
import { applyFilterContext, initializeFilterContext } from "./filterContextUtils.js";
import {
    type CrossFilteringLocalIdsByTab,
    findCounterpartFilter,
    findOriginalFilter,
    isCrossFilteringVirtualFilter,
    preserveFilterDependencies,
    retargetAttributeFilterItem,
} from "./filterSync.js";

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
    readonly emptyValueHandling?: EmptyValues;
    readonly enablePersistentFiltersAcrossTabs?: boolean;
    /**
     * Optional tab local identifier to target a specific tab.
     * If not provided, the active tab will be used.
     */
    readonly tabLocalIdentifier?: string;
    /**
     * When true, other tabs restore their own saved initial date filter instead of this payload.
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
    readonly enablePersistentFiltersAcrossTabs?: boolean;
    /**
     * Optional tab local identifier to target a specific tab.
     * If not provided, the active tab will be used.
     */
    readonly tabLocalIdentifier?: string;
    /**
     * When true, other tabs restore their own saved initial date filter instead of this payload.
     */
    readonly restoreTargetOriginal?: boolean;
}

/**
 * @internal
 */
export type IUpsertDateFilterPayload = IUpsertDateFilterAllTimePayload | IUpsertDateFilterNonAllTimePayload;

const upsertDateFilter: FilterContextReducer<PayloadAction<IUpsertDateFilterPayload>> = (state, action) => {
    const { tabLocalIdentifier, enablePersistentFiltersAcrossTabs, isWorkingSelectionChange } =
        action.payload;
    const tabs = getTabsToMutate(
        state,
        tabLocalIdentifier,
        enablePersistentFiltersAcrossTabs,
        isWorkingSelectionChange,
    );

    const source = tabs[0];
    if (!source) {
        return;
    }

    upsertDateFilterOnTab(source, action.payload, true);

    for (const tab of tabs.slice(1)) {
        const payload = action.payload.restoreTargetOriginal
            ? restoredDateFilterPayload(tab, action.payload)
            : action.payload;
        if (!payload) {
            continue;
        }
        upsertDateFilterOnTab(tab, payload, false);
    }
};

/**
 * Saved date filter for a non-source tab during reset.
 * A common date filter with no saved original is all time, which is stored as the filter's absence.
 * A dimension date filter with no counterpart, or no saved original, is left unchanged.
 */
function restoredDateFilterPayload(
    tab: ITabState,
    payload: IUpsertDateFilterPayload,
): IUpsertDateFilterPayload | undefined {
    const applied = findAppliedDateFilter(tab, payload.dataSet);
    if (!applied && payload.dataSet) {
        return undefined;
    }

    const original = findOriginalFilter(
        tab,
        applied ?? {
            dateFilter: { type: "relative", granularity: "GDC.time.date" },
        },
    );
    if (isDashboardDateFilter(original)) {
        return toUpsertDateFilterPayload(original, payload);
    }
    if (!payload.dataSet) {
        return { type: "allTime" };
    }
    return undefined;
}

function findAppliedDateFilter(
    tab: ITabState,
    dataSet: ObjRef | undefined,
): IDashboardDateFilter | undefined {
    const filters = tab.filterContext?.filterContextDefinition?.filters;
    if (!filters) {
        return undefined;
    }
    if (dataSet) {
        return filters.find(
            (item): item is IDashboardDateFilter =>
                isDashboardDateFilter(item) && areObjRefsEqual(item.dateFilter.dataSet, dataSet),
        );
    }
    return filters.find(isDashboardCommonDateFilter);
}

function toUpsertDateFilterPayload(
    filter: IDashboardDateFilter,
    source: IUpsertDateFilterPayload,
): IUpsertDateFilterPayload {
    const { dataSet, localIdentifier, emptyValueHandling, boundedFilter, type, granularity, from, to } =
        filter.dateFilter;
    const shared = {
        ...(dataSet ? { dataSet } : {}),
        ...(localIdentifier ? { localIdentifier } : {}),
        ...(emptyValueHandling ? { emptyValueHandling } : {}),
        ...(source.isWorkingSelectionChange ? { isWorkingSelectionChange: true } : {}),
        ...(source.tabLocalIdentifier ? { tabLocalIdentifier: source.tabLocalIdentifier } : {}),
    };

    if (isAllTimeDashboardDateFilter(filter)) {
        return { type: "allTime", ...shared };
    }

    return {
        type,
        granularity,
        from,
        to,
        ...(boundedFilter ? { boundedFilter } : {}),
        ...shared,
    };
}

function upsertDateFilterOnTab(
    targetTab: ITabState,
    payload: IUpsertDateFilterPayload,
    isSource: boolean,
): void {
    if (!targetTab.filterContext) {
        if (!isSource) {
            return;
        }
        targetTab.filterContext = { ...filterContextInitialState };
    }

    const filterContextDefinition = payload.isWorkingSelectionChange
        ? targetTab.filterContext.workingFilterContextDefinition
        : targetTab.filterContext.filterContextDefinition;
    if (!isSource && !filterContextDefinition?.filters) {
        return;
    }
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

    if (!isSource && existingFilterIndex < 0 && dateDataSet) {
        return;
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
                const existing = filterContextDefinition.filters[existingFilterIndex];
                const preservedLocalIdentifier = isSource
                    ? payload.localIdentifier
                    : isDashboardDateFilter(existing)
                      ? existing.dateFilter.localIdentifier
                      : undefined;
                if (payload.emptyValueHandling) {
                    // Preserve all-time common DF when it carries additional config (e.g. emptyValueHandling).
                    filterContextDefinition.filters[existingFilterIndex] = newAllTimeDashboardDateFilter(
                        undefined,
                        preservedLocalIdentifier,
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

            if (localIdentifier && isSource) {
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
    } else if (isSource || !dateDataSet) {
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
     * When true, other tabs restore their own saved initial selection instead of this payload.
     */
    readonly restoreTargetOriginal?: boolean;
    /**
     * Cross-filtering virtual filters per tab. They are not mirrored to or from other tabs.
     */
    readonly crossFilteringLocalIdsByTab?: CrossFilteringLocalIdsByTab;

    readonly enablePersistentFiltersAcrossTabs?: boolean;
}

const updateAttributeFilterSelection: FilterContextReducer<
    PayloadAction<IUpdateAttributeFilterSelectionPayload>
> = (state, action) => {
    const {
        tabLocalIdentifier,
        enablePersistentFiltersAcrossTabs,
        isWorkingSelectionChange,
        crossFilteringLocalIdsByTab,
    } = action.payload;
    const tabs = getTabsToMutate(
        state,
        tabLocalIdentifier,
        enablePersistentFiltersAcrossTabs,
        isWorkingSelectionChange,
    );
    const source = tabs[0];
    if (!source) {
        return;
    }

    const sourceFilter = findAppliedFilterByLocalId(source, action.payload.filterLocalId);
    updateAttributeFilterSelectionOnTab(source, action.payload, action.payload.filterLocalId, true);

    if (
        tabs.length === 1 ||
        !sourceFilter ||
        !isDashboardAttributeFilter(sourceFilter) ||
        isCrossFilteringVirtualFilter(source, action.payload.filterLocalId, crossFilteringLocalIdsByTab)
    ) {
        return;
    }

    for (const tab of tabs.slice(1)) {
        const match = findCounterpartFilter(source, sourceFilter, tab, state.attributesWithReferences, {
            allowListToText: false,
            crossFilteringLocalIdsByTab,
        });
        if (!match || !isDashboardAttributeFilter(match)) {
            continue;
        }
        const targetLocalId = match.attributeFilter.localIdentifier;
        if (!targetLocalId) {
            continue;
        }
        const original = action.payload.restoreTargetOriginal ? findOriginalFilter(tab, match) : undefined;
        if (action.payload.restoreTargetOriginal && !isDashboardAttributeFilter(original)) {
            continue;
        }
        updateAttributeFilterSelectionOnTab(
            tab,
            {
                ...action.payload,
                filterLocalId: targetLocalId,
                ...(isDashboardAttributeFilter(original)
                    ? {
                          elements: original.attributeFilter.attributeElements,
                          negativeSelection: original.attributeFilter.negativeSelection,
                      }
                    : {}),
                enableImmediateAttributeFilterDisplayAsLabelMigration: false,
                isResultOfMigration: false,
            },
            targetLocalId,
            false,
        );
    }
};

function updateAttributeFilterSelectionOnTab(
    targetTab: ITabState,
    payload: IUpdateAttributeFilterSelectionPayload,
    filterLocalId: string,
    isSource: boolean,
): void {
    if (!targetTab.filterContext) {
        if (!isSource) {
            return;
        }
        targetTab.filterContext = { ...filterContextInitialState };
    }

    const {
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
    if (!isSource && !filterContextDefinition?.filters) {
        return;
    }
    invariant(filterContextDefinition?.filters, "Attempt to edit uninitialized filter context");

    const existingFilterIndex = filterContextDefinition.filters.findIndex(
        (item) => isDashboardAttributeFilter(item) && item.attributeFilter.localIdentifier === filterLocalId,
    );

    if (!isSource && existingFilterIndex < 0) {
        return;
    }
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
    readonly enablePersistentFiltersAcrossTabs?: boolean;
    /**
     * Optional tab local identifier to target a specific tab.
     * If not provided, the active tab will be used.
     */
    readonly tabLocalIdentifier?: string;
    /**
     * When true, other tabs restore their own saved initial filter instead of this payload.
     */
    readonly restoreTargetOriginal?: boolean;
    /**
     * Cross-filtering virtual filters per tab. They are not mirrored to or from other tabs.
     */
    readonly crossFilteringLocalIdsByTab?: CrossFilteringLocalIdsByTab;
}

const replaceAttributeFilterItem: FilterContextReducer<PayloadAction<IReplaceAttributeFilterItemPayload>> = (
    state,
    action,
) => {
    const {
        tabLocalIdentifier,
        enablePersistentFiltersAcrossTabs,
        isWorkingSelectionChange,
        crossFilteringLocalIdsByTab,
    } = action.payload;
    const tabs = getTabsToMutate(
        state,
        tabLocalIdentifier,
        enablePersistentFiltersAcrossTabs,
        isWorkingSelectionChange,
    );
    const source = tabs[0];

    if (!source) {
        return;
    }

    const sourceFilter = findAppliedFilterByLocalId(source, action.payload.filterLocalId);
    replaceAttributeFilterItemOnTab(source, action.payload, action.payload.filter, true);

    if (
        tabs.length === 1 ||
        !sourceFilter ||
        !isDashboardAttributeFilterItem(sourceFilter) ||
        isCrossFilteringVirtualFilter(source, action.payload.filterLocalId, crossFilteringLocalIdsByTab)
    ) {
        return;
    }

    for (const tab of tabs.slice(1)) {
        const match = findCounterpartFilter(source, sourceFilter, tab, state.attributesWithReferences, {
            allowListToText: true,
            crossFilteringLocalIdsByTab,
        });
        if (!match || !isDashboardAttributeFilterItem(match)) {
            continue;
        }
        const targetLocalId = dashboardAttributeFilterItemLocalIdentifier(match);
        if (!targetLocalId) {
            continue;
        }
        const original = action.payload.restoreTargetOriginal ? findOriginalFilter(tab, match) : undefined;
        if (action.payload.restoreTargetOriginal && !isDashboardAttributeFilterItem(original)) {
            continue;
        }
        const replacement = isDashboardAttributeFilterItem(original) ? original : action.payload.filter;
        replaceAttributeFilterItemOnTab(
            tab,
            { ...action.payload, filterLocalId: targetLocalId },
            retargetAttributeFilterItem(replacement, targetLocalId),
            false,
        );
    }
};

function replaceAttributeFilterItemOnTab(
    targetTab: ITabState,
    payload: IReplaceAttributeFilterItemPayload,
    filter: DashboardAttributeFilterItem,
    isSource: boolean,
): void {
    if (!targetTab.filterContext) {
        if (!isSource) {
            return;
        }
        targetTab.filterContext = { ...filterContextInitialState };
    }

    const { filterLocalId, isWorkingSelectionChange, isSelectionInvalid } = payload;

    const filterContextDefinition = isWorkingSelectionChange
        ? targetTab.filterContext.workingFilterContextDefinition
        : targetTab.filterContext.filterContextDefinition;
    if (!isSource && !filterContextDefinition?.filters) {
        return;
    }
    invariant(filterContextDefinition?.filters, "Attempt to edit uninitialized filter context");

    const existingFilterIndex = filterContextDefinition.filters.findIndex(
        (item) =>
            isDashboardAttributeFilterItem(item) &&
            dashboardAttributeFilterItemLocalIdentifier(item) === filterLocalId,
    );

    if (!isSource && existingFilterIndex < 0) {
        return;
    }

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
export interface IAddTextAttributeFilterReducerPayload {
    readonly filter: DashboardTextAttributeFilter;
    readonly index: number;
}

const addTextAttributeFilter: FilterContextReducer<PayloadAction<IAddTextAttributeFilterReducerPayload>> = (
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

    const { filter, index } = action.payload;

    // Filters are indexed just for attribute filters, if DateFilter is present should be always first item
    const isDateFilterPresent =
        activeTab.filterContext.filterContextDefinition.filters.findIndex(isDashboardDateFilter) >= 0;
    const attributeFilterIndex = isDateFilterPresent ? index + 1 : index;
    const generatedLocalIdentifierIndex = Math.max(0, attributeFilterIndex);
    const filterWithLocalIdentifier: DashboardTextAttributeFilter = isDashboardArbitraryAttributeFilter(
        filter,
    )
        ? {
              arbitraryAttributeFilter: {
                  ...filter.arbitraryAttributeFilter,
                  localIdentifier:
                      filter.arbitraryAttributeFilter.localIdentifier ??
                      generateFilterLocalIdentifier(
                          filter.arbitraryAttributeFilter.displayForm,
                          generatedLocalIdentifierIndex,
                      ),
              },
          }
        : isDashboardMatchAttributeFilter(filter)
          ? {
                matchAttributeFilter: {
                    ...filter.matchAttributeFilter,
                    localIdentifier:
                        filter.matchAttributeFilter.localIdentifier ??
                        generateFilterLocalIdentifier(
                            filter.matchAttributeFilter.displayForm,
                            generatedLocalIdentifierIndex,
                        ),
                },
            }
          : filter;

    if (index === -1) {
        activeTab.filterContext.filterContextDefinition.filters.push(filterWithLocalIdentifier);
    } else {
        activeTab.filterContext.filterContextDefinition.filters.splice(
            attributeFilterIndex,
            0,
            filterWithLocalIdentifier,
        );
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
        (item) =>
            isDashboardDateFilter(item) ||
            !isDashboardAttributeFilterItem(item) ||
            dashboardAttributeFilterItemLocalIdentifier(item) !== filterLocalId,
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
        (item) =>
            isDashboardAttributeFilterItem(item) &&
            dashboardAttributeFilterItemLocalIdentifier(item) === filterLocalId,
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
        (item) =>
            isDashboardAttributeFilterItem(item) &&
            dashboardAttributeFilterItemLocalIdentifier(item) === filterLocalId,
    );

    invariant(currentFilterIndex >= 0, "Attempt to set parent of a non-existing filter");

    // silently ignore when targeting match filter, will have no effect
    const filter = activeTab.filterContext.filterContextDefinition.filters[currentFilterIndex];

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
        (item) =>
            isDashboardAttributeFilterItem(item) &&
            dashboardAttributeFilterItemLocalIdentifier(item) === filterLocalId,
    );

    invariant(currentFilterIndex >= 0, "Attempt to set dependent date filter of a non-existing filter");

    const filter = activeTab.filterContext.filterContextDefinition.filters[currentFilterIndex];
    if (isDashboardAttributeFilter(filter)) {
        filter.attributeFilter.filterElementsByDate = [...dependentDateFilters];
    } else if (isDashboardArbitraryAttributeFilter(filter)) {
        filter.arbitraryAttributeFilter.filterElementsByDate = [...dependentDateFilters];
    }
    // Match filters do not support filterElementsByDate
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
    /**
     * When true, other tabs restore their own saved initial selection instead of clearing to All.
     */
    readonly restoreTargetOriginal?: boolean;
    /**
     * Cross-filtering virtual filters per tab. They are not mirrored to or from other tabs.
     */
    readonly crossFilteringLocalIdsByTab?: CrossFilteringLocalIdsByTab;
    readonly enablePersistentFiltersAcrossTabs?: boolean;
}

const clearAttributeFiltersSelection: FilterContextReducer<
    PayloadAction<IClearAttributeFiltersSelectionPayload>
> = (state, action) => {
    const {
        tabLocalIdentifier,
        enablePersistentFiltersAcrossTabs,
        filterLocalIds,
        crossFilteringLocalIdsByTab,
    } = action.payload;
    const tabs = getTabsToMutate(state, tabLocalIdentifier, enablePersistentFiltersAcrossTabs);
    const source = tabs[0];
    if (!source) {
        return;
    }
    if (!source.filterContext) {
        source.filterContext = { ...filterContextInitialState };
    }

    const sourceFilters = filterLocalIds.map((filterLocalId) => ({
        filterLocalId,
        filter: findAppliedFilterByLocalId(source, filterLocalId),
    }));

    filterLocalIds.forEach((filterLocalId) => {
        clearAttributeFilterSelectionOnTab(source, filterLocalId, true);
    });

    for (const tab of tabs.slice(1)) {
        for (const { filterLocalId, filter } of sourceFilters) {
            if (
                !filter ||
                !isDashboardAttributeFilter(filter) ||
                isCrossFilteringVirtualFilter(source, filterLocalId, crossFilteringLocalIdsByTab)
            ) {
                continue;
            }
            const match = findCounterpartFilter(source, filter, tab, state.attributesWithReferences, {
                allowListToText: false,
                crossFilteringLocalIdsByTab,
            });
            if (!match || !isDashboardAttributeFilter(match) || !match.attributeFilter.localIdentifier) {
                continue;
            }
            const targetLocalId = match.attributeFilter.localIdentifier;
            if (action.payload.restoreTargetOriginal) {
                const original = findOriginalFilter(tab, match);
                if (!isDashboardAttributeFilter(original)) {
                    continue;
                }
                updateAttributeFilterSelectionOnTab(
                    tab,
                    {
                        filterLocalId: targetLocalId,
                        elements: original.attributeFilter.attributeElements,
                        negativeSelection: original.attributeFilter.negativeSelection,
                    },
                    targetLocalId,
                    false,
                );
                continue;
            }
            clearAttributeFilterSelectionOnTab(tab, targetLocalId, false);
        }
    }
};

function clearAttributeFilterSelectionOnTab(tab: ITabState, filterLocalId: string, isSource: boolean): void {
    const filters = tab.filterContext?.filterContextDefinition?.filters;
    if (!isSource && !filters) {
        return;
    }
    invariant(tab.filterContext?.filterContextDefinition, "Attempt to edit uninitialized filter context");
    const currentFilterIndex = tab.filterContext.filterContextDefinition.filters.findIndex(
        (item) => isDashboardAttributeFilter(item) && item.attributeFilter.localIdentifier === filterLocalId,
    );
    if (!isSource && currentFilterIndex < 0) {
        return;
    }
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
    if (!targetTab?.filterContext) {
        return;
    }

    const { filterLocalId, displayForm } = action.payload;
    const filterContextDefinition = targetTab.filterContext.filterContextDefinition;
    if (!filterContextDefinition?.filters) {
        return;
    }

    const currentFilterIndex = filterContextDefinition.filters.findIndex(
        (item) =>
            isDashboardAttributeFilterItem(item) &&
            !isDashboardAttributeFilter(item) &&
            dashboardAttributeFilterItemLocalIdentifier(item) === filterLocalId,
    );

    if (currentFilterIndex < 0) {
        return;
    }

    const filter = filterContextDefinition.filters[currentFilterIndex];
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
        (item) =>
            isDashboardAttributeFilterItem(item) &&
            dashboardAttributeFilterItemLocalIdentifier(item) === filterLocalId,
    );

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
        (item) =>
            isDashboardAttributeFilterItem(item) &&
            dashboardAttributeFilterItemLocalIdentifier(item) === filterLocalId,
    );

    invariant(findFilter, "Attempt to change selection mode of a non-existing filter");

    // Text filters (arbitrary, match) do not have selectionMode; no-op for them
    if (isDashboardAttributeFilter(findFilter)) {
        findFilter.attributeFilter.selectionMode = selectionMode;
    }
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

const addMeasureValueFilter: FilterContextReducer<PayloadAction<IAddMeasureValueFilterPayload>> = (
    state,
    action,
) => {
    // A new measure value filter has no counterpart yet. Creating one on other tabs would be a
    // phantom filter, so the add stays on the source tab even when sync is on.
    const activeTab = getTabsToMutate(state)[0];
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

    const { index, measure, localIdentifier, title } = action.payload;

    const filter: IDashboardMeasureValueFilter = {
        dashboardMeasureValueFilter: {
            measure,
            localIdentifier:
                localIdentifier ?? generateMeasureValueFilterLocalIdentifier(measure, Math.max(0, index)),
            title,
        },
    };

    const isCommonDateFilterPresent =
        activeTab.filterContext.filterContextDefinition.filters.findIndex(isDashboardCommonDateFilter) >= 0;

    if (index === -1) {
        activeTab.filterContext.filterContextDefinition.filters.push(filter);
    } else {
        const newFilterIndex = isCommonDateFilterPresent ? index + 1 : index;
        activeTab.filterContext.filterContextDefinition.filters.splice(newFilterIndex, 0, filter);
    }
};

/**
 * @internal
 */
export interface IRemoveMeasureValueFilterReducerPayload {
    readonly localIdentifier: string;
}

const removeMeasureValueFilter: FilterContextReducer<
    PayloadAction<IRemoveMeasureValueFilterReducerPayload>
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

    activeTab.filterContext.filterContextDefinition = {
        ...activeTab.filterContext.filterContextDefinition,
        filters: activeTab.filterContext.filterContextDefinition.filters.filter(
            (item) =>
                !(
                    isDashboardMeasureValueFilter(item) &&
                    dashboardFilterLocalIdentifier(item) === action.payload.localIdentifier
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
}

const moveMeasureValueFilter: FilterContextReducer<PayloadAction<IMoveMeasureValueFilterPayload>> = (
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

    const { localIdentifier, index } = action.payload;
    const filters = activeTab.filterContext.filterContextDefinition.filters;
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
        (item) => !isDashboardDateFilter(item) || !areObjRefsEqual(item.dateFilter.dataSet!, dataSet),
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
        (item) =>
            isDashboardAttributeFilterItem(item) &&
            dashboardAttributeFilterItemLocalIdentifier(item) === filterLocalId,
    );

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
    for (const tab of getTabsToMutate(state)) {
        clearFilterContextWorkingValues(tab);
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
    readonly enablePersistentFiltersAcrossTabs?: boolean;
    /**
     * When true, other tabs restore their own saved initial condition instead of this payload.
     */
    readonly restoreTargetOriginal?: boolean;
};

const changeMeasureValueFilterCondition: FilterContextReducer<
    PayloadAction<IChangeMeasureValueFilterConditionReducerPayload>
> = (state, action) => {
    const { localIdentifier, isWorkingSelectionChange, enablePersistentFiltersAcrossTabs } = action.payload;
    const tabs = getTabsToMutate(
        state,
        undefined,
        enablePersistentFiltersAcrossTabs,
        isWorkingSelectionChange,
    );
    const source = tabs[0];
    if (!source) {
        return;
    }
    const sourceFilter = findAppliedFilterByLocalId(source, localIdentifier);
    changeMeasureValueFilterConditionOnTab(source, action.payload, localIdentifier, true);
    if (!sourceFilter || !isDashboardMeasureValueFilter(sourceFilter)) {
        return;
    }
    for (const tab of tabs.slice(1)) {
        const match = findCounterpartFilter(source, sourceFilter, tab, state.attributesWithReferences);
        const targetLocalId = match ? dashboardFilterLocalIdentifier(match) : undefined;
        if (!targetLocalId || !match) {
            continue;
        }
        if (action.payload.restoreTargetOriginal) {
            const original = findOriginalFilter(tab, match);
            if (!isDashboardMeasureValueFilter(original)) {
                continue;
            }
            changeMeasureValueFilterConditionOnTab(
                tab,
                {
                    ...action.payload,
                    localIdentifier: targetLocalId,
                    conditions: original.dashboardMeasureValueFilter.conditions,
                },
                targetLocalId,
                false,
            );
            continue;
        }
        changeMeasureValueFilterConditionOnTab(tab, action.payload, targetLocalId, false);
    }
};

function changeMeasureValueFilterConditionOnTab(
    tab: ITabState,
    payload: IChangeMeasureValueFilterConditionReducerPayload,
    localIdentifier: string,
    isSource: boolean,
): void {
    if (!tab.filterContext) {
        if (!isSource) {
            return;
        }
        tab.filterContext = { ...filterContextInitialState };
    }
    const { conditions, isWorkingSelectionChange } = payload;
    const filterContextDefinition = isWorkingSelectionChange
        ? tab.filterContext?.workingFilterContextDefinition
        : tab.filterContext?.filterContextDefinition;
    if (!isSource && !filterContextDefinition?.filters) {
        return;
    }
    invariant(filterContextDefinition?.filters, "Attempt to edit uninitialized filter context");

    const filters = filterContextDefinition.filters;
    const index = filters.findIndex(
        (item) =>
            isDashboardMeasureValueFilter(item) && dashboardFilterLocalIdentifier(item) === localIdentifier,
    );

    const hasConditions = !!conditions && conditions.length > 0;
    if (!isSource && index < 0) {
        return;
    }
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

type IChangeMeasureValueFilterTitleReducerPayload = {
    readonly filterLocalId: string;
    readonly title?: string;
};

type ISetMeasureValueFilterDimensionalityReducerPayload = {
    readonly localIdentifier: string;
    readonly dimensionality?: ObjRef[];
    /**
     * When true, other tabs restore their own saved initial dimensionality instead of this payload.
     */
    readonly restoreTargetOriginal?: boolean;
    readonly enablePersistentFiltersAcrossTabs?: boolean;
};

const setMeasureValueFilterDimensionality: FilterContextReducer<
    PayloadAction<ISetMeasureValueFilterDimensionalityReducerPayload>
> = (state, action) => {
    const { localIdentifier, restoreTargetOriginal, enablePersistentFiltersAcrossTabs } = action.payload;
    const tabs = getTabsToMutate(state, undefined, enablePersistentFiltersAcrossTabs);
    const source = tabs[0];
    if (!source) {
        return;
    }
    const sourceFilter = findAppliedFilterByLocalId(source, localIdentifier);
    setMeasureValueFilterDimensionalityOnTab(source, action.payload, localIdentifier, true);
    if (!sourceFilter || !isDashboardMeasureValueFilter(sourceFilter)) {
        return;
    }
    for (const tab of tabs.slice(1)) {
        const match = findCounterpartFilter(source, sourceFilter, tab, state.attributesWithReferences);
        const targetLocalId = match ? dashboardFilterLocalIdentifier(match) : undefined;
        if (!targetLocalId || !match) {
            continue;
        }
        if (restoreTargetOriginal) {
            const original = findOriginalFilter(tab, match);
            if (!isDashboardMeasureValueFilter(original)) {
                continue;
            }
            setMeasureValueFilterDimensionalityOnTab(
                tab,
                {
                    ...action.payload,
                    localIdentifier: targetLocalId,
                    dimensionality: original.dashboardMeasureValueFilter.dimensionality,
                },
                targetLocalId,
                false,
            );
            continue;
        }
        setMeasureValueFilterDimensionalityOnTab(tab, action.payload, targetLocalId, false);
    }
};

function setMeasureValueFilterDimensionalityOnTab(
    tab: ITabState,
    payload: ISetMeasureValueFilterDimensionalityReducerPayload,
    localIdentifier: string,
    isSource: boolean,
): void {
    const filters = tab.filterContext?.filterContextDefinition?.filters;
    if (!isSource && !filters) {
        return;
    }
    invariant(filters, "Attempt to edit uninitialized filter context");

    const index = filters.findIndex(
        (item) =>
            isDashboardMeasureValueFilter(item) && dashboardFilterLocalIdentifier(item) === localIdentifier,
    );
    if (!isSource && index < 0) {
        return;
    }
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
    const activeTab = getActiveTab(state);
    if (!activeTab) {
        return;
    }
    invariant(
        activeTab.filterContext?.filterContextDefinition?.filters,
        "Attempt to edit uninitialized filter context",
    );

    const filters = activeTab.filterContext.filterContextDefinition.filters;
    const index = filters.findIndex(
        (item) =>
            isDashboardMeasureValueFilter(item) &&
            dashboardFilterLocalIdentifier(item) === action.payload.filterLocalId,
    );
    invariant(
        index >= 0,
        `Attempt to change title of measure value filter ${action.payload.filterLocalId} that does not exist`,
    );

    const filter = filters[index] as IDashboardMeasureValueFilter;
    filters[index] = {
        dashboardMeasureValueFilter: {
            ...filter.dashboardMeasureValueFilter,
            title: action.payload.title,
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
