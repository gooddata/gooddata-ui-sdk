// (C) 2019-2023 GoodData Corporation
import set from "lodash/set.js";
import uniq from "lodash/uniq.js";
import uniqBy from "lodash/uniqBy.js";
import negate from "lodash/negate.js";
import includes from "lodash/includes.js";
import every from "lodash/every.js";
import forEach from "lodash/forEach.js";
import cloneDeep from "lodash/cloneDeep.js";
import isEmpty from "lodash/isEmpty.js";
import flatMap from "lodash/flatMap.js";
import compact from "lodash/compact.js";
import without from "lodash/without.js";
import { IntlShape } from "react-intl";
import {
    BucketNames,
    OverTimeComparisonType,
    OverTimeComparisonTypes,
    VisualizationTypes,
} from "@gooddata/sdk-ui";
import {
    ObjRef,
    bucketItems,
    bucketsFind,
    bucketsMeasures,
    IBucket,
    IInsightDefinition,
    insightBuckets,
    isSimpleMeasure,
    ITotal,
    IMeasure,
    areObjRefsEqual,
} from "@gooddata/sdk-model";

import {
    DATE_DATASET_ATTRIBUTE,
    IAttributeFilter,
    IBucketFilter,
    IBucketItem,
    IBucketOfFun,
    IBucketsUiConfig,
    IBucketUiConfig,
    IDateFilter,
    IExtendedReferencePoint,
    IFilters,
    IFiltersBucketItem,
    IMeasureValueFilter,
    IUiConfig,
    IRankingFilter,
} from "../interfaces/Visualization.js";
import { ATTRIBUTE, BUCKETS, DATE, METRIC, SHOW_ON_SECONDARY_AXIS } from "../constants/bucket.js";
import { getTranslation } from "./translations.js";
import { titles, subtitles } from "../../locales.js";

export function isDateFilter(filter: IBucketFilter): filter is IDateFilter {
    return !!filter && (filter as IDateFilter).attribute === DATE_DATASET_ATTRIBUTE;
}

export function isFiltersBucketItem(filter: IFiltersBucketItem): filter is IFiltersBucketItem {
    return filter?.attribute === DATE_DATASET_ATTRIBUTE;
}

export function isAttributeFilter(filter: IBucketFilter): filter is IAttributeFilter {
    const filterAsAttributeFilter: IAttributeFilter = filter as IAttributeFilter;
    return (
        !!filter &&
        filterAsAttributeFilter.attribute !== DATE_DATASET_ATTRIBUTE &&
        filterAsAttributeFilter.attribute !== undefined
    );
}

export function isMeasureValueFilter(filter: IBucketFilter): filter is IMeasureValueFilter {
    return !!filter && !!(filter as IMeasureValueFilter).measureLocalIdentifier;
}

export function isActiveMeasureValueFilter(filter: IBucketFilter): boolean {
    if (!isMeasureValueFilter(filter)) {
        return false;
    }
    return !!filter.condition;
}

export function isRankingFilter(filter: IBucketFilter): filter is IRankingFilter {
    const filterAsRankingFilter = filter as IRankingFilter;
    return (
        !!filter &&
        typeof filterAsRankingFilter.measure === "string" &&
        typeof filterAsRankingFilter.operator === "string" &&
        typeof filterAsRankingFilter.value === "number"
    );
}

export function sanitizeFilters(newReferencePoint: IExtendedReferencePoint): IExtendedReferencePoint {
    const attributeBucketItems = getAllAttributeItems(newReferencePoint.buckets);
    const measureBucketItems = getAllMeasureItems(newReferencePoint.buckets);

    newReferencePoint.filters = newReferencePoint.filters || {
        localIdentifier: "filters",
        items: [],
    };

    const filteredFilters = newReferencePoint.filters.items.filter((filterBucketItem: IFiltersBucketItem) => {
        const filter = filterBucketItem.filters[0];

        if (isAttributeFilter(filter) || isDateFilter(filter)) {
            if (filterBucketItem.autoCreated === false) {
                return true;
            }
            return attributeBucketItems.some(
                (attributeBucketItem: IBucketItem) => attributeBucketItem.attribute === filter.attribute,
            );
        } else if (isMeasureValueFilter(filter)) {
            if (attributeBucketItems.length === 0) {
                return false;
            }
            return measureBucketItems.some(
                (measureBucketItem: IBucketItem) =>
                    measureBucketItem.localIdentifier === filter.measureLocalIdentifier,
            );
        } else if (isRankingFilter(filter)) {
            if (attributeBucketItems.length === 0) {
                return false;
            }
            const hasValidMeasure = measureBucketItems.some(
                (measureBucketItem: IBucketItem) => measureBucketItem.localIdentifier === filter.measure,
            );
            const hasValidAttributes =
                !filter.attributes ||
                filter.attributes.every((localIdentifier) =>
                    attributeBucketItems.some(
                        (attributeBucketItem) => attributeBucketItem.localIdentifier === localIdentifier,
                    ),
                );
            return hasValidMeasure && hasValidAttributes;
        }

        return false;
    });

    return {
        ...newReferencePoint,
        filters: {
            ...newReferencePoint.filters,
            items: filteredFilters,
        },
    };
}

