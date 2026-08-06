// (C) 2025-2026 GoodData Corporation

import { compact } from "lodash-es";

import { NotSupported } from "@gooddata/sdk-backend-spi";
import {
    type DateFilterGranularity,
    type FilterContextItem,
    type IAutomationVisibleFilter,
    type IFilter,
    type IInsight,
    type ObjRefInScope,
    attributeLocalId,
    dashboardFilterLocalIdentifier,
    filterAttributeElements,
    filterLocalIdentifier,
    filterObjRef,
    hasMeasureValueFilterConditions,
    insightAttributes,
    isAbsoluteDateFilter,
    isAllDashboardMeasureValueFilter,
    isAllTimeDateFilter,
    isAllValuesAttributeFilter,
    isAllValuesDashboardAttributeFilter,
    isArbitraryAttributeFilter,
    isAttributeFilterWithSelection,
    isDashboardDateFilter,
    isDashboardMeasureValueFilter,
    isDateFilter,
    isInsightWidget,
    isLocalIdRef,
    isMatchAttributeFilter,
    isMeasureValueFilter,
    isNegativeAttributeFilter,
    isNoopAllTimeDashboardDateFilter,
    isObjRef,
    isRelativeBoundedDateFilter,
    isRelativeDateFilter,
    measureValueFilterConditions,
    measureValueFilterMeasure,
    mergeFilters,
    newAbsoluteDashboardDateFilter,
    newAllTimeDashboardDateFilter,
    newRelativeDashboardDateFilter,
} from "@gooddata/sdk-model";

import { filterContextItemsToDashboardFiltersByWidget } from "../../../../converters/filterConverters.js";
import { type ExtendedDashboardWidget } from "../../../../model/types/layoutTypes.js";
import { removeIgnoredWidgetFilters } from "../../../../model/utils/widgetFilters.js";
import { type IDashboardFilter } from "../../../../types.js";

export const getVisibleFiltersByFilters = (
    selectedFilters: FilterContextItem[] | undefined,
    visibleFiltersMetadata: IAutomationVisibleFilter[] | undefined,
    storeFilters?: boolean,
): IAutomationVisibleFilter[] | undefined => {
    if (!storeFilters) {
        return undefined;
    }

    const filters = (selectedFilters ?? [])
        // Strip noop "All values" attribute filters and "All" measure value filters —
        // they have no effect on execution and should not be stored in visible filters metadata.
        .filter(
            (filter) =>
                !isAllValuesDashboardAttributeFilter(filter) && !isAllDashboardMeasureValueFilter(filter),
        )
        .map((selectedFilter) => {
            const selectedLocalIdentifier = dashboardFilterLocalIdentifier(selectedFilter);
            const targetFilter = (visibleFiltersMetadata ?? []).find((visibleFilter) => {
                return selectedLocalIdentifier === visibleFilter.localIdentifier;
            });

            if (targetFilter && isDashboardDateFilter(selectedFilter)) {
                return {
                    ...targetFilter,
                    // NOTE: despite the name, this flag is used to mark *noop* "All time" filters (implicit default)
                    // that are intentionally not stored in automation execution filters.
                    isAllTimeDateFilter: isNoopAllTimeDashboardDateFilter(selectedFilter),
                };
            }

            return targetFilter;
        });

    return compact(filters);
};

/**
 * Get visible filters metadata structured by tab.
 * Applies the same logic as getVisibleFiltersByFilters to each tab's filters.
 */
export const getVisibleFiltersByFiltersByTab = (
    filtersByTab: Record<string, FilterContextItem[]> | undefined,
    visibleFiltersMetadata: Record<string, IAutomationVisibleFilter[]> | undefined,
    storeFilters?: boolean,
): Record<string, IAutomationVisibleFilter[]> | undefined => {
    if (!storeFilters || !filtersByTab) {
        return undefined;
    }

    return Object.entries(filtersByTab).reduce<Record<string, IAutomationVisibleFilter[]>>(
        (acc, [tabId, tabFilters]) => {
            const visibleFilters = getVisibleFiltersByFilters(
                tabFilters,
                visibleFiltersMetadata?.[tabId],
                true,
            );
            if (visibleFilters && visibleFilters.length > 0) {
                acc[tabId] = visibleFilters;
            }
            return acc;
        },
        {},
    );
};

/**
 * Get final execution filters for the widget alert or scheduled export.
 */
