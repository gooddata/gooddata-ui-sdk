// (C) 2022 GoodData Corporation
import flow from "lodash/fp/flow";
import fromPairs from "lodash/fp/fromPairs";
import map from "lodash/fp/map";
import toPairs from "lodash/fp/toPairs";
import {
    attributeAlias,
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
    measureAlias,
    measureFormat,
    measureLocalId,
    measureTitle,
    modifyAttribute,
    modifyMeasure,
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
 * Makes use of the {@link @gooddata/sdk-backed-base#Normalizer} to do most of the work, filling back things
 * that the Normalizer removes (like titles, aliases, etc.).
 *
 * @param insight - the insight to "normalize"
 * @returns always a new instance
 * @internal
 */
export function normalizeInsight(insight: IInsightDefinition): IInsightDefinition {
    const execution = newDefForInsight("foo", insight);
    const { n2oMap, normalized } = Normalizer.normalize(execution);

    const o2nMap = flow(
        toPairs,
        map(([normalized, original]) => [original, normalized]),
        fromPairs,
    )(n2oMap);

    const processedBuckets = insightBuckets(insight).map((originalBucket) => {
        // put back stuff deleted by the normalizer
        const processedItems = bucketItems(originalBucket).map((originalBucketItem) => {
            if (isAttribute(originalBucketItem)) {
                const normalizedId = o2nMap[attributeLocalId(originalBucketItem)];
                const normalizedBucketItem = normalized.attributes.find(
                    (attr) => attributeLocalId(attr) === normalizedId,
                );
                return modifyAttribute(normalizedBucketItem, (a) =>
                    a.alias(attributeAlias(originalBucketItem)),
                );
            } else {
                const normalizedId = o2nMap[measureLocalId(originalBucketItem)];
                const normalizedBucketItem = normalized.measures.find(
                    (measure) => measureLocalId(measure) === normalizedId,
                );
                return modifyMeasure(normalizedBucketItem, (m) =>
                    m
                        .alias(measureAlias(originalBucketItem))
                        .format(measureFormat(originalBucketItem))
                        .title(measureTitle(originalBucketItem)),
                );
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
