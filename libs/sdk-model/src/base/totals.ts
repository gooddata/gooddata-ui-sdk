// (C) 2019 GoodData Corporation

import isEmpty from "lodash/isEmpty";

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
import { Identifier } from "./index";

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

/**
 * TODO: SDK8: Add docs
 * TODO: SDK8: Revisit this; perhaps no native total item is needed?
 *
 * @public
 */
export interface INativeTotalItem {
    nativeTotal: {
        measureIdentifier: Identifier;
        attributeIdentifiers: Identifier[];
    };
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export type Total = ITotal | INativeTotalItem;

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

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export function isNativeTotal(obj: any): obj is INativeTotalItem {
    return !isEmpty(obj) && (obj as INativeTotalItem).nativeTotal !== undefined;
}

//
//
//
