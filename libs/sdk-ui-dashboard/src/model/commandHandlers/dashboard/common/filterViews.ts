// (C) 2024-2026 GoodData Corporation

import { isEqual, omit } from "lodash-es";

import {
    type DashboardAttributeFilterItem,
    type DashboardTextAttributeFilter,
    type FilterContextItem,
    type IDashboard,
    type IDashboardArbitraryAttributeFilter,
    type IDashboardAttributeFilter,
    type IDashboardAttributeFilterConfig,
    type IDashboardDateFilter,
    type IDashboardFilterView,
    type IFilterContext,
    type ISettings,
    type ObjRef,
    areObjRefsEqual,
    dashboardAttributeFilterItemDisplayForm,
    dashboardAttributeFilterItemFilterElementsBy,
    dashboardAttributeFilterItemFilterElementsByDate,
    dashboardAttributeFilterItemLocalIdentifier,
    dashboardAttributeFilterItemTitle,
    dashboardAttributeFilterItemValidateElementsBy,
    isDashboardArbitraryAttributeFilter,
    isDashboardAttributeFilter,
    isDashboardAttributeFilterItem,
    isDashboardDateFilter,
    isDashboardMatchAttributeFilter,
    isDashboardTextAttributeFilter,
    isFilterContext,
} from "@gooddata/sdk-model";

import { isFilterTypeCompatibleWithSelectionType } from "./attributeFilterSelectionTypeCompatibility.js";

const findMatchingAttributeFilterByLocalIdentifier = (
    filter: IDashboardAttributeFilter,
    viewFilters: FilterContextItem[],
): IDashboardAttributeFilter | undefined =>
    viewFilters.find(
        (item): item is IDashboardAttributeFilter =>
            isDashboardAttributeFilter(item) &&
            item.attributeFilter.localIdentifier === filter.attributeFilter.localIdentifier,
    );

const findMatchingTextFilterByLocalIdentifier = (
    filter: DashboardTextAttributeFilter,
    viewFilters: FilterContextItem[],
): DashboardTextAttributeFilter | undefined => {
    const localId = dashboardAttributeFilterItemLocalIdentifier(filter);
    if (!localId) return undefined;
    return viewFilters.find(
        (item): item is DashboardTextAttributeFilter =>
            isDashboardTextAttributeFilter(item) &&
            dashboardAttributeFilterItemLocalIdentifier(item) === localId,
    );
};

/** Finds any attribute filter item (list or text) by localIdentifier. */
const findMatchingAttributeFilterItemByLocalIdentifier = (
    localId: string,
    viewFilters: FilterContextItem[],
): DashboardAttributeFilterItem | undefined =>
    viewFilters.find(
        (item): item is DashboardAttributeFilterItem =>
            isDashboardAttributeFilterItem(item) &&
            dashboardAttributeFilterItemLocalIdentifier(item) === localId,
    );

// date filters do not have localIdentifier set, compare them by dataSet instead
const findMatchingDateFilterByDataSet = (
    filter: IDashboardDateFilter,
    viewFilters: FilterContextItem[],
): IDashboardDateFilter | undefined =>
    viewFilters.find(
        (item): item is IDashboardDateFilter =>
            isDashboardDateFilter(item) &&
            ((item.dateFilter.dataSet === undefined && filter.dateFilter.dataSet === undefined) ||
                areObjRefsEqual(item.dateFilter.dataSet, filter.dateFilter.dataSet)),
    );

const OMITTED_ATTRIBUTE_FILTER_PATHS = [
    "attributeFilter.attributeElements",
    "attributeFilter.negativeSelection",
];

const hasSameAttributeFilterConfiguration = (
    filterA: IDashboardAttributeFilter,
    filterB?: IDashboardAttributeFilter,
) => {
    return isEqual(
        omit(filterA, OMITTED_ATTRIBUTE_FILTER_PATHS),
        omit(filterB, OMITTED_ATTRIBUTE_FILTER_PATHS),
    );
};

/**
 * Checks that the non-view-editable configuration of two text filters matches.
 * Only displayForm and title are compared — everything changeable in view mode
 * (type, values, operator, literal, caseSensitive, negativeSelection) is ignored.
 */
const hasSameTextFilterConfiguration = (
    filterA: DashboardTextAttributeFilter,
    filterB: DashboardTextAttributeFilter,
) => {
    return (
        areObjRefsEqual(
            dashboardAttributeFilterItemDisplayForm(filterA),
            dashboardAttributeFilterItemDisplayForm(filterB),
        ) && dashboardAttributeFilterItemTitle(filterA) === dashboardAttributeFilterItemTitle(filterB)
    );
};

