// (C) 2019-2025 GoodData Corporation

import { isEmpty, reduce } from "lodash-es";

import { BucketNames } from "@gooddata/sdk-ui";

import {
    getAllAttributeItems,
    getAllItemsByType,
    getAttributeItemsWithoutStacks,
    getBucketItems,
    getItemsCount,
    getMeasureItems,
    getStackItems,
    isDateBucketItem,
    isMeasureValueFilter,
    isRankingFilter,
} from "./bucketHelper.js";
import { ALL_TIME, ATTRIBUTE, DATE, METRIC } from "../constants/bucket.js";
import {
    INCREASE_MAX_TABLE_ATTRIBUTES_ITEMS_LIMIT,
    INCREASE_MAX_TABLE_MEASURE_ITEMS_LIMIT,
    MAX_METRICS_COUNT,
    MAX_TABLE_CATEGORIES_COUNT,
} from "../constants/uiConfig.js";
import {
    type IBucketItem,
    type IBucketOfFun,
    type IDateFilter,
    type IFilters,
    type IFiltersBucketItem,
    type IReferencePoint,
} from "../interfaces/Visualization.js";

export function hasOneMeasure(buckets: IBucketOfFun[]): boolean {
    return getItemsCount(buckets, BucketNames.MEASURES) === 1;
}

function hasOneMasterMeasure(buckets: IBucketOfFun[]): boolean {
    return getMasterMeasuresCount(buckets, BucketNames.MEASURES) === 1;
}

export function getMasterMeasuresCount(buckets: IBucketOfFun[], bucketLocalIdentifier: string): number {
    const items: IBucketItem[] = getBucketItems(buckets, bucketLocalIdentifier);
    return reduce(items, (acc, item) => (item.masterLocalIdentifier ? acc : acc + 1), 0);
}

export function hasOneMasterMeasureInBucket(buckets: IBucketOfFun[], bucketLocalIdentifier: string): boolean {
    return getMasterMeasuresCount(buckets, bucketLocalIdentifier) === 1;
}

export function hasOneMeasureOrAlsoLineStyleControlMeasure(buckets: IBucketOfFun[]): boolean {
    const measures = getBucketItems(buckets, BucketNames.MEASURES);
    const lineStyleControlMetrics = measures.filter((measure) => measure.isThresholdMeasure);
    return measures.length === 1 || (measures.length === 2 && lineStyleControlMetrics.length === 1);
}

export function filteredByDerivedMeasure(buckets: IBucketOfFun[], filters: IFilters): boolean {
    const measures = getAllItemsByType(buckets, [METRIC]);
    const derivedMeasuresLocalIdentifiers = measures.reduce((acc: string[], measure) => {
        if (measure.masterLocalIdentifier) {
            acc.push(measure.localIdentifier);
        }
        return acc;
    }, []);

    const allBucketFilters = filters.items.flatMap((filterItem) => filterItem.filters);
    return allBucketFilters
        .filter(isMeasureValueFilter)
        .some((measureValueFilter) =>
            derivedMeasuresLocalIdentifiers.includes(measureValueFilter.measureLocalIdentifier),
        );
}

export function hasNoMeasures(buckets: IBucketOfFun[]): boolean {
    return getItemsCount(buckets, BucketNames.MEASURES) === 0;
}

export function hasNoSecondaryMeasures(buckets: IBucketOfFun[]): boolean {
    return getItemsCount(buckets, BucketNames.SECONDARY_MEASURES) === 0;
}

export function hasNoAttribute(buckets: IBucketOfFun[]): boolean {
    return getItemsCount(buckets, BucketNames.ATTRIBUTE) === 0;
}

export function hasMeasuresOrRowsUnderLowerLimit(buckets: IBucketOfFun[]): boolean {
    return (
        getItemsCount(buckets, BucketNames.ATTRIBUTE) <= MAX_TABLE_CATEGORIES_COUNT &&
        getItemsCount(buckets, BucketNames.MEASURES) <= MAX_METRICS_COUNT
    );
}

