// (C) 2021-2025 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";
import { compact, isEmpty, isEqual, keyBy, sortBy } from "lodash-es";
import { invariant } from "ts-invariant";

import { IAttributeWithReferences } from "@gooddata/sdk-backend-spi";
import {
    FilterContextItem,
    IAttributeDisplayFormMetadataObject,
    IDashboardAttributeFilter,
    IDashboardDateFilter,
    IDashboardObjectIdentity,
    IFilterContextDefinition,
    ObjRef,
    areObjRefsEqual,
    getAttributeElementsItems,
    idRef,
    isDashboardAttributeFilter,
    isDashboardCommonDateFilter,
    isDashboardDateFilterWithDimension,
    isObjRef,
    uriRef,
} from "@gooddata/sdk-model";

import { applyFilterContext, getFilterIdentifier } from "./filterContextUtils.js";
import { ObjRefMap, newDisplayFormMap } from "../../../../_staging/metadata/objRefMap.js";
import { createMemoizedSelector } from "../../_infra/selectors.js";
import { selectSupportsCircularDependencyInFilters } from "../../backendCapabilities/backendCapabilitiesSelectors.js";
import { selectEnableImmediateAttributeFilterDisplayAsLabelMigration } from "../../config/configSelectors.js";
import { selectCrossFilteringFiltersLocalIdentifiers } from "../../drill/drillSelectors.js";
import { DashboardSelector, DashboardState } from "../../types.js";
import { DEFAULT_TAB_ID, selectActiveTabLocalIdentifier, selectTabs, selectTabsState } from "../index.js";
import { type FilterContextState, filterContextInitialState } from "./filterContextState.js";

const selectSelf = createSelector(selectTabs, selectActiveTabLocalIdentifier, (tabs, activeTabId) => {
    if (!tabs || !activeTabId) {
        return filterContextInitialState;
    }
    const activeTab = tabs.find((tab) => tab.localIdentifier === activeTabId);
    return activeTab?.filterContext ?? filterContextInitialState;
});

const selectTabsArray = createSelector(selectTabs, (tabs) => [...(tabs ?? [])]);

/**
 * Returns filter context state for each tab keyed by identifier.
 *
 * @internal
 */
export const selectFilterContextStatesByTab = createSelector(selectTabsArray, (tabs) => {
    if (!tabs.length) {
        return {};
    }

    return tabs.reduce<Record<string, FilterContextState>>((acc, tab) => {
        const identifier = tab.localIdentifier ?? DEFAULT_TAB_ID;
        acc[identifier] = tab.filterContext ?? filterContextInitialState;
        return acc;
    }, {});
});

/**
 * Returns applied filter context definitions for each tab keyed by identifier.
 *
 * @internal
 */
export const selectFilterContextDefinitionsByTab = createSelector(
    selectFilterContextStatesByTab,
    (statesByTab) => {
        return Object.entries(statesByTab).reduce<Record<string, IFilterContextDefinition | undefined>>(
            (acc, [identifier, state]) => {
                acc[identifier] = state.filterContextDefinition;
                return acc;
            },
            {},
        );
    },
);

/**
 * Returns filters from each tab keyed by tab identifier.
 * This selector is useful for exporting dashboards with per-tab filters.
 *
 * @internal
 */
export const selectFiltersByTab = createSelector(selectFilterContextDefinitionsByTab, (definitionsByTab) => {
    return Object.entries(definitionsByTab).reduce<Record<string, FilterContextItem[]>>(
        (acc, [identifier, definition]) => {
            acc[identifier] = definition?.filters ?? [];
            return acc;
        },
        {},
    );
});

/**
 * Returns original (persisted) filter context definitions for each tab keyed by identifier.
 *
 * @internal
 */
export const selectOriginalFilterContextDefinitionsByTab = createSelector(
    selectFilterContextStatesByTab,
    (statesByTab) => {
        return Object.entries(statesByTab).reduce<Record<string, IFilterContextDefinition | undefined>>(
            (acc, [identifier, state]) => {
                acc[identifier] = state.originalFilterContextDefinition;
                return acc;
            },
            {},
        );
    },
);

