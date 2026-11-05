// (C) 2026 GoodData Corporation

import { type IAttributeWithReferences } from "@gooddata/sdk-backend-spi";
import {
    DashboardDateFilterConfigModeValues,
    type FilterContextItem,
    type IDashboardAttributeFilterConfig,
    type IDashboardDateFilterConfig,
    type IDashboardDateFilterConfigItem,
    type IDashboardMeasureValueFilterConfig,
    type IFilterContextDefinition,
    isDashboardArbitraryAttributeFilter,
    isDashboardAttributeFilter,
    isDashboardAttributeFilterItem,
    isDashboardCommonDateFilter,
    isDashboardMatchAttributeFilter,
    isNoopAllTimeDashboardDateFilter,
} from "@gooddata/sdk-model";

import {
    type IDashboardFilterMergeConfig,
    type ValidationResult,
    mergeFilterContextFilters,
} from "../../../../_staging/dashboard/dashboardFilterContextValidation.js";
import {
    applyMirroredFilterValue,
    findCounterpartFilter,
    targetAcceptsAttributeFilterValue,
} from "../../../store/tabs/filterContext/filterSync.js";
import { type ITabState } from "../../../store/tabs/tabsState.js";

/**
 * Tabs the embed-url filter overrides are fitted to.
 *
 * The overrides are the filter context of the tab the link was copied on. Their local identifiers
 * belong to that tab. Another tab's widgets and filter configuration bind the same logical filter
 * by its own local identifier, so copying the identifier leaves that tab's charts unfiltered.
 */
interface IOverrideFilterTab {
    readonly localIdentifier: string;
    readonly filterContext?: { readonly filters: readonly FilterContextItem[] };
    readonly attributeFilterConfigs?: IDashboardAttributeFilterConfig[];
    readonly dateFilterConfig?: IDashboardDateFilterConfig;
    readonly dateFilterConfigs?: IDashboardDateFilterConfigItem[];
    readonly measureValueFilterConfigs?: IDashboardMeasureValueFilterConfig[];
}

/**
 * Override filters to merge into each tab.
 *
 * The tab the dashboard opens on receives the overrides unchanged. When filters persist across tabs,
 * every other tab receives the same values on its own counterpart filters. A tab is absent from the
 * result when it keeps its saved filters.
 *
 * @internal
 */
export function resolveOverrideFiltersByTab(
    tabs: readonly IOverrideFilterTab[],
    overrideFilters: FilterContextItem[] | undefined,
    activeTabLocalIdentifier: string | undefined,
    persistFiltersAcrossTabs: boolean,
    attributesWithReferences?: IAttributeWithReferences[],
): Record<string, FilterContextItem[] | undefined> {
    if (!overrideFilters) {
        return {};
    }

    const activeId = activeTabLocalIdentifier ?? tabs[0]?.localIdentifier;
    const active = tabs.find((tab) => tab.localIdentifier === activeId) ?? tabs[0];
    if (!active) {
        return {};
    }

    const share = persistFiltersAcrossTabs && overrideFilters.length > 0 && tabs.length > 1;
    return Object.fromEntries(
        tabs.flatMap((tab) => {
            if (tab.localIdentifier === active.localIdentifier) {
                return [[tab.localIdentifier, overrideFilters]];
            }
            if (!share) {
                return [];
            }
            return [
                [
                    tab.localIdentifier,
                    retargetOverrideFilters(active, tab, overrideFilters, attributesWithReferences),
                ],
            ];
        }),
    );
}

/**
 * Merges override filters into a tab and applies a common date override that the saved filter
 * context cannot match.
 *
 * All time is stored as the absence of the common date filter, and the filter's local identifier
 * differs between tabs, so {@link mergeFilterContextFilters} drops the override. The common date
 * value is then written onto the tab's own filter, or added when the tab is all time.
 *
 * @internal
 */
export function mergeDashboardOverrideFilters(
    originalFilters: FilterContextItem[],
    overrideFilters: FilterContextItem[],
    config: IDashboardFilterMergeConfig,
): { mergedFilters: FilterContextItem[]; validationResults: ValidationResult[] } {
    const merged = mergeFilterContextFilters(originalFilters, overrideFilters, config);
    return {
        mergedFilters: applyCommonDateOverride(
            merged.mergedFilters,
            overrideFilters,
            config.dateFilterConfig,
        ),
        validationResults: merged.validationResults,
    };
}

