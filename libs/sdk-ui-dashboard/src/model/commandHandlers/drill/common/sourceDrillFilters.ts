// (C) 2021-2026 GoodData Corporation

import {
    type DateFilterOfAnyType,
    type IAbsoluteGranularityDateFilter,
    type IAttributeFilter,
    type IDrillToDashboard,
    type IDrillToInsight,
    type IFilter,
    type IInsight,
    type IMeasure,
    type IParameterizedDateFilter,
    type SourceInsightFilterObjRef,
    filterMeasureRef,
    insightFilters,
    insightMeasures,
    isAbsoluteGranularityDateFilter,
    isAttributeFilter,
    isDateFilterOfAnyType,
    isMeasureValueFilter,
    isParameterizedDateFilter,
    isRankingFilter,
} from "@gooddata/sdk-model";

import { ABSOLUTE_GRANULARITY_DATE_FILTER_DRILL_TO_DASHBOARD_NOT_SUPPORTED } from "../../../../_staging/dashboard/absoluteGranularityDateFilters.js";
import { PARAMETERIZED_DATE_FILTER_NOT_SUPPORTED } from "../../../../_staging/dashboard/parameterizedDateFilters.js";
import {
    getSourceMeasureFiltersForDrillDefinition,
    isMatchingSourceInsightFilter,
    resolveSourceMeasureRef,
} from "../../../../_staging/drills/drillingUtils.js";

import { type SourceFilter } from "./mergeFilters.js";

type IDrillDefinitionWithIncludedSourceFilters = Pick<
    IDrillToDashboard | IDrillToInsight,
    "origin" | "includedSourceInsightFiltersObjRefs" | "includedSourceMeasureFiltersObjRefs"
>;

export function getIncludedSourceInsightFilters(
    sourceInsight: IInsight | null,
    includedSourceInsightFiltersObjRefs: SourceInsightFilterObjRef[],
): IFilter[] {
    const sourceFilters = sourceInsight
        ? insightFilters(sourceInsight).filter(
              (filter) =>
                  isAttributeFilter(filter) ||
                  isDateFilterOfAnyType(filter) ||
                  isMeasureValueFilter(filter) ||
                  isRankingFilter(filter),
          )
        : [];

    return includedSourceFilters(sourceFilters, includedSourceInsightFiltersObjRefs);
}

export function getIncludedSourceMeasureFilters(
    sourceInsight: IInsight | null,
    drillDefinition: IDrillDefinitionWithIncludedSourceFilters,
): Array<IAttributeFilter | DateFilterOfAnyType> {
    if (!sourceInsight) {
        return [];
    }

    const sourceMeasureFilters = getSourceMeasureFiltersForDrillDefinition(
        drillDefinition,
        insightMeasures(sourceInsight),
    );

    return includedSourceFilters(
        sourceMeasureFilters,
        drillDefinition.includedSourceMeasureFiltersObjRefs ?? [],
    );
}

export function getIncludedSourceFiltersForDashboard(
    sourceInsight: IInsight | null,
    drillDefinition: IDrillDefinitionWithIncludedSourceFilters,
): Array<SourceFilter> {
    const sourceInsightMeasures = sourceInsight ? insightMeasures(sourceInsight) : [];
    const sourceMeasureFilters = getIncludedSourceMeasureFilters(sourceInsight, drillDefinition).filter(
        isSourceFilterSupportedByDashboard,
    );
    const sourceInsightFilters = getIncludedSourceInsightFilters(
        sourceInsight,
        drillDefinition.includedSourceInsightFiltersObjRefs ?? [],
    )
        .filter(
            (filter): filter is SourceFilter | IAbsoluteGranularityDateFilter | IParameterizedDateFilter => {
                return (
                    isAttributeFilter(filter) || isDateFilterOfAnyType(filter) || isMeasureValueFilter(filter)
                );
            },
        )
        .filter(isSourceFilterSupportedByDashboard)
        .flatMap((filter) => normalizeSourceFilterForDashboard(filter, sourceInsightMeasures));

    // Keep the same precedence as drill-to-insight: measure filters win over source insight filters.
    return [...sourceMeasureFilters, ...sourceInsightFilters];
}

function isSourceFilterSupportedByDashboard<T extends IFilter>(
    filter: T,
): filter is Exclude<T, IAbsoluteGranularityDateFilter | IParameterizedDateFilter> {
    if (isAbsoluteGranularityDateFilter(filter)) {
        console.warn(
            `${ABSOLUTE_GRANULARITY_DATE_FILTER_DRILL_TO_DASHBOARD_NOT_SUPPORTED} Skipping a source insight filter.`,
            filter,
        );
        return false;
    }
    if (isParameterizedDateFilter(filter)) {
        console.warn(`Skipping a source insight filter. ${PARAMETERIZED_DATE_FILTER_NOT_SUPPORTED}`, filter);
        return false;
    }
    return true;
}

function normalizeSourceFilterForDashboard(
    filter: SourceFilter,
    sourceInsightMeasures: IMeasure[],
): SourceFilter[] {
    if (!isMeasureValueFilter(filter)) {
        return [filter];
    }

    const measureRef = resolveSourceMeasureRef(filterMeasureRef(filter), sourceInsightMeasures);
    if (!measureRef) {
        return [];
    }

    return [
        {
            measureValueFilter: {
                ...filter.measureValueFilter,
                measure: measureRef,
            },
        },
    ];
}

function includedSourceFilters<T extends IFilter>(
    sourceFilters: T[],
    includedFilterObjRefs: SourceInsightFilterObjRef[],
): T[] {
    return sourceFilters.filter((sourceFilter) => {
        return includedFilterObjRefs.some((includedFilterObjRef) =>
            isMatchingSourceInsightFilter(sourceFilter, includedFilterObjRef),
        );
    });
}