/**
 * Resolves the effective display form for a filter in the context of cross-type comparison.
 * List filters use displayAsLabel from config (falls back to primary displayForm).
 * Text filters use their displayForm directly.
 */
const getEffectiveDisplayForm = (
    filter: DashboardAttributeFilterItem,
    filterConfig: IDashboardAttributeFilterConfig | undefined,
) => {
    if (isDashboardAttributeFilter(filter)) {
        return filterConfig?.displayAsLabel ?? filter.attributeFilter.displayForm;
    }
    return dashboardAttributeFilterItemDisplayForm(filter);
};

/**
 * Checks that the non-view-editable configuration of two attribute filters of different types matches.
 *
 * - DisplayForm: list filters use displayAsLabel from config; text filters use their own displayForm.
 * - Parent/validation props (filterElementsBy, filterElementsByDate, validateElementsBy):
 *   compared only when the view filter is arbitrary (which supports them).
 *   Match filters don't support parent dependencies, so these are skipped for match overrides.
 * - Title is always compared.
 */
const hasSameCrossTypeFilterConfiguration = (
    dashboardFilter: DashboardAttributeFilterItem,
    viewFilter: DashboardAttributeFilterItem,
    filterConfig: IDashboardAttributeFilterConfig | undefined,
): boolean => {
    const hasSameDisplayForm = areObjRefsEqual(
        getEffectiveDisplayForm(dashboardFilter, filterConfig),
        getEffectiveDisplayForm(viewFilter, filterConfig),
    );
    const hasSameTitle =
        dashboardAttributeFilterItemTitle(dashboardFilter) === dashboardAttributeFilterItemTitle(viewFilter);

    // Parent/validation props only apply to arbitrary filters — match filters don't support them
    const hasSameParentConfig =
        !isDashboardArbitraryAttributeFilter(viewFilter) ||
        (isEqual(
            dashboardAttributeFilterItemFilterElementsBy(dashboardFilter),
            dashboardAttributeFilterItemFilterElementsBy(viewFilter),
        ) &&
            isEqual(
                dashboardAttributeFilterItemFilterElementsByDate(dashboardFilter),
                dashboardAttributeFilterItemFilterElementsByDate(viewFilter),
            ) &&
            isEqual(
                dashboardAttributeFilterItemValidateElementsBy(dashboardFilter),
                dashboardAttributeFilterItemValidateElementsBy(viewFilter),
            ));

    return hasSameDisplayForm && hasSameTitle && hasSameParentConfig;
};

/** Creates "All" state for text filters: always a negative arbitrary filter with empty selection */
const createResetTextFilter = (filter: DashboardTextAttributeFilter): IDashboardArbitraryAttributeFilter => {
    const displayForm = dashboardAttributeFilterItemDisplayForm(filter);
    const localIdentifier = dashboardAttributeFilterItemLocalIdentifier(filter);
    const title = dashboardAttributeFilterItemTitle(filter);
    if (isDashboardArbitraryAttributeFilter(filter)) {
        const { filterElementsBy, filterElementsByDate, validateElementsBy } =
            filter.arbitraryAttributeFilter;
        return {
            arbitraryAttributeFilter: {
                displayForm,
                values: [],
                negativeSelection: true,
                localIdentifier,
                title,
                filterElementsBy,
                filterElementsByDate,
                validateElementsBy,
            },
        };
    }
    // Match filter - no validateElementsBy, filterElementsBy, or filterElementsByDate
    return {
        arbitraryAttributeFilter: {
            displayForm,
            values: [],
            negativeSelection: true,
            localIdentifier,
            title,
        },
    };
};

const isCommonDateFilter = (filter: FilterContextItem) =>
    isDashboardDateFilter(filter) && filter.dateFilter.dataSet === undefined;

const handleCommonDateFilter = (
    filterContextFilters: FilterContextItem[],
    filterViewFilters: FilterContextItem[],
    mergedFilters: FilterContextItem[],
): FilterContextItem[] => {
    // If common date is set to All, it is not included in filter context filters.
    // Common filter differs from date filters by not having date dataset (it is provided by widget).
    const isCommonDateOriginallyOnAll = !filterContextFilters.some(isCommonDateFilter);
    const nonAllCommonDateFilterFromView = filterViewFilters.find(isCommonDateFilter);

    if (isCommonDateOriginallyOnAll && nonAllCommonDateFilterFromView) {
        // inject value of common date from view to filter context to override filter context's All value
        return [nonAllCommonDateFilterFromView, ...mergedFilters];
    } else if (!nonAllCommonDateFilterFromView) {
        // set common date to All based on filter view
        return mergedFilters.filter((filter) => !isCommonDateFilter(filter));
    }

    return mergedFilters;
};

