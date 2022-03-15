// (C) 2019-2022 GoodData Corporation
import { IntlShape } from "react-intl";
import isEmpty from "lodash/isEmpty";
import isNil from "lodash/isNil";
import omitBy from "lodash/omitBy";
import isEqual from "lodash/isEqual";
import {
    bucketAttributes,
    IBucket,
    IInsightDefinition,
    IMeasure,
    insightBucket,
    insightMeasures,
    insightSorts,
    newAttributeSort,
    newMeasureSort,
    newMeasureSortFromLocators,
    SortDirection,
    ISortItem,
    newAttributeAreaSort,
    ILocatorItem,
    isAttributeAreaSort,
    isAttributeValueSort,
    isMeasureSort,
    sortMeasureLocators,
    IMeasureSortItem,
    sortDirection,
} from "@gooddata/sdk-model";
import { BucketNames, VisualizationTypes } from "@gooddata/sdk-ui";

import { getTranslation } from "./translations";

import { SORT_DIR_DESC } from "../constants/sort";
import { IBucketItem, IBucketOfFun, IExtendedReferencePoint } from "../interfaces/Visualization";
import { IAvailableSortsGroup } from "../interfaces/SortConfig";

export function getAttributeSortItem(
    identifier: string,
    direction: SortDirection = "asc",
    aggregation: boolean = false,
): ISortItem {
    const attributeSortItemWithoutAggregation = {
        attributeIdentifier: identifier,
        direction,
    };

    return {
        attributeSortItem: aggregation
            ? {
                  ...attributeSortItemWithoutAggregation,
                  aggregation: "sum",
              }
            : attributeSortItemWithoutAggregation,
    };
}

function getDefaultBarChartSort(
    insight: IInsightDefinition,
    canSortStackTotalValue: boolean = false,
): ISortItem[] {
    const measures = insightMeasures(insight);
    const viewBucket = insightBucket(insight, BucketNames.VIEW);
    const stackBucket = insightBucket(insight, BucketNames.STACK);
    const viewBy = viewBucket ? bucketAttributes(viewBucket) : [];
    const stackBy = stackBucket ? bucketAttributes(stackBucket) : [];

    if (viewBy.length === 2) {
        if (measures.length >= 2 && !canSortStackTotalValue) {
            return [
                newAttributeAreaSort(viewBy[0], SORT_DIR_DESC),
                newMeasureSort(measures[0], SORT_DIR_DESC),
            ];
        }

        return [
            newAttributeAreaSort(viewBy[0], SORT_DIR_DESC),
            newAttributeAreaSort(viewBy[1], SORT_DIR_DESC),
        ];
    }

    if (!isEmpty(viewBy) && !isEmpty(stackBy)) {
        return [newAttributeAreaSort(viewBy[0], SORT_DIR_DESC)];
    }

    if (!isEmpty(viewBy) && canSortStackTotalValue) {
        return [newAttributeAreaSort(viewBy[0], SORT_DIR_DESC)];
    }

    return isEmpty(stackBy) && !isEmpty(measures) ? [newMeasureSort(measures[0], SORT_DIR_DESC)] : [];
}

export function getDefaultTreemapSortFromBuckets(
    viewBy: IBucket,
    segmentBy: IBucket,
    measures: IMeasure[],
): ISortItem[] {
    const viewAttr = viewBy ? bucketAttributes(viewBy) : [];
    const stackAttr = segmentBy ? bucketAttributes(segmentBy) : [];

    if (!isEmpty(viewAttr) && !isEmpty(stackAttr)) {
        return [newAttributeSort(viewAttr[0], "asc"), ...measures.map((m) => newMeasureSort(m, "desc"))];
    }

    return [];
}

function getDefaultTreemapSort(insight: IInsightDefinition): ISortItem[] {
    return getDefaultTreemapSortFromBuckets(
        insightBucket(insight, BucketNames.VIEW),
        insightBucket(insight, BucketNames.SEGMENT),
        insightMeasures(insight),
    );
}

function getDefaultHeatmapSortFromBuckets(viewBy: IBucket): ISortItem[] {
    const viewAttr = viewBy ? bucketAttributes(viewBy) : [];
    if (!isEmpty(viewAttr)) {
        return [newAttributeSort(viewAttr[0], "desc")];
    }

    return [];
}

function getDefaultHeatmapSort(insight: IInsightDefinition): ISortItem[] {
    const sorts = insightSorts(insight);
    if (sorts && sorts.length > 0) {
        return sorts;
    }

    return getDefaultHeatmapSortFromBuckets(insightBucket(insight, BucketNames.VIEW));
}

