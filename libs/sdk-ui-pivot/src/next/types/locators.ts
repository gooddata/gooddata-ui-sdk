// (C) 2025 GoodData Corporation

import { isEmpty } from "lodash-es";

import { IAttribute, IMeasure, Identifier, attributeLocalId, measureLocalId } from "@gooddata/sdk-model";

/**
 * @alpha
 */
export type ColumnLocator = IAttributeColumnLocator | IMeasureColumnLocator | ITotalColumnLocator;

/**
 * Locates all columns for an attribute or columns for particular attribute element.
 *
 * @alpha
 */
export interface IAttributeColumnLocator {
    attributeLocatorItem: IAttributeColumnLocatorBody;
}

/**
 * Locates table column by column measure's localId.
 *
 * @alpha
 */
export interface IMeasureColumnLocator {
    measureLocatorItem: IMeasureColumnLocatorBody;
}

/**
 * Locates all columns for a columns for particular total.
 *
 * @alpha
 */
export interface ITotalColumnLocator {
    totalLocatorItem: ITotalColumnLocatorBody;
}

/**
 * Object defining the {@link IAttributeColumnLocator} object body.
 *
 * @alpha
 */
export interface IAttributeColumnLocatorBody {
    /**
     * Local identifier of the attribute
     */
    attributeIdentifier: Identifier;

    /**
     * Attribute element URI / primary key.
     */
    element?: string | null;
}

/**
 * Object defining the {@link IMeasureColumnLocator} object body.
 *
 * @alpha
 */
export interface IMeasureColumnLocatorBody {
    /**
     * Local identifier of the measure.
     */
    measureIdentifier: Identifier;
}

/**
 * Object defining the {@link ITotalColumnLocator} object body.
 *
 * @alpha
 */
export interface ITotalColumnLocatorBody {
    /**
     * Local identifier of the attribute inside which the subtotal is put
     */
    attributeIdentifier: Identifier;

    /**
     * Function for the total, such as sum, max, min, ...
     */
    totalFunction: string;
}

/**
 * Tests whether object is an instance of {@link IAttributeColumnLocator}
 *
 * @alpha
 */
export function isAttributeColumnLocator(obj: unknown): obj is IAttributeColumnLocator {
    return !isEmpty(obj) && (obj as IAttributeColumnLocator).attributeLocatorItem !== undefined;
}

/**
 * Tests whether object is an instance of {@link IMeasureColumnLocator}
 *
 * @alpha
 */
export function isMeasureColumnLocator(obj: unknown): obj is IMeasureColumnLocator {
    return !isEmpty(obj) && (obj as IMeasureColumnLocator).measureLocatorItem !== undefined;
}

/**
 * Tests whether object is an instance of {@link ITotalColumnLocator}
 *
 * @alpha
 */
export function isTotalColumnLocator(obj: unknown): obj is ITotalColumnLocator {
    return !isEmpty(obj) && (obj as ITotalColumnLocator).totalLocatorItem !== undefined;
}

/**
 * Creates a new attribute column locator
 *
 * @remarks
 * This is used to narrow down location of measure columns in pivot table, where
 * measures are further scoped by different attribute elements - imagine pivot table with defined for measure 'Amount' and column
 * attribute 'Product'. The table will have multiple columns for the 'Amount' measure - each for different element of the
 * 'Product' attribute. In this context, identifying particular measure columns needs to be more specific.
 *
 * The attribute column locator can match either single element of particular attribute, or all elements of particular
 * attribute.
 *
 * @param attributeOrId - Column attribute specified by either value or by localId reference
 * @param element - specify attribute element URI or primary key; if not specified, the locator will match
 *  all elements of the attribute
 * @alpha
 */
export function newAttributeColumnLocator(
    attributeOrId: IAttribute | string,
    element?: string,
): IAttributeColumnLocator {
    const elementObj = element === undefined ? {} : { element };

    return {
        attributeLocatorItem: {
            attributeIdentifier: attributeLocalId(attributeOrId),
            ...elementObj,
        },
    };
}

/**
 * @internal
 */
export function newMeasureColumnLocator(measureOrId: IMeasure | string): IMeasureColumnLocator {
    const measureIdentifier = measureLocalId(measureOrId);

    return {
        measureLocatorItem: {
            measureIdentifier,
        },
    };
}

/**
 * Creates a new total column locator
 *
 * @param attributeOrId - Column attribute specified by either value or by localId reference
 * @param totalFunction - Function for the total, such as sum, max, min...
 * @alpha
 */
export function newTotalColumnLocator(
    attributeOrId: IAttribute | string,
    totalFunction: string,
): ITotalColumnLocator {
    return {
        totalLocatorItem: {
            attributeIdentifier: attributeLocalId(attributeOrId),
            totalFunction,
        },
    };
}
