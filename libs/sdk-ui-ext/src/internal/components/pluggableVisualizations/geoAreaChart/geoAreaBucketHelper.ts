// (C) 2025-2026 GoodData Corporation

import {
    type IInsightDefinition,
    type ISortItem,
    bucketAttribute,
    insightBucket,
    newAttributeSort,
} from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";

import { ATTRIBUTE, METRIC } from "../../../constants/bucket.js";
import {
    type IBucketItem,
    type IBucketOfFun,
    type IExtendedReferencePoint,
    type IUiConfig,
} from "../../../interfaces/Visualization.js";
import {
    filterOutDerivedMeasures,
    getAllMeasures,
    getItemsCount,
    getItemsFromBuckets,
    isDateBucketItem,
} from "../../../utils/bucketHelper.js";
import { getRefIdentifier } from "../geoChartNext/geoAttributeHelper.js";

const GEO_AREA_DISPLAY_FORM_TYPE = "GDC.geo.area";
const TEXT_DISPLAY_FORM_TYPE = "GDC.text";

/**
 * Finds a bucket by local identifier
 *
 * @param buckets - Array of buckets
 * @param bucketId - Bucket identifier to find
 * @returns Found bucket or undefined
 * @internal
 */
function findBucket(buckets: IBucketOfFun[], bucketId: string): IBucketOfFun | undefined {
    return buckets.find((bucket) => bucket.localIdentifier === bucketId);
}

function ensureBucket(buckets: IBucketOfFun[], bucketId: string): IBucketOfFun {
    const existing = findBucket(buckets, bucketId);
    if (existing) {
        return existing;
    }

    const created: IBucketOfFun = {
        localIdentifier: bucketId,
        items: [],
    };
    buckets.push(created);
    return created;
}

/**
 * Sanitizes measures for geo area chart by removing unsupported features.
 * Area only supports a single color measure, no size measures.
 *
 * @param referencePoint - Reference point to sanitize
 * @returns Sanitized reference point
 * @internal
 */
export function sanitizeAreaMeasures(referencePoint: IExtendedReferencePoint): IExtendedReferencePoint {
    const buckets = referencePoint?.buckets ?? [];
    const measures = getAllMeasures(buckets);

    // Filter out derived measures (e.g., PoP, previous period)
    const sanitized = filterOutDerivedMeasures(measures);

    // Remove all measures from buckets, keeping only attributes
    referencePoint.buckets = buckets.map((bucket: IBucketOfFun) => {
        return {
            ...bucket,
            items: bucket.items.filter((item: IBucketItem) => item.type === ATTRIBUTE),
        };
    });

    // Add sanitized measures to COLOR bucket (geo area only supports color measures)
    if (sanitized.length > 0) {
        const colorBucket = ensureBucket(referencePoint.buckets, BucketNames.COLOR);
        colorBucket.items = [...sanitized];
    }

    return referencePoint;
}

/**
 * Gets area attribute items from buckets.
 * Filters out date attributes and stacking attributes.
 *
 * @param buckets - All buckets from the reference point
 * @param uiConfig - UI configuration containing bucket item limits
 * @returns Array of area attribute items
 * @internal
 */
export function getAreaItems(buckets: IBucketOfFun[], uiConfig: IUiConfig): IBucketItem[] {
    const limit = uiConfig?.buckets?.[BucketNames.AREA]?.itemsLimit ?? 1;
    const isValidAreaItem = (item: IBucketItem) => item.type === ATTRIBUTE && !isDateBucketItem(item);
    const isAreaCapableItem = (item: IBucketItem) =>
        Boolean(item.areaDisplayFormRef) ||
        Boolean(item.displayForms?.some((displayForm) => displayForm.type === GEO_AREA_DISPLAY_FORM_TYPE));

    const mapToGeoAreaDisplayForm = (item: IBucketItem): IBucketItem => {
        const areaDisplayForm = item.displayForms?.find(
            (displayForm) => displayForm.type === GEO_AREA_DISPLAY_FORM_TYPE,
        );

        if (!areaDisplayForm?.ref) {
            return item;
        }

        return {
            ...item,
            areaDisplayFormRef: areaDisplayForm.ref,
        };
    };

    // 1) Do not override user choice: if AREA bucket already contains at least one valid attribute, keep it.
    const areaBucket = findBucket(buckets, BucketNames.AREA);
    const existingAreaItems = areaBucket?.items.filter(isValidAreaItem) ?? [];
    const existingPreferred = existingAreaItems.filter(isAreaCapableItem);
    if (existingAreaItems.length > 0) {
        // Align with Pushpin behavior: never keep a non-geo-capable attribute in the geo bucket.
        return existingPreferred.map(mapToGeoAreaDisplayForm).slice(0, limit);
    }

    // 2) When switching to geo area from another visualization, the candidate geo-area attribute may live
    // in a different bucket (e.g. VIEW/ATTRIBUTE). Mirror Geo Pushpin's cross-bucket scan behavior.
    const candidates = getItemsFromBuckets(
        buckets,
        [BucketNames.ATTRIBUTE, BucketNames.VIEW, BucketNames.TREND, BucketNames.AREA],
        [ATTRIBUTE],
    ).filter(isValidAreaItem);

    const preferredCandidates = candidates.filter(isAreaCapableItem);
    // Strict like Pushpin: if there is no area-capable attribute, leave AREA empty.
    return preferredCandidates.map(mapToGeoAreaDisplayForm).slice(0, limit);
}