export function isDerivedBucketItem(measureItem: IBucketItem): boolean {
    return !!measureItem.masterLocalIdentifier;
}

function isArithmeticBucketItem(bucketItem: IBucketItem): boolean {
    return !!bucketItem.operandLocalIdentifiers;
}

function isDerivedOfTypeBucketItem(measureItem: IBucketItem, derivedType: OverTimeComparisonType): boolean {
    if (!isDerivedBucketItem(measureItem)) {
        return false;
    }

    return measureItem.overTimeComparisonType === derivedType;
}

function findDerivedTypesReferencedByArithmeticMeasure(
    measure: IBucketItem,
    allMeasures: IBucketItem[],
    visitedMeasures: Set<string>,
): Set<OverTimeComparisonType> {
    return measure.operandLocalIdentifiers.reduce(
        (types: Set<OverTimeComparisonType>, operandIdentifier: string) => {
            if (operandIdentifier === null || visitedMeasures.has(operandIdentifier)) {
                return types;
            }
            const operand: IBucketItem = findMeasureByLocalIdentifier(operandIdentifier, allMeasures);
            if (operand === undefined) {
                return types;
            }
            if (isArithmeticBucketItem(operand)) {
                visitedMeasures.add(operandIdentifier);
                findDerivedTypesReferencedByArithmeticMeasure(operand, allMeasures, visitedMeasures).forEach(
                    (type: OverTimeComparisonType) => types.add(type),
                );
            } else if (isDerivedBucketItem(operand) && !types.has(operand.overTimeComparisonType)) {
                types.add(operand.overTimeComparisonType);
            }
            return types;
        },
        new Set(),
    );
}

/**
 * Get array of unique over time comparison types used in ancestors of the provided arithmetic measure.
 *
 * @param measure - the (possibly) arithmetic measure
 * @param buckets - all buckets
 * @returns empty array if there are no derived measures in the arithmetic measure ancestors, empty array if provided
 * measure is not arithmetic, array of unique {@link OverTimeComparisonType} of derived ancestor measures found in arithmetic
 * measure tree.
 */
export function getDerivedTypesFromArithmeticMeasure(
    measure: IBucketItem,
    buckets: IBucketOfFun[],
): OverTimeComparisonType[] {
    if (!isArithmeticBucketItem(measure)) {
        return [];
    }

    const allMeasures = flatMap<IBucketOfFun, IBucketItem>(buckets, (bucket) => bucket.items);
    const overTimeComparisonTypes = findDerivedTypesReferencedByArithmeticMeasure(
        measure,
        allMeasures,
        new Set(),
    );
    return Array.from(overTimeComparisonTypes);
}

export function filterOutDerivedMeasures(measures: IBucketItem[]): IBucketItem[] {
    return measures.filter((measure) => !isDerivedBucketItem(measure));
}

function isArithmeticMeasureFromDerived(measure: IBucketItem, buckets: IBucketOfFun[]): boolean {
    return getDerivedTypesFromArithmeticMeasure(measure, buckets).length > 0;
}

export function filterOutArithmeticMeasuresFromDerived(
    measures: IBucketItem[],
    buckets: IBucketOfFun[],
): IBucketItem[] {
    return measures.filter((measure) => !isArithmeticMeasureFromDerived(measure, buckets));
}

function isArithmeticMeasureFromDerivedOfTypeOnly(
    measure: IBucketItem,
    buckets: IBucketOfFun[],
    derivedType: OverTimeComparisonType,
): boolean {
    const arithmeticMeasureDerivedTypes = getDerivedTypesFromArithmeticMeasure(measure, buckets);
    return arithmeticMeasureDerivedTypes.length === 1 && arithmeticMeasureDerivedTypes[0] === derivedType;
}

export function keepOnlyMasterAndDerivedMeasuresOfType(
    measures: IBucketItem[],
    derivedType: OverTimeComparisonType,
): IBucketItem[] {
    return measures.filter(
        (measure) => !isDerivedBucketItem(measure) || isDerivedOfTypeBucketItem(measure, derivedType),
    );
}

export function filterOutIncompatibleArithmeticMeasures(
    measures: IBucketItem[],
    buckets: IBucketOfFun[],
    derivedOfTypeToKeep: OverTimeComparisonType,
): IBucketItem[] {
    return measures.filter(
        (measure: IBucketItem) =>
            !isArithmeticBucketItem(measure) ||
            !isArithmeticMeasureFromDerived(measure, buckets) ||
            isArithmeticMeasureFromDerivedOfTypeOnly(measure, buckets, derivedOfTypeToKeep),
    );
}

export function isDateBucketItem(bucketItem: IBucketItem): boolean {
    return bucketItem?.type === DATE;
}

