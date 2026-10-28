// (C) 2024-2026 GoodData Corporation

import { isEqual, omit } from "lodash-es";

import {
    type IAttributeWithReferences,
    type IUnavailableDashboardReference,
} from "@gooddata/sdk-backend-spi";
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
    type IDashboardMeasureValueFilter,
    type IDashboardParameter,
    type IFilterContext,
    type ObjRef,
    areObjRefsEqual,
    dashboardAttributeFilterItemDisplayForm,
    dashboardAttributeFilterItemFilterElementsBy,
    dashboardAttributeFilterItemFilterElementsByDate,
    dashboardAttributeFilterItemLocalIdentifier,
    dashboardAttributeFilterItemTitle,
    dashboardAttributeFilterItemValidateElementsBy,
    dashboardFilterLocalIdentifier,
    dashboardMeasureValueFilterLocalIdentifier,
    isDashboardArbitraryAttributeFilter,
    isDashboardAttributeFilter,
    isDashboardAttributeFilterItem,
    isDashboardCommonDateFilter,
    isDashboardDateFilter,
    isDashboardMatchAttributeFilter,
    isDashboardMeasureValueFilter,
    isDashboardTextAttributeFilter,
    isExportOverrideFilterContext,
    isFilterContext,
    isSingleSelectionFilter,
} from "@gooddata/sdk-model";

import { type RenderMode } from "../../../../types.js";
import { filterLocalIdentifiers } from "../../../store/filtering/dashboardFilterSelectors.js";
import { getRestrictedDashboardFilters } from "../../../store/filtering/restrictedFilterUtils.js";
import {
    applyMirroredFilterValue,
    findCounterpartFilter,
} from "../../../store/tabs/filterContext/filterSync.js";
import { type ITabState } from "../../../store/tabs/tabsState.js";
import { isFilterTypeCompatibleWithSelectionType } from "../../../utils/attributeFilterSelectionTypeCompatibility.js";

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

