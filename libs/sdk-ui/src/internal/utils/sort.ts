// (C) 2019 GoodData Corporation
import get = require("lodash/get");
import set = require("lodash/set");
import includes = require("lodash/includes");
import every = require("lodash/every");
import isEmpty = require("lodash/isEmpty");
import omitBy = require("lodash/omitBy");
import isNil = require("lodash/isNil");
import { SORT_DIR_ASC, SORT_DIR_DESC } from "../constants/sort";
import { IBucketItem, IBucketOfFun, IExtendedReferencePoint } from "../interfaces/Visualization";

import { getFirstAttribute, getFirstValidMeasure } from "./bucketHelper";

import { VisualizationTypes } from "../../base/constants/visualizationTypes";
import * as SortsHelper from "../../base/helpers/sorts";
import {
    bucketsAttributes,
    IAttributeSortItem,
    IInsight,
    insightAttributes,
    insightBuckets,
    insightMeasures,
    insightSorts,
    newAttributeSort,
    newMeasureSort,
    SortDirection,
    SortItem,
} from "@gooddata/sdk-model";
import { BucketNames } from "../../index";
import { SortEntityIds, sortEntityIds } from "@gooddata/sdk-model/src/base/sort";

export function getMeasureSortItems(identifier: string, direction: SortDirection): SortItem[] {
    return [newMeasureSort(identifier, direction)];
}

export function getAttributeSortItem(
    identifier: string,
    direction: SortDirection = "asc",
    aggregation: boolean = false,
): SortItem {
    const attributeSortItemWithoutAggregation = {
        attributeIdentifier: identifier,
        direction,
    };

    const attributeSortItem: IAttributeSortItem = {
        attributeSortItem: aggregation
            ? {
                  ...attributeSortItemWithoutAggregation,
                  aggregation: "sum",
              }
            : attributeSortItemWithoutAggregation,
    };

    return attributeSortItem;
}

function getDefaultTableSort(insight: IInsight): SortItem[] {
    const attributes = insightAttributes(insight);

    if (attributes.length > 0) {
        return [newAttributeSort(attributes[0], SORT_DIR_ASC)];
    }

    const measures = insightMeasures(insight);

    if (measures.length > 0) {
        return [newMeasureSort(measures[0], SORT_DIR_DESC)];
    }

    return [];
}

function getDefaultBarChartSort(insight: IInsight): SortItem[] {
    const viewBy = bucketsAttributes(insightBuckets(insight, BucketNames.VIEW));
    const stackBy = bucketsAttributes(insightBuckets(insight, BucketNames.STACK));

    if (!isEmpty(viewBy) && !isEmpty(stackBy)) {
        return [newAttributeSort(viewBy[0], SORT_DIR_DESC, true)];
    }

    const measures = insightMeasures(insight);

    return !isEmpty(measures) ? [newMeasureSort(measures[0], SORT_DIR_DESC)] : [];
}

// Consider disolving this function into individual components
export function createSorts(type: string, insight: IInsight): SortItem[] {
    switch (type) {
        case VisualizationTypes.TABLE:
            const sorts = insightSorts(insight);

            return !isEmpty(sorts) ? sorts : getDefaultTableSort(insight);
        case VisualizationTypes.COLUMN:
        case VisualizationTypes.LINE:
            return [];
        case VisualizationTypes.BAR:
            return getDefaultBarChartSort(insight);
        case VisualizationTypes.TREEMAP:
            return SortsHelper.getDefaultTreemapSort(insight);
    }
    return [];
}

export function getBucketItemIdentifiers(referencePoint: IExtendedReferencePoint): string[] {
    const buckets: IBucketOfFun[] = get(referencePoint, "buckets", []);
    return buckets.reduce((localIdentifiers: string[], bucket: IBucketOfFun): string[] => {
        const items: IBucketItem[] = get(bucket, "items", []);
        return localIdentifiers.concat(items.map((item: IBucketItem): string => item.localIdentifier));
    }, []);
}

function isSortItemValid(item: SortItem, identifiers: string[]) {
    const sortIdentifiers: SortEntityIds = sortEntityIds(item);

    return every(sortIdentifiers.allIdentifiers, id => includes(identifiers, id));
}

export function removeSort(referencePoint: Readonly<IExtendedReferencePoint>) {
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

export function removeInvalidSort(referencePoint: Readonly<IExtendedReferencePoint>) {
    if (referencePoint.properties) {
        const identifiers = getBucketItemIdentifiers(referencePoint);

        let sortItems = referencePoint.properties.sortItems || [];
        sortItems = sortItems.filter((item: SortItem) => {
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

export function setSortItems(referencePoint: IExtendedReferencePoint) {
    const buckets = referencePoint.buckets;
    const sortItems = get(referencePoint, ["properties", "sortItems"], []);

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
