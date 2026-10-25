// (C) 2026 GoodData Corporation

import { areObjRefsEqual } from "@gooddata/sdk-model";

import { COMPUTED_ATTRIBUTE } from "../../constants/bucket.js";
import { type IDecoratedMetricAttributeFilter } from "../../models/decorated_metric_attribute_filter.js";
import { type IDecoratedBucketItem } from "../../typings/buckets.js";

import { type IMeasureAttributeFilterItem } from "./MeasureAttributeListItemOrganized.js";

/**
 * Whether the metric already filters by the attribute on offer. The attribute refs decide (a
 * computed attribute's ref carries its own type); a filter whose cache entry has no ref falls back
 * to the identifier, which a regular and a computed attribute may share, so the kind has to match too.
 */
export const isAttributeAlreadyFiltered = (
    bucketItem: IDecoratedBucketItem,
    item: IMeasureAttributeFilterItem,
): boolean => {
    const isComputedAttributeItem = item.type === COMPUTED_ATTRIBUTE;
    return bucketItem.filters.some((filter) => {
        const attribute = (filter as IDecoratedMetricAttributeFilter).attribute;
        if (!attribute) {
            return false;
        }
        if (attribute.ref && item.ref) {
            return areObjRefsEqual(attribute.ref, item.ref);
        }
        return (
            attribute.identifier === item.identifier &&
            (attribute.type === COMPUTED_ATTRIBUTE) === isComputedAttributeItem
        );
    });
};