export function hasNoColumns(buckets: IBucketOfFun[]): boolean {
    return getItemsCount(buckets, BucketNames.COLUMNS) === 0;
}

export function hasSomeSegmentByItems(buckets: IBucketOfFun[]): boolean {
    return getItemsCount(buckets, BucketNames.SEGMENT) !== 0;
}

export function hasMoreThanOneCategory(buckets: IBucketOfFun[]): boolean {
    return getAllAttributeItems(buckets).length > 1;
}

export function hasMoreThanOneMasterMeasure(buckets: IBucketOfFun[], bucketLocalIdentifier: string): boolean {
    return getMasterMeasuresCount(buckets, bucketLocalIdentifier) > 1;
}

function hasSomeCategories(buckets: IBucketOfFun[]): boolean {
    return getAttributeItemsWithoutStacks(buckets).length > 0;
}

function hasNoCategories(buckets: IBucketOfFun[]): boolean {
    return getAttributeItemsWithoutStacks(buckets).length === 0;
}

function allRulesMet(
    rules: Array<(buckets: IBucketOfFun[], filters?: IFilters) => boolean>,
    buckets: IBucketOfFun[],
    filters?: IFilters,
): boolean {
    return rules.every((rule) => rule(buckets, filters));
}

function hasDateInCategories(buckets: IBucketOfFun[]): boolean {
    return getAllAttributeItems(buckets).some(isDateBucketItem);
}

export function hasGlobalDateFilterIgnoreAllTime(filters: IFilters): boolean {
    if (filters) {
        const filterBucketItems = filters?.items ?? [];
        const dateFilter = filterBucketItems.find((filter: IFiltersBucketItem) => {
            return filter?.attribute === "attr.datedataset";
        });

        const interval = (dateFilter?.filters?.[0] as IDateFilter)?.interval ?? null;
        return interval && interval.name !== ALL_TIME;
    }

    return false;
}

export function hasGlobalDateFilter(filters: IFilters): boolean {
    if (filters) {
        return filters.items.some((item) => (item?.filters?.[0] as IDateFilter)?.interval);
    }

    return false;
}

export function hasUsedDateIgnoreAllTime(buckets: IBucketOfFun[], filters: IFilters): boolean {
    return hasDateInCategories(buckets) || hasGlobalDateFilterIgnoreAllTime(filters);
}

export function hasUsedDate(buckets: IBucketOfFun[], filters: IFilters): boolean {
    return hasDateInCategories(buckets) || hasGlobalDateFilter(filters);
}

function hasNoMeasureDateFilter(buckets: IBucketOfFun[]): boolean {
    return !getMeasureItems(buckets).some((item: IBucketItem) => {
        const filters = item?.filters;
        return filters?.some((filter) => isDateBucketItem(filter as unknown as IBucketItem));
    });
}

export function hasNoStacks(buckets: IBucketOfFun[]): boolean {
    return getStackItems(buckets).length === 0;
}

export function hasNoStacksWithDate(buckets: IBucketOfFun[]): boolean {
    return getStackItems(buckets, [ATTRIBUTE, DATE]).length === 0;
}

export function hasOneCategory(buckets: IBucketOfFun[]): boolean {
    return getAttributeItemsWithoutStacks(buckets, [ATTRIBUTE, DATE]).length === 1;
}

function isShowPercentageUnselected(buckets: IBucketOfFun[]): boolean {
    return !getBucketItems(buckets, BucketNames.MEASURES)?.[0]?.showInPercent;
}

export function noDerivedMeasurePresent(buckets: IBucketOfFun[]): boolean {
    const measures = getAllItemsByType(buckets, [METRIC]);
    return !measures.some((measure) => measure.masterLocalIdentifier);
}

function hasFirstDate(buckets: IBucketOfFun[]): boolean {
    const firstAttributeItem = getAllAttributeItems(buckets)?.[0];
    return firstAttributeItem && isDateBucketItem(firstAttributeItem);
}

