// (C) 2020-2026 GoodData Corporation

import {
    type IBucket,
    type IInsightDefinition,
    bucketItems,
    insightBuckets,
    insightFilters,
    isAttribute,
} from "@gooddata/sdk-model";

export type IInsightForAvailability = Pick<IInsightDefinition["insight"], "buckets" | "filters">;

const removeBucketTotals = (buckets: IBucket[]): IBucket[] =>
    buckets.map((bucket) => {
        const { totals: _, ...rest } = bucket;
        return rest;
    });

const removeBucketAliases = (buckets: IBucket[]): IBucket[] =>
    buckets.map((bucket) => ({
        ...bucket,
        items: bucketItems(bucket).map((item) => {
            if (isAttribute(item)) {
                const { alias: _, ...rest } = item.attribute;
                return { attribute: rest };
            } else {
                const { alias: _, ...rest } = item.measure;
                return { measure: rest };
            }
        }),
    }));

export const getInsightContentForAvailability = (insight: IInsightDefinition): IInsightForAvailability => ({
    buckets: removeBucketAliases(removeBucketTotals(insightBuckets(insight))),
    filters: insightFilters(insight),
});