export const isNotDateBucketItem = negate(isDateBucketItem);

export function getDateFilter(filtersBucket: IFilters): IDateFilter {
    if (!filtersBucket) {
        return null;
    }
    const dateFiltersInclEmpty = flatMap(filtersBucket.items, (filterItem) => {
        const filters = filterItem.filters ?? [];
        return filters.find(isDateFilter);
    });
    const dateFilters = compact(dateFiltersInclEmpty);
    return dateFilters.length ? dateFilters[0] : null;
}

export function getComparisonTypeFromFilters(filtersBucket: IFilters): OverTimeComparisonType {
    if (isEmpty(filtersBucket)) {
        return OverTimeComparisonTypes.NOTHING;
    }
    const dateFilter = getDateFilter(filtersBucket);

    return !isEmpty(dateFilter) && dateFilter.overTimeComparisonType
        ? dateFilter.overTimeComparisonType
        : OverTimeComparisonTypes.NOTHING;
}

function bucketSupportsSubtitle(visualizationType: string, bucketLocalIdentifier: string) {
    switch (visualizationType) {
        case VisualizationTypes.HEADLINE:
            return true;

        case VisualizationTypes.SCATTER:
            return bucketLocalIdentifier !== BucketNames.ATTRIBUTE;

        case VisualizationTypes.BUBBLE:
            return bucketLocalIdentifier !== BucketNames.VIEW;

        case VisualizationTypes.COMBO:
            return bucketLocalIdentifier !== BucketNames.VIEW;

        case VisualizationTypes.BULLET:
            return bucketLocalIdentifier !== BucketNames.VIEW;

        case VisualizationTypes.PUSHPIN:
            return (
                bucketLocalIdentifier !== BucketNames.LOCATION &&
                bucketLocalIdentifier !== BucketNames.SEGMENT
            );

        case VisualizationTypes.SANKEY:
        case VisualizationTypes.DEPENDENCY_WHEEL:
            return bucketLocalIdentifier !== BucketNames.MEASURES;

        default:
            return false;
    }
}

export function setBucketTitles(
    referencePoint: IExtendedReferencePoint,
    visualizationType: string,
    intl?: IntlShape,
): IUiConfig {
    const buckets = referencePoint?.buckets;
    const updatedUiConfig = cloneDeep(referencePoint?.uiConfig);

    forEach(buckets, (bucket) => {
        const localIdentifier = bucket.localIdentifier ?? "";
        // skip disabled buckets
        if (!(updatedUiConfig?.buckets?.[localIdentifier]?.enabled ?? false)) {
            return;
        }

        if (bucketSupportsSubtitle(visualizationType, localIdentifier)) {
            const subtitleId = generateBucketSubtitleId(localIdentifier, visualizationType);
            const subtitle = getTranslation(subtitleId, intl);
            set(updatedUiConfig, [BUCKETS, localIdentifier, "subtitle"], subtitle);
        }

        const titleId = generateBucketTitleId(localIdentifier, visualizationType);
        const title = getTranslation(titleId, intl);
        set(updatedUiConfig, [BUCKETS, localIdentifier, "title"], title);
    });

    return updatedUiConfig;
}

export function generateBucketTitleId(localIdentifier: string, visualizationType: string): string {
    return titles[`${localIdentifier}_${visualizationType}`].id;
}

function generateBucketSubtitleId(localIdentifier: string, visualizationType: string): string {
    return subtitles[`${localIdentifier}_${visualizationType}`].id;
}

export function getItemsCount(buckets: IBucketOfFun[], localIdentifier: string): number {
    return getBucketItems(buckets, localIdentifier).length;
}

export function getBucketItems(buckets: IBucketOfFun[], localIdentifier: string): IBucketItem[] {
    return buckets.find((bucket) => bucket.localIdentifier === localIdentifier)?.items ?? [];
}

// return bucket items matching localIdentifiers from any bucket
export function getItemsFromBuckets(
    buckets: IBucketOfFun[],
    localIdentifiers: string[],
    types?: string[],
): IBucketItem[] {
    return localIdentifiers.reduce((bucketItems: IBucketItem[], localIdentifier) => {
        const toAdd = types
            ? getBucketItemsByType(buckets, localIdentifier, types)
            : getBucketItems(buckets, localIdentifier);

        bucketItems.push(...toAdd);
        return bucketItems;
    }, []);
}

export function getBucketItemsByType(
    buckets: IBucketOfFun[],
    localIdentifier: string,
    types: string[],
): IBucketItem[] {
    const itemsOfType: IBucketItem[] = [];
    const bucketItems: IBucketItem[] = getBucketItems(buckets, localIdentifier);

    bucketItems.forEach((item: IBucketItem) => {
        if (includes(types, item.type)) {
            itemsOfType.push(item);
        }
    });
    return itemsOfType;
}

export function getPreferredBucketItems(
    buckets: IBucketOfFun[],
    preference: string[],
    type: string[],
): IBucketItem[] {
    const bucket = getPreferredBucket(buckets, preference, type);
    return bucket?.items ?? [];
}

