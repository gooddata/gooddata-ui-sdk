// (C) 2021-2026 GoodData Corporation

import {
    type IAttributeFilter,
    type IDateFilter,
    type IDrillToDashboard,
    type IDrillToInsight,
    type IFilter,
    type IInsight,
    type IMeasure,
    type SourceInsightFilterObjRef,
    filterMeasureRef,
    insightFilters,
    insightMeasures,
    isAttributeFilter,
    isDateFilter,
    isMeasureValueFilter,
    isRankingFilter,
} from "@gooddata/sdk-model";

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
                  isDateFilter(filter) ||
                  isMeasureValueFilter(filter) ||
                  isRankingFilter(filter),
          )
        : [];

    return includedSourceFilters(sourceFilters, includedSourceInsightFiltersObjRefs);
}

export function getIncludedSourceMeasureFilters(
    sourceInsight: IInsight | null,
    drillDefinition: IDrillDefinitionWithIncludedSourceFilters,
): Array<IAttributeFilter | IDateFilter> {
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
    const sourceMeasureFilters = getIncludedSourceMeasureFilters(sourceInsight, drillDefinition);
    const sourceInsightFilters = getIncludedSourceInsightFilters(
        sourceInsight,
        drillDefinition.includedSourceInsightFiltersObjRefs ?? [],
    )
        .filter((filter): filter is SourceFilter => {
            return isAttributeFilter(filter) || isDateFilter(filter) || isMeasureValueFilter(filter);
        })
        .flatMap((filter) => normalizeSourceFilterForDashboard(filter, sourceInsightMeasures));

    // Keep the same precedence as drill-to-insight: measure filters win over source insight filters.
    return [...sourceMeasureFilters, ...sourceInsightFilters];
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
