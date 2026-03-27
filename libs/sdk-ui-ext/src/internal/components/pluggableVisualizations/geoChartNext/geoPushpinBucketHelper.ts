// (C) 2025-2026 GoodData Corporation

import { BucketNames } from "@gooddata/sdk-ui";

import { ATTRIBUTE, METRIC } from "../../../constants/bucket.js";
import {
    type IBucketItem,
    type IBucketOfFun,
    type IExtendedReferencePoint,
    type IUiConfig,
} from "../../../interfaces/Visualization.js";
import {
    getAllMeasures,
    getAttributeItemsWithoutStacks,
    getItemsFromBuckets,
    getPreferredBucketItems,
    isDateBucketItem,
    removeAllArithmeticMeasuresFromDerived,
    removeAllDerivedMeasures,
    removeShowOnSecondaryAxis,
} from "../../../utils/bucketHelper.js";

const GEO_PIN_LATITUDE_DISPLAY_FORM_TYPE = "GDC.geo.pin_latitude";
const GEO_PIN_LONGITUDE_DISPLAY_FORM_TYPE = "GDC.geo.pin_longitude";

function isPushpinLocationCapable(item: IBucketItem): boolean {
    // Prefer strict detection when display forms are available (prevents treating area-only attrs as location).
    if (item.displayForms?.length) {
        const hasLatitude = item.displayForms.some(
            (displayForm) => displayForm.type === GEO_PIN_LATITUDE_DISPLAY_FORM_TYPE,
        );
        const hasLongitude = item.displayForms.some(
            (displayForm) => displayForm.type === GEO_PIN_LONGITUDE_DISPLAY_FORM_TYPE,
        );
        return hasLatitude && hasLongitude;
    }

    // Backward-compatible fallback used by existing reference point mocks / older enrichment paths.
    return Boolean(item.locationDisplayFormRef);
}

function removeAllArithmeticMeasures(
    extendedReferencePoint: IExtendedReferencePoint,
): IExtendedReferencePoint {
    extendedReferencePoint.buckets.forEach((bucket) => {
        bucket.items = bucket.items.filter((item) => !item.operandLocalIdentifiers);
    });

    return extendedReferencePoint;
}

/**
 * Distributes measures between SIZE, COLOR, and MEASURES buckets based on user preferences.
 * Primary measures go to SIZE, secondary measures go to COLOR, tooltip metric measures go to MEASURES.
 * MEASURES is independent and can coexist with SIZE and COLOR.
 *
 * @param buckets - All buckets from the reference point
 * @param uiConfig - UI configuration containing bucket item limits
 * @returns Object with sizeMeasures, colorMeasures, and metricMeasures arrays
 * @internal
 */
export function distributeMeasures(
    buckets: IBucketOfFun[],
    uiConfig: IUiConfig,
): {
    sizeMeasures: IBucketItem[];
    colorMeasures: IBucketItem[];
    metricMeasures: IBucketItem[];
} {
    const allMeasures = getAllMeasures(buckets);

    // Metric bucket is independent — extract it before distributing size/color
    const metricBucketMeasures = getPreferredBucketItems(buckets, [BucketNames.MEASURES], [METRIC]);
    const hasMetricBucket = uiConfig.buckets[BucketNames.MEASURES] !== undefined;
    const metricMeasures = hasMetricBucket
        ? metricBucketMeasures.slice(0, uiConfig.buckets[BucketNames.MEASURES]?.itemsLimit ?? 1)
        : [];

    // Exclude metric measures from size/color distribution to avoid duplicates
    const metricLocalIds = new Set(metricMeasures.map((m) => m.localIdentifier));
    const excludeMetric = (items: IBucketItem[]) =>
        items.filter((item) => !metricLocalIds.has(item.localIdentifier));

    const primaryMeasures = excludeMetric(
        getPreferredBucketItems(buckets, [BucketNames.MEASURES, BucketNames.SIZE], [METRIC]),
    );
    const secondaryMeasures = excludeMetric(
        getPreferredBucketItems(buckets, [BucketNames.SECONDARY_MEASURES, BucketNames.COLOR], [METRIC]),
    );
    const remainingMeasures = excludeMetric(allMeasures);

    // Determine SIZE measures: use primary if available, otherwise use remaining measures
    const sizeMeasures = selectMeasuresForBucket(
        primaryMeasures,
        remainingMeasures,
        secondaryMeasures,
        BucketNames.SIZE,
        uiConfig,
    );

    // Determine COLOR measures: use secondary if available, otherwise use remaining measures
    const colorMeasures = selectMeasuresForBucket(
        secondaryMeasures,
        remainingMeasures,
        sizeMeasures,
        BucketNames.COLOR,
        uiConfig,
    );

    return { sizeMeasures, colorMeasures, metricMeasures };
}

