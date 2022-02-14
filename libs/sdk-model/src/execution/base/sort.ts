// (C) 2019-2022 GoodData Corporation
import { Identifier } from "../../objRef/index";
import { attributeLocalId, IAttribute } from "../attribute";
import { IMeasure, measureLocalId } from "../measure";
import isEmpty from "lodash/isEmpty";
import invariant from "ts-invariant";

/**
 * Sort items can be used to specify how the result of an execution should be sorted. Sorting can be done by
 * attribute value and/or by value of a measure.
 *
 * @public
 */
export type ISortItem = IAttributeSortItem | IMeasureSortItem;

/**
 * Sorting direction.
 *
 * @public
 */
export type SortDirection = "asc" | "desc";

export interface ISortDirection {
    /**
     * Sort ascending or descending.
     */
    direction: SortDirection;
}

/**
 * Sort item which specifies that the result should be sorted by attribute element values in either
 * ascending or descending order.
 *
 * @public
 */
export interface IAttributeSortItem {
    attributeSortItem: IAttributeSortTarget & IAttributeSortType & ISortDirection;
}

export interface IAttributeSortTarget {
    /**
     * Local identifier of the attribute to sort by.
     */
    attributeIdentifier: Identifier;
}

export interface IAttributeSortType {
    /**
     * If specified, defines aggregation function used on attribute's data points before sorting is evaluated
     * eg. used on stacked bar chart on view by attribute it defines, that all stacks are summed up and results are sorted
     */
    aggregation?: "sum";
}

/**
 * Sort item which specifies that the result should be sorted by value of a measure. Since the result can have
 * the value of the measure sliced by one or more attributes, the measure sort item must explicitly specify
 * the 'slice' by which to sort. This slice is specified by locators.
 *
 * @public
 */
export interface IMeasureSortItem {
    measureSortItem: IMeasureSortTarget & ISortDirection;
}
export interface IMeasureSortTarget {
    /**
     * Locators explicitly specifying the exact slice of the measure values to sort by.
     */
    locators: ILocatorItem[];
}

/**
 * Locators are used to identify slice of measure values to sort by.
 *
 * @public
 */
export type ILocatorItem = IAttributeLocatorItem | IMeasureLocatorItem;

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
export function isAttributeSort(obj: unknown): obj is IAttributeSortItem {
    return !isEmpty(obj) && (obj as IAttributeSortItem).attributeSortItem !== undefined;
}

/**
 * Type guard checking whether an object is an attribute area sort item.
 *
 * @public
 */
export function isAttributeAreaSort(obj: unknown): obj is IAttributeSortItem {
    return isAttributeSort(obj) && obj.attributeSortItem.aggregation !== undefined;
}

/**
 * Type guard checking whether an object is a measure sort item.
 *
 * @public
 */
export function isMeasureSort(obj: unknown): obj is IMeasureSortItem {
    return !isEmpty(obj) && (obj as IMeasureSortItem).measureSortItem !== undefined;
}

/**
 * Type guard checking whether an object is an attribute locator.
 *
 * @public
 */
export function isAttributeLocator(obj: unknown): obj is IAttributeLocatorItem {
    return !isEmpty(obj) && (obj as IAttributeLocatorItem).attributeLocatorItem !== undefined;
}

/**
 * Type guard checking whether an object is measure locator
 *
 * @public
 */
export function isMeasureLocator(obj: unknown): obj is IMeasureLocatorItem {
    return !isEmpty(obj) && (obj as IMeasureLocatorItem).measureLocatorItem !== undefined;
}

//
// Public functions
//

/**
 * Gets sort item's direction
 * @param sort - sort item.
 * @public
 */
export function sortDirection(sort: ISortItem): SortDirection {
    invariant(sort, "sort item must be specified");

    if (isAttributeSort(sort)) {
        return sort.attributeSortItem.direction;
    } else {
        return sort.measureSortItem.direction;
    }
}

/**
 * Categorized collection of entity (object) identifiers referenced by a sort item.
 *
 * @public
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
 * @public
 */