function getPreferredBucket(buckets: IBucketOfFun[], preference: string[], type: string[]): IBucketOfFun {
    return preference.reduce((result: IBucketOfFun, preference: string) => {
        if (result) {
            return result;
        }

        return buckets.find((bucket: IBucketOfFun) => {
            const preferenceMatch = bucket.localIdentifier === preference;
            const typeMatch = every(bucket?.items ?? [], (item) => type.indexOf(item.type) !== -1);

            return preferenceMatch && typeMatch;
        });
    }, undefined);
}

function getAllBucketItemsByType(bucket: IBucketOfFun, types: string[]): IBucketItem[] {
    return bucket.items.reduce((resultItems: IBucketItem[], item: IBucketItem): IBucketItem[] => {
        if (includes(types, item.type)) {
            resultItems.push(item);
        }
        return resultItems;
    }, []);
}

export function getAllItemsByType(buckets: IBucketOfFun[], types: string[]): IBucketItem[] {
    return buckets.reduce((items: IBucketItem[], bucket: IBucketOfFun) => {
        items.push(...getAllBucketItemsByType(bucket, types));
        return items;
    }, []);
}

export function removeDuplicateBucketItems(buckets: IBucketOfFun[]): IBucketOfFun[] {
    const usedIdentifiersMap: { [key: string]: boolean } = {};

    return buckets.map((bucket) => {
        const filteredBucketItems = bucket.items.filter((bucketItem) => {
            const isDuplicate = usedIdentifiersMap[bucketItem.localIdentifier];
            usedIdentifiersMap[bucketItem.localIdentifier] = true;
            return !isDuplicate;
        });
        return filteredBucketItems.length === bucket.items.length
            ? bucket
            : {
                  ...bucket,
                  items: filteredBucketItems,
              };
    });
}

export function getTotalsFromBucket(buckets: IBucketOfFun[], bucketName: string): ITotal[] {
    const selectedBucket = buckets.find((bucket) => bucket.localIdentifier === bucketName);
    return selectedBucket?.totals ?? [];
}

function getUniqueAttributes(buckets: IBucketOfFun[]): IBucketItem[] {
    const attributes = getAllItemsByType(buckets, [ATTRIBUTE, DATE]);
    return uniqBy(attributes, (attribute) => attribute?.attribute);
}

export function getMeasuresFromMdObject(insight: IInsightDefinition): IMeasure[] {
    if (!insight) {
        return [];
    }

    return bucketsMeasures(insightBuckets(insight), isSimpleMeasure);
}

export function getAllMeasures(buckets: IBucketOfFun[]): IBucketItem[] {
    return getAllItemsByType(buckets, [METRIC]);
}

export function getFirstValidMeasure(buckets: IBucketOfFun[]): IBucketItem {
    const measures = getAllMeasures(buckets);
    const validMeasures = measures.filter(isValidMeasure);
    return validMeasures[0] || null;
}

function isValidMeasure(measure: IBucketItem): boolean {
    if (isArithmeticBucketItem(measure)) {
        return measure.operandLocalIdentifiers.every(
            (operandLocalIdentifier) => operandLocalIdentifier !== null,
        );
    }
    return true;
}

export function getFirstAttribute(buckets: IBucketOfFun[]): IBucketItem {
    return getUniqueAttributes(buckets)[0] || null;
}

export function getMeasureItems(buckets: IBucketOfFun[]): IBucketItem[] {
    const preference = [BucketNames.MEASURES, BucketNames.SECONDARY_MEASURES, BucketNames.TERTIARY_MEASURES];
    const preferredMeasures = preference.reduce((acc: IBucketItem[], pref) => {
        const prefBucketItems = getPreferredBucketItems(buckets, [pref], [METRIC]);
        acc.push(...prefBucketItems);
        return acc;
    }, []);

    // if no preferred items are found, return all available items
    if (isEmpty(preferredMeasures)) {
        return getAllMeasures(buckets);
    }

    return preferredMeasures;
}

export function getBucketItemsWithExcludeByType(
    buckets: IBucketOfFun[],
    excludedBucket: string[],
    type: string[],
): IBucketItem[] {
    const includedBuckets = buckets.filter(
        (bucket: IBucketOfFun) => !includes(excludedBucket, bucket.localIdentifier),
    );
    return getAllItemsByType(includedBuckets, type);
}

export function getStackItems(buckets: IBucketOfFun[], itemTypes: string[] = [ATTRIBUTE]): IBucketItem[] {
    const preferredStacks = getPreferredBucket(buckets, [BucketNames.STACK, BucketNames.SEGMENT], itemTypes);

    return preferredStacks?.items ?? [];
}

export function getAttributeToItems(buckets: IBucketOfFun[]): IBucketItem[] {
    const preferredAttributeTos = getPreferredBucket(buckets, [BucketNames.ATTRIBUTE_TO], [ATTRIBUTE, DATE]);
    return preferredAttributeTos?.items ?? [];
}