/**
 * Selects measures for a bucket, applying limits and excluding already-assigned measures.
 *
 * @param preferredMeasures - Measures explicitly assigned to this bucket
 * @param allMeasures - All available measures
 * @param excludeMeasures - Measures already assigned to another bucket
 * @param bucketName - Name of the bucket (for looking up limits)
 * @param uiConfig - UI configuration containing bucket item limits
 * @returns Filtered and limited measures array
 * @internal
 */
export function selectMeasuresForBucket(
    preferredMeasures: IBucketItem[],
    allMeasures: IBucketItem[],
    excludeMeasures: IBucketItem[],
    bucketName: string,
    uiConfig: IUiConfig,
): IBucketItem[] {
    const measures =
        preferredMeasures.length > 0
            ? preferredMeasures
            : allMeasures.filter((measure) => !excludeMeasures.includes(measure));

    const limit = uiConfig.buckets[bucketName].itemsLimit;
    return measures.slice(0, limit);
}

/**
 * Creates the final bucket configuration with location, size, color, metric, and segment buckets.
 *
 * @param buckets - All buckets from the reference point
 * @param sizeMeasures - Measures to place in SIZE bucket
 * @param colorMeasures - Measures to place in COLOR bucket
 * @param metricMeasures - Measures to place in MEASURES bucket
 * @param uiConfig - UI configuration containing bucket item limits
 * @returns Array of configured buckets
 * @internal
 */
export function createConfiguredBuckets(
    buckets: IBucketOfFun[],
    sizeMeasures: IBucketItem[],
    colorMeasures: IBucketItem[],
    metricMeasures: IBucketItem[],
    uiConfig: IUiConfig,
): IBucketOfFun[] {
    const locationItems = getLocationItems(buckets, uiConfig);

    return [
        {
            localIdentifier: BucketNames.LOCATION,
            items: locationItems,
        },
        {
            localIdentifier: BucketNames.SIZE,
            items: removeShowOnSecondaryAxis(sizeMeasures),
        },
        {
            localIdentifier: BucketNames.COLOR,
            items: removeShowOnSecondaryAxis(colorMeasures),
        },
        {
            localIdentifier: BucketNames.MEASURES,
            items: removeShowOnSecondaryAxis(metricMeasures),
        },
        {
            localIdentifier: BucketNames.SEGMENT,
            items: getSegmentItems(buckets, locationItems.length > 0),
        },
    ];
}

/**
 * Extracts location attribute items from buckets.
 *
 * @param buckets - All buckets from the reference point
 * @param uiConfig - UI configuration containing bucket item limits
 * @returns Filtered location items
 * @internal
 */
export function getLocationItems(buckets: IBucketOfFun[], uiConfig: IUiConfig): IBucketItem[] {
    const locationItems: IBucketItem[] = getItemsFromBuckets(
        buckets,
        [BucketNames.ATTRIBUTE, BucketNames.VIEW, BucketNames.LOCATION, BucketNames.TREND],
        [ATTRIBUTE],
    ).filter(isPushpinLocationCapable);

    const limit = uiConfig.buckets[BucketNames.LOCATION].itemsLimit;
    return locationItems.slice(0, limit);
}

/**
 * Extracts segment attribute items from buckets.
 * Excludes location attributes and date attributes when location is present.
 *
 * @param buckets - All buckets from the reference point
 * @returns Filtered segment items (max 1)
 * @internal
 */
export function getSegmentItems(buckets: IBucketOfFun[], hasLocation: boolean): IBucketItem[] {
    const segmentItems = getPreferredBucketItems(buckets, [BucketNames.SEGMENT], [ATTRIBUTE]);

    // Align with legacy pushpin behavior:
    // - never infer SEGMENT when there is no valid location selected
    // - keep explicit user SEGMENT selection (if any)
    if (!hasLocation) {
        return segmentItems.slice(0, 1);
    }

    // Legacy pushpin can infer a segment when there are multiple attributes present and location is set.
    const nonSegmentAttributes = getAttributeItemsWithoutStacks(buckets);
    if (nonSegmentAttributes.length > 1 && segmentItems.length === 0) {
        return nonSegmentAttributes
            .filter((item: IBucketItem) => !isPushpinLocationCapable(item))
            .filter((item: IBucketItem) => !isDateBucketItem(item))
            .slice(0, 1);
    }

    return segmentItems.slice(0, 1);
}

/**
 * Removes arithmetic and derived measures from the reference point.
 * Geo pushpin charts don't support these measure types.
 *
 * @param extendedReferencePoint - The reference point to sanitize
 * @returns Sanitized reference point without arithmetic or derived measures
 * @internal
 */
export function sanitizeMeasures(extendedReferencePoint: IExtendedReferencePoint): IExtendedReferencePoint {
    const withoutArithmetic = removeAllArithmeticMeasuresFromDerived(extendedReferencePoint);
    const withoutDerived = removeAllDerivedMeasures(withoutArithmetic);
    return removeAllArithmeticMeasures(withoutDerived);
}