function getDefaultPieDonutSort(insight: IInsightDefinition): ISortItem[] {
    const measures = insightMeasures(insight);
    const viewBucket = insightBucket(insight, BucketNames.VIEW);
    const viewBy = viewBucket ? bucketAttributes(viewBucket) : [];

    if (!isEmpty(measures) && !isEmpty(viewBy)) {
        return [newMeasureSort(measures[0], SORT_DIR_DESC)];
    }

    return [];
}

/**
 * Defaults created by this helper need to be the same
 * as defaults created by method getDefaultAndAvailableSort in each PV's class
 */
// Consider dissolving this function into individual components
export function createSorts(
    type: string,
    insight: IInsightDefinition,
    canSortStackTotalValue: boolean = false,
): ISortItem[] {
    if (insight.insight.sorts && insight.insight.sorts.length > 0) {
        return insight.insight.sorts;
    }
    switch (type) {
        case VisualizationTypes.COLUMN:
        case VisualizationTypes.LINE:
            return [];
        case VisualizationTypes.BAR:
            return getDefaultBarChartSort(insight, canSortStackTotalValue);
        case VisualizationTypes.TREEMAP:
            return getDefaultTreemapSort(insight);
        case VisualizationTypes.HEATMAP:
            return getDefaultHeatmapSort(insight);
        case VisualizationTypes.PIE:
        case VisualizationTypes.DONUT:
            return getDefaultPieDonutSort(insight);
    }
    return [];
}

export function getBucketItemIdentifiers(referencePoint: IExtendedReferencePoint): string[] {
    const buckets = referencePoint?.buckets ?? [];
    return buckets.reduce((localIdentifiers: string[], bucket: IBucketOfFun): string[] => {
        const items = bucket?.items ?? [];
        return localIdentifiers.concat(items.map((item: IBucketItem): string => item.localIdentifier));
    }, []);
}

export function removeSort(referencePoint: Readonly<IExtendedReferencePoint>): IExtendedReferencePoint {
    if (referencePoint.properties) {
        const properties = omitBy(
            {
                ...referencePoint.properties,
                sortItems: null,
            },
            isNil,
        );

        return {
            ...referencePoint,
            properties,
        };
    }

    return referencePoint;
}

function isValidAreaSort(areaSort: ISortItem, availableSort: IAvailableSortsGroup) {
    return (
        isAttributeAreaSort(areaSort) &&
        availableSort &&
        areaSort.attributeSortItem.attributeIdentifier === availableSort.itemId.localIdentifier
    );
}

function isValidAttributeSort(attributeSort: ISortItem, availableSort: IAvailableSortsGroup) {
    return (
        isAttributeValueSort(attributeSort) &&
        availableSort &&
        attributeSort.attributeSortItem.attributeIdentifier === availableSort.itemId.localIdentifier &&
        availableSort.attributeSort?.normalSortEnabled
    );
}

function validateMeasureSortLocators(sortLocators: ILocatorItem[], availableLocators: ILocatorItem[]) {
    return (
        sortLocators.length === availableLocators.length &&
        sortLocators.every((sortLocator, locatorIndex) =>
            isEqual(sortLocator, availableLocators[locatorIndex]),
        )
    );
}

function isValidMeasureSort(measureSort: IMeasureSortItem, availableSort: IAvailableSortsGroup) {
    return (
        availableSort &&
        !!availableSort.metricSorts?.find((availableMetricSort) =>
            validateMeasureSortLocators(availableMetricSort.locators, sortMeasureLocators(measureSort)),
        )
    );
}

function findReusableSort(
    currentSort: ISortItem[],
    availableSortGroup: IAvailableSortsGroup,
    groupIndex: number,
    validationPredicate: (sortItem: ISortItem, availableSort: IAvailableSortsGroup) => boolean,
) {
    const modifiedSorts = [...currentSort];

    const foundSortIndex = currentSort.findIndex((sortItem) =>
        validationPredicate(sortItem, availableSortGroup),
    );
    if (foundSortIndex !== -1) {
        const reusedItem = currentSort[foundSortIndex];
        modifiedSorts[foundSortIndex] = modifiedSorts[groupIndex];
        modifiedSorts[groupIndex] = reusedItem;
        return {
            modifiedSorts,
            reusedItem,
        };
    }
}