/**
 * Applies the view filter's type and values to the dashboard filter,
 * preserving the dashboard filter's config (title, filterElementsBy,
 * filterElementsByDate, validateElementsBy) and taking only selection
 * fields from the view. Handles type changes between arbitrary and match filters.
 */
const applyTextFilterFromView = (
    dashboardFilter: DashboardTextAttributeFilter,
    viewFilter: DashboardTextAttributeFilter,
): DashboardTextAttributeFilter => {
    const dashboardFilterTitle = dashboardAttributeFilterItemTitle(dashboardFilter);

    if (isDashboardArbitraryAttributeFilter(viewFilter)) {
        const dashboardArbitrary = isDashboardArbitraryAttributeFilter(dashboardFilter)
            ? dashboardFilter.arbitraryAttributeFilter
            : undefined;
        return {
            arbitraryAttributeFilter: {
                ...viewFilter.arbitraryAttributeFilter,
                title: dashboardFilterTitle,
                filterElementsBy: dashboardArbitrary?.filterElementsBy,
                filterElementsByDate: dashboardArbitrary?.filterElementsByDate,
                validateElementsBy: dashboardArbitrary?.validateElementsBy,
            },
        };
    }
    if (isDashboardMatchAttributeFilter(viewFilter)) {
        return {
            matchAttributeFilter: {
                ...viewFilter.matchAttributeFilter,
                title: dashboardFilterTitle,
            },
        };
    }
    return viewFilter;
};

type DisplayAsLabelUpdate = { displayAsLabel: ObjRef | undefined };

/**
 * Applies displayAsLabel config updates to attribute filter configs after cross-type filter replacement.
 */
function applyConfigUpdates(
    configs: IDashboardAttributeFilterConfig[] | undefined,
    updates: Map<string, DisplayAsLabelUpdate>,
): IDashboardAttributeFilterConfig[] | undefined {
    if (updates.size === 0) {
        return configs;
    }
    return (configs ?? []).map((config) => {
        const update = updates.get(config.localIdentifier);
        return update ? { ...config, displayAsLabel: update.displayAsLabel } : config;
    });
}

interface IFilterContextSelectionResult {
    filterContext: IFilterContext;
    configUpdates: Map<string, DisplayAsLabelUpdate>;
}

export const changeFilterContextSelection = (
    filterContext: IFilterContext,
    filterViewFilters: FilterContextItem[],
    attributeFilterConfigs?: IDashboardAttributeFilterConfig[],
): IFilterContextSelectionResult => {
    const configsMap = new Map(
        (attributeFilterConfigs ?? []).map((config) => [config.localIdentifier, config]),
    );
    const configUpdates = new Map<string, DisplayAsLabelUpdate>();
    const mergedFilters: FilterContextItem[] = filterContext.filters.map((filter) => {
        if (isDashboardAttributeFilter(filter)) {
            const filterLocalId = filter.attributeFilter.localIdentifier;
            const filterConfig = filterLocalId ? configsMap.get(filterLocalId) : undefined;
            const configSelectionType = filterConfig?.selectionType;

            // Try same-type (list) match first
            const viewFilter = findMatchingAttributeFilterByLocalIdentifier(filter, filterViewFilters);
            if (
                viewFilter !== undefined &&
                hasSameAttributeFilterConfiguration(filter, viewFilter) &&
                isFilterTypeCompatibleWithSelectionType("list", configSelectionType, "list")
            ) {
                return {
                    attributeFilter: {
                        ...filter.attributeFilter,
                        attributeElements: viewFilter.attributeFilter.attributeElements,
                        negativeSelection: viewFilter.attributeFilter.negativeSelection,
                    },
                };
            }

            // Try cross-type (text) match if selectionType allows text
            if (
                filterLocalId &&
                isFilterTypeCompatibleWithSelectionType("text", configSelectionType, "list")
            ) {
                const viewTextFilter = findMatchingAttributeFilterItemByLocalIdentifier(
                    filterLocalId,
                    filterViewFilters,
                );
                if (
                    viewTextFilter &&
                    isDashboardTextAttributeFilter(viewTextFilter) &&
                    hasSameCrossTypeFilterConfiguration(filter, viewTextFilter, filterConfig)
                ) {
                    // List → text: update displayAsLabel to text filter's displayForm
                    configUpdates.set(filterLocalId, {
                        displayAsLabel: dashboardAttributeFilterItemDisplayForm(viewTextFilter),
                    });
                    return viewTextFilter;
                }
            }

            // No compatible match found, reset
            return {
                attributeFilter: {
                    ...filter.attributeFilter,
                    attributeElements: {
                        uris: [],
                    },
                    negativeSelection: true,
                },
            };
        } else if (isDashboardDateFilter(filter)) {
            const viewFilter = findMatchingDateFilterByDataSet(filter, filterViewFilters);
            if (viewFilter) {
                return {
                    dateFilter: {
                        ...filter.dateFilter,
                        from: viewFilter.dateFilter.from,
                        to: viewFilter.dateFilter.to,
                        granularity: viewFilter.dateFilter.granularity,
                        type: viewFilter.dateFilter.type,
                    },
                };
            } else {
                return {
                    // reset filter that has not been found in the view
                    dateFilter: {
                        ...filter.dateFilter,
                        from: undefined,
                        to: undefined,
                        granularity: "GDC.time.date",
                        type: "relative",
                    },
                };
            }
        } else if (isDashboardTextAttributeFilter(filter)) {
            const filterLocalId = dashboardAttributeFilterItemLocalIdentifier(filter);
            const filterConfig = filterLocalId ? configsMap.get(filterLocalId) : undefined;
            const configSelectionType = filterConfig?.selectionType;

            // Try same-type (text) match first
            if (isFilterTypeCompatibleWithSelectionType("text", configSelectionType, "text")) {
                const viewFilter = findMatchingTextFilterByLocalIdentifier(filter, filterViewFilters);
                if (viewFilter !== undefined && hasSameTextFilterConfiguration(filter, viewFilter)) {
                    return applyTextFilterFromView(filter, viewFilter);
                }
            }

            // Try cross-type (list) match if selectionType allows list
            if (
                filterLocalId &&
                isFilterTypeCompatibleWithSelectionType("list", configSelectionType, "text")
            ) {
                const viewListFilter = findMatchingAttributeFilterItemByLocalIdentifier(
                    filterLocalId,
                    filterViewFilters,
                );
                if (
                    viewListFilter &&
                    isDashboardAttributeFilter(viewListFilter) &&
                    hasSameCrossTypeFilterConfiguration(filter, viewListFilter, filterConfig)
                ) {
                    // Text → list: set displayAsLabel to the text filter's displayForm
                    configUpdates.set(filterLocalId, {
                        displayAsLabel: dashboardAttributeFilterItemDisplayForm(filter),
                    });
                    return viewListFilter;
                }
            }

            // No compatible match found, reset
            return createResetTextFilter(filter);
        } else {
            return filter;
        }
    });

    return {
        filterContext: {
            ...filterContext,
            filters: handleCommonDateFilter(filterContext.filters, filterViewFilters, mergedFilters),
        },
        configUpdates,
    };
};

