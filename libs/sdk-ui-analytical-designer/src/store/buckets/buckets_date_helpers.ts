// (C) 2007-2026 GoodData Corporation

import { type ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";

import { isAttribute, isComputedAttributeItem, isDate } from "../../models/bucket_item.js";
import { decoratedDateDataset } from "../../models/date_dataset.js";
import { createDateItem } from "../../models/date_item.js";
import { getGranularity } from "../../models/decorated_bucket_item.js";
import {
    type IDecoratedGranularity,
    type IRawBucket,
    type IRawBucketItem,
    type IRawBuckets,
} from "../../typings/buckets.js";
import { type IDateDataset } from "../../typings/datasets.js";
import { FilterBar, type IFilter } from "../filter_bar/filter_bar_types.js";

import { updateEveryBucket, updateEveryBucketItem } from "./bucket_item_address.js";
import { getDateBucketItemsInBuckets, hasDateBucketItemInBuckets } from "./buckets_read_helpers.js";

/**
 * Date-dataset and granularity rules as narrow pure helpers over bucket VALUES.
 *
 * The foreign lookup these rules need — "which date dataset is this ObjRef?" — arrives as a LAZY
 * RESOLVER, not as a state read. A resolver is one function the caller closes over its own source, so
 * the two callers that disagree about which date-datasets collection to consult say so in their own
 * code instead of both calling "the" selector.
 */

/** Resolves a date dataset by its ObjRef; `undefined` when the catalog does not carry it. */
export type DateDatasetByRefResolver = (ref: ObjRef) => IDateDataset | undefined;

/** Resolves an attribute cache-item identifier to its display-form ObjRef, or null. */
export type AttributeDfRefResolver = (
    cacheItemIdentifier: string,
    /**
     * Whether the bucket item was built from a computed attribute. A regular and a computed
     * attribute may share an identifier, so this is what points the cache lookup at the right
     * namespace - without it the identifier alone resolves to the regular attribute.
     */
    isComputedAttribute: boolean,
) => ObjRef | null;

/**
 * Syncs granularity and dfRef on a date bucket item against the date dataset it points at.
 *
 * Answers the item UNCHANGED for every reason it cannot sync — not a date item, no dateDatasetRef, an
 * unresolvable dataset, no granularity attribute. Identity is the no-op signal, and each of
 * those early exits is a case the callers rely on.
 *
 * @param bucketItem - the date bucket item to sync
 * @param dateDataset - the dataset `bucketItem.dateDatasetRef` resolves to, already looked up
 * @param granularityOverride - a granularity to prefer over the item's own
 */
export function syncDateBucketItemGranularityAndDfRef(
    bucketItem: IRawBucketItem,
    dateDataset: IDateDataset | undefined,
    granularityOverride?: string,
): IRawBucketItem {
    if (!isDate(bucketItem)) {
        return bucketItem;
    }

    const dateDatasetRef = bucketItem?.dateDatasetRef;
    if (!dateDatasetRef) {
        return bucketItem;
    }

    if (!dateDataset) {
        return bucketItem;
    }

    const decoratedDataset = decoratedDateDataset(dateDataset);
    if (!decoratedDataset) {
        return bucketItem;
    }

    // Use provided granularity or existing granularity, otherwise use default
    const granularityToUse = granularityOverride ?? bucketItem?.granularity;
    const itemWithGranularity =
        granularityToUse && bucketItem.granularity !== granularityToUse
            ? { ...bucketItem, granularity: granularityToUse }
            : bucketItem;

    // Resolve the granularity attribute
    const dateAttribute = getGranularity(itemWithGranularity, createDateItem(), decoratedDataset);
    if (!dateAttribute) {
        return bucketItem;
    }

    const resolvedGranularity = dateAttribute.dateType;
    const resolvedDfRef = dateAttribute.dfRef;

    if (!resolvedGranularity || !resolvedDfRef) {
        return bucketItem;
    }

    // Update both granularity and dfRef — one copy, and identity when the item already carries both
    if (bucketItem.granularity === resolvedGranularity && bucketItem.dfRef === resolvedDfRef) {
        return bucketItem;
    }
    return { ...bucketItem, granularity: resolvedGranularity, dfRef: resolvedDfRef };
}

/**
 * Re-points date bucket items at `ref` and re-syncs their granularity/dfRef.
 *
 * The target is addressed by EITHER a bucket item local identifier or a bucket local identifier, or
 * neither — in which case every date item in every bucket is re-pointed. That three-way is the whole
 * behavior of the three `SET_*_DATE_DATASET` triggers, so it stays one function.
 *
 * The lazy copy at BOTH levels is what keeps identity when nothing changes; a rebuilt collection
 * would dirty the subtree on every dispatch. The dataset is resolved ONCE, because every item written
 * here ends up pointing at the same `ref`.
 */
export function setBucketItemsDateDataset(
    buckets: IRawBuckets,
    ref: ObjRef,
    target: { bucketItemLocalIdentifier?: string; bucketLocalIdentifier?: string },
    dateDatasetByRef: DateDatasetByRefResolver,
): IRawBuckets {
    if (!hasDateBucketItemInBuckets(buckets)) {
        return buckets;
    }

    const { bucketItemLocalIdentifier, bucketLocalIdentifier } = target;
    const dateDataset = dateDatasetByRef(ref);

    return updateEveryBucket(buckets, (bucket: IRawBucket) => {
        const changeAllItemsInBucket = bucketLocalIdentifier === bucket?.localIdentifier;

        return updateEveryBucketItem(bucket, (bucketItem: IRawBucketItem) => {
            const isDateItem = isDate(bucketItem);
            const areEqualLocalIdentifiers = bucketItem?.localIdentifier === bucketItemLocalIdentifier;
            const canBeSetRef =
                isDateItem &&
                (!bucketItemLocalIdentifier || areEqualLocalIdentifiers || changeAllItemsInBucket);

            if (canBeSetRef) {
                // Update dateDatasetRef and sync granularity/dfRef.
                // Pass the existing granularity — syncDateBucketItemGranularityAndDfRef checks
                // whether it is available in the new dateDataset and falls back to default if not.
                const updatedItem =
                    bucketItem.dateDatasetRef === ref ? bucketItem : { ...bucketItem, dateDatasetRef: ref };
                const existingGranularity = bucketItem?.granularity;
                return syncDateBucketItemGranularityAndDfRef(updatedItem, dateDataset, existingGranularity);
            }
            return bucketItem;
        });
    });
}

/**
 * The date dataset the insight is "about": the one its date bucket items use, else the one its date
 * filter uses, else the first available.
 *
 * `firstAvailableDateDataset` arrives already resolved. It is only consulted when the buckets have no
 * date item AND there is no date filter, but the caller resolves it eagerly — which is safe: the
 * answer on an unloaded catalog is `undefined`, not a throw.
 */
export function getPrimaryDateDatasetRefInBuckets(
    buckets: IRawBuckets,
    filterItems: ReadonlyArray<IFilter>,
    firstAvailableDateDataset: IDateDataset | undefined,
): ObjRef | undefined {
    const dateBucketItems = getDateBucketItemsInBuckets(buckets);

    if (!dateBucketItems?.length) {
        const dateFilter = filterItems.find(FilterBar.isDateFilter);
        if (dateFilter) {
            return dateFilter.dateDatasetRef;
        }
        return firstAvailableDateDataset ? firstAvailableDateDataset.ref : undefined;
    }

    const firstDateDataset = [...(dateBucketItems ?? [])]?.[0]?.dateDatasetRef;
    return firstDateDataset ?? undefined;
}

/**
 * Is period-over-period comparison available? It is when some date bucket item points at the SAME date
 * dataset as the first date filter — comparing over time needs both ends on one dataset.
 *
 * The value level of `selectors/date_filter_selector.ts#isPoPAvailable`, which delegates here (the 4.10
 * rule). The buckets operations need it mid-gesture, over the buckets and the filter bar as their
 * helpers left them, which a selector over the root cannot answer.
 */
export function isPoPAvailableInBuckets(buckets: IRawBuckets, filters: ReadonlyArray<IFilter>): boolean {
    const dateFilter = filters.find(FilterBar.isDateFilter);

    return [...(getDateBucketItemsInBuckets(buckets) ?? [])]
        .map((dateBucketItem: IRawBucketItem) => dateBucketItem?.dateDatasetRef)
        .some((dateDatasetRef: ObjRef) => areObjRefsEqual(dateDatasetRef, dateFilter?.dateDatasetRef));
}

/**
 * Every date dataset ObjRef the buckets and filters reference — the date filter's first, then the
 * bucket items' in bucket order. Order is part of the contract: `getUsedDateDatasets` maps over this
 * list and the filter's dataset must lead.
 */
export function getUsedDateDatasetRefsInBuckets(
    buckets: IRawBuckets,
    filters: ReadonlyArray<IFilter>,
): ObjRef[] {
    const dateDatasetRefs: ObjRef[] = [];

    const dateFilter = filters.find(FilterBar.isDateFilter);
    if (dateFilter) {
        dateDatasetRefs.push(dateFilter.dateDatasetRef);
    }

    const dateBucketItems = getDateBucketItemsInBuckets(buckets);
    [...(dateBucketItems ?? [])]
        .map((dateBucketItem: IRawBucketItem) => dateBucketItem?.dateDatasetRef)
        .filter(Boolean)
        .forEach((dateDatasetRef) => {
            dateDatasetRefs.push(dateDatasetRef);
        });

    return dateDatasetRefs;
}

/**
 * The ObjRef a dimensionality entry keeps for a bucket item: the display form ref, which for a date
 * item uniquely identifies the granularity attribute.
 *
 * Both branches fall back the same way — the item's own `dfRef` first, then a resolver — but from
 * different sources, which is why the two resolvers are separate parameters rather than one lookup:
 * a date item resolves through its DATE DATASET's granularity attribute, an attribute item through
 * the ITEM CACHE. Returns null when nothing resolves; the caller keeps the local identifier rather
 * than dropping the entry (dropping it would re-point a ranking filter at the remaining attributes —
 * a wrong result, not an error).
 */
export function getBucketItemDimensionalityRef(
    bucketItem: IRawBucketItem | undefined,
    resolvers: {
        dateDatasetByRef: DateDatasetByRefResolver;
        attributeDfRefByIdentifier: AttributeDfRefResolver;
    },
): ObjRef | null {
    if (!bucketItem) {
        return null;
    }

    const bucketItemDfRef = bucketItem?.dfRef;
    if (isDate(bucketItem)) {
        if (bucketItemDfRef) {
            return bucketItemDfRef;
        }

        // Fallback: resolve dfRef from date dataset meta. Happens for a fresh date item added to the
        // bucket — it has neither dfRef nor granularity. Uses the same helpers as bucket item decoration.
        const dateDatasetRef: ObjRef | undefined = bucketItem?.dateDatasetRef;
        const dateDataset = dateDatasetRef ? resolvers.dateDatasetByRef(dateDatasetRef) : undefined;
        const decoratedDataset = dateDataset ? decoratedDateDataset(dateDataset) : null;
        const dateAttribute: IDecoratedGranularity | undefined = decoratedDataset
            ? getGranularity(bucketItem, createDateItem(), decoratedDataset)
            : undefined;

        return dateAttribute?.dfRef ?? null;
    }

    if (isAttribute(bucketItem)) {
        // First try to get dfRef directly from the bucket item
        if (bucketItemDfRef) {
            return bucketItemDfRef;
        }

        // Fallback to the item cache
        const cacheItemIdentifier = bucketItem?.attribute;
        if (!cacheItemIdentifier) {
            return null;
        }
        return resolvers.attributeDfRefByIdentifier(cacheItemIdentifier, isComputedAttributeItem(bucketItem));
    }

    return null;
}
