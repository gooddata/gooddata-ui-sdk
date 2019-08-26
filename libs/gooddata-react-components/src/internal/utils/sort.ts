// (C) 2019 GoodData Corporation
import get = require("lodash/get");
import set = require("lodash/set");
import includes = require("lodash/includes");
import every = require("lodash/every");
import isEmpty = require("lodash/isEmpty");
import omitBy = require("lodash/omitBy");
import isNil = require("lodash/isNil");
import { AFM } from "@gooddata/typings";
import { DataLayer } from "@gooddata/gooddata-js";
import { SORT_DIR_ASC, SORT_DIR_DESC } from "../constants/sort";
import {
    IBucket,
    IBucketItem,
    IExtendedReferencePoint,
    IVisualizationProperties,
} from "../interfaces/Visualization";

import { getFirstAttribute, getFirstValidMeasure } from "./bucketHelper";

import { MEASUREGROUP } from "../constants/bucket";
import { VisualizationTypes } from "../../constants/visualizationTypes";
import * as SortsHelper from "../../helpers/sorts";

const STACK_BY_DIMENSION = 0;
const VIEW_BY_DIMENSION = 1;

export function getMeasureSortItems(identifier: string, direction: AFM.SortDirection): AFM.SortItem[] {
    return [
        {
            measureSortItem: {
                direction,
                locators: [
                    {
                        measureLocatorItem: {
                            measureIdentifier: identifier,
                        },
                    },
                ],
            },
        },
    ];
}

export function getAttributeSortItem(
    identifier: string,
    direction: AFM.SortDirection = SORT_DIR_ASC,
    aggregation: boolean = false,
): AFM.SortItem {
    const attributeSortItemWithoutAggregation = {
        attributeIdentifier: identifier,
        direction,
    };

    const attributeSortItem: AFM.IAttributeSortItem = {
        attributeSortItem: aggregation
            ? {
                  ...attributeSortItemWithoutAggregation,
                  aggregation: "sum",
              }
            : attributeSortItemWithoutAggregation,
    };

    return attributeSortItem;
}

export function getFirstAttributeIdentifier(
    resultSpec: AFM.IResultSpec,
    dimensionIndex: number,
): string | null {
    const dimensionItems: AFM.Identifier[] = get(
        resultSpec,
        ["dimensions", dimensionIndex, "itemIdentifiers"],
        [],
    );
    return dimensionItems.find(a => a !== MEASUREGROUP) || null;
}

function getFirstMeasureSort(afm: AFM.IAfm): AFM.SortItem[] {
    const measure: AFM.IMeasure = get(afm, "measures.0");
    if (measure) {
        return getMeasureSortItems(measure.localIdentifier, SORT_DIR_DESC);
    }

    return [];
}

function getDefaultTableSort(afm: AFM.IAfm): AFM.SortItem[] {
    const attribute: AFM.IAttribute = get(afm, "attributes.0");
    if (!attribute) {
        return getFirstMeasureSort(afm);
    }

    return [getAttributeSortItem(attribute.localIdentifier, SORT_DIR_ASC)];
}

export function getDefaultPivotTableSort(afm: AFM.IAfm): AFM.SortItem[] {
    const attribute: AFM.IAttribute = get(afm, "attributes.0");
    if (!attribute) {
        return [];
    }

    return [];
}

function getDefaultBarChartSort(afm: AFM.IAfm, resultSpec: AFM.IResultSpec): AFM.SortItem[] {
    const viewByAttributeIdentifier = getFirstAttributeIdentifier(resultSpec, VIEW_BY_DIMENSION);
    const stackByAttributeIdentifier = getFirstAttributeIdentifier(resultSpec, STACK_BY_DIMENSION);

    if (viewByAttributeIdentifier && stackByAttributeIdentifier) {
        return [getAttributeSortItem(viewByAttributeIdentifier, SORT_DIR_DESC, true)];
    }

    if (!stackByAttributeIdentifier) {
        return getFirstMeasureSort(afm);
    }

    return [];
}

function sanitizeSorts(afm: AFM.IAfm, sorts: AFM.SortItem[]): AFM.SortItem[] {
    if (isEmpty(sorts)) {
        return [];
    }

    return sorts.filter((sortItem: AFM.SortItem) => DataLayer.ResultSpecUtils.isSortValid(afm, sortItem));
}

// Consider disolving this function into individual components
export function createSorts(
    type: string,
    afm: AFM.IAfm,
    resultSpec: AFM.IResultSpec,
    visualizationProperties: IVisualizationProperties,
): AFM.SortItem[] {
    const sortItems = get(visualizationProperties, "sortItems", []) as AFM.SortItem[];
    const sanitizedSortItems: AFM.SortItem[] = sanitizeSorts(afm, sortItems);

    // reuse sorts only for Table
    // This does not apply to PivotTable, it doesn't use this function at all
    if (type === VisualizationTypes.TABLE && !isEmpty(sanitizedSortItems)) {
        return sanitizedSortItems;
    }

    switch (type) {
        case VisualizationTypes.TABLE:
            return getDefaultTableSort(afm);
        case VisualizationTypes.COLUMN:
        case VisualizationTypes.LINE:
            return [];
        case VisualizationTypes.BAR:
            return getDefaultBarChartSort(afm, resultSpec);
        case VisualizationTypes.TREEMAP:
            return SortsHelper.getDefaultTreemapSort(afm, resultSpec);
    }
    return [];
}

export function getBucketItemIdentifiers(referencePoint: IExtendedReferencePoint): string[] {
    const buckets: IBucket[] = get(referencePoint, "buckets", []);
    return buckets.reduce((localIdentifiers: string[], bucket: IBucket): string[] => {
        const items: IBucketItem[] = get(bucket, "items", []);
        return localIdentifiers.concat(items.map((item: IBucketItem): string => item.localIdentifier));
    }, []);
}

export function getSortIdentifiers(item: AFM.SortItem): string[] {
    if (AFM.isMeasureSortItem(item)) {
        return get(item, "measureSortItem.locators", []).map((locator: AFM.LocatorItem) => {
            if (get(locator, "measureLocatorItem")) {
                return get(locator, "measureLocatorItem.measureIdentifier");
            } else {
                return get(locator, "attributeLocatorItem.attributeIdentifier");
            }
        });
    }
    if (AFM.isAttributeSortItem(item)) {
        const attribute = get(item, "attributeSortItem.attributeIdentifier");
        if (attribute) {
            return [attribute];
        }
    }
    return [];
}

function isSortItemValid(item: AFM.SortItem, identifiers: string[]) {
    const sortIdentifiers = getSortIdentifiers(item);
    return every(sortIdentifiers, id => includes(identifiers, id));
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
        sortItems = sortItems.filter((item: AFM.SortItem) => {
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