function applyCommonDateOverride(
    mergedFilters: FilterContextItem[],
    overrideFilters: readonly FilterContextItem[],
    dateFilterConfig: IDashboardDateFilterConfig | undefined,
): FilterContextItem[] {
    const incoming = overrideFilters.find(isDashboardCommonDateFilter);
    if (!incoming || isDateFilterLocked(dateFilterConfig)) {
        return mergedFilters;
    }

    const current = mergedFilters.find(isDashboardCommonDateFilter);
    if (current) {
        return mergedFilters.map((filter) =>
            filter === current ? applyMirroredFilterValue(incoming, current) : filter,
        );
    }
    // All time is the absence of the filter. Only a selected range, or all time that carries
    // extra configuration, is stored.
    if (isNoopAllTimeDashboardDateFilter(incoming)) {
        return mergedFilters;
    }
    return [incoming, ...mergedFilters];
}

function isDateFilterLocked(dateFilterConfig: IDashboardDateFilterConfig | undefined): boolean {
    return (
        dateFilterConfig?.mode === DashboardDateFilterConfigModeValues.HIDDEN ||
        dateFilterConfig?.mode === DashboardDateFilterConfigModeValues.READONLY
    );
}

function retargetOverrideFilters(
    source: IOverrideFilterTab,
    target: IOverrideFilterTab,
    overrideFilters: readonly FilterContextItem[],
    attributesWithReferences: IAttributeWithReferences[] | undefined,
): FilterContextItem[] {
    const sourceState = toTabState(source);
    const targetState = toTabState(target);
    const targetFilters = filtersOf(target);

    return overrideFilters.flatMap((override): FilterContextItem[] => {
        if (isDashboardCommonDateFilter(override)) {
            const targetDate = targetFilters.find(isDashboardCommonDateFilter);
            if (targetDate) {
                return [applyMirroredFilterValue(override, targetDate)];
            }
            if (isNoopAllTimeDashboardDateFilter(override)) {
                return [];
            }
            // The target is all time, so it has no local identifier to keep.
            const { localIdentifier: _localIdentifier, ...dateFilter } = override.dateFilter;
            return [{ dateFilter }];
        }

        const counterpart = findCounterpartFilter(
            sourceState,
            override,
            targetState,
            attributesWithReferences,
        );
        if (
            !counterpart ||
            (isDashboardAttributeFilterItem(counterpart) &&
                isDashboardAttributeFilterItem(override) &&
                !targetAcceptsAttributeFilterValue(targetState, counterpart, override))
        ) {
            return [];
        }
        // The merge compares display forms by reference form.
        return [withTargetDisplayForm(applyMirroredFilterValue(override, counterpart), counterpart)];
    });
}

/**
 * Uses the target filter's display form on a mirrored attribute override.
 */
function withTargetDisplayForm(mirrored: FilterContextItem, target: FilterContextItem): FilterContextItem {
    if (isDashboardAttributeFilter(mirrored) && isDashboardAttributeFilter(target)) {
        return {
            attributeFilter: {
                ...mirrored.attributeFilter,
                displayForm: target.attributeFilter.displayForm,
            },
        };
    }
    if (isDashboardMatchAttributeFilter(mirrored) && isDashboardMatchAttributeFilter(target)) {
        return {
            matchAttributeFilter: {
                ...mirrored.matchAttributeFilter,
                displayForm: target.matchAttributeFilter.displayForm,
            },
        };
    }
    if (isDashboardArbitraryAttributeFilter(mirrored) && isDashboardArbitraryAttributeFilter(target)) {
        return {
            arbitraryAttributeFilter: {
                ...mirrored.arbitraryAttributeFilter,
                displayForm: target.arbitraryAttributeFilter.displayForm,
            },
        };
    }
    return mirrored;
}

function filtersOf(tab: IOverrideFilterTab): FilterContextItem[] {
    return tab.filterContext?.filters ? [...tab.filterContext.filters] : [];
}

/**
 * The tab state that cross-tab filter matching reads.
 */
function toTabState(tab: IOverrideFilterTab): ITabState {
    const filterContextDefinition: IFilterContextDefinition = {
        title: "",
        description: "",
        filters: filtersOf(tab),
    };
    return {
        localIdentifier: tab.localIdentifier,
        filterContext: { filtersWithInvalidSelection: [], filterContextDefinition },
        attributeFilterConfigs: { attributeFilterConfigs: tab.attributeFilterConfigs },
        dateFilterConfigs: tab.dateFilterConfigs ? { dateFilterConfigs: tab.dateFilterConfigs } : undefined,
        measureValueFilterConfigs: tab.measureValueFilterConfigs
            ? { measureValueFilterConfigs: tab.measureValueFilterConfigs }
            : undefined,
    };
}
