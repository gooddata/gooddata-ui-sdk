// (C) 2019-2022 GoodData Corporation
import some from "lodash/some.js";
import every from "lodash/every.js";
import isEmpty from "lodash/isEmpty.js";
import reduce from "lodash/reduce.js";
import flatMap from "lodash/flatMap.js";

import { BucketNames } from "@gooddata/sdk-ui";
import {
    IFiltersBucketItem,
    IBucketItem,
    IBucketOfFun,
    IReferencePoint,
    IFilters,
    IDateFilter,
} from "../interfaces/Visualization.js";

import {
    getItemsCount,
    getMeasureItems,
    getStackItems,
    getAllAttributeItems,
    getBucketItems,
    getAllItemsByType,
    getAttributeItemsWithoutStacks,
    isDateBucketItem,
    isMeasureValueFilter,
    isRankingFilter,
} from "./bucketHelper.js";

import { FILTERS, GRANULARITY, ALL_TIME, METRIC, ATTRIBUTE, DATE } from "../constants/bucket.js";

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

export function filteredByDerivedMeasure(buckets: IBucketOfFun[], filters: IFilters): boolean {
    const measures = getAllItemsByType(buckets, [METRIC]);
    const derivedMeasuresLocalIdentifiers = measures.reduce((acc: string[], measure) => {
        if (measure.masterLocalIdentifier) {
            acc.push(measure.localIdentifier);
        }
        return acc;
    }, []);

    const allBucketFilters = flatMap(filters.items, (filterItem) => filterItem.filters);
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
    return some(getAllAttributeItems(buckets), isDateBucketItem);
}

export function hasGlobalDateFilterIgnoreAllTime(filters: IFilters): boolean {
    if (filters) {
        return some(filters.items, (item) => {
            const interval = (item?.filters?.[0] as IDateFilter)?.interval ?? null;
            return interval && interval.name !== ALL_TIME;
        });
    }

    return false;
}

export function hasGlobalDateFilter(filters: IFilters): boolean {
    if (filters) {
        return some(filters.items, (item) => (item?.filters?.[0] as IDateFilter)?.interval);
    }

    return false;
}

export function hasUsedDateIgnoreAllTime(buckets: IBucketOfFun[], filters: IFilters): boolean {
    return hasDateInCategories(buckets) || hasGlobalDateFilterIgnoreAllTime(filters);
}

export function hasUsedDate(buckets: IBucketOfFun[], filters: IFilters): boolean {
    return hasDateInCategories(buckets) || hasGlobalDateFilter(filters);
}

function hasNoWeekGranularity(buckets: IBucketOfFun[]): boolean {
    if (hasDateInCategories(buckets)) {
        return every(getAllAttributeItems(buckets), (item) => item?.granularity !== GRANULARITY.week);
    }

    return every(getBucketItems(buckets, FILTERS), (item) => item?.granularity !== GRANULARITY.week);
}

function hasNoMeasureDateFilter(buckets: IBucketOfFun[]): boolean {
    return !some(getMeasureItems(buckets), (item: IBucketItem) => {
        const filters = item?.filters;
        return filters && some(filters, isDateBucketItem);
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
    return !some(measures, (measure) => measure.masterLocalIdentifier);
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
    const allBucketFilters = flatMap(filters.items, (filterItem) => filterItem.filters);
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

export function isComparisonOverTimeAllowed(
    buckets: IBucketOfFun[],
    filters: IFilters,
    weekFiltersEnabled: boolean,
): boolean {
    const rules = weekFiltersEnabled ? [hasNoStacksWithDate] : [hasNoStacksWithDate, hasNoWeekGranularity];

    return allRulesMet(rules, buckets, filters) && hasGlobalDateFilter(filters);
}

export function overTimeComparisonRecommendationEnabled(
    referencePoint: IReferencePoint,
    weekFiltersEnabled: boolean,
): boolean {
    const baseRules = [
        noDerivedMeasurePresent,
        hasOneMeasure,
        hasFirstDate,
        hasNoStacksWithDate,
        hasOneCategory,
        hasNoMeasureDateFilter,
    ];
    const rules = weekFiltersEnabled ? baseRules : [...baseRules, hasNoWeekGranularity];

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