export const getAppliedWidgetFilters = (
    selectedAutomationFilters: FilterContextItem[],
    dashboardHiddenFilters: FilterContextItem[],
    widget: ExtendedDashboardWidget | undefined,
    insight: IInsight | undefined,
    commonDateFilterId: string | undefined,
    mergeInsightFilters: boolean = false,
    withoutWidget: boolean = false,
) => {
    // Hidden filters are never included in selectedAutomationFilters,
    // but we need them to construct proper execution filters, so merge them.
    const selectedFiltersWithHiddenFilters = [...selectedAutomationFilters, ...dashboardHiddenFilters];

    // Now, remove ignored filters (some of the hidden filters might be ignored).
    const selectedFiltersWithoutIgnoredFilters = removeIgnoredWidgetFilters(
        selectedFiltersWithHiddenFilters,
        widget,
    );

    // Now, convert sanitized selected filters to execution filters shape.
    const selectedExecutionFilters = isInsightWidget(widget)
        ? filterContextItemsToDashboardFiltersByWidget(selectedFiltersWithoutIgnoredFilters, widget)
        : withoutWidget
          ? filterContextItemsToDashboardFiltersByWidget(selectedFiltersWithoutIgnoredFilters, undefined)
          : [];

    const filtersToUse = mergeInsightFilters
        ? mergeFilters(insight?.insight?.filters ?? [], selectedExecutionFilters, commonDateFilterId)
        : selectedExecutionFilters;

    // Resolve MVF dimensionality localIdRefs to stable identifierRefs so that
    // alert executions (which have empty attributes) don't contain dangling refs.
    const resolvedFilters = resolveMvfDimensionalityLocalRefs(filtersToUse, insight);

    // Strip noop filters - they have no effect on execution.
    return resolvedFilters.filter((filter) => {
        // Strip noop "All time" date filters (implicit default with no extra configuration).
        if (isDateFilter(filter)) {
            return !isNoopAllTimeDateFilterFixed(filter);
        }
        // Strip noop "All" measure value filters (no conditions).
        if (isMeasureValueFilter(filter)) {
            return hasMeasureValueFilterConditions(filter);
        }
        // Strip noop "All values" attribute filters (negative filter with empty exclusion list).
        return !isAllValuesAttributeFilter(filter);
    });
};

/**
 * Get final filters for the dashboard scheduled export.
 */
export const getAppliedDashboardFilters = (
    selectedAutomationFilters: FilterContextItem[],
    dashboardHiddenFilters: FilterContextItem[],
    storeFilters?: boolean,
) => {
    if (!storeFilters) {
        return undefined;
    }
    // Hidden filters are never included in selectedAutomationFilters,
    // but we need them to construct proper execution filters, so merge them.
    const selectedFiltersWithHiddenFilters = [...selectedAutomationFilters, ...dashboardHiddenFilters];

    // Strip noop filters - they have no effect on execution.
    return selectedFiltersWithHiddenFilters.filter((filter) => {
        // Strip noop "All time" date filters (implicit default with no extra configuration).
        if (isDashboardDateFilter(filter)) {
            return !isNoopAllTimeDashboardDateFilter(filter);
        }
        // Strip noop "All" measure value filters (no/empty conditions).
        if (isDashboardMeasureValueFilter(filter)) {
            return !isAllDashboardMeasureValueFilter(filter);
        }
        // Strip noop "All values" attribute filters.
        return !isAllValuesDashboardAttributeFilter(filter);
    });
};

export function dashboardFilterToFilterContextItem(
    filter: IDashboardFilter,
    keepDatasets: boolean,
): FilterContextItem | undefined {
    if (isAttributeFilterWithSelection(filter)) {
        return {
            attributeFilter: {
                negativeSelection: isNegativeAttributeFilter(filter),
                displayForm: filterObjRef(filter),
                attributeElements: filterAttributeElements(filter),
                selectionMode: "multi",
                localIdentifier: filterLocalIdentifier(filter),
            },
        };
    } else if (isArbitraryAttributeFilter(filter)) {
        return {
            arbitraryAttributeFilter: {
                displayForm: filterObjRef(filter),
                values: filter.arbitraryAttributeFilter.values,
                negativeSelection: filter.arbitraryAttributeFilter.negativeSelection ?? false,
                localIdentifier: filterLocalIdentifier(filter),
            },
        };
    } else if (isMatchAttributeFilter(filter)) {
        return {
            matchAttributeFilter: {
                displayForm: filterObjRef(filter),
                operator: filter.matchAttributeFilter.operator,
                literal: filter.matchAttributeFilter.literal,
                caseSensitive: filter.matchAttributeFilter.caseSensitive,
                negativeSelection: filter.matchAttributeFilter.negativeSelection,
                localIdentifier: filterLocalIdentifier(filter),
            },
        };
    } else if (isAbsoluteDateFilter(filter)) {
        return newAbsoluteDashboardDateFilter(
            filter.absoluteDateFilter.from,
            filter.absoluteDateFilter.to,
            keepDatasets ? filter.absoluteDateFilter.dataSet : undefined,
            filter.absoluteDateFilter.localIdentifier,
            filter.absoluteDateFilter.emptyValueHandling,
        );
    } else if (isAllTimeDateFilter(filter)) {
        return newAllTimeDashboardDateFilter(
            keepDatasets ? filter.relativeDateFilter.dataSet : undefined,
            filter.relativeDateFilter.localIdentifier,
            filter.relativeDateFilter.emptyValueHandling,
        );
    } else if (isRelativeDateFilter(filter)) {
        return newRelativeDashboardDateFilter(
            filter.relativeDateFilter.granularity as DateFilterGranularity,
            filter.relativeDateFilter.from,
            filter.relativeDateFilter.to,
            keepDatasets ? filter.relativeDateFilter.dataSet : undefined,
            filter.relativeDateFilter.localIdentifier,
            isRelativeBoundedDateFilter(filter) ? filter.relativeDateFilter.boundedFilter : undefined,
            filter.relativeDateFilter.emptyValueHandling,
        );
    } else if (isMeasureValueFilter(filter)) {
        const measure = measureValueFilterMeasure(filter);
        // Dashboard MVFs always reference the measure by ObjRef. Insight MVFs use LocalIdRef
        // (bucket localId) and have no honest representation in the dashboard filter context —
        // they reach this converter only because automation execution filters mix dashboard and
        // insight filters. Caller is responsible for dropping these undefined entries.
        if (!isObjRef(measure)) {
            return undefined;
        }
        const conditions = measureValueFilterConditions(filter);
        return {
            dashboardMeasureValueFilter: {
                measure,
                localIdentifier:
                    filter.measureValueFilter.localIdentifier ?? `mvf:${JSON.stringify(measure)}`,
                ...(conditions ? { conditions } : {}),
            },
        };
    }

    throw new NotSupported(
        `Unsupported filter type! Please provide valid dashboard filter. Filter: ${JSON.stringify(filter)}`,
    );
}

