// (C) 2007-2020 GoodData Corporation
import {
    IInsightDefinition,
    IAttributeOrMeasure,
    IMeasure,
    isSimpleMeasure,
    isAdhocMeasure,
    modifyMeasure,
    insightModifyItems,
} from "@gooddata/sdk-model";

/**
 * This function ignores the titles of simple measures.
 *
 * For simple measures, their titles are removed.
 * For adhoc or non-simple measures, their titles are left intact.
 *
 * @param {IInsight|IInsightDefinition} insight - insight or insight definition that must be processed.
 *
 * @returns {IInsight}
 *
 * @internal
 */
export function ignoreTitlesForSimpleMeasures<T extends IInsightDefinition>(insight: T): T {
    return insightModifyItems(
        insight,
        (bucketItem: IAttributeOrMeasure): IAttributeOrMeasure => {
            if (isSimpleMeasure(bucketItem) && !isAdhocMeasure(bucketItem)) {
                return modifyMeasure(bucketItem as IMeasure, (m) => m.noTitle());
            }
            return bucketItem;
        },
    );
}