export function sortEntityIds(sort: ISortItem): SortEntityIds {
    invariant(sort, "sort item must be specified");

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
        sort.measureSortItem.locators.forEach((loc) => {
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

/**
 * Given a measure sort item, return the locators which identify the measure (possibly scoped for particular
 * attribute element).
 *
 * @param sort - measure sort items
 * @returns measure sort locators
 * @public
 */
export function sortMeasureLocators(sort: IMeasureSortItem): ILocatorItem[] {
    return sort.measureSortItem.locators;
}

/**
 * Given attribute locator, return the localId of attribute that it references.
 *
 * @param locator - attribute locator
 * @returns attribute localId
 * @public
 */
export function attributeLocatorIdentifier(locator: IAttributeLocatorItem): Identifier {
    return locator.attributeLocatorItem.attributeIdentifier;
}

/**
 * Given attribute locator, return the element that it references.
 *
 * @param locator - attribute locator
 * @returns attribute element
 * @public
 */
export function attributeLocatorElement(locator: IAttributeLocatorItem): Identifier {
    return locator.attributeLocatorItem.element;
}

/**
 * Given measure locator, return the localId of measure that it references.
 *
 * @param locator - measure locator
 * @returns measure localId
 * @public
 */
export function measureLocatorIdentifier(locator: IMeasureLocatorItem): Identifier {
    return locator.measureLocatorItem.measureIdentifier;
}

/**
 * Creates a new attribute sort - sorting the result by values of the provided attribute's elements. The attribute
 * can be either specified by value or by reference using its local identifier.
 *
 * @param attributeOrId - attribute to sort by
 * @param sortDirection - asc or desc, defaults to "asc"
 * @returns always new item
 * @public
 */
export function newAttributeSort(
    attributeOrId: IAttribute | Identifier,
    sortDirection: SortDirection = "asc",
): IAttributeSortItem {
    invariant(attributeOrId, "attribute to create sort for must be specified");

    const id: string = attributeLocalId(attributeOrId);

    return {
        attributeSortItem: {
            attributeIdentifier: id,
            direction: sortDirection,
        },
    };
}

/**
 * Creates a new attribute sort - sorting the result by defined target in defined direction
 *
 * @param attributeSortTarget - sort target part
 * @param sortDirection - sort direction part
 * @returns new sort item
 * @public
 */
export function newAttributeSortFromParts(
    attributeSortTarget: IAttributeSortTarget,
    sortDirection: ISortDirection = { direction: "asc" },
): IAttributeSortItem {
    return newAttributeSort(attributeSortTarget.attributeIdentifier, sortDirection.direction);
}

/**
 * Creates a new attribute area sort - sorting the result by aggregated measure values belonging to each
 * attribute value included in the result.
 *
 * @param attributeOrId - attribute to sort by
 * @param sortDirection - sorting direction
 * @param aggregation - area sort aggregation function. only "sum" is supported at the moment.
 * @public
 */
export function newAttributeAreaSort(
    attributeOrId: IAttribute | string,
    sortDirection: SortDirection = "asc",
    aggregation: "sum" = "sum",
): IAttributeSortItem {
    invariant(attributeOrId, "attribute to create sort for must be specified");

    const id: string = attributeLocalId(attributeOrId);

    return {
        attributeSortItem: {
            attributeIdentifier: id,
            direction: sortDirection,
            aggregation,
        },
    };
}
/**
 * Creates a new attribute sort - sorting the result by defined target, type and in defined direction
 *
 * @param attributeSortTarget - sort target part
 * @param sortDirection - sort direction part
 * @returns new sort item
 * @public
 */
export function newAttributeAreaSortFromParts(
    attributeSortTarget: IAttributeSortTarget,
    sortDirection: ISortDirection = { direction: "asc" },
    attributeSortType: IAttributeSortType = { aggregation: "sum" },
): IAttributeSortItem {
    return newAttributeAreaSort(
        attributeSortTarget.attributeIdentifier,
        sortDirection.direction,
        attributeSortType.aggregation,
    );
}

/**
 * Creates a new measure sort - sorting the result by values of the provided measure. The measure
 * can be either specified by value or by reference using its local identifier.
 *
 * @param measureOrId - measure to sort by
 * @param sortDirection - asc or desc, defaults to "asc"
 * @param attributeLocators - optional attribute locators
 * @returns new sort item
 * @public
 */
export function newMeasureSort(
    measureOrId: IMeasure | string,
    sortDirection: SortDirection = "asc",
    attributeLocators: IAttributeLocatorItem[] = [],
): IMeasureSortItem {
    invariant(measureOrId, "measure to create sort for must be specified");

    const id: string = measureLocalId(measureOrId);

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

/**
 * Creates a new measure sort - sorting the result by defined target in defined direction
 *
 * @param measureSortTarget - what to sort part
 * @param sortDirection - direction
 * @returns new sort item
 * @public
 */
export function newMeasureSortFromParts(
    measureSortTarget: IMeasureSortTarget,
    sortDirection: SortDirection = "asc",
): IMeasureSortItem {
    invariant(measureSortTarget, "measure to create sort for must be specified");

    return {
        measureSortItem: {
            direction: sortDirection,
            ...measureSortTarget,
        },
    };
}

/**
 * Creates a new attribute locator for an attribute element.
 *
 * @param attributeOrId - attribute, can be specified by either the attribute object or its local identifier
 * @param element - attribute element value URI or primary label value
 * @returns new locator
 * @public
 */
export function newAttributeLocator(
    attributeOrId: IAttribute | string,
    element: string,
): IAttributeLocatorItem {
    invariant(attributeOrId, "attribute to create sort locator for must be specified");
    invariant(element, "attribute element must be specified");

    const localId: string = attributeLocalId(attributeOrId);

    return {
        attributeLocatorItem: {
            attributeIdentifier: localId,
            element,
        },
    };
}
