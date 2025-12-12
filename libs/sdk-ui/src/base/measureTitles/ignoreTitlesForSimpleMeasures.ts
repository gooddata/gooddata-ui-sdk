// (C) 2007-2025 GoodData Corporation
import {
    type IAttributeOrMeasure,
    type IInsightDefinition,
    type IMeasure,
    insightMeasures,
    insightModifyItems,
    isAdhocMeasure,
    isDateFilter,
    isSimpleMeasure,
    measureFilters,
    modifyMeasure,
} from "@gooddata/sdk-model";

/**
 * This function ignores the titles of simple measures.
 *
 * For simple measures, their titles are removed.
 * For adhoc or non-simple measures, their titles are left intact.
 *
 * @param insight - insight or insight definition that must be processed.
 * @returns a copy of insight modified bucket items
 *
 * @internal
 */
export function ignoreTitlesForSimpleMeasures<T extends IInsightDefinition>(insight: T): T {
    const measuresWithDateFilter = insightMeasures(
        insight,
        (measure: IMeasure): boolean => measureFilters(measure)?.some(isDateFilter) ?? false,
    );
    if (measuresWithDateFilter.length > 0) {
        // If the insight contains a measure with a date filter, all other measures are considered adhoc measures
        // and their titles should be left intact.
        return insight;
    }
    return insightModifyItems(insight, (bucketItem: IAttributeOrMeasure): IAttributeOrMeasure => {
        if (isSimpleMeasure(bucketItem) && !isAdhocMeasure(bucketItem)) {
            return modifyMeasure(bucketItem as IMeasure, (m) => m.noTitle());
        }
        return bucketItem;
    });
}
