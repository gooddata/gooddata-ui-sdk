// (C) 2019 GoodData Corporation
import { Identifier } from ".";
import isEmpty = require("lodash/isEmpty");
import { IAttribute } from "../attribute";
import { IMeasure } from "../measure";

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export type SortDirection = "asc" | "desc";

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export interface IAttributeSortItem {
    attributeSortItem: {
        direction: SortDirection;
        attributeIdentifier: Identifier;
        aggregation?: "sum";
    };
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export type SortItem = IAttributeSortItem | IMeasureSortItem;

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export interface IMeasureSortItem {
    measureSortItem: {
        direction: SortDirection;
        locators: LocatorItem[];
    };
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export type LocatorItem = IAttributeLocatorItem | IMeasureLocatorItem;

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export interface IAttributeLocatorItem {
    attributeLocatorItem: {
        attributeIdentifier: Identifier;
        element: string;
    };
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export interface IMeasureLocatorItem {
    measureLocatorItem: {
        measureIdentifier: Identifier;
    };
}

//
// Type guards
//

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export function isAttributeSort(obj: any): obj is IAttributeSortItem {
    return !isEmpty(obj) && (obj as IAttributeSortItem).attributeSortItem !== undefined;
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export function isMeasureSort(obj: any): obj is IMeasureSortItem {
    return !isEmpty(obj) && (obj as IMeasureSortItem).measureSortItem !== undefined;
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export function isAttributeLocator(obj: any): obj is IAttributeLocatorItem {
    return !isEmpty(obj) && (obj as IAttributeLocatorItem).attributeLocatorItem !== undefined;
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export function isMeasureLocator(obj: any): obj is IMeasureLocatorItem {
    return !isEmpty(obj) && (obj as IMeasureLocatorItem).measureLocatorItem !== undefined;
}

//
// Non-public functions
//

/**
 * TODO: SDK8: Add docs
 *
 * @internal
 */
export type SortEntityIds = {
    attributeIdentifiers: Identifier[];
    measureIdentifiers: Identifier[];
};

/**
 * TODO: SDK8: Add docs
 *
 * @internal
 */
export function sortEntityIds(sort: SortItem): SortEntityIds {
    if (isAttributeSort(sort)) {
        return {
            attributeIdentifiers: [sort.attributeSortItem.attributeIdentifier],
            measureIdentifiers: [],
        };
    } else if (isMeasureSort(sort)) {
        const res: SortEntityIds = {
            attributeIdentifiers: [],
            measureIdentifiers: [],
        };

        return sort.measureSortItem.locators.reduce((acc, loc) => {
            if (isAttributeLocator(loc)) {
                acc.attributeIdentifiers.push(loc.attributeLocatorItem.attributeIdentifier);
            } else if (isMeasureLocator(loc)) {
                acc.measureIdentifiers.push(loc.measureLocatorItem.measureIdentifier);
            }

            return acc;
        }, res);
    }

    // TODO: SDK8: switch to invariant
    throw new Error();
}

//
// Public functions
//

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export function newAttributeSort(
    attribute: IAttribute,
    sortDirection: SortDirection,
    aggregation: boolean = false,
): IAttributeSortItem {
    if (!aggregation) {
        return {
            attributeSortItem: {
                attributeIdentifier: attribute.attribute.localIdentifier,
                direction: sortDirection,
            },
        };
    }

    return {
        attributeSortItem: {
            attributeIdentifier: attribute.attribute.localIdentifier,
            direction: sortDirection,
            aggregation: "sum",
        },
    };
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export function newMeasureSort(measure: IMeasure, sortDirection: SortDirection): IMeasureSortItem {
    return {
        measureSortItem: {
            direction: sortDirection,
            locators: [
                {
                    measureLocatorItem: {
                        measureIdentifier: measure.measure.localIdentifier,
                    },
                },
            ],
        },
    };
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export function sortFingerprint(sort: SortItem): string {
    return JSON.stringify(sort);
}