/**
 * Returns original (persisted) filters for each tab keyed by identifier.
 *
 * @internal
 */
export const selectOriginalFilterContextFiltersByTab = createSelector(
    selectOriginalFilterContextDefinitionsByTab,
    (definitionsByTab) => {
        return Object.entries(definitionsByTab).reduce<Record<string, FilterContextItem[]>>(
            (acc, [identifier, definition]) => {
                acc[identifier] = definition?.filters ?? [];
                return acc;
            },
            {},
        );
    },
);

/**
 * This selector returns array of filter localIds that have invalid selections.
 *
 * @returns Array of filter localIds with invalid selections.
 *
 * @public
 */
export const selectFiltersWithInvalidSelection: DashboardSelector<string[]> = createSelector(
    selectSelf,
    (filterContextState) => filterContextState.filtersWithInvalidSelection,
);

/**
 * This selector returns original (stored) dashboard's filter context definition.
 *
 * @remarks
 * It is expected that the selector is called only after the filter context state is correctly initialized.
 * Invocations before initialization lead to invariant errors.
 *
 * @returns {@link @gooddata/sdk-backend-spi#IFilterContextDefinition} or `undefined` if original filter context definition is not set.
 *
 * @public
 */
export const selectOriginalFilterContextDefinition: DashboardSelector<IFilterContextDefinition | undefined> =
    createSelector(selectSelf, (filterContextState) => {
        invariant(
            filterContextState.filterContextDefinition,
            "attempting to access uninitialized filter context state",
        );

        return filterContextState.originalFilterContextDefinition;
    });

/**
 * This selector returns original (stored) dashboard's filters.
 *
 * @remarks
 * It is expected that the selector is called only after the filter context state is correctly initialized.
 * Invocations before initialization lead to invariant errors.
 *
 * @returns an array of {@link @gooddata/sdk-backend-spi#FilterContextItem} or an empty array.
 *
 * @public
 */
export const selectOriginalFilterContextFilters: DashboardSelector<FilterContextItem[]> = createSelector(
    selectOriginalFilterContextDefinition,
    (filterContext): FilterContextItem[] => filterContext?.filters ?? [],
);

/**
 * This selector returns current applied dashboard's filter context definition.
 *
 * @remarks
 * It is expected that the selector is called only after the filter context state is correctly initialized.
 * Invocations before initialization lead to invariant errors.
 *
 * @returns a {@link @gooddata/sdk-backend-spi#IFilterContextDefinition}
 *
 * @public
 */
export const selectFilterContextDefinition: DashboardSelector<IFilterContextDefinition> = createSelector(
    selectSelf,
    (filterContextState) => {
        invariant(
            filterContextState.filterContextDefinition,
            "attempting to access uninitialized applied filter context state",
        );

        return filterContextState.filterContextDefinition!;
    },
);

/**
 * This selector returns current working dashboard's filter context definition.
 *
 * @remarks
 * It is expected that the selector is called only after the wokring filter context state is correctly initialized.
 * Invocations before initialization lead to invariant errors.
 *
 * @returns a {@link @gooddata/sdk-backend-spi#IFilterContextDefinition}
 *
 * @alpha
 */
export const selectWorkingFilterContextDefinition: DashboardSelector<IFilterContextDefinition> =
    createSelector(selectSelf, (state) => {
        invariant(
            state.filterContextDefinition,
            "attempting to access uninitialized working filter context state",
        );

        return applyFilterContext(state.filterContextDefinition, state.workingFilterContextDefinition)!;
    });

/**
 * Returns true if working filters and applied filters are same.
 *
 * Attribute filters are considered equal if
 *  - they have same localIdentifier
 *  - they have same elements (order does not matter)
 *  - all other fields are deep equal EXCEPT displayForm
 * We exclude diplayForm becuase of primary display form migration code.
 * Which changes display forms after update.
 *
 * @alpha
 */
