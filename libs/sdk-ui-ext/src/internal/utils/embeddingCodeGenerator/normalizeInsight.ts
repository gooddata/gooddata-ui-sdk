// (C) 2022 GoodData Corporation
import flow from "lodash/fp/flow.js";
import fromPairs from "lodash/fp/fromPairs.js";
import map from "lodash/fp/map.js";
import toPairs from "lodash/fp/toPairs.js";
import {
    attributeLocalId,
    bucketItems,
    bucketTotals,
    IInsightDefinition,
    insightBuckets,
    insightProperties,
    insightSetBuckets,
    insightSetFilters,
    insightSetProperties,
    insightSetSorts,
    isAttribute,
    measureLocalId,
    newBucket,
    newDefForInsight,
    newTotal,
    VisualizationProperties,
} from "@gooddata/sdk-model";
import { LocalIdMap, Normalizer } from "@gooddata/sdk-backend-base";

function normalizeProperties(
    properties: VisualizationProperties,
    o2nMap: LocalIdMap,
): VisualizationProperties {
    // do simple search/replace of all the original items
    const stringified = JSON.stringify(properties);

    const replaced = toPairs(o2nMap).reduce((acc, [original, normalized]) => {
        const regex = new RegExp(original, "g");
        return acc.replace(regex, normalized);
    }, stringified);

    return JSON.parse(replaced);
}

/**
 * Creates an insight that has reasonable local ids instead of potentially long illegible ones in the original insight.
 *
 * @privateRemarks
 * Makes use of the {@link @gooddata/sdk-backed-base#Normalizer} to do most of the work.
 *
 * @param insight - the insight to "normalize"
 * @returns always a new instance
 * @internal
 */
export function normalizeInsight(insight: IInsightDefinition): IInsightDefinition {
    const execution = newDefForInsight("foo", insight);
    const { n2oMap, normalized } = Normalizer.normalize(execution, { keepRemovableProperties: true });

    const o2nMap: LocalIdMap = flow(
        toPairs,
        map(([normalized, original]) => [original, normalized]),
        fromPairs,
    )(n2oMap);

    const processedBuckets = insightBuckets(insight).map((originalBucket) => {
        // put back stuff deleted by the normalizer
        const processedItems = bucketItems(originalBucket).map((originalBucketItem) => {
            if (isAttribute(originalBucketItem)) {
                const normalizedId = o2nMap[attributeLocalId(originalBucketItem)];
                return normalized.attributes.find((attr) => attributeLocalId(attr) === normalizedId);
            } else {
                const normalizedId = o2nMap[measureLocalId(originalBucketItem)];
                return normalized.measures.find((measure) => measureLocalId(measure) === normalizedId);
            }
        });

        const processedTotals = bucketTotals(originalBucket).map((originalTotal) => {
            const { attributeIdentifier, measureIdentifier, type, alias } = originalTotal;
            return newTotal(type, o2nMap[measureIdentifier], o2nMap[attributeIdentifier], alias);
        });

        return newBucket(originalBucket.localIdentifier, ...processedItems, ...processedTotals);
    });

    const properties = insightProperties(insight);
    const processedProperties = properties && normalizeProperties(properties, o2nMap);

    return flow(
        (i) => insightSetBuckets(i, processedBuckets),
        (i) => insightSetFilters(i, normalized.filters),
        (i) => insightSetSorts(i, normalized.sortBy),
        (i) => insightSetProperties(i, processedProperties),
    )(insight);
}