/**
 * Resolves the preferred textual display form for the provided area item.
 *
 * @param areaItem - Area bucket item
 * @returns Identifier or URI of the textual display form to use for tooltips
 * @internal
 */
export function getAreaTooltipText(areaItem: IBucketItem): string | undefined {
    const textDisplayForms =
        areaItem.displayForms?.filter(
            (displayForm) => !displayForm.type || displayForm.type === TEXT_DISPLAY_FORM_TYPE,
        ) ?? [];

    const preferredTextDf =
        textDisplayForms.find((displayForm) => displayForm.isDefault) ?? textDisplayForms[0];

    const tooltipRef = preferredTextDf?.ref ?? areaItem.dfRef;

    return getRefIdentifier(tooltipRef);
}

/**
 * Gets segment attribute items from buckets.
 *
 * @param buckets - All buckets from the reference point
 * @returns Array of segment attribute items
 * @internal
 */
export function getSegmentItems(buckets: IBucketOfFun[]): IBucketItem[] {
    const segmentBucket = findBucket(buckets, BucketNames.SEGMENT);
    if (!segmentBucket) {
        return [];
    }

    return segmentBucket.items.filter(
        (item: IBucketItem) => item.type === ATTRIBUTE && !isDateBucketItem(item),
    );
}

/**
 * Gets color measure items from buckets.
 *
 * @param buckets - All buckets from the reference point
 * @returns Array of color measure items
 * @internal
 */
export function getColorMeasures(buckets: IBucketOfFun[]): IBucketItem[] {
    const colorBucket = findBucket(buckets, BucketNames.COLOR);
    if (!colorBucket) {
        return [];
    }

    return colorBucket.items.filter((item: IBucketItem) => item.type === METRIC);
}

/**
 * Creates configured buckets for geo area chart.
 * Distributes location, segment, and color measure items appropriately.
 *
 * @param buckets - All buckets from the reference point
 * @param locationItems - Location attribute items
 * @param segmentItems - Segment attribute items
 * @param colorMeasures - Color measure items
 * @param uiConfig - UI configuration containing bucket item limits
 * @returns Configured buckets array
 * @internal
 */
export function createAreaConfiguredBuckets(
    _buckets: IBucketOfFun[],
    areaItems: IBucketItem[],
    segmentItems: IBucketItem[],
    colorMeasures: IBucketItem[],
    uiConfig: IUiConfig,
): IBucketOfFun[] {
    const areaLimit = uiConfig?.buckets?.[BucketNames.AREA]?.itemsLimit ?? 1;
    const segmentLimit = uiConfig?.buckets?.[BucketNames.SEGMENT]?.itemsLimit ?? 1;
    const colorLimit = uiConfig?.buckets?.[BucketNames.COLOR]?.itemsLimit ?? 1;

    return [
        {
            localIdentifier: BucketNames.AREA,
            items: areaItems.slice(0, areaLimit),
        },
        {
            localIdentifier: BucketNames.COLOR,
            items: colorMeasures.slice(0, colorLimit),
        },
        {
            localIdentifier: BucketNames.SEGMENT,
            items: segmentItems.slice(0, segmentLimit),
        },
    ];
}

/**
 * Creates sort items for geo area chart.
 * Sorts by segment attribute if present.
 *
 * @param insight - Insight definition
 * @returns Array of sort items
 * @internal
 */
export function createAreaSortForSegment(insight: IInsightDefinition): ISortItem[] {
    const segmentBucket = insightBucket(insight, BucketNames.SEGMENT);
    if (!segmentBucket) {
        return [];
    }

    const segmentAttribute = bucketAttribute(segmentBucket);
    if (!segmentAttribute) {
        return [];
    }

    return [newAttributeSort(segmentAttribute, "asc")];
}

/**
 * Checks if geo area chart has the minimum required data.
 *
 * @param buckets - All buckets from the reference point
 * @returns true if chart has at least a location attribute
 * @internal
 */
export function hasAreaMinimumData(buckets: IBucketOfFun[] | unknown[]): boolean {
    const typedBuckets = buckets as IBucketOfFun[];
    return getItemsCount(typedBuckets, BucketNames.AREA) > 0;
}