export function getAttributeFromItems(buckets: IBucketOfFun[]): IBucketItem[] {
    const preferredAttributeTos = getPreferredBucket(
        buckets,
        [BucketNames.ATTRIBUTE_FROM],
        [ATTRIBUTE, DATE],
    );
    return preferredAttributeTos?.items ?? [];
}

export function getViewItems(buckets: IBucketOfFun[], itemTypes: string[] = [ATTRIBUTE]): IBucketItem[] {
    const preferredStacks = getPreferredBucket(buckets, [BucketNames.VIEW], itemTypes);

    return preferredStacks?.items ?? [];
}

export function getAttributeItems(buckets: IBucketOfFun[]): IBucketItem[] {
    return getAllAttributeItemsWithPreference(buckets, [
        BucketNames.LOCATION,
        BucketNames.VIEW,
        BucketNames.TREND,
    ]);
}

export function getAttributeItemsWithoutStacks(
    buckets: IBucketOfFun[],
    itemTypes: string[] = [ATTRIBUTE],
): IBucketItem[] {
    return getAttributeItems(buckets).filter((attribute) => {
        return !includes(getStackItems(buckets, itemTypes), attribute);
    });
}

export function getAllCategoriesAttributeItems(buckets: IBucketOfFun[]): IBucketItem[] {
    const stackItemsWithDate = getStackItems(buckets, [ATTRIBUTE, DATE]);
    return getAttributeItems(buckets).filter((attribute: IBucketItem) => {
        return !includes(stackItemsWithDate, attribute);
    });
}

export function getAllAttributeItems(buckets: IBucketOfFun[]): IBucketItem[] {
    return getAllItemsByType(buckets, [ATTRIBUTE, DATE]);
}

function getAllMeasureItems(buckets: IBucketOfFun[]): IBucketItem[] {
    return getAllItemsByType(buckets, [METRIC]);
}

// get all attributes from buckets, but items from preferred buckets are first
export function getAllAttributeItemsWithPreference(
    buckets: IBucketOfFun[],
    preference: string[],
): IBucketItem[] {
    const preferredAttributes = preference.reduce((acc: IBucketItem[], pref) => {
        const prefBucket = getPreferredBucket(buckets, [pref], [ATTRIBUTE, DATE]);
        if (prefBucket?.items?.length) {
            acc.push(...prefBucket.items);
        }
        return acc;
    }, []);
    const allBucketNames = buckets.map((bucket) => bucket?.localIdentifier);
    const otherBucketNames = allBucketNames.filter((bucketName) => !includes(preference, bucketName));
    const allOtherAttributes = otherBucketNames.reduce((attributes: IBucketItem[], bucketName) => {
        attributes.push(...getBucketItemsByType(buckets, bucketName, [ATTRIBUTE, DATE]));
        return attributes;
    }, []);
    return [...preferredAttributes, ...allOtherAttributes];
}

export function getDateItems(buckets: IBucketOfFun[]): IBucketItem[] {
    return getAttributeItemsWithoutStacks(buckets).filter(isDateBucketItem);
}

export function getDateItemsWithMultipleDates(buckets: IBucketOfFun[]): IBucketItem[] {
    return getAttributeItemsWithoutStacks(buckets, [ATTRIBUTE, DATE]).filter(isDateBucketItem);
}

export function getFistDateItemWithMultipleDates(buckets: IBucketOfFun[]): IBucketItem | undefined {
    const dateItems = getDateItemsWithMultipleDates(buckets);
    return dateItems[0];
}
export function getFistDateItem(buckets: IBucketOfFun[]): IBucketItem | undefined {
    const dateItems = getDateItems(buckets);
    return dateItems[0];
}

export function getMainDateItem(dateItems: IBucketItem[]): IBucketItem {
    // first item for now, can be replaced by item matching the dimension of date filter in future
    return dateItems[0];
}

function hasItemsAboveLimit(bucket: IBucketOfFun, itemsLimit: number): boolean {
    const masterBucketItems = filterOutDerivedMeasures(bucket.items);
    return masterBucketItems.length > itemsLimit;
}

function applyItemsLimit(bucket: IBucketOfFun, itemsLimit: number): IBucketOfFun {
    if (itemsLimit !== undefined && hasItemsAboveLimit(bucket, itemsLimit)) {
        const newBucket = cloneDeep(bucket);

        newBucket.items = newBucket.items.slice(0, itemsLimit);
        return newBucket;
    }
    return bucket;
}

function applyUiConfigOnBucket(bucket: IBucketOfFun, bucketUiConfig: IBucketUiConfig): IBucketOfFun {
    return applyItemsLimit(bucket, bucketUiConfig?.itemsLimit);
}