export const selectIsWorkingFilterContextChanged: DashboardSelector<boolean | undefined> = createSelector(
    selectFilterContextDefinition,
    selectWorkingFilterContextDefinition,
    selectEnableImmediateAttributeFilterDisplayAsLabelMigration,
    (filterContext, workingFilterContext, enableImmediateAttributeFilterDisplayAsLabelMigration) => {
        if (filterContext.filters.length !== workingFilterContext.filters.length) {
            return true;
        }

        const appliedFilters = keyBy(filterContext.filters, getFilterIdentifier);
        const workingFilters = keyBy(workingFilterContext.filters, getFilterIdentifier);

        return !Object.keys(appliedFilters)
            .map((key): boolean => {
                const appliedFilter = appliedFilters[key];
                const workingFilter = workingFilters[key];

                if (isDashboardAttributeFilter(appliedFilter) && isDashboardAttributeFilter(workingFilter)) {
                    const { attributeElements: appliedElements, ...appliedFilterWithoutElements } =
                        appliedFilter.attributeFilter;
                    const { attributeElements: workingElements, ...workingFilterWithoutElements } =
                        workingFilter.attributeFilter;

                    // This code can be removed when enableImmediateAttributeFilterDisplayAsLabelMigration is removed
                    const partialAppliedFilter: Partial<IDashboardAttributeFilter["attributeFilter"]> =
                        appliedFilterWithoutElements;
                    const partialWorkingFilter: Partial<IDashboardAttributeFilter["attributeFilter"]> =
                        workingFilterWithoutElements;
                    if (!enableImmediateAttributeFilterDisplayAsLabelMigration) {
                        delete partialAppliedFilter.displayForm;
                        delete partialWorkingFilter.displayForm;
                    }

                    return (
                        isEqual(partialAppliedFilter, partialWorkingFilter) &&
                        isEqual(
                            sortBy(getAttributeElementsItems(appliedElements)),
                            sortBy(getAttributeElementsItems(workingElements)),
                        )
                    );
                }
                // Date filters
                return isEqual(appliedFilter, workingFilter);
            })
            .every((v) => v);
    },
);

/**
 * Selects dashboard's filter context identity.
 *
 * @remarks
 * The identity may be undefined in two circumstances:
 *
 * -  a new, yet unsaved dashboard; the filter context is saved together with the dashboard and after the
 *    save the identity will be known and added
 *
 * -  export of an existing, saved dashboard; during the export the dashboard receives a temporary
 *    filter context that represents values of filters at the time the export was initiated - which may
 *    be different from what is saved in the filter context itself. that temporary context is not
 *    persistent and lives only for that particular export operation.
 *
 * Invocations before initialization lead to invariant errors.
 *
 * @returns a {@link @gooddata/sdk-backend-spi#IDashboardObjectIdentity} or undefined, if the filter context identity is not set.
 *
 * @internal
 */
export const selectFilterContextIdentity: DashboardSelector<IDashboardObjectIdentity | undefined> =
    createSelector(selectSelf, (filterContextState) => {
        // this is intentional; want to fail fast when trying to access an optional identity of filter context \
        // but there is actually no filter context initialized for the dashboard
        invariant(
            filterContextState.filterContextDefinition,
            "attempting to access uninitialized filter context state",
        );

        return filterContextState.filterContextIdentity;
    });

/**
 * Selects list of display form metadata objects referenced by attribute filters.
 *
 * @remarks
 * Invocations before initialization lead to invariant errors.
 *
 * @returns an array of {@link @gooddata/sdk-backend-spi#IAttributeDisplayFormMetadataObject}
 *
 * @public
 */
export const selectAttributeFilterDisplayForms: DashboardSelector<IAttributeDisplayFormMetadataObject[]> =
    createSelector(selectSelf, (filterContextState) => {
        invariant(
            filterContextState.attributeFilterDisplayForms,
            "attempting to access uninitialized filter context state",
        );

        return filterContextState.attributeFilterDisplayForms;
    });

/**
 * Selects map of display form metadata objects referenced by attribute filters.
 *
 * @remarks
 * Invocations before initialization lead to invariant errors.
 *
 * @returns a {@link ObjRefMap} of {@link @gooddata/sdk-backend-spi#IAttributeDisplayFormMetadataObject}
 *
 * @internal
 */
export const selectAttributeFilterDisplayFormsMap: DashboardSelector<
    ObjRefMap<IAttributeDisplayFormMetadataObject>