// MVF: match only when both localIdentifier and the referenced metric agree.
// The metric ref is set in edit mode and not changeable in view mode, so a localId
// collision with a different metric must not import stale conditions.
const findMatchingMeasureValueFilter = (
    filter: IDashboardMeasureValueFilter,
    viewFilters: FilterContextItem[],
): IDashboardMeasureValueFilter | undefined =>
    viewFilters.find(
        (item): item is IDashboardMeasureValueFilter =>
            isDashboardMeasureValueFilter(item) &&
            dashboardMeasureValueFilterLocalIdentifier(item) ===
                dashboardMeasureValueFilterLocalIdentifier(filter) &&
            areObjRefsEqual(
                item.dashboardMeasureValueFilter.measure,
                filter.dashboardMeasureValueFilter.measure,
            ),
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
    restrictedLocalIdentifiers: ReadonlySet<string>,
    attributeFilterConfigs?: IDashboardAttributeFilterConfig[],
): IFilterContextSelectionResult => {
    const configsMap = new Map(
        (attributeFilterConfigs ?? []).map((config) => [config.localIdentifier, config]),
    );
    const configUpdates = new Map<string, DisplayAsLabelUpdate>();
    const mergedFilters: FilterContextItem[] = filterContext.filters.map((filter) => {
        // a restricted filter keeps its stored value
        if (restrictedLocalIdentifiers.has(dashboardFilterLocalIdentifier(filter) ?? "")) {
            return filter;
        }
        if (isDashboardAttributeFilter(filter)) {
            const filterLocalId = filter.attributeFilter.localIdentifier;
            const filterConfig = filterLocalId ? configsMap.get(filterLocalId) : undefined;
            const configSelectionType = filterConfig?.selectionType;

            // Try same-type (list) match first
            const viewFilter = findMatchingAttributeFilterByLocalIdentifier(filter, filterViewFilters);
            const listDefaultSelectionType = isSingleSelectionFilter(filter) ? "list" : undefined;
            if (
                viewFilter !== undefined &&
                hasSameAttributeFilterConfiguration(filter, viewFilter) &&
                isFilterTypeCompatibleWithSelectionType("list", configSelectionType, listDefaultSelectionType)
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
                isFilterTypeCompatibleWithSelectionType("text", configSelectionType, listDefaultSelectionType)
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
            if (isFilterTypeCompatibleWithSelectionType("text", configSelectionType)) {
                const viewFilter = findMatchingTextFilterByLocalIdentifier(filter, filterViewFilters);
                if (viewFilter !== undefined && hasSameTextFilterConfiguration(filter, viewFilter)) {
                    return applyTextFilterFromView(filter, viewFilter);
                }
            }

            // Try cross-type (list) match if selectionType allows list
            if (filterLocalId && isFilterTypeCompatibleWithSelectionType("list", configSelectionType)) {
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
        } else if (isDashboardMeasureValueFilter(filter)) {
            const viewFilter = findMatchingMeasureValueFilter(filter, filterViewFilters);
            if (viewFilter) {
                return {
                    dashboardMeasureValueFilter: {
                        ...filter.dashboardMeasureValueFilter,
                        conditions: viewFilter.dashboardMeasureValueFilter.conditions,
                    },
                };
            }
            // reset MVF that has not been found in the view to "All" (empty conditions)
            return {
                dashboardMeasureValueFilter: {
                    ...filter.dashboardMeasureValueFilter,
                    conditions: [],
                },
            };
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

type DashboardTab = NonNullable<IDashboard["tabs"]>[number];

/**
 * @internal
 */
export interface IApplyDefaultFilterViewOptions {
    /**
     * When true, the default view of the tab the dashboard opens on initializes the filters shared by
     * every tab. The other tabs' own default views are applied on their first visit instead.
     */
    readonly persistFiltersAcrossTabs?: boolean;
    /**
     * Tab the dashboard opens on. Defaults to the first tab.
     */
    readonly activeTabLocalIdentifier?: string;
    /**
     * Attributes of the attribute filters, with their display forms. The view of the active tab is
     * written to the filters of the other tabs that filter the same attribute, which only equal display
     * form refs identify without them.
     */
    readonly attributesWithReferences?: IAttributeWithReferences[];
}

/**
 * True when applying the default filter view writes it to other tabs, so the attributes of the attribute
 * filters are needed to match the filters of the tabs, see {@link IApplyDefaultFilterViewOptions}.
 *
 * @internal
 */
export function isDefaultFilterViewSharedAcrossTabs(
    dashboard: IDashboard,
    filterViews: IDashboardFilterView[],
    renderMode: RenderMode,
    options: IApplyDefaultFilterViewOptions,
): boolean {
    const tabs = dashboard.tabs ?? [];
    if (renderMode === "edit" || !options.persistFiltersAcrossTabs || tabs.length < 2) {
        return false;
    }
    const sourceIndex = Math.max(
        0,
        tabs.findIndex((tab) => tab.localIdentifier === options.activeTabLocalIdentifier),
    );
    return !!findTabDefaultFilterView(filterViews, tabs[sourceIndex].localIdentifier, sourceIndex === 0);
}

/**
 * The default filter view of a tab. A legacy default view, saved without a tab, belongs to the first tab.
 *
 * @internal
 */
export function findTabDefaultFilterView(
    filterViews: IDashboardFilterView[],
    tabLocalIdentifier: string,
    isFirstTab: boolean,
): IDashboardFilterView | undefined {
    const tabDefaultView = filterViews.find(
        (view) => view.isDefault && view.tabLocalIdentifier === tabLocalIdentifier,
    );
    if (tabDefaultView || !isFirstTab) {
        return tabDefaultView;
    }
    return filterViews.find((view) => view.isDefault && !view.tabLocalIdentifier);
}

/**
 * Applies the user's default filter view for the given render mode. The view is the user's own starting
 * point for viewing; edit mode starts from the saved filters, otherwise the view's selection would make
 * the dashboard dirty and get saved into it.
 */
export function applyDefaultFilterViewForRenderMode(
    dashboard: IDashboard,
    filterViews: IDashboardFilterView[],
    exportId: string | undefined,
    unavailableObjects: ReadonlyArray<IUnavailableDashboardReference>,
    renderMode: RenderMode,
    options?: IApplyDefaultFilterViewOptions,
): IDashboard {
    return renderMode === "edit"
        ? dashboard
        : applyDefaultFilterView(dashboard, filterViews, exportId, unavailableObjects, options);
}

export function applyDefaultFilterView(
    dashboard: IDashboard,
    filterViews: IDashboardFilterView[],
    exportId: string | undefined,
    unavailableObjects: ReadonlyArray<IUnavailableDashboardReference>,
    options: IApplyDefaultFilterViewOptions = {},
): IDashboard {
    // In an export render, the loaded filter context may be synthesized from export metadata,
    // carrying the filters captured at export-request time (they replace the persisted context on
    // the root and on every tab). The user's default filter view must not clobber those filters
    // (or parameters). Exports whose metadata supplied no filters keep the persisted context and
    // get the default view applied as usual.
    if (isExportOverrideFilterContext(dashboard.filterContext, exportId)) {
        return dashboard;
    }

    if (dashboard.tabs && dashboard.tabs.length > 0) {
        if (options.persistFiltersAcrossTabs) {
            return applyDefaultFilterViewToSharedTabs(
                dashboard,
                dashboard.tabs,
                filterViews,
                unavailableObjects,
                options.activeTabLocalIdentifier,
                options.attributesWithReferences,
            );
        }

        return {
            ...dashboard,
            tabs: dashboard.tabs.map((tab, index) =>
                applyFilterViewToTab(
                    tab,
                    findTabDefaultFilterView(filterViews, tab.localIdentifier, index === 0),
                    unavailableObjects,
                ),
            ),
        };
    }

    // Legacy behavior: apply default view to root-level filter context
    const defaultFilterView = filterViews.find((view) => view.isDefault);

    if (defaultFilterView && isFilterContext(dashboard.filterContext)) {
        const { filterContext: updatedFilterContext, configUpdates } = changeFilterContextSelection(
            dashboard.filterContext,
            defaultFilterView.filterContext.filters,
            filterLocalIdentifiers(
                getRestrictedDashboardFilters(dashboard.filterContext.filters, unavailableObjects),
            ),
            dashboard.attributeFilterConfigs,
        );
        return {
            ...dashboard,
            filterContext: updatedFilterContext,
            attributeFilterConfigs: applyConfigUpdates(dashboard.attributeFilterConfigs, configUpdates),
            parameters: applyFilterViewParameterValues(dashboard.parameters, defaultFilterView.parameters),
        };
    }

    return dashboard;
}

function applyFilterViewToTab(
    tab: DashboardTab,
    filterView: IDashboardFilterView | undefined,
    unavailableObjects: ReadonlyArray<IUnavailableDashboardReference>,
): DashboardTab {
    const parameters = applyFilterViewParameterValues(tab.parameters, filterView?.parameters);

    if (filterView && tab.filterContext && isFilterContext(tab.filterContext)) {
        const { filterContext: updatedFilterContext, configUpdates } = changeFilterContextSelection(
            tab.filterContext,
            filterView.filterContext.filters,
            filterLocalIdentifiers(
                getRestrictedDashboardFilters(tab.filterContext.filters, unavailableObjects),
            ),
            tab.attributeFilterConfigs,
        );
        return {
            ...tab,
            ...(parameters === undefined ? {} : { parameters }),
            filterContext: updatedFilterContext,
            attributeFilterConfigs: applyConfigUpdates(tab.attributeFilterConfigs, configUpdates),
        };
    }

    return parameters === undefined ? tab : { ...tab, parameters };
}

/**
 * Applies the default view of the active tab to it and writes the resulting values to the same logical
 * filters and parameters of every other tab, the way a filter change is mirrored while filters persist
 * across tabs. Filters that exist on one tab only keep their own value.
 */
function applyDefaultFilterViewToSharedTabs(
    dashboard: IDashboard,
    tabs: DashboardTab[],
    filterViews: IDashboardFilterView[],
    unavailableObjects: ReadonlyArray<IUnavailableDashboardReference>,
    activeTabLocalIdentifier: string | undefined,
    attributesWithReferences: IAttributeWithReferences[] | undefined,
): IDashboard {
    const sourceIndex = Math.max(
        0,
        tabs.findIndex((tab) => tab.localIdentifier === activeTabLocalIdentifier),
    );
    const source = tabs[sourceIndex];
    const filterView = findTabDefaultFilterView(filterViews, source.localIdentifier, sourceIndex === 0);
    if (!filterView) {
        return dashboard;
    }

    const updatedSource = applyFilterViewToTab(source, filterView, unavailableObjects);
    return {
        ...dashboard,
        tabs: tabs.map((tab) =>
            tab === source
                ? updatedSource
                : mirrorTabSelection(
                      source,
                      updatedSource,
                      tab,
                      filterView,
                      unavailableObjects,
                      attributesWithReferences,
                  ),
        ),
    };
}

function mirrorTabSelection(
    sourceBefore: DashboardTab,
    sourceAfter: DashboardTab,
    target: DashboardTab,
    filterView: IDashboardFilterView,
    unavailableObjects: ReadonlyArray<IUnavailableDashboardReference>,
    attributesWithReferences: IAttributeWithReferences[] | undefined,
): DashboardTab {
    const parameters = applyFilterViewParameterValues(target.parameters, filterView.parameters);
    const withParameters = parameters === undefined ? target : { ...target, parameters };

    if (
        !isFilterContext(sourceBefore.filterContext) ||
        !isFilterContext(sourceAfter.filterContext) ||
        !isFilterContext(target.filterContext)
    ) {
        return withParameters;
    }

    const sourceRestricted = filterLocalIdentifiers(
        getRestrictedDashboardFilters(sourceBefore.filterContext.filters, unavailableObjects),
    );
    const targetRestricted = filterLocalIdentifiers(
        getRestrictedDashboardFilters(target.filterContext.filters, unavailableObjects),
    );
    const isRestricted = (restricted: ReadonlySet<string>, filter: FilterContextItem) =>
        restricted.has(dashboardFilterLocalIdentifier(filter) ?? "");

    const sourceState = toTabSyncState(sourceBefore, sourceBefore.filterContext);
    const targetState = toTabSyncState(target, target.filterContext);

    const replacements = new Map<FilterContextItem, FilterContextItem>();
    for (const before of sourceBefore.filterContext.filters) {
        if (isCommonDateFilter(before) || isRestricted(sourceRestricted, before)) {
            continue;
        }
        const after = findSameTabFilter(sourceAfter.filterContext.filters, before);
        // a list and a text filter hold incompatible values, and their configs stay on their own tab
        if (!after || isDashboardTextAttributeFilter(before) !== isDashboardTextAttributeFilter(after)) {
            continue;
        }
        const counterpart = findCounterpartFilter(sourceState, before, targetState, attributesWithReferences);
        if (counterpart && !isRestricted(targetRestricted, counterpart)) {
            replacements.set(counterpart, applyMirroredFilterValue(after, counterpart));
        }
    }

    const mirroredFilters = target.filterContext.filters
        .filter((filter) => !isCommonDateFilter(filter))
        .map((filter) => replacements.get(filter) ?? filter);
    // the common date filter is all time when it is absent, so it is shared even without a counterpart
    const sourceCommonDate = sourceAfter.filterContext.filters.find(isDashboardCommonDateFilter);
    const targetCommonDate = target.filterContext.filters.find(isDashboardCommonDateFilter);
    const commonDate = sourceCommonDate
        ? targetCommonDate
            ? applyMirroredFilterValue(sourceCommonDate, targetCommonDate)
            : { dateFilter: omit(sourceCommonDate.dateFilter, ["localIdentifier"]) }
        : undefined;

    return {
        ...withParameters,
        filterContext: {
            ...target.filterContext,
            filters: commonDate ? [commonDate, ...mirroredFilters] : mirroredFilters,
        },
    };
}

/**
 * The filter of the same tab that `filter` was before a filter view changed its value.
 */
function findSameTabFilter(
    filters: FilterContextItem[],
    filter: FilterContextItem,
): FilterContextItem | undefined {
    if (isDashboardDateFilter(filter)) {
        return findMatchingDateFilterByDataSet(filter, filters);
    }
    const localIdentifier = dashboardFilterLocalIdentifier(filter);
    return localIdentifier
        ? filters.find((item) => dashboardFilterLocalIdentifier(item) === localIdentifier)
        : undefined;
}

/**
 * The tab state that the cross-tab filter matching reads. Display form metadata comes from the
 * attributes passed to the matching, as the tab state does not hold it yet.
 */
function toTabSyncState(tab: DashboardTab, filterContext: IFilterContext): ITabState {
    return {
        localIdentifier: tab.localIdentifier,
        filterContext: { filtersWithInvalidSelection: [], filterContextDefinition: filterContext },
        attributeFilterConfigs: { attributeFilterConfigs: tab.attributeFilterConfigs },
    };
}

/**
 * Default filter views are applied before tab parameters are hydrated into runtime state.
 * Copy captured filter view values into matching dashboard parameters so hydration initializes chips
 * from the default view.
 */
function applyFilterViewParameterValues(
    dashboardParameters: IDashboardParameter[] | undefined,
    filterViewParameters: IDashboardParameter[] | undefined,
): IDashboardParameter[] | undefined {
    if (!dashboardParameters || !filterViewParameters || filterViewParameters.length === 0) {
        return dashboardParameters;
    }

    return dashboardParameters.map((parameter) => {
        const filterViewParameter = filterViewParameters.find((item) =>
            areObjRefsEqual(item.ref, parameter.ref),
        );
        if (!filterViewParameter) {
            return parameter;
        }
        if (filterViewParameter.value === undefined) {
            return omit(parameter, ["value"]);
        }
        return { ...parameter, value: filterViewParameter.value };
    });
}