/**
 * Resolve MVF dimensionality localIdRefs to stable identifierRefs using the insight's attributes.
 *
 * Measure value filters may reference attributes in their dimensionality via localIdRef,
 * which is only meaningful within the insight's own execution context. When these filters
 * are used in an alert execution (which may not include the original attributes), the
 * localIdRefs become dangling. This function resolves them to display form identifierRefs.
 */
export function resolveMvfDimensionalityLocalRefs(
    filters: IFilter[],
    insight: IInsight | undefined,
): IFilter[] {
    if (!insight) {
        return filters;
    }

    const attributeLocalIdToDisplayForm = new Map<string, ObjRefInScope>();
    insightAttributes(insight).forEach((attribute) => {
        attributeLocalIdToDisplayForm.set(attributeLocalId(attribute), attribute.attribute.displayForm);
    });

    if (attributeLocalIdToDisplayForm.size === 0) {
        return filters;
    }

    return filters.map((filter) => {
        if (!isMeasureValueFilter(filter)) {
            return filter;
        }

        const dimensionality = filter.measureValueFilter.dimensionality;
        if (!dimensionality?.length) {
            return filter;
        }

        const resolvedDimensionality = dimensionality.map((item) => {
            if (!isLocalIdRef(item)) {
                return item;
            }
            return attributeLocalIdToDisplayForm.get(item.localIdentifier) ?? item;
        });

        const changed = dimensionality.some((item, i) => item !== resolvedDimensionality[i]);
        if (!changed) {
            return filter;
        }

        return {
            ...filter,
            measureValueFilter: {
                ...filter.measureValueFilter,
                dimensionality: resolvedDimensionality,
            },
        };
    });
}

/**
 * Matches all-time date filters that are *noop*, i.e. that have no effect on execution.
 *
 * @remarks
 * Noop all-time filters are implicit defaults and have no effect on execution. All-time filters with `emptyValueHandling`
 * are considered meaningful (they carry extra configuration) and should not be treated as no-op.
 */
export function isNoopAllTimeDateFilterFixed(f: IFilter): boolean {
    // Standard check for noop all-time date filter.
    if (isAllTimeDateFilter(f)) {
        return f.relativeDateFilter.emptyValueHandling === undefined;
    }

    // Analytical Designer may store "all-time" as a relative date filter without from/to.
    // Treat it as no-op only when it does NOT carry extra configuration (e.g. emptyValueHandling).
    if (isRelativeDateFilter(f)) {
        return (
            (f.relativeDateFilter.from === null || f.relativeDateFilter.from === undefined) &&
            (f.relativeDateFilter.to === null || f.relativeDateFilter.to === undefined) &&
            f.relativeDateFilter.emptyValueHandling === undefined
        );
    }

    // Not expected, but keep the symmetric safety behavior for absolute filters.
    if (isAbsoluteDateFilter(f)) {
        return (
            (f.absoluteDateFilter.from === null || f.absoluteDateFilter.from === undefined) &&
            (f.absoluteDateFilter.to === null || f.absoluteDateFilter.to === undefined) &&
            f.absoluteDateFilter.emptyValueHandling === undefined
        );
    }

    return false;
}