> = createSelector(selectSelf, (filterContextState) => {
    invariant(
        filterContextState.attributeFilterDisplayForms,
        "attempting to access uninitialized filter context state",
    );

    return newDisplayFormMap(filterContextState.attributeFilterDisplayForms);
});

/**
 * This selector returns dashboard's applied filter context filters.
 *
 * @remarks
 * It is expected that the selector is called only after the filter context state is correctly initialized.
 * Invocations before initialization lead to invariant errors.
 *
 * @public
 */
export const selectFilterContextFilters: DashboardSelector<FilterContextItem[]> = createSelector(
    selectFilterContextDefinition,
    (filterContext): FilterContextItem[] => filterContext.filters,
);

/**
 * This selector returns dashboard's working filter context filters.
 *
 * @remarks
 * It is expected that the selector is called only after the filter context state is correctly initialized.
 * Invocations before initialization lead to invariant errors.
 *
 * @public
 */
export const selectWorkingFilterContextFilters: DashboardSelector<FilterContextItem[]> = createSelector(
    selectWorkingFilterContextDefinition,
    (filterContext): FilterContextItem[] => filterContext.filters,
);

/**
 * This selector returns dashboard's applied filter context attribute filters.
 *
 * @remarks
 * It is expected that the selector is called only after the filter context state is correctly initialized.
 * Invocations before initialization lead to invariant errors.
 *
 * @public
 */
export const selectFilterContextAttributeFilters: DashboardSelector<IDashboardAttributeFilter[]> =
    createSelector(selectFilterContextFilters, (filters): IDashboardAttributeFilter[] =>
        filters.filter(isDashboardAttributeFilter),
    );

/**
 * This selector returns dashboard's working filter context attribute filters.
 *
 * @remarks
 * It is expected that the selector is called only after the filter context state is correctly initialized.
 * Invocations before initialization lead to invariant errors.
 *
 * @public
 */
export const selectWorkingFilterContextAttributeFilters: DashboardSelector<IDashboardAttributeFilter[]> =
    createSelector(selectWorkingFilterContextFilters, (filters): IDashboardAttributeFilter[] =>
        filters.filter(isDashboardAttributeFilter),
    );

/**
 * This selector returns dashboard's applied filter context date filter.
 *
 * @remarks
 * It is expected that the selector is called only after the filter context state is correctly initialized.
 * Invocations before initialization lead to invariant errors.
 *
 * @public
 */
export const selectFilterContextDateFilter: DashboardSelector<IDashboardDateFilter | undefined> =
    createSelector(selectFilterContextFilters, (filters): IDashboardDateFilter | undefined =>
        filters.find(isDashboardCommonDateFilter),
    );

/**
 * This selector returns dashboard's working filter context date filter.
 *
 * @remarks
 * It is expected that the selector is called only after the filter context state is correctly initialized.
 * Invocations before initialization lead to invariant errors.
 *
 * @public
 */
export const selectWorkingFilterContextDateFilter: DashboardSelector<IDashboardDateFilter | undefined> =
    createSelector(selectWorkingFilterContextFilters, (filters): IDashboardDateFilter | undefined =>
        filters.find(isDashboardCommonDateFilter),
    );

/**
 * This selector returns dashboard's filter context draggable filters.
 *
 * @remarks
 * It is expected that the selector is called only after the filter context state is correctly initialized.
 * Invocations before initialization lead to invariant errors.
 *
 * @public
 */
export const selectFilterContextDraggableFilters: DashboardSelector<
    Array<IDashboardDateFilter | IDashboardAttributeFilter>
> = createSelector(
    selectFilterContextFilters,
    (filters): Array<IDashboardDateFilter | IDashboardAttributeFilter> =>
        filters.filter((f) => isDashboardDateFilterWithDimension(f) || isDashboardAttributeFilter(f)),
);

/**
 * This selector returns dashboard's applied filter context date filter with dimension specified.
 *
 * @remarks
 * It is expected that the selector is called only after the filter context state is correctly initialized.
 * Invocations before initialization lead to invariant errors.
 *
 * @public
 */
export const selectFilterContextDateFiltersWithDimension: DashboardSelector<IDashboardDateFilter[]> =
    createSelector(selectFilterContextFilters, (filters): IDashboardDateFilter[] =>
        filters.filter(isDashboardDateFilterWithDimension),
    );

