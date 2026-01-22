// (C) 2026 GoodData Corporation

import { type ObjRef, idRef, isObjRef } from "@gooddata/sdk-model";

import {
    type IBucketItem,
    type IBucketOfFun,
    type IFilters,
    type IFiltersBucketItem,
    type IMeasureValueFilter,
} from "../../interfaces/Visualization.js";
import { getAllAttributeItems, getAllMeasures, isMeasureValueFilter } from "../bucketHelper.js";

function ensureFiltersBucket(filters: IFilters | undefined): IFilters {
    return (
        filters ?? {
            localIdentifier: "filters",
            items: [],
        }
    );
}

function getDimensionalityRef(
    localIdentifier: string,
    oldAttributeBucketItems: IBucketItem[],
): ObjRef | undefined {
    const bucketItem = oldAttributeBucketItems.find((item) => item.localIdentifier === localIdentifier);

    // MVF dimensionality should be expressed using ObjRefs:
    // - attribute items: display form ref is stored on dfRef
    // - date items: date dataset ref is stored on dateDatasetRef
    return bucketItem?.dfRef ?? bucketItem?.dateDatasetRef;
}

function canConvertDroppedMeasureLocalIdToMeasureRef(previousMeasure: IBucketItem): boolean {
    // Only simple bucket measures can be converted to measureRef-based MVF.
    const hasAttribute = Boolean(previousMeasure.attribute);
    const isAggregated = Boolean(previousMeasure.aggregation);
    const hasMaster = Boolean(previousMeasure.masterLocalIdentifier);

    return hasAttribute && !isAggregated && !hasMaster;
}

function transformMeasureValueFilterMeasureToRefIfPossible(
    filter: IMeasureValueFilter,
    oldMeasureBucketItems: IBucketItem[],
): IMeasureValueFilter {
    if (!filter.measureLocalIdentifier || filter.measureRef) {
        return filter;
    }

    const previousMeasure = oldMeasureBucketItems.find(
        (item) => item.localIdentifier === filter.measureLocalIdentifier,
    );
    if (!previousMeasure) {
        return filter;
    }

    if (!canConvertDroppedMeasureLocalIdToMeasureRef(previousMeasure)) {
        return filter;
    }

    const { measureLocalIdentifier: _measureLocalIdentifier, ...restFilter } = filter;
    return {
        ...restFilter,
        measureRef: idRef(previousMeasure.attribute!, "measure"),
    };
}

function transformMeasureValueFilterDimensionalityToRefs(
    filter: IMeasureValueFilter,
    oldRootAttributes: IBucketItem[],
    oldRootAttributeLocalIds: Set<string>,
    newRootAttributeLocalIds: Set<string>,
    enableImprovedAdFilters: boolean,
): IMeasureValueFilter {
    if (!enableImprovedAdFilters) {
        return filter;
    }
    if (!filter.dimensionality?.length) {
        return filter;
    }

    const transformedDimensionality = filter.dimensionality.map((item) => {
        if (isObjRef(item)) {
            return item;
        }

        // Keep local ids that still exist in new root buckets.
        if (newRootAttributeLocalIds.has(item)) {
            return item;
        }

        // Only attempt to resolve local ids that come from the old root buckets.
        // If the dimensionality localId is not from the old root, it may belong to an additional layer.
        // Keeping it as-is preserves layer MVFs (GeoChartNext routes localIdRef-based MVFs per-layer at execution time).
        return oldRootAttributeLocalIds.has(item)
            ? (getDimensionalityRef(item, oldRootAttributes) ?? item)
            : item;
    });

    const hasChanges = filter.dimensionality.some((item, index) => item !== transformedDimensionality[index]);
    return hasChanges
        ? {
              ...filter,
              dimensionality: transformedDimensionality,
          }
        : filter;
}

/**
 * GeoChartNext intentionally preserves original filter bucket to avoid dropping MVFs intended for non-root layers.
 *
 * However, when switching from a visualization with many measures to geo (which limits measures),
 * MVFs referencing measures that were removed from the *root* buckets can become dangling.
 *
 * This helper:
 * - only touches MVFs that referenced measures present in the *old* root buckets (so layer MVFs are preserved)
 * - converts dropped simple bucket measures from measureLocalIdentifier-based MVF to measureRef-based MVF
 * - converts dimensionality local ids to ObjRefs when possible (when improved filters are enabled)
 * - drops MVFs that would stay invalid/dangling after the bucket change
 */
export function sanitizeGeoReferencePointFilters(
    filters: IFilters | undefined,
    oldBuckets: IBucketOfFun[],
    newBuckets: IBucketOfFun[],
    enableImprovedAdFilters: boolean,
): IFilters {
    const safeFilters = ensureFiltersBucket(filters);
    const oldRootMeasures = getAllMeasures(oldBuckets);
    const oldRootMeasureLocalIds = new Set(oldRootMeasures.map((m) => m.localIdentifier));
    const newRootMeasureLocalIds = new Set(getAllMeasures(newBuckets).map((m) => m.localIdentifier));

    const oldRootAttributes = getAllAttributeItems(oldBuckets);
    const oldRootAttributeLocalIds = new Set(oldRootAttributes.map((a) => a.localIdentifier));
    const newRootAttributeLocalIds = new Set(getAllAttributeItems(newBuckets).map((a) => a.localIdentifier));

    const sanitizeItem = (item: IFiltersBucketItem): IFiltersBucketItem | undefined => {
        const filter = item.filters?.[0];
        if (!isMeasureValueFilter(filter)) {
            return item;
        }

        const measureLocalId = filter.measureLocalIdentifier;

        // Preserve MVFs not tied to the old root bucket model (e.g., MVFs for additional layers).
        if (!measureLocalId || !oldRootMeasureLocalIds.has(measureLocalId)) {
            return item;
        }

        const wasRemovedFromNewRoot = !newRootMeasureLocalIds.has(measureLocalId);
        if (wasRemovedFromNewRoot && !enableImprovedAdFilters) {
            return undefined;
        }

        const withMeasureRef =
            wasRemovedFromNewRoot && enableImprovedAdFilters
                ? transformMeasureValueFilterMeasureToRefIfPossible(filter, oldRootMeasures)
                : filter;

        const withDimensionalityRefs = transformMeasureValueFilterDimensionalityToRefs(
            withMeasureRef,
            oldRootAttributes,
            oldRootAttributeLocalIds,
            newRootAttributeLocalIds,
            enableImprovedAdFilters,
        );

        const measureLocalIdAfter = withDimensionalityRefs.measureLocalIdentifier;
        const isMeasureLocalIdValid = !measureLocalIdAfter || newRootMeasureLocalIds.has(measureLocalIdAfter);

        const usesObjRefMeasure = Boolean(withDimensionalityRefs.measureRef);
        const usesObjRefDimensionality = Boolean(withDimensionalityRefs.dimensionality?.some(isObjRef));
        const usesAnyObjRefs = usesObjRefMeasure || usesObjRefDimensionality;
        const areObjRefsAllowed = enableImprovedAdFilters || !usesAnyObjRefs;

        const isValid = isMeasureLocalIdValid && areObjRefsAllowed;

        if (!isValid) {
            return undefined;
        }

        return { ...item, filters: [withDimensionalityRefs] };
    };

    const sanitizedItems = safeFilters.items.flatMap((item) => {
        const sanitized = sanitizeItem(item);
        return sanitized ? [sanitized] : [];
    });

    return {
        ...safeFilters,
        items: sanitizedItems,
    };
}
