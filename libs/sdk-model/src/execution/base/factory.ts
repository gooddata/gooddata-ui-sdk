// (C) 2020 GoodData Corporation
import { Identifier, Uri, IdentifierRef, UriRef, LocalIdRef } from ".";

/**
 * Creates an IdentifierRef from an identifier
 * @param identifier - identifier to use
 * @public
 */
export function idRef(identifier: Identifier): IdentifierRef {
    return { identifier };
}

/**
 * Creates an UriRef from an URI
 * @param uri - URI to use
 * @public
 */
export function uriRef(uri: Uri): UriRef {
    return { uri };
}

/**
 * Creates an LocalIdRef from a local identifier
 * @param localIdentifier - local identifier to use
 * @public
 */
export function localIdRef(localIdentifier: Identifier): LocalIdRef {
    return { localIdentifier };
}