/**
 * This selector returns dashboard's working filter context date filter with dimension specified.
 *
 * @remarks
 * It is expected that the selector is called only after the filter context state is correctly initialized.
 * Invocations before initialization lead to invariant errors.
 *
 * @public
 */
export const selectWorkingFilterContextDateFiltersWithDimension: DashboardSelector<IDashboardDateFilter[]> =
    createSelector(selectWorkingFilterContextFilters, (filters): IDashboardDateFilter[] =>
        filters.filter(isDashboardDateFilterWithDimension),
    );

/**
 * Creates a selector for selecting date filter by its dataset {@link @gooddata/sdk-model#ObjRef}.
 *
 * @remarks
 * Invocations before initialization lead to invariant errors.
 *
 * @public
 */
export const selectFilterContextDateFilterByDataSet: (
    dataSet: ObjRef,
) => (state: DashboardState) => IDashboardDateFilter | undefined = createMemoizedSelector((dataSet: ObjRef) =>
    createSelector(selectFilterContextDateFiltersWithDimension, (dateFilters) => {
        return dateFilters.find((filter) => areObjRefsEqual(filter.dateFilter.dataSet, dataSet));
    }),
);

/**
 * Creates a selector for selecting date filter's index by its dataset {@link @gooddata/sdk-model#ObjRef}.
 *
 * @remarks
 * Invocations before initialization lead to invariant errors.
 *
 * @public
 */
export const selectFilterContextDateFilterIndexByDataSet: (
    dataSet: ObjRef,
) => (state: DashboardState) => number = createMemoizedSelector((dataSet: ObjRef) =>
    createSelector(selectFilterContextDateFiltersWithDimension, (dateFilters) => {
        return dateFilters.findIndex((filter) => areObjRefsEqual(filter.dateFilter.dataSet, dataSet));
    }),
);

/**
 * Returns date filters with dimension for a specific tab.
 *
 * @param tabLocalIdentifier - Tab local identifier
 * @returns Date filters with dimension for the specified tab
 *
 * @internal
 */
export const selectFilterContextDateFiltersWithDimensionForTab: (
    tabLocalIdentifier: string,
) => DashboardSelector<IDashboardDateFilter[]> = createMemoizedSelector((tabLocalIdentifier: string) =>
    createSelector(selectFiltersByTab, (filtersByTab): IDashboardDateFilter[] => {
        const filters = filtersByTab[tabLocalIdentifier] ?? [];
        return filters.filter(isDashboardDateFilterWithDimension);
    }),
);

/**
 * Creates a selector for selecting date filter by its dataset from a specific tab.
 *
 * @param dataSet - Date dataset ref
 * @param tabLocalIdentifier - Tab local identifier
 * @returns Date filter matching the dataset, or undefined if not found
 *
 * @internal
 */
export const selectFilterContextDateFilterByDataSetForTab: (
    dataSet: ObjRef,
    tabLocalIdentifier: string,
) => DashboardSelector<IDashboardDateFilter | undefined> = createMemoizedSelector(
    (dataSet: ObjRef, tabLocalIdentifier: string) =>
        createSelector(
            selectFilterContextDateFiltersWithDimensionForTab(tabLocalIdentifier),
            (dateFilters) => {
                return dateFilters.find((filter) => areObjRefsEqual(filter.dateFilter.dataSet, dataSet));
            },
        ),
);

/**
 * Creates a selector for selecting draggable filter's index by its ref:
 * dataSet ref for date filters {@link @gooddata/sdk-model#ObjRef}
 * localIdentifier for attribute filters
 *
 * @remarks
 * Invocations before initialization lead to invariant errors.
 *
 * @public
 */
export const selectFilterContextDraggableFilterIndexByRef: (
    ref: ObjRef | string,
) => (state: DashboardState) => number = createMemoizedSelector((ref: ObjRef | string) =>
    createSelector(selectFilterContextFilters, (filters) => {
        return filters.findIndex((filter) => {
            if (isDashboardDateFilterWithDimension(filter) && isObjRef(ref)) {
                return areObjRefsEqual(filter.dateFilter.dataSet, ref);
            }
            if (isDashboardAttributeFilter(filter) && typeof ref === "string") {
                return filter.attributeFilter.localIdentifier === ref;
            }
            return false;
        });
    }),
);

