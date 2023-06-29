// (C) 2019-2022 GoodData Corporation

import isEmpty from "lodash/isEmpty.js";
import { IMeasure, measureLocalId } from "../measure/index.js";
import { attributeLocalId, IAttribute } from "../attribute/index.js";
import { invariant } from "ts-invariant";
import { Identifier } from "../../objRef/index.js";

/**
 * Supported types of totals.
 *
 * @public
 */
export type TotalType = "sum" | "avg" | "max" | "min" | "med" | "nat";

/**
 * Describes type and granularity for calculation of Totals.
 *
 * @remarks
 * Total is calculated for particular measure and on some granularity - specified by an attribute
 * by which the measure is sliced by.
 *
 * @public
 */
export interface ITotal {
    /**
     * Type of total calculation.
     */
    type: TotalType;

    /**
     * Local identifier of measure for which to calculate total.
     */
    measureIdentifier: Identifier;

    /**
     * Local identifier of attribute - specifies granularity of the calculation.
     */
    attributeIdentifier: Identifier;

    /**
     * Specifies custom name for the calculated total. This will be included in result metadata.
     */
    alias?: string;
}

//
// Type guards
//

/**
 * Type-guard checking whether an object is a Total.
 *
 * @public
 */
export function isTotal(obj: unknown): obj is ITotal {
    return (
        !isEmpty(obj) &&
        (obj as ITotal).type !== undefined &&
        (obj as ITotal).measureIdentifier !== undefined &&
        (obj as ITotal).attributeIdentifier !== undefined
    );
}

//
//
//

/**
 * Creates a new total.
 *
 * @param type - type of total, one of the enumerated types
 * @param measureOrId - measure instance OR measure local identifier
 * @param attributeOrId - attribute instance OR attribute local identifier
 * @param alias - provide custom name (alias) for the total; this will be included in the computed results
 * @returns new total
 * @public
 */
export function newTotal(
    type: TotalType,
    measureOrId: IMeasure | Identifier,
    attributeOrId: IAttribute | Identifier,
    alias?: string,
): ITotal {
    invariant(type, "total type must be specified");
    invariant(measureOrId, "measure or measure local id must be specified");
    invariant(attributeOrId, "attribute or attribute local id must be specified");

    const measureIdentifier = measureLocalId(measureOrId);
    const attributeIdentifier = attributeLocalId(attributeOrId);
    const aliasProp = alias ? { alias } : {};

    return {
        type,
        measureIdentifier,
        attributeIdentifier,
        ...aliasProp,
    };
}

/**
 * Tests whether total instance represents a native total = a roll-up total.
 *
 * @public
 */
export function totalIsNative(total: ITotal): boolean {
    invariant(total, "total must be specified");

    return total.type === "nat";
}
