// (C) 2019 GoodData Corporation

import isEmpty from "lodash/isEmpty";
/**
 * TODO: SDK8: Add docs
 *
 * @public
 */

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export type TotalType = "sum" | "avg" | "max" | "min" | "med" | "nat";

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export interface ITotal {
    type: TotalType;
    measureIdentifier: string;
    attributeIdentifier: string;
    alias?: string;
}

//
// Type guards
//

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export function isTotal(obj: any): obj is ITotal {
    return !isEmpty(obj) && (obj as ITotal).type !== undefined;
}

//
//
//

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export function totalIsNative(total: ITotal): boolean {
    return total.type === "nat";
}
