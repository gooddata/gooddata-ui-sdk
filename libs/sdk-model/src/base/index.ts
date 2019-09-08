// (C) 2019 GoodData Corporation

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