/**
 * Creates a selector for selecting attribute filter by its displayForm {@link @gooddata/sdk-model#ObjRef}.
 *
 * @remarks
 * Invocations before initialization lead to invariant errors.
 *
 * @public
 */
export const selectFilterContextAttributeFilterByDisplayForm: (
    displayForm: ObjRef,
) => (state: DashboardState) => IDashboardAttributeFilter | undefined = createMemoizedSelector(
    (displayForm: ObjRef) =>
        createSelector(
            selectAttributeFilterDisplayFormsMap,
            selectFilterContextAttributeFilters,
            (attributeDisplayFormsMap, attributeFilters) => {
                const df = attributeDisplayFormsMap.get(displayForm);
                if (!df) {
                    return undefined;
                }
                // try matching both uri and id in case the type of ref is different from what is in the ref field
                return attributeFilters.find(
                    (filter) =>
                        areObjRefsEqual(filter.attributeFilter.displayForm, idRef(df.id, "displayForm")) ||
                        areObjRefsEqual(filter.attributeFilter.displayForm, uriRef(df.uri)),
                );
            },
        ),
);

/**
 * Creates a selector for selecting attribute filter by its localId.
 *
 * @remarks
 * Invocations before initialization lead to invariant errors.
 *
 * @public
 */
export const selectFilterContextAttributeFilterByLocalId: (
    localId: string,
) => DashboardSelector<IDashboardAttributeFilter | undefined> = createMemoizedSelector((localId: string) =>
    createSelector(selectFilterContextAttributeFilters, (attributeFilters) =>
        attributeFilters.find((filter) => filter.attributeFilter.localIdentifier === localId),
    ),
);

/**
 * Returns attribute filters for a specific tab.
 *
 * @param tabLocalIdentifier - Tab local identifier
 * @returns Attribute filters for the specified tab
 *
 * @internal
 */
export const selectFilterContextAttributeFiltersByTab: (
    tabLocalIdentifier: string,
) => DashboardSelector<IDashboardAttributeFilter[]> = createMemoizedSelector((tabLocalIdentifier: string) =>
    createSelector(selectFiltersByTab, (filtersByTab): IDashboardAttributeFilter[] => {
        const filters = filtersByTab[tabLocalIdentifier] ?? [];
        return filters.filter(isDashboardAttributeFilter);
    }),
);

/**
 * Creates a selector for selecting attribute filter by its display form from a specific tab.
 *
 * @param displayForm - Display form ref
 * @param tabLocalIdentifier - Tab local identifier
 * @returns Attribute filter matching the display form, or undefined if not found
 *
 * @internal
 */
export const selectFilterContextAttributeFilterByDisplayFormForTab: (
    displayForm: ObjRef,
    tabLocalIdentifier: string,
) => DashboardSelector<IDashboardAttributeFilter | undefined> = createMemoizedSelector(
    (displayForm: ObjRef, tabLocalIdentifier: string) =>
        createSelector(
            selectAttributeFilterDisplayFormsMap,
            selectFilterContextAttributeFiltersByTab(tabLocalIdentifier),
            (attributeDisplayFormsMap, attributeFilters) => {
                const df = attributeDisplayFormsMap.get(displayForm);
                if (!df) {
                    return undefined;
                }
                // try matching both uri and id in case the type of ref is different from what is in the ref field
                return attributeFilters.find(
                    (filter) =>
                        areObjRefsEqual(filter.attributeFilter.displayForm, idRef(df.id, "displayForm")) ||
                        areObjRefsEqual(filter.attributeFilter.displayForm, uriRef(df.uri)),
                );
            },
        ),
);

/**
 * Creates a selector for selecting attribute filter by its localId from a specific tab.
 *
 * @param localId - Filter local identifier
 * @param tabLocalIdentifier - Tab local identifier
 * @returns Attribute filter matching the local id, or undefined if not found
 *
 * @internal
 */
