// (C) 2021-2026 GoodData Corporation

import {
    type IDrillToInsight as IDrillToInsightDefinition,
    type IFilter,
    type IInsight,
    type SourceInsightFilterObjRef,
    areObjRefsEqual,
    filterObjRef,
    insightFilters,
    insightMeasures,
    insightSetFilters,
    isAttributeFilter,
    isDateFilter,
    isMeasureValueFilter,
    isRankingFilter,
} from "@gooddata/sdk-model";
import { addIntersectionFiltersToInsight } from "@gooddata/sdk-ui-ext";

import { removeIgnoredValuesFromDrillIntersection } from "./common/intersectionUtils.js";
import {
    getSourceMeasureFiltersForDrillDefinition,
    isMatchingSourceInsightFilter,
} from "../../../_staging/drills/drillingUtils.js";
import { type IDashboardDrillEvent } from "../../../types.js";

/**
 * Applies drill intersection filters that are not excluded by `drillIntersectionIgnoredAttributes`,
 * and source insight filters/source measure filters that are explicitly included by
 * `includedSourceInsightFiltersObjRefs`/`includedSourceMeasureFiltersObjRefs`.
 * Dashboard filters are handled by drill dialog itself.
 *
 * If the target insight already contains filters:
 * - attribute filters are merged with existing target filters
 * - date filters are merged unless source and target date filters point to the same dataset
 * - for the same dataset, the source date filter replaces the target date filter
 * - target measure value/ranking filters are replaced when source includes measure value or ranking filter
 */
export function addDrillFiltersToInsight(
    targetInsight: IInsight,
    sourceInsight: IInsight | null,
    drillDefinition: IDrillToInsightDefinition,
    drillEvent: IDashboardDrillEvent,
    supportsElementUris: boolean,
) {
    const intersection = drillEvent.drillContext.intersection;
    const filteredIntersection = drillDefinition.drillIntersectionIgnoredAttributes
        ? removeIgnoredValuesFromDrillIntersection(
              intersection ?? [],
              drillDefinition.drillIntersectionIgnoredAttributes ?? [],
          )
        : intersection;

    const insightWithIntersectionFilters = addIntersectionFiltersToInsight(
        targetInsight,
        filteredIntersection,
        supportsElementUris,
    );

    const insightWithSourceInsightFilters = addSourceInsightFiltersToInsight(
        insightWithIntersectionFilters,
        sourceInsight,
        drillDefinition.includedSourceInsightFiltersObjRefs ?? [],
    );

    const insightWithSourceMeasureFilters = addSourceMeasureFiltersToInsight(
        insightWithSourceInsightFilters,
        sourceInsight,
        drillDefinition,
    );

    return insightWithSourceMeasureFilters;
}

function addSourceInsightFiltersToInsight(
    targetInsight: IInsight,
    sourceInsight: IInsight | null,
    includedSourceInsightFiltersObjRefs: SourceInsightFilterObjRef[],
) {
    const sourceFilters = sourceInsight
        ? insightFilters(sourceInsight).filter(
              (filter) =>
                  isAttributeFilter(filter) ||
                  isDateFilter(filter) ||
                  isMeasureValueFilter(filter) ||
                  isRankingFilter(filter),
          )
        : [];
    const sourceFiltersToApply = includedSourceFilters(sourceFilters, includedSourceInsightFiltersObjRefs);
    const targetFilters = insightFilters(targetInsight);
    const mergedFilters = mergeInsightFilters(sourceFiltersToApply, targetFilters);
    return insightSetFilters(targetInsight, mergedFilters);
}

function addSourceMeasureFiltersToInsight(
    targetInsight: IInsight,
    sourceInsight: IInsight | null,
    drillDefinition: IDrillToInsightDefinition,
) {
    if (!sourceInsight) {
        return targetInsight;
    }

    const sourceMeasureFilters = getSourceMeasureFiltersForDrillDefinition(
        drillDefinition,
        insightMeasures(sourceInsight),
    );
    const sourceFiltersToApply = includedSourceFilters(
        sourceMeasureFilters,
        drillDefinition.includedSourceMeasureFiltersObjRefs ?? [],
    );
    const targetFilters = insightFilters(targetInsight);
    const mergedFilters = mergeInsightFilters(sourceFiltersToApply, targetFilters);
    return insightSetFilters(targetInsight, mergedFilters);
}

function includedSourceFilters(
    sourceFilters: IFilter[],
    includedFilterObjRefs: SourceInsightFilterObjRef[],
): IFilter[] {
    return sourceFilters.filter((sourceFilter) => {
        return includedFilterObjRefs.some((includedFilterObjRef) =>
            isMatchingSourceInsightFilter(sourceFilter, includedFilterObjRef),
        );
    });
}

function mergeInsightFilters(sourceFiltersToApply: IFilter[], targetFilters: IFilter[]): IFilter[] {
    const sourceContainsMeasureValueFilter = sourceFiltersToApply.some(
        (filter) => isMeasureValueFilter(filter) || isRankingFilter(filter),
    );
    const sourceDateFilters = sourceFiltersToApply.filter(isDateFilter);
    const sourceDateFilterRefs = sourceDateFilters.flatMap((sourceFilter) => {
        const sourceRef = filterObjRef(sourceFilter);
        return sourceRef ? [sourceRef] : [];
    });
    const targetFiltersWithoutConflicts = targetFilters.filter((targetFilter) => {
        if (
            sourceContainsMeasureValueFilter &&
            (isMeasureValueFilter(targetFilter) || isRankingFilter(targetFilter))
        ) {
            return false;
        }

        if (!isDateFilter(targetFilter)) {
            return true;
        }

        const targetRef = filterObjRef(targetFilter);
        if (!targetRef) {
            return true;
        }

        return !sourceDateFilterRefs.some((sourceDateFilterRef) =>
            areObjRefsEqual(sourceDateFilterRef, targetRef),
        );
    });

    return [...targetFiltersWithoutConflicts, ...sourceFiltersToApply];
}
