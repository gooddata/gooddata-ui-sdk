// (C) 2019-2020 GoodData Corporation
import get = require("lodash/get");
import some = require("lodash/some");
import every = require("lodash/every");
import isEmpty = require("lodash/isEmpty");
import reduce = require("lodash/reduce");

import { BucketNames } from "@gooddata/sdk-ui";
import {
    IFiltersBucketItem,
    IBucketItem,
    IBucketOfFun,
    IReferencePoint,
    IFilters,
} from "../interfaces/Visualization";

import {
    getItemsCount,
    getMeasureItems,
    getStackItems,
    getAllAttributeItems,
    getBucketItems,
    getAllItemsByType,
    getAttributeItemsWithoutStacks,
    isDateBucketItem,
} from "./bucketHelper";

import { FILTERS, GRANULARITY, ALL_TIME, ATTRIBUTE, BUCKETS, METRIC } from "../constants/bucket";

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
        return some(filters.items, (item: IFiltersBucketItem) => {
            const interval = get(item, [FILTERS, 0, "interval"], null);
            return interval && get(interval, "name") !== ALL_TIME;
        });
    }

    return false;
}

export function hasGlobalDateFilter(filters: IFilters): boolean {
    if (filters) {
        return some(filters.items, (item: IFiltersBucketItem) => get(item, [FILTERS, 0, "interval"], null));
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
        return every(getAllAttributeItems(buckets), (item) => get(item, "granularity") !== GRANULARITY.week);
    }

    return every(getBucketItems(buckets, FILTERS), (item) => get(item, "granularity") !== GRANULARITY.week);
}

function hasNoMeasureDateFilter(buckets: IBucketOfFun[]): boolean {
    return !some(getMeasureItems(buckets), (item: IBucketItem) => {
        const filters = get(item, FILTERS);
        return filters && some(filters, isDateBucketItem);
    });
}

export function hasNoStacks(buckets: IBucketOfFun[]): boolean {
    return getStackItems(buckets).length === 0;
}

export function hasOneCategory(buckets: IBucketOfFun[]): boolean {
    return getAttributeItemsWithoutStacks(buckets).length === 1;
}

function isShowPercentageUnselected(buckets: IBucketOfFun[]): boolean {
    return !get(getBucketItems(buckets, BucketNames.MEASURES), [0, "showInPercent"], false);
}

export function noDerivedMeasurePresent(buckets: IBucketOfFun[]): boolean {
    const measures = getAllItemsByType(buckets, [METRIC]);
    return !some(measures, (measure) => measure.masterLocalIdentifier);
}

function hasFirstDate(buckets: IBucketOfFun[]): boolean {
    const firstAttributeItem = get(getAllAttributeItems(buckets), 0);
    return firstAttributeItem && isDateBucketItem(firstAttributeItem);
}

function hasNotFirstDate(buckets: IBucketOfFun[]): boolean {
    return !hasFirstDate(buckets);
}

export function hasNonAllTimeFilter(filters: IFilters): boolean {
    const filterBucketItems: IFiltersBucketItem[] = get(filters, "items", []);
    const dateFilter = filterBucketItems.find((filter: IFiltersBucketItem) => {
        return get(filter, ATTRIBUTE) === "attr.datedataset";
    });

    const filterInterval = get(dateFilter, [FILTERS, 0, "interval", "interval"], []);
    return !isEmpty(filterInterval);
}

export function isShowInPercentAllowed(
    buckets: IBucketOfFun[],
    filters: IFilters,
    bucketLocalIdentifier: string,
) {
    const rules = [hasNoStacks, hasSomeCategories];

    return (
        allRulesMet(rules, buckets, filters) && hasOneMasterMeasureInBucket(buckets, bucketLocalIdentifier)
    );
}

export function isComparisonOverTimeAllowed(
    buckets: IBucketOfFun[],
    filters: IFilters,
    weekFiltersEnabled: boolean,
) {
    const rules = weekFiltersEnabled ? [hasNoStacks] : [hasNoStacks, hasNoWeekGranularity];

    return allRulesMet(rules, buckets, filters) && hasGlobalDateFilter(filters);
}

export function overTimeComparisonRecommendationEnabled(
    referencePoint: IReferencePoint,
    weekFiltersEnabled: boolean,
) {
    const baseRules = [
        noDerivedMeasurePresent,
        hasOneMeasure,
        hasFirstDate,
        hasNoStacks,
        hasOneCategory,
        hasNoMeasureDateFilter,
    ];
    const rules = weekFiltersEnabled ? baseRules : [...baseRules, hasNoWeekGranularity];

    return (
        allRulesMet(rules, get(referencePoint, BUCKETS, [])) &&
        hasGlobalDateFilterIgnoreAllTime(get(referencePoint, FILTERS))
    );
}

export function comparisonAndTrendingRecommendationEnabled(buckets: IBucketOfFun[]) {
    const rules = [hasOneMeasure, noDerivedMeasurePresent, hasNoCategories];

    return allRulesMet(rules, buckets);
}

export function percentRecommendationEnabled(buckets: IBucketOfFun[]): boolean {
    const rules = [
        isShowPercentageUnselected,
        hasNotFirstDate,
        hasOneMasterMeasure,
        hasOneCategory,
        hasNoStacks,
    ];

    return allRulesMet(rules, buckets);
}

export function previousPeriodRecommendationEnabled(buckets: IBucketOfFun[]) {
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
