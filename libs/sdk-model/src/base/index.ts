// (C) 2019 GoodData Corporation

import isEmpty = require("lodash/isEmpty");

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export type Identifier = string;

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export interface IObjUriQualifier {
    uri: string;
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export interface IObjIdentifierQualifier {
    identifier: string;
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export interface IObjLocalIdentifierQualifier {
    localIdentifier: Identifier;
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export type ObjQualifier = IObjUriQualifier | IObjIdentifierQualifier;

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export type ObjQualifierWithLocal = ObjQualifier | IObjLocalIdentifierQualifier;

//
// Type guards
//

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export function isUriQualifier(obj: any): obj is IObjUriQualifier {
    return !isEmpty(obj) && (obj as IObjUriQualifier).uri !== undefined;
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export function isIdentifierQualifier(obj: any): obj is IObjIdentifierQualifier {
    return !isEmpty(obj) && (obj as IObjIdentifierQualifier).identifier !== undefined;
}