export const selectFilterContextAttributeFilterByLocalIdForTab: (
    localId: string,
    tabLocalIdentifier: string,
) => DashboardSelector<IDashboardAttributeFilter | undefined> = createMemoizedSelector(
    (localId: string, tabLocalIdentifier: string) =>
        createSelector(selectFilterContextAttributeFiltersByTab(tabLocalIdentifier), (attributeFilters) =>
            attributeFilters.find((filter) => filter.attributeFilter.localIdentifier === localId),
        ),
);

/**
 * Creates a selector for selecting attribute filter index by its localId.
 *
 * @remarks
 * Invocations before initialization lead to invariant errors.
 *
 * @public
 */
export const selectFilterContextAttributeFilterIndexByLocalId: (
    localId: string,
) => DashboardSelector<number> = createMemoizedSelector((localId: string) =>
    createSelector(selectFilterContextAttributeFilters, (attributeFilters) =>
        attributeFilters.findIndex((filter) => filter.attributeFilter.localIdentifier === localId),
    ),
);

/**
 * Creates a selector for selecting all descendants of the attribute filter with given localId.
 *
 * @remarks
 * Invocations before initialization lead to invariant errors.
 * This selector should only be used when circular filter dependencies are not allowed.
 *
 * @public
 */
export const selectAttributeFilterDescendants: (localId: string) => DashboardSelector<string[]> =
    createMemoizedSelector((localId: string) =>
        createSelector(
            selectFilterContextAttributeFilters,
            selectSupportsCircularDependencyInFilters,
            (attributeFilters, supportsCircularDependencies) => {
                invariant(
                    !supportsCircularDependencies,
                    "Filter descendants cannot be computed as this backend supports circular dependencies in filters. Do not use this selector.",
                );

                const toCheck = compact([localId]);
                const result = new Set<string>();

                while (toCheck.length) {
                    const current = toCheck.pop();
                    const children = attributeFilters.filter((f) =>
                        f.attributeFilter.filterElementsBy?.some(
                            (parent) => parent.filterLocalIdentifier === current,
                        ),
                    );

                    children.forEach((child) => {
                        result.add(child.attributeFilter.localIdentifier!);
                        toCheck.push(child.attributeFilter.localIdentifier!);
                    });
                }

                return Array.from(result);
            },
        ),
    );

/**
 * Creates a selector for selecting all filters with different reference than the given one.
 *
 * @internal
 */
export const selectOtherContextAttributeFilters: (
    ref?: ObjRef,
) => DashboardSelector<IDashboardAttributeFilter[]> = createMemoizedSelector((ref?: ObjRef) =>
    createSelector(selectFilterContextAttributeFilters, (attributeFilters): IDashboardAttributeFilter[] => {
        return attributeFilters.filter(
            (attributeFilter) => !areObjRefsEqual(attributeFilter.attributeFilter.displayForm, ref),
        );
    }),
);

/**
 * Creates a selector to get a display form of the filter defined by its local identifier.
 *
 * @internal
 */
export const selectAttributeFilterDisplayFormByLocalId: (localId: string) => DashboardSelector<ObjRef> =
    createMemoizedSelector((localId: string) =>
        createSelector(selectFilterContextAttributeFilters, (filters) => {
            const filter = filters.find((filter) => filter.attributeFilter.localIdentifier === localId);

            invariant(filter, "Unable to find current filter to get its title.");

            return filter.attributeFilter.displayForm;
        }),
    );

/**
 * Creates a selector which checks for a circular dependency between filters.
 *
 * @remarks
 * This selector should only be used when circular filter dependencies are not allowed.
 *
 * @internal
 */
export const selectIsCircularDependency: (
    currentFilterLocalId: string,
    neighborFilterLocalId: string,
) => DashboardSelector<boolean> = createMemoizedSelector(
    (currentFilterLocalId: string, neighborFilterLocalId: string) =>
        createSelector(
            selectAttributeFilterDescendants(currentFilterLocalId),
            selectSupportsCircularDependencyInFilters,
            (descendants, supportsCircularDependencies) => {
                invariant(
                    !supportsCircularDependencies,
                    "No need to compute circular dependencies as this backend supports it in filters. Do not use this selector.",
                );

                return descendants.some((descendant) => descendant === neighborFilterLocalId);
            },
        ),
);

