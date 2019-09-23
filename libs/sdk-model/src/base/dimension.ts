// (C) 2019 GoodData Corporation

import { Identifier } from "./index";
import { ITotal } from "./totals";
import isEmpty = require("lodash/isEmpty");

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export interface IDimension {
    itemIdentifiers: Identifier[];
    totals?: ITotal[];
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export const MeasureGroupIdentifier = "measureGroup";

//
// Type guards
//

/**
 * TODO: SDK8: Add docs
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
 * TODO: SDK8: Add docs
 *
 * @public
 */
export function dimensionTotals(dim: IDimension): ITotal[] {
    return dim.totals ? dim.totals : [];
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export function newTwoDimensional(dim1Ids: Identifier[], dim2Ids: Identifier[]): IDimension[] {
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
 * TODO: SDK8: Add docs
 *
 * @public
 */
export function newDimension(ids: Identifier[] = []): IDimension {
    return {
        itemIdentifiers: ids,
    };
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export function dimensionFingerprint(dim: IDimension): string {
    return JSON.stringify(dim);
}
