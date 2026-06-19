// (C) 2021-2026 GoodData Corporation

// Derived from _staging/dashboard/dashboardFilterContext.ts

import { NotSupported } from "@gooddata/sdk-backend-spi";
import {
    type DateFilterGranularity,
    type FilterContextItem,
    filterAttributeElements,
    filterLocalIdentifier,
    filterObjRef,
    isAbsoluteDateFilter,
    isAllTimeDateFilter,
    isArbitraryAttributeFilter,
    isAttributeFilterWithSelection,
    isMatchAttributeFilter,
    isMeasureValueFilter,
    isNegativeAttributeFilter,
    isObjRef,
    isRelativeBoundedDateFilter,
    isRelativeDateFilter,
    measureValueFilterConditions,
    measureValueFilterMeasure,
    newAbsoluteDashboardDateFilter,
    newAllTimeDashboardDateFilter,
    newRelativeDashboardDateFilter,
} from "@gooddata/sdk-model";

import { type IDashboardFilter } from "../../../../types.js";

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
