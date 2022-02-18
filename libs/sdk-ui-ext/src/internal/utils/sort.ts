// (C) 2019-2022 GoodData Corporation
import every from "lodash/every";
import includes from "lodash/includes";
import isEmpty from "lodash/isEmpty";
import isNil from "lodash/isNil";
import omitBy from "lodash/omitBy";
import set from "lodash/set";
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
    SortDirection,
    SortEntityIds,
    sortEntityIds,
    ISortItem,
    newAttributeAreaSort,
} from "@gooddata/sdk-model";
import { BucketNames, VisualizationTypes } from "@gooddata/sdk-ui";
import { SORT_DIR_ASC, SORT_DIR_DESC } from "../constants/sort";
import { IBucketItem, IBucketOfFun, IExtendedReferencePoint } from "../interfaces/Visualization";

import { getFirstAttribute, getFirstValidMeasure } from "./bucketHelper";

function getMeasureSortItems(identifier: string, direction: SortDirection): ISortItem[] {
    return [newMeasureSort(identifier, direction)];
}

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

function isSortItemValid(item: ISortItem, identifiers: string[]) {
    const sortIdentifiers: SortEntityIds = sortEntityIds(item);

    return every(sortIdentifiers.allIdentifiers, (id) => includes(identifiers, id));
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

export function removeInvalidSort(
    referencePoint: Readonly<IExtendedReferencePoint>,
): IExtendedReferencePoint {
    if (referencePoint.properties) {
        const identifiers = getBucketItemIdentifiers(referencePoint);

        let sortItems = referencePoint.properties.sortItems || [];
        sortItems = sortItems.filter((item: ISortItem) => {
            return isSortItemValid(item, identifiers);
        });

        return {
            ...referencePoint,
            properties: {
                ...referencePoint.properties,
                sortItems,
            },
        };
    }

    return referencePoint;
}

export function setSortItems(referencePoint: IExtendedReferencePoint): IExtendedReferencePoint {
    const buckets = referencePoint.buckets;
    const sortItems = referencePoint?.properties?.sortItems ?? [];

    if (sortItems.length > 0) {
        return referencePoint;
    }

    const firstMeasure = getFirstValidMeasure(buckets);
    const firstAttribute = getFirstAttribute(buckets);
    if (firstMeasure !== null && firstAttribute == null) {
        set(
            referencePoint,
            ["properties", "sortItems"],
            getMeasureSortItems(firstMeasure.localIdentifier, SORT_DIR_DESC),
        );
    } else if (firstAttribute !== null) {
        set(
            referencePoint,
            ["properties", "sortItems"],
            [getAttributeSortItem(firstAttribute.localIdentifier, SORT_DIR_ASC)],
        );
    }

    return referencePoint;
}
