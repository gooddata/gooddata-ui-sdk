// (C) 2019-2022 GoodData Corporation
import { IntlShape } from "react-intl";
import isEmpty from "lodash/isEmpty.js";
import isNil from "lodash/isNil.js";
import omitBy from "lodash/omitBy.js";
import isEqual from "lodash/isEqual.js";
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
    areObjRefsEqual,
    ISettings,
} from "@gooddata/sdk-model";
import { BucketNames, VisualizationTypes } from "@gooddata/sdk-ui";

import { getTranslation } from "./translations.js";

import { SORT_DIR_DESC } from "../constants/sort.js";
import {
    IBucketItem,
    IExtendedReferencePoint,
    IVisualizationProperties,
} from "../interfaces/Visualization.js";
import { IAvailableSortsGroup } from "../interfaces/SortConfig.js";
import { IAxisConfig } from "@gooddata/sdk-ui-charts";
import { messages } from "../../locales.js";

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
    if (sorts?.length > 0) {
        return sorts;
    }

    return getDefaultHeatmapSortFromBuckets(insightBucket(insight, BucketNames.VIEW));
}

function getDefaultPieDonutPyramidFunnelSort(insight: IInsightDefinition): ISortItem[] {
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
    supportedControls: IVisualizationProperties,
    featureFlags: ISettings,
): ISortItem[] {
    if (insight.insight.sorts?.length > 0) {
        return insight.insight.sorts;
    }
    switch (type) {
        case VisualizationTypes.COLUMN:
        case VisualizationTypes.LINE:
            return [];
        case VisualizationTypes.BAR:
            return getDefaultBarChartSort(insight, canSortStackTotalValue(insight, supportedControls));
        case VisualizationTypes.TREEMAP:
            return getDefaultTreemapSort(insight);
        case VisualizationTypes.HEATMAP:
            return getDefaultHeatmapSort(insight);
        case VisualizationTypes.PIE:
        case VisualizationTypes.DONUT:
        case VisualizationTypes.PYRAMID:
        case VisualizationTypes.FUNNEL:
        case VisualizationTypes.WATERFALL:
            if (featureFlags.enableChartsSorting) {
                return getDefaultPieDonutPyramidFunnelSort(insight);
            }
    }
    return [];
}

function areAllMeasuresOnSingleAxis(insight: IInsightDefinition, secondaryYAxis: IAxisConfig): boolean {
    const measureCount = insightMeasures(insight).length;
    const numberOfMeasureOnSecondaryAxis = secondaryYAxis.measures?.length ?? 0;
    return numberOfMeasureOnSecondaryAxis === 0 || measureCount === numberOfMeasureOnSecondaryAxis;
}

function canSortStackTotalValue(
    insight: IInsightDefinition,
    supportedControls: IVisualizationProperties,
): boolean {
    const stackMeasures = supportedControls?.stackMeasures ?? false;
    const secondaryAxis: IAxisConfig = supportedControls?.secondary_yaxis ?? { measures: [] };
    const allMeasuresOnSingleAxis = areAllMeasuresOnSingleAxis(insight, secondaryAxis);

    return stackMeasures && allMeasuresOnSingleAxis;
}