export function applyUiConfig(referencePoint: IExtendedReferencePoint): IExtendedReferencePoint {
    const buckets: IBucketOfFun[] = referencePoint.buckets;
    const uiConfig: IBucketsUiConfig = referencePoint.uiConfig.buckets;
    const newBuckets: IBucketOfFun[] = buckets.map((bucket: IBucketOfFun) =>
        applyUiConfigOnBucket(bucket, uiConfig[bucket.localIdentifier]),
    );
    set(referencePoint, "buckets", newBuckets);
    return referencePoint;
}

export function hasBucket(buckets: IBucketOfFun[], localIdentifier: string): boolean {
    return buckets.some((bucket) => bucket.localIdentifier === localIdentifier);
}

export function findBucket(buckets: IBucketOfFun[], localIdentifier: string): IBucketOfFun {
    return buckets.find((bucket) => bucket?.localIdentifier === localIdentifier);
}

export function getBucketsByNames(buckets: IBucketOfFun[], names: string[]): IBucketOfFun[] {
    return buckets.filter((bucket) => includes(names, bucket?.localIdentifier));
}

export function getFirstMasterWithDerived(measureItems: IBucketItem[]): IBucketItem[] {
    const masters = filterOutDerivedMeasures(measureItems);
    const chosenMaster = masters[0];
    return measureItems.filter(
        (measureItem) =>
            measureItem.masterLocalIdentifier === chosenMaster.localIdentifier ||
            measureItem === chosenMaster,
    );
}

export function removeAllArithmeticMeasuresFromDerived(
    extendedReferencePoint: IExtendedReferencePoint,
): IExtendedReferencePoint {
    const originalBuckets = cloneDeep(extendedReferencePoint.buckets);
    forEach(extendedReferencePoint.buckets, (bucket) => {
        bucket.items = filterOutArithmeticMeasuresFromDerived(bucket.items, originalBuckets);
    });
    return extendedReferencePoint;
}

export function removeAllDerivedMeasures(
    extendedReferencePoint: IExtendedReferencePoint,
): IExtendedReferencePoint {
    forEach(extendedReferencePoint.buckets, (bucket) => {
        bucket.items = filterOutDerivedMeasures(bucket.items);
    });
    return extendedReferencePoint;
}

export function findMasterBucketItem(
    derivedBucketItem: IBucketItem,
    bucketItems: IBucketItem[],
): IBucketItem {
    return bucketItems.find((item) => item.localIdentifier === derivedBucketItem.masterLocalIdentifier);
}

export function findMasterBucketItems(bucketItems: IBucketItem[]): IBucketItem[] {
    return bucketItems.filter((measure) => !isDerivedBucketItem(measure));
}

export function findDerivedBucketItems(
    masterBucketItem: IBucketItem,
    bucketItems: IBucketItem[],
): IBucketItem[] {
    return bucketItems.filter(
        (measure) => measure.masterLocalIdentifier === masterBucketItem.localIdentifier,
    );
}

export function findDerivedBucketItem(
    masterBucketItem: IBucketItem,
    bucketItems: IBucketItem[],
): IBucketItem {
    return bucketItems.find(
        (bucketItem) => bucketItem.masterLocalIdentifier === masterBucketItem.localIdentifier,
    );
}

export function hasDerivedBucketItems(masterBucketItem: IBucketItem, buckets: IBucketOfFun[]): boolean {
    return buckets.some((bucket) =>
        bucket.items.some(
            (bucketItem) => bucketItem.masterLocalIdentifier === masterBucketItem.localIdentifier,
        ),
    );
}

export function getFilteredMeasuresForStackedCharts(buckets: IBucketOfFun[]): IBucketItem[] {
    const hasStacks = getStackItems(buckets, [ATTRIBUTE, DATE]).length > 0;
    if (hasStacks) {
        const limitedBuckets = limitNumberOfMeasuresInBuckets(buckets, 1);
        return getMeasureItems(limitedBuckets);
    }
    return getMeasureItems(buckets);
}

export function noRowsAndHasOneMeasure(buckets: IBucket[]): boolean {
    const measuresBucket = bucketsFind(buckets, BucketNames.MEASURES);
    const measures = measuresBucket ? bucketItems(measuresBucket) : [];
    const rowsBucket = bucketsFind(buckets, BucketNames.VIEW);
    const rows = rowsBucket ? bucketItems(rowsBucket) : [];

    const hasOneMeasure = measures.length === 1;
    const hasRows = rows.length > 0;

    return Boolean(hasOneMeasure && !hasRows);
}

export function noColumnsAndHasOneMeasure(buckets: IBucket[]): boolean {
    const measuresBucket = bucketsFind(buckets, BucketNames.MEASURES);
    const measures = measuresBucket ? bucketItems(measuresBucket) : [];
    const columnsBucket = bucketsFind(buckets, BucketNames.STACK);
    const columns = columnsBucket ? bucketItems(columnsBucket) : [];

    const hasOneMeasure = measures.length === 1;
    const hasColumn = columns.length > 0;

    return hasOneMeasure && !hasColumn;
}