function hasNotFirstDate(buckets: IBucketOfFun[]): boolean {
    return !hasFirstDate(buckets);
}

export function hasNonAllTimeFilter(filters: IFilters): boolean {
    const filterBucketItems = filters?.items ?? [];
    const dateFilter = filterBucketItems.find((filter: IFiltersBucketItem) => {
        return filter?.attribute === "attr.datedataset";
    });

    const filterInterval = (dateFilter?.filters?.[0] as IDateFilter)?.interval?.interval ?? [];
    return !isEmpty(filterInterval);
}

function hasNoRankingFilter(_: IBucketOfFun[], filters: IFilters): boolean {
    const allBucketFilters = filters.items.flatMap((filterItem) => filterItem.filters);
    return !allBucketFilters.some(isRankingFilter);
}

export function isShowInPercentAllowed(
    buckets: IBucketOfFun[],
    filters: IFilters,
    bucketLocalIdentifier: string,
): boolean {
    const rules = [hasNoStacks, hasSomeCategories, hasNoRankingFilter];

    return (
        allRulesMet(rules, buckets, filters) &&
        hasOneMasterMeasureInBucket(buckets, bucketLocalIdentifier) &&
        !filteredByDerivedMeasure(buckets, filters)
    );
}

export function isComparisonOverTimeAllowed(buckets: IBucketOfFun[], filters: IFilters): boolean {
    return allRulesMet([hasNoStacksWithDate], buckets, filters) && hasGlobalDateFilter(filters);
}

export function overTimeComparisonRecommendationEnabled(referencePoint: IReferencePoint): boolean {
    const rules = [
        noDerivedMeasurePresent,
        hasOneMeasure,
        hasFirstDate,
        hasNoStacksWithDate,
        hasOneCategory,
        hasNoMeasureDateFilter,
    ];

    return (
        allRulesMet(rules, referencePoint?.buckets ?? []) &&
        hasGlobalDateFilterIgnoreAllTime(referencePoint?.filters)
    );
}

export function comparisonAndTrendingRecommendationEnabled(buckets: IBucketOfFun[]): boolean {
    const rules = [hasOneMeasure, noDerivedMeasurePresent, hasNoCategories];

    return allRulesMet(rules, buckets);
}

export function percentRecommendationEnabled(buckets: IBucketOfFun[], filters: IFilters): boolean {
    const rules = [
        isShowPercentageUnselected,
        hasNotFirstDate,
        hasOneMasterMeasure,
        hasOneCategory,
        hasNoStacks,
        hasNoRankingFilter,
    ];

    return allRulesMet(rules, buckets, filters) && !filteredByDerivedMeasure(buckets, filters);
}

export function previousPeriodRecommendationEnabled(buckets: IBucketOfFun[]): boolean {
    const rules = [
        hasOneMeasure,
        hasOneCategory,
        hasNotFirstDate,
        hasNoStacks,
        noDerivedMeasurePresent,
        isShowPercentageUnselected,
        hasNoMeasureDateFilter,
    ];

    return allRulesMet(rules, buckets);
}

export function canIncreasedTableMeasuresAddMoreItems(buckets: IBucketOfFun[]) {
    const itemsCount = getItemsCount(buckets, BucketNames.MEASURES);
    const limit = hasNoColumns(buckets) ? INCREASE_MAX_TABLE_MEASURE_ITEMS_LIMIT : MAX_METRICS_COUNT;
    return itemsCount < limit;
}

export function canIncreasedTableAttributesAddMoreItems(buckets: IBucketOfFun[]) {
    const itemsCount = getItemsCount(buckets, BucketNames.ATTRIBUTE);
    const limit = hasNoColumns(buckets)
        ? INCREASE_MAX_TABLE_ATTRIBUTES_ITEMS_LIMIT
        : MAX_TABLE_CATEGORIES_COUNT;
    return itemsCount < limit;
}
