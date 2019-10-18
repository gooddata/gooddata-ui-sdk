// (C) 2019 GoodData Corporation
import { Identifier } from ".";
import { attributeLocalId, IAttribute } from "../attribute";
import { IMeasure, measureId } from "../measure";
import isEmpty = require("lodash/isEmpty");

/**
 * Sort items can be used to specify how the result of an execution should be sorted. Sorting can be done by
 * attribute value and/or by value of a measure.
 *
 * @public
 */
export type SortItem = IAttributeSortItem | IMeasureSortItem;

/**
 * Sorting direction.
 *
 * @public
 */
export type SortDirection = "asc" | "desc";

/**
 * Sort item which specifies that the result should be sorted by attribute element values in either
 * ascending or descending order.
 *
 * @public
 */
export interface IAttributeSortItem {
    attributeSortItem: {
        /**
         * Sort ascending or descending.
         */
        direction: SortDirection;
        /**
         * Local identifier of the attribute to sort by.
         */
        attributeIdentifier: Identifier;
        /**
         * TODO: find out what this does :)
         */
        aggregation?: "sum";
    };
}

/**
 * Sort item which specifies that the result should be sorted by value of a measure. Since the result can have
 * the value of the measure sliced by one or more attributes, the measure sort item must explicitly specify
 * the 'slice' by which to sort. This slice is specified by locators.
 *
 * @public
 */
export interface IMeasureSortItem {
    measureSortItem: {
        /**
         * Sort ascending or descending.
         */
        direction: SortDirection;
        /**
         * Locators explicitly specifying the exact slice of the measure values to sort by.
         */
        locators: LocatorItem[];
    };
}

/**
 * Locators are used to identify slice of measure values to sort by.
 *
 * @public
 */
export type LocatorItem = IAttributeLocatorItem | IMeasureLocatorItem;

/**
 * Locator that specifies a concrete attribute element for which the measure values are sliced.
 *
 * @public
 */
export interface IAttributeLocatorItem {
    attributeLocatorItem: {
        /**
         * Local identifier of the attribute.
         */
        attributeIdentifier: Identifier;
        /**
         * Value of the attribute element; TODO: make sure bear is ready for this
         */
        element: string;
    };
}

/**
 * Locator that specifies a concrete measure to sort by.
 *
 * @public
 */
export interface IMeasureLocatorItem {
    measureLocatorItem: {
        /**
         * Local identifier of the measure.
         */
        measureIdentifier: Identifier;
    };
}

//
// Type guards
//

/**
 * Type guard checking whether an object is an attribute sort item.
 *
 * @public
 */
export function isAttributeSort(obj: any): obj is IAttributeSortItem {
    return !isEmpty(obj) && (obj as IAttributeSortItem).attributeSortItem !== undefined;
}

/**
 * Type guard checking whether an object is a measure sort item.
 *
 * @public
 */
export function isMeasureSort(obj: any): obj is IMeasureSortItem {
    return !isEmpty(obj) && (obj as IMeasureSortItem).measureSortItem !== undefined;
}

/**
 * Type guard checking whether an object is an attribute locator.
 *
 * @public
 */
export function isAttributeLocator(obj: any): obj is IAttributeLocatorItem {
    return !isEmpty(obj) && (obj as IAttributeLocatorItem).attributeLocatorItem !== undefined;
}

/**
 * Type guard checking whether an object is measure locator
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
 * Categorized collection of entity (object) identifiers referenced by a sort item.
 *
 * @internal
 */
export type SortEntityIds = {
    allIdentifiers: Identifier[];
    attributeIdentifiers: Identifier[];
    measureIdentifiers: Identifier[];
};

/**
 * Given sort item, returns ids of entities (objects) that are referenced by the sort item.
 *
 * The ids are returned in an categorized way.
 *
 * @internal
 */
export function sortEntityIds(sort: SortItem): SortEntityIds {
    const res: SortEntityIds = {
        attributeIdentifiers: [],
        measureIdentifiers: [],
        allIdentifiers: [],
    };

    if (isAttributeSort(sort)) {
        const attrId = sort.attributeSortItem.attributeIdentifier;
        res.attributeIdentifiers.push(attrId);
        res.allIdentifiers.push(attrId);
    } else if (isMeasureSort(sort)) {
        sort.measureSortItem.locators.forEach(loc => {
            if (isAttributeLocator(loc)) {
                const attrId = loc.attributeLocatorItem.attributeIdentifier;

                res.attributeIdentifiers.push(attrId);
                res.allIdentifiers.push(attrId);
            } else if (isMeasureLocator(loc)) {
                const measureId = loc.measureLocatorItem.measureIdentifier;

                res.measureIdentifiers.push(measureId);
                res.allIdentifiers.push(measureId);
            }
        });
    }

    return res;
}

//
// Public functions
//

/**
 * Creates a new attribute sort - sorting the result by values of the provided attribute's elements. The attribute
 * can be either specified by value or by reference using its local identifier.
 *
 * @param attributeOrId - attribute to sort by
 * @param sortDirection - asc or desc
 * @param aggregation - TODO
 * @returns always new item
 * @public
 */
export function newAttributeSort(
    attributeOrId: IAttribute | string,
    sortDirection: SortDirection,
    aggregation: boolean = false,
): IAttributeSortItem {
    const id: string = typeof attributeOrId === "string" ? attributeOrId : attributeLocalId(attributeOrId);

    if (!aggregation) {
        return {
            attributeSortItem: {
                attributeIdentifier: id,
                direction: sortDirection,
            },
        };
    }

    return {
        attributeSortItem: {
            attributeIdentifier: id,
            direction: sortDirection,
            aggregation: "sum",
        },
    };
}

/**
 * Creates a new measure sort - sorting the result by values of the provided measure. The measure
 * can be either specified by value or by reference using its local identifier.
 *
 * @param measureOrId - measure to sort by
 * @param sortDirection - asc or desc
 * @param attributeLocators - optional attribute locators
 * @returns always new instance
 * @public
 */
export function newMeasureSort(
    measureOrId: IMeasure | string,
    sortDirection: SortDirection,
    attributeLocators: IAttributeLocatorItem[] = [],
): IMeasureSortItem {
    const id: string = typeof measureOrId === "string" ? measureOrId : measureId(measureOrId);

    return {
        measureSortItem: {
            direction: sortDirection,
            locators: [
                ...attributeLocators,
                {
                    measureLocatorItem: {
                        measureIdentifier: id,
                    },
                },
            ],
        },
    };
}