export function getBucketItemIdentifiers(referencePoint: IExtendedReferencePoint): string[] {
    const buckets = referencePoint?.buckets ?? [];
    return buckets.reduce((localIdentifiers: string[], bucket): string[] => {
        const items = bucket?.items ?? [];
        localIdentifiers.push(...items.map((item) => item.localIdentifier));
        return localIdentifiers;
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

function handleDifferentOrder(
    currentSort: ISortItem[],
    availableSortGroup: IAvailableSortsGroup,
    previousAvailableSorts: IAvailableSortsGroup[],
): {
    modifiedSorts?: ISortItem[];
    reusedItem?: ISortItem;
} {
    const correspondingGroupIndex = previousAvailableSorts.findIndex((previousSortGroup) =>
        areObjRefsEqual(previousSortGroup.itemId, availableSortGroup.itemId),
    );

    if (correspondingGroupIndex !== -1) {
        const reusedItem = reuseSortItemType(currentSort[correspondingGroupIndex], availableSortGroup);

        const modifiedSorts = [...currentSort];
        modifiedSorts[correspondingGroupIndex] = undefined; // clear reused item to not affect other availableGroups
        return {
            modifiedSorts,
            reusedItem,
        };
    }
    return {};
}

function reuseAttributeValueSortItem(currentSortItem: ISortItem, availableSortGroup: IAvailableSortsGroup) {
    const currentSortDirection = sortDirection(currentSortItem);
    return newAttributeSort(availableSortGroup.itemId.localIdentifier, currentSortDirection);
}

function reuseAttributeAreaSortItem(currentSortItem: ISortItem, availableSortGroup: IAvailableSortsGroup) {
    const currentSortDirection = sortDirection(currentSortItem);
    // reuse it whole
    if (availableSortGroup.attributeSort.areaSortEnabled) {
        return newAttributeAreaSort(availableSortGroup.itemId.localIdentifier, currentSortDirection);
    }
    // reuse numeric sort type
    const availableMetricSort = availableSortGroup.metricSorts?.[0];
    if (availableMetricSort) {
        return newMeasureSortFromLocators(availableMetricSort.locators, currentSortDirection);
    }
}

function reuseMetricSortItem(currentSortItem: IMeasureSortItem, availableSortGroup: IAvailableSortsGroup) {
    const currentSortDirection = sortDirection(currentSortItem);
    // reuse it whole
    if (isValidMeasureSort(currentSortItem, availableSortGroup)) {
        return currentSortItem;
    }
    // reuse direction
    const availableMetricSort = availableSortGroup.metricSorts?.[0];
    if (availableMetricSort) {
        return newMeasureSortFromLocators(availableMetricSort.locators, currentSortDirection);
    }
    // reuse numeric sort type in form of area sort
    if (availableSortGroup.attributeSort.areaSortEnabled) {
        return newAttributeAreaSort(availableSortGroup.itemId.localIdentifier, currentSortDirection);
    }
}

function reuseSortItemType(currentSortItem: ISortItem, availableSortGroup: IAvailableSortsGroup) {
    if (currentSortItem) {
        if (isAttributeValueSort(currentSortItem) && availableSortGroup.attributeSort.normalSortEnabled) {
            return reuseAttributeValueSortItem(currentSortItem, availableSortGroup);
        }
        if (isAttributeAreaSort(currentSortItem)) {
            return reuseAttributeAreaSortItem(currentSortItem, availableSortGroup);
        }
        if (isMeasureSort(currentSortItem)) {
            return reuseMetricSortItem(currentSortItem, availableSortGroup);
        }
    }
}

/**
 * Validates the previous sort in context of new available sorts for new buckets state.
 * Keeps current sort item if valid.
 * If current sort is not valid it is replaced by the most similar sort or default one for current moment.
 * - metric sort replaced by area sort if available
 * - area sort replaced by metric sort if available
 * - attribute sort used regardless its position
 * @param previousAvailableSorts - available sorts for previous setup (buckets content, set properties)
 * @param previousSort - current sorts to validate
 * @param availableSorts - available sorts for current moment (buckets content, set properties)
 * @param defaultSort - default sorts for current moment
 */
export function validateCurrentSort(
    previousAvailableSorts: IAvailableSortsGroup[] = [],
    previousSort: ISortItem[] = [],
    availableSorts: IAvailableSortsGroup[] = [],
    defaultSort: ISortItem[] = [],
): ISortItem[] {
    if (previousSort.length === 0) {
        return [];
    }
    let sortsToReuse = [...previousSort];
    const completelyReused = availableSorts.map((availableSortGroup) => {
        // reuse existing sort item with only changed order
        // it may affect also items in current sort - set to undefined when item already reused
        const { reusedItem, modifiedSorts } = handleDifferentOrder(
            sortsToReuse,
            availableSortGroup,
            previousAvailableSorts,
        );
        if (reusedItem) {
            sortsToReuse = modifiedSorts;
            return reusedItem;
        }
    });
    return availableSorts
        .map((availableSortGroup, index) => {
            if (completelyReused[index]) {
                return completelyReused[index];
            }
            const currentSortItem = sortsToReuse[index];
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
        return getTranslation(messages.explanationMeasure.id, intl);
    }

    if (relevantAttributes.length === 0) {
        return getTranslation(messages.explanationAttribute.id, intl);
    }
}