function handleDifferentOrder(
    currentSort: ISortItem[],
    availableSortGroup: IAvailableSortsGroup,
    groupIndex: number,
): {
    modifiedSorts?: ISortItem[];
    reusedItem?: ISortItem;
} {
    if (availableSortGroup.attributeSort.normalSortEnabled) {
        const found = findReusableSort(currentSort, availableSortGroup, groupIndex, isValidAttributeSort);
        if (found) {
            return found;
        }
    }

    const found = findReusableSort(currentSort, availableSortGroup, groupIndex, isValidAreaSort);
    if (found) {
        if (availableSortGroup.attributeSort.areaSortEnabled) {
            return found;
        } else {
            const reusedAreaSort = reuseSortItemType(found.reusedItem, availableSortGroup);
            if (reusedAreaSort) {
                return {
                    ...found,
                    reusedItem: reusedAreaSort,
                };
            }
        }
    }

    // this works only because two dimensional avalableSortGroups never allow metricSort on both levels
    if (availableSortGroup.metricSorts && availableSortGroup.metricSorts.length) {
        const predicate = (sortItem: ISortItem, availableSort: IAvailableSortsGroup) => {
            return isMeasureSort(sortItem) && isValidMeasureSort(sortItem, availableSort);
        };
        const found = findReusableSort(currentSort, availableSortGroup, groupIndex, predicate);
        if (found) {
            return found;
        }
    }
    return {};
}

function reuseSortItemType(currentSortItem: ISortItem, availableSortGroup: IAvailableSortsGroup) {
    if (currentSortItem) {
        const currentSortDirection = sortDirection(currentSortItem);
        if (isAttributeValueSort(currentSortItem) && availableSortGroup.attributeSort.normalSortEnabled) {
            return newAttributeSort(availableSortGroup.itemId.localIdentifier, currentSortDirection);
        }
        if (isAttributeAreaSort(currentSortItem)) {
            if (availableSortGroup.attributeSort.areaSortEnabled) {
                return newAttributeAreaSort(availableSortGroup.itemId.localIdentifier, currentSortDirection);
            }
            const availableMetricSort = availableSortGroup.metricSorts && availableSortGroup.metricSorts[0];
            if (availableMetricSort) {
                return newMeasureSortFromLocators(availableMetricSort.locators, currentSortDirection);
            }
        }
        if (isMeasureSort(currentSortItem)) {
            if (isValidMeasureSort(currentSortItem, availableSortGroup)) {
                return currentSortItem;
            }
            const availableMetricSort = availableSortGroup.metricSorts && availableSortGroup.metricSorts[0];
            if (availableMetricSort) {
                return newMeasureSortFromLocators(availableMetricSort.locators, currentSortDirection);
            }
            if (availableSortGroup.attributeSort.areaSortEnabled) {
                return newAttributeAreaSort(availableSortGroup.itemId.localIdentifier, currentSortDirection);
            }
        }
    }
}

/**
 * Validates the current sort in context of available sorts for current moment.
 * Keeps current sort item if valid.
 * If current sort is not valid it is replaced by the most similar sort or default one for current moment.
 * - metric sort replaced by area sort if available
 * - area sort replaced by metric sort if available
 * - attribute sort used regardless its position
 * @param currentSort - current sorts to validate
 * @param availableSorts - available sorts for current moment (buckets content, set properties)
 * @param defaultSort - default sorts for current moment
 */
export function validateCurrentSort(
    currentSort: ISortItem[] = [],
    availableSorts: IAvailableSortsGroup[] = [],
    defaultSort: ISortItem[] = [],
): ISortItem[] {
    if (currentSort.length === 0) {
        return [];
    }
    let currentSortsToReuse = [...currentSort];
    const completelyReused = availableSorts.map((availableSortGroup, index) => {
        // reuse existing sort item with only changed order
        // it may affect also order of items in current sort
        const { reusedItem, modifiedSorts } = handleDifferentOrder(
            currentSortsToReuse,
            availableSortGroup,
            index,
        );
        if (reusedItem) {
            currentSortsToReuse = modifiedSorts;
            return reusedItem;
        }
    });
    return availableSorts
        .map((availableSortGroup, index) => {
            if (completelyReused[index]) {
                return completelyReused[index];
            }
            const currentSortItem = currentSortsToReuse[index];
            // reuse at least type of sort item
            return reuseSortItemType(currentSortItem, availableSortGroup) ?? defaultSort[index];
        })
        .filter(Boolean);
}

export function getCustomSortDisabledExplanation(
    relevantMeasures: IBucketItem[],
    relevantAttributes: IBucketItem[],
    intl: IntlShape,
): string {
    if (relevantAttributes.length === 0 && relevantMeasures.length >= 2) {
        return getTranslation("sorting.disabled.explanation.measure", intl);
    }

    if (relevantAttributes.length === 0) {
        return getTranslation("sorting.disabled.explanation.attribute", intl);
    }
}