export function limitNumberOfMeasuresInBuckets(
    buckets: IBucketOfFun[],
    measuresLimitCount: number,
    tryToSelectDerivedWithMaster: boolean = false,
): IBucketOfFun[] {
    const allMeasures = getAllMeasures(buckets);

    let selectedMeasuresLocalIdentifiers: string[] = [];

    // try to select measures one per bucket
    buckets.forEach((bucket: IBucketOfFun) => {
        const currentBucketMeasures: IBucketItem[] = getAllBucketItemsByType(bucket, [METRIC]);

        if (currentBucketMeasures.length === 0) {
            return;
        }

        selectedMeasuresLocalIdentifiers = getLimitedMeasuresLocalIdentifiers(
            currentBucketMeasures,
            1,
            allMeasures,
            measuresLimitCount,
            tryToSelectDerivedWithMaster,
            selectedMeasuresLocalIdentifiers,
        );
    });

    // if it was not possible to select all measures one per bucket then limit them globally
    if (selectedMeasuresLocalIdentifiers.length < measuresLimitCount) {
        selectedMeasuresLocalIdentifiers = getLimitedMeasuresLocalIdentifiers(
            allMeasures,
            measuresLimitCount,
            allMeasures,
            measuresLimitCount,
            tryToSelectDerivedWithMaster,
            selectedMeasuresLocalIdentifiers,
        );
    }

    return pruneBucketMeasureItems(buckets, selectedMeasuresLocalIdentifiers);
}

function getLimitedMeasuresLocalIdentifiers(
    measures: IBucketItem[],
    measuresLimitCount: number,
    allMeasures: IBucketItem[],
    allMeasuresLimitCount: number,
    tryToSelectDerivedWithMaster: boolean,
    alreadySelectedMeasures: string[],
): string[] {
    let selectedMeasures: string[] = alreadySelectedMeasures;

    // try to select measures one by one together with their dependencies
    measures.forEach((measure: IBucketItem) => {
        if (selectedMeasures.length - alreadySelectedMeasures.length === measuresLimitCount) {
            return;
        }

        const measureDependencies = getDependenciesLocalIdentifiers(measure, allMeasures);
        const measureWithDependencies = [measure.localIdentifier, ...measureDependencies];

        if (tryToSelectDerivedWithMaster) {
            const derivedMeasures = getDerivedLocalIdentifiers(measure, allMeasures);
            const masterDerivedAndDependencies = [...measureWithDependencies, ...derivedMeasures];

            selectedMeasures = tryToSelectMeasures(
                masterDerivedAndDependencies,
                selectedMeasures,
                allMeasuresLimitCount,
            );
        }

        selectedMeasures = tryToSelectMeasures(
            measureWithDependencies,
            selectedMeasures,
            allMeasuresLimitCount,
        );
    });

    return selectedMeasures;
}

function getDerivedLocalIdentifiers(measure: IBucketItem, allMeasures: IBucketItem[]): string[] {
    const derivedMeasures = findDerivedBucketItems(measure, allMeasures);
    return derivedMeasures.map((derivedMeasure: IBucketItem) => derivedMeasure.localIdentifier);
}

function findMeasureByLocalIdentifier(
    localIdentifier: string,
    measures: IBucketItem[],
): IBucketItem | undefined {
    return measures.find((measure: IBucketItem) => measure.localIdentifier === localIdentifier);
}

function getDependenciesLocalIdentifiers(measure: IBucketItem, allMeasures: IBucketItem[]): string[] {
    const directDependencies: string[] = [];

    if (measure.masterLocalIdentifier) {
        directDependencies.push(measure.masterLocalIdentifier);
    }

    if (measure.operandLocalIdentifiers) {
        measure.operandLocalIdentifiers
            .filter((operandLocalIdentifier) => operandLocalIdentifier !== null)
            .forEach((operandLocalIdentifier: string) => {
                const operandMeasure = findMeasureByLocalIdentifier(operandLocalIdentifier, allMeasures);
                if (operandMeasure !== undefined) {
                    directDependencies.push(operandLocalIdentifier);
                }
            });
    }

    const indirectDependencies: string[] = [];

    directDependencies.forEach((dependencyLocalIdentifier: string) => {
        const dependencyMeasure = findMeasureByLocalIdentifier(dependencyLocalIdentifier, allMeasures);
        const dependenciesOfDependency = getDependenciesLocalIdentifiers(dependencyMeasure, allMeasures);
        indirectDependencies.push(...dependenciesOfDependency);
    });

    return uniq([...directDependencies, ...indirectDependencies]);
}

function tryToSelectMeasures(measures: string[], alreadySelectedMeasures: string[], limit: number): string[] {
    const measuresToBePlaced = without(measures, ...alreadySelectedMeasures);

    if (measuresToBePlaced.length <= limit - alreadySelectedMeasures.length) {
        return [...alreadySelectedMeasures, ...measuresToBePlaced];
    }

    return alreadySelectedMeasures;
}

