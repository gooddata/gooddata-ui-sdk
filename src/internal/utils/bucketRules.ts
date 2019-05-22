// (C) 2019 GoodData Corporation
import get = require("lodash/get");
import some = require("lodash/some");
import every = require("lodash/every");
import isEmpty = require("lodash/isEmpty");
import reduce = require("lodash/reduce");

import * as BucketNames from "../../constants/bucketNames";
import {
    IFiltersBucketItem,
    IBucketItem,
    IBucket,
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
    isDate,
    getAttributeItemsWithoutStacks,
} from "./bucketHelper";

import { FILTERS, GRANULARITY, ALL_TIME, ATTRIBUTE, BUCKETS, METRIC } from "../constants/bucket";

export function hasOneMeasure(buckets: IBucket[]): boolean {
    return getItemsCount(buckets, BucketNames.MEASURES) === 1;
}

function hasOneMasterMeasure(buckets: IBucket[]): boolean {
    return getMasterMeasuresCount(buckets, BucketNames.MEASURES) === 1;
}

export function getMasterMeasuresCount(buckets: IBucket[], bucketLocalIdentifier: string): number {
    const items: IBucketItem[] = getBucketItems(buckets, bucketLocalIdentifier);
    return reduce(items, (acc, item) => (item.masterLocalIdentifier ? acc : acc + 1), 0);
}

export function hasOneMasterMeasureInBucket(buckets: IBucket[], bucketLocalIdentifier: string): boolean {
    return getMasterMeasuresCount(buckets, bucketLocalIdentifier) === 1;
}

export function hasNoMeasures(buckets: IBucket[]): boolean {
    return getItemsCount(buckets, BucketNames.MEASURES) === 0;
}

export function hasNoSecondaryMeasures(buckets: IBucket[]): boolean {
    return getItemsCount(buckets, BucketNames.SECONDARY_MEASURES) === 0;
}

export function hasSomeSegmentByItems(buckets: IBucket[]): boolean {
    return getItemsCount(buckets, BucketNames.SEGMENT) !== 0;
}

export function hasMoreThanOneCategory(buckets: IBucket[]): boolean {
    return getAllAttributeItems(buckets).length > 1;
}

export function hasMoreThanOneMasterMeasure(buckets: IBucket[], bucketLocalIdentifier: string): boolean {
    return getMasterMeasuresCount(buckets, bucketLocalIdentifier) > 1;
}

function hasSomeCategories(buckets: IBucket[]): boolean {
    return getAttributeItemsWithoutStacks(buckets).length > 0;
}

function hasNoCategories(buckets: IBucket[]): boolean {
    return getAttributeItemsWithoutStacks(buckets).length === 0;
}

function allRulesMet(
    rules: Array<(buckets: IBucket[], filters?: IFilters) => boolean>,
    buckets: IBucket[],
    filters?: IFilters,
): boolean {
    return rules.every(rule => rule(buckets, filters));
}

function hasDateInCategories(buckets: IBucket[]): boolean {
    return some(getAllAttributeItems(buckets), isDate);
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

export function hasUsedDateIgnoreAllTime(buckets: IBucket[], filters: IFilters): boolean {
    return hasDateInCategories(buckets) || hasGlobalDateFilterIgnoreAllTime(filters);
}

export function hasUsedDate(buckets: IBucket[], filters: IFilters): boolean {
    return hasDateInCategories(buckets) || hasGlobalDateFilter(filters);
}

function hasNoWeekGranularity(buckets: IBucket[]): boolean {
    if (hasDateInCategories(buckets)) {
        return every(getAllAttributeItems(buckets), item => get(item, "granularity") !== GRANULARITY.week);
    }

    return every(getBucketItems(buckets, FILTERS), item => get(item, "granularity") !== GRANULARITY.week);
}

function hasNoMeasureDateFilter(buckets: IBucket[]): boolean {
    return !some(getMeasureItems(buckets), (item: IBucketItem) => {
        const filters = get(item, FILTERS);
        return filters && some(filters, isDate);
    });
}

export function hasNoStacks(buckets: IBucket[]): boolean {
    return getStackItems(buckets).length === 0;
}

export function hasOneCategory(buckets: IBucket[]): boolean {
    return getAttributeItemsWithoutStacks(buckets).length === 1;
}

function isShowPercentageUnselected(buckets: IBucket[]): boolean {
    return !get(getBucketItems(buckets, BucketNames.MEASURES), [0, "showInPercent"], false);
}

export function noDerivedMeasurePresent(buckets: IBucket[]): boolean {
    const measures = getAllItemsByType(buckets, [METRIC]);
    return !some(measures, measure => measure.masterLocalIdentifier);
}

function hasFirstDate(buckets: IBucket[]): boolean {
    return isDate(get(getAllAttributeItems(buckets), 0));
}

function hasNotFirstDate(buckets: IBucket[]): boolean {
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

export function isShowInPercentAllowed(buckets: IBucket[], filters: IFilters, bucketLocalIdentifier: string) {
    const rules = [hasNoStacks, hasSomeCategories];

    return (
        allRulesMet(rules, buckets, filters) && hasOneMasterMeasureInBucket(buckets, bucketLocalIdentifier)
    );
}

export function isComparisonOverTimeAllowed(buckets: IBucket[], filters: IFilters) {
    const rules = [hasNoStacks, hasNoWeekGranularity];

    return allRulesMet(rules, buckets, filters) && hasGlobalDateFilter(filters);
}

export function overTimeComparisonRecommendationEnabled(referencePoint: IReferencePoint) {
    const rules = [
        noDerivedMeasurePresent,
        hasOneMeasure,
        hasFirstDate,
        hasNoStacks,
        hasOneCategory,
        hasNoWeekGranularity,
        hasNoMeasureDateFilter,
    ];

    return (
        allRulesMet(rules, get(referencePoint, BUCKETS, [])) &&
        hasGlobalDateFilterIgnoreAllTime(get(referencePoint, FILTERS))
    );
}

export function comparisonAndTrendingRecommendationEnabled(buckets: IBucket[]) {
    const rules = [hasOneMeasure, noDerivedMeasurePresent, hasNoCategories];

    return allRulesMet(rules, buckets);
}

export function percentRecommendationEnabled(buckets: IBucket[]): boolean {
    const rules = [
        isShowPercentageUnselected,
        hasNotFirstDate,
        hasOneMasterMeasure,
        hasOneCategory,
        hasNoStacks,
    ];

    return allRulesMet(rules, buckets);
}

export function previousPeriodRecommendationEnabled(buckets: IBucket[]) {
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