const MAX_DRAGGABLE_FILTERS_COUNT = 30;

/**
 * This selector returns whether any more attribute filters can be added.
 *
 * @remarks
 * It is expected that the selector is called only after the filter context state is correctly initialized.
 * Invocations before initialization lead to invariant errors.
 *
 * @public
 * @deprecated use selectCanAddMoreFilters instead
 */
export const selectCanAddMoreAttributeFilters: DashboardSelector<boolean> = createSelector(
    selectFilterContextAttributeFilters,
    selectFilterContextDateFiltersWithDimension,
    selectCrossFilteringFiltersLocalIdentifiers,
    (attributeFilters, dateFiltersWithDimension, crossFilters) => {
        return (
            attributeFilters.length + dateFiltersWithDimension.length - crossFilters.length <
            MAX_DRAGGABLE_FILTERS_COUNT
        );
    },
);

/**
 * This selector returns whether any more attribute filters can be added.
 *
 * @remarks
 * It is expected that the selector is called only after the filter context state is correctly initialized.
 * Invocations before initialization lead to invariant errors.
 *
 * @public
 */
export const selectCanAddMoreFilters = selectCanAddMoreAttributeFilters;

/**
 * This selector returns information whether attribute filter from filter context has some dependencies.
 *
 * @internal
 */
export const selectIsAttributeFilterDependentByLocalIdentifier: (
    attributeFilterLocalIdentifier: string,
) => DashboardSelector<boolean> = createMemoizedSelector((attributeFilterLocalIdentifier: string) =>
    createSelector(
        selectFilterContextAttributeFilterByLocalId(attributeFilterLocalIdentifier),
        (filterContextAttributeFilter) => {
            return (
                !isEmpty(filterContextAttributeFilter?.attributeFilter?.filterElementsBy) ||
                !isEmpty(filterContextAttributeFilter?.attributeFilter?.filterElementsByDate)
            );
        },
    ),
);

/**
 * Select preloaded attribute metadata objects with references for attribute filters.
 * Returns merged attributes from all filters across all tabs.
 *
 * @internal
 */
export const selectPreloadedAttributesWithReferences: DashboardSelector<
    IAttributeWithReferences[] | undefined
> = createSelector(selectTabsState, (tabsState) => {
    return tabsState.attributesWithReferences;
});

/**
 * This selector returns an array of attribute names related to filters with invalid selection.
 *
 * @remarks
 * It is expected that the selector is called only after the filter context state is correctly initialized.
 *
 * @returns An array of attribute names that have filters with invalid selections.
 *
 * @public
 */
export const selectNamesOfFiltersWithInvalidSelection: DashboardSelector<string[]> = createSelector(
    selectFiltersWithInvalidSelection,
    selectAttributeFilterDisplayForms,
    selectFilterContextAttributeFilters,
    (invalidFilterIds, attributeFilterDisplayForms, attributeFilters): string[] => {
        // If attributeFilterDisplayForms is undefined, return empty array
        if (!attributeFilterDisplayForms) {
            return [];
        }

        // Find filters with invalid selection
        const invalidFilters = attributeFilters.filter(
            (filter) =>
                filter.attributeFilter.localIdentifier &&
                invalidFilterIds.includes(filter.attributeFilter.localIdentifier),
        );

        // For each invalid filter, find the attribute name from attributeFilterDisplayForms
        const attributeNames = invalidFilters.map((filter) => {
            const displayFormRef = filter.attributeFilter.displayForm;

            // Find the attribute that contains this display form
            const attributeWithReferences = attributeFilterDisplayForms.find((item) =>
                areObjRefsEqual(item.ref, displayFormRef),
            );

            return attributeWithReferences?.title ?? "";
        });

        // Filter out empty strings and remove duplicates
        return [...new Set(attributeNames.filter(Boolean))];
    },
);

/**
 * Selects default filter overrides for the dashboard.
 *
 * @beta
 */
export const selectDefaultFilterOverrides: DashboardSelector<FilterContextItem[] | undefined> =
    createSelector(selectSelf, (state) => state.defaultFilterOverrides);