function pruneBucketMeasureItems(
    buckets: IBucketOfFun[],
    measureLocalIdentifiersToBeKept: string[],
): IBucketOfFun[] {
    return buckets.map((bucket: IBucketOfFun): IBucketOfFun => {
        const prunedItems = bucket.items.filter(
            (item: IBucketItem) =>
                measureLocalIdentifiersToBeKept.indexOf(item.localIdentifier) > -1 || item.type !== METRIC,
        );

        return {
            ...bucket,
            items: prunedItems,
        };
    });
}

function isShowOnSecondaryAxis(item: IBucketItem): boolean {
    return item?.showOnSecondaryAxis ?? false;
}

export function setMeasuresShowOnSecondaryAxis(items: IBucketItem[], value: boolean): IBucketItem[] {
    return items.map((item: IBucketItem) => ({
        ...item,
        [SHOW_ON_SECONDARY_AXIS]: value,
    }));
}

export function removeShowOnSecondaryAxis(items: IBucketItem[]): IBucketItem[] {
    return setMeasuresShowOnSecondaryAxis(items, null);
}

export function getAllMeasuresShowOnSecondaryAxis(buckets: IBucketOfFun[]): IBucketItem[] {
    return getAllItemsByType(buckets, [METRIC]).filter(isShowOnSecondaryAxis);
}

export function getItemsLocalIdentifiers(items: IBucketItem[]): string[] {
    return items.map((item) => item?.localIdentifier ?? "");
}

export interface IMeasureBucketItemsLimit {
    localIdentifier: string;
    itemsLimit: number;
}

export const transformMeasureBuckets = (
    measureBucketItemsLimits: IMeasureBucketItemsLimit[],
    buckets: IBucketOfFun[],
): IBucketOfFun[] => {
    let unusedMeasures: IBucketItem[] = [];

    const newBuckets: IBucketOfFun[] = measureBucketItemsLimits.map(({ localIdentifier, itemsLimit }) => {
        const preferredBucketLocalIdentifiers: string[] =
            localIdentifier === BucketNames.MEASURES
                ? [BucketNames.MEASURES, BucketNames.SIZE]
                : localIdentifier === BucketNames.SECONDARY_MEASURES
                ? [BucketNames.SECONDARY_MEASURES, BucketNames.COLOR]
                : [localIdentifier];

        const preferredBucketItems = getPreferredBucketItems(buckets, preferredBucketLocalIdentifiers, [
            METRIC,
        ]);
        const measuresToBePlaced = preferredBucketItems.splice(0, itemsLimit);

        if (measuresToBePlaced.length === 0) {
            return {
                localIdentifier,
                items: unusedMeasures.splice(0, itemsLimit),
            };
        }

        unusedMeasures = [...unusedMeasures, ...preferredBucketItems];

        return {
            localIdentifier,
            items: measuresToBePlaced,
        };
    });

    return newBuckets.map((bucket: IBucketOfFun, bucketIndex: number) => {
        const bucketItemsLimit = measureBucketItemsLimits[bucketIndex].itemsLimit;

        const freeSlotsCount = bucketItemsLimit - bucket.items.length;
        if (freeSlotsCount === 0) {
            return bucket;
        }

        return {
            ...bucket,
            items: [...bucket.items, ...unusedMeasures.splice(0, freeSlotsCount)],
        };
    });
};

export const hasSameDateDimension = (dateItem: IBucketItem, referenceDateItem: IBucketItem): boolean => {
    if (isDateBucketItem(dateItem) && isDateBucketItem(referenceDateItem)) {
        return areObjRefsEqual(dateItem.dateDatasetRef, referenceDateItem.dateDatasetRef);
    }
    return false;
};

export const removeDivergentDateItems = (
    viewItems: IBucketItem[],
    mainDateItem: IBucketItem,
): IBucketItem[] => {
    return viewItems.filter(
        (item: IBucketItem) => isNotDateBucketItem(item) || hasSameDateDimension(item, mainDateItem),
    );
};

const getDateFilterRef = (filters: IFilters): ObjRef | undefined => {
    const dateFilter = filters?.items?.find(isFiltersBucketItem);
    if (!dateFilter) {
        return undefined;
    }
    return dateFilter.dateDatasetRef;
};

export const isComparisonAvailable = (buckets: IBucketOfFun[], filters: IFilters): boolean => {
    const itemsFromBucket: IBucketItem[] = buckets.reduce((acc: IBucketItem[], bucket) => {
        acc.push(...bucket.items);
        return acc;
    }, []);
    const bucketDateItems = itemsFromBucket.filter(isDateBucketItem);
    const areDateBucketItemsEmpty = bucketDateItems.length === 0;
    const dateFilterRef = getDateFilterRef(filters);
    if (areDateBucketItemsEmpty) {
        return true;
    }
    return bucketDateItems.some((bucketDateItem: IBucketItem) =>
        areObjRefsEqual(bucketDateItem.dateDatasetRef, dateFilterRef),
    );
};