export function applyDefaultFilterView(
    dashboard: IDashboard,
    filterViews: IDashboardFilterView[],
    settings: ISettings,
): IDashboard {
    const areFilterViewsEnabled = settings.enableDashboardFilterViews;

    if (!areFilterViewsEnabled) {
        return dashboard;
    }

    // If dashboard has tabs, apply default views per tab
    if (dashboard.tabs && dashboard.tabs.length > 0) {
        // Find legacy global default view (without tabLocalIdentifier) as fallback for first tab
        const legacyDefaultView = filterViews.find((view) => view.isDefault && !view.tabLocalIdentifier);

        const updatedTabs = dashboard.tabs.map((tab, index) => {
            // Find default view specific to this tab
            const tabDefaultView = filterViews.find(
                (view) => view.isDefault && view.tabLocalIdentifier === tab.localIdentifier,
            );

            // Use tab-specific default, or fall back to legacy global default only for the first tab
            const isFirstTab = index === 0;
            const effectiveDefaultView = tabDefaultView ?? (isFirstTab ? legacyDefaultView : undefined);

            if (effectiveDefaultView && tab.filterContext && isFilterContext(tab.filterContext)) {
                const { filterContext: updatedFilterContext, configUpdates } = changeFilterContextSelection(
                    tab.filterContext,
                    effectiveDefaultView.filterContext.filters,
                    tab.attributeFilterConfigs,
                );
                return {
                    ...tab,
                    filterContext: updatedFilterContext,
                    attributeFilterConfigs: applyConfigUpdates(tab.attributeFilterConfigs, configUpdates),
                };
            }

            return tab;
        });

        return {
            ...dashboard,
            tabs: updatedTabs,
        };
    }

    // Legacy behavior: apply default view to root-level filter context
    const defaultFilterView = filterViews.find((view) => view.isDefault);

    if (defaultFilterView && isFilterContext(dashboard.filterContext)) {
        const { filterContext: updatedFilterContext, configUpdates } = changeFilterContextSelection(
            dashboard.filterContext,
            defaultFilterView.filterContext.filters,
            dashboard.attributeFilterConfigs,
        );
        return {
            ...dashboard,
            filterContext: updatedFilterContext,
            attributeFilterConfigs: applyConfigUpdates(dashboard.attributeFilterConfigs, configUpdates),
        };
    }

    return dashboard;
}
