// (C) 2019 GoodData Corporation

import { Identifier } from "./index";
import { ITotal } from "./totals";
import isEmpty = require("lodash/isEmpty");
import invariant from "ts-invariant";

/**
 * Dimensions specify how to organize the results of an execution in a data view. Imagine an attribute in columns vs. rows.
 * Each dimension requires the itemIdentifiers property, which is an array of items. These items could be attributes' localIdentifiers
 * or a special 'measureGroup' identifier.
 *
 * The 'measureGroup' can be used to specify that all measures in the execution definition should be
 * included in the dimension.
 *
 * @public
 */
export interface IDimension {
    /**
     * List of localIdentifier's of attribute to put in this dimension.
     */
    itemIdentifiers: Identifier[];

    /**
     * List of totals to include in this dimension.
     */
    totals?: ITotal[];
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export const MeasureGroupIdentifier = "measureGroup";

const isMeasureGroupIdentifier = (id: string) => id === MeasureGroupIdentifier;

//
// Type guards
//

/**
 * Type guard checking whether object is of IDimension type.
 *
 * @public
 */
export function isDimension(obj: any): obj is IDimension {
    return !isEmpty(obj) && (obj as IDimension).itemIdentifiers !== undefined;
}

//
// Public functions
//

/**
 * Gets totals defined in the provided dimension
 *
 * @param dim - dimension to work with, may be undefined == empty totals will be returned
 * @returns totals in the dimension or empty array if none
 * @public
 */
export function dimensionTotals(dim: IDimension): ITotal[] {
    return dim && dim.totals ? dim.totals : [];
}

/**
 * Creates new two dimensional specification where each dimension will have the provided set of
 * identifiers.
 *
 * The 'measureGroup' identifier MAY be specified in only one of the dimensions.
 *
 * @param dim1Ids - identifiers of attributes and/or measureGroup to put in first dimension
 * @param dim2Ids - identifiers of attributes and/or measureGroup to put in second dimension
 * @returns array with exactly two dimensions
 * @public
 */
export function newTwoDimensional(dim1Ids: Identifier[], dim2Ids: Identifier[]): IDimension[] {
    const atMostOneMeasureGroup = !(
        dim1Ids.find(isMeasureGroupIdentifier) && dim2Ids.find(isMeasureGroupIdentifier)
    );

    invariant(
        atMostOneMeasureGroup,
        "The 'measureGroup' identifier must only be specified in one dimension.",
    );

    return [
        {
            itemIdentifiers: dim1Ids,
        },
        {
            itemIdentifiers: dim2Ids,
        },
    ];
}

/**
 * Creates new single-dimensional specification where the dimension will have the provided set of identifiers.
 *
 * @param ids - identifiers of attributes and/or measureGroup to put in the single dimension.
 * @returns single dimension
 * @public
 */
export function newDimension(ids: Identifier[] = []): IDimension {
    return {
        itemIdentifiers: ids,
    };
}

/**
 * TODO move and hide this; fingerprint calculation only make sense in the context of the entire execution
 *
 * @internal
 */
export function dimensionFingerprint(dim: IDimension): string {
    return JSON.stringify(dim);
}
