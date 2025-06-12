// (C) 2019-2022 GoodData Corporation
import { isUriRef, ObjRef, Uri, isIdentifierRef, Identifier } from "@gooddata/sdk-model";
import { UnexpectedError } from "@gooddata/sdk-backend-spi";
import { TigerAuthenticatedCallGuard } from "../types/index.js";

/**
 * Converts ObjRef instance to URI. For UriRef returns the uri as is, for IdentifierRef calls the backend and gets the URI.
 * @param ref - ref to convert
 * @param workspace - workspace id to use
 * @param authCall - call guard to perform API calls through
 *
 * @internal
 */
export const objRefToUri = async (
    ref: ObjRef,
    workspace: string,
    authCall: TigerAuthenticatedCallGuard,
): Promise<Uri> => {
    return isUriRef(ref) ? ref.uri : authCall(async () => `/${workspace}/${ref.type}/${ref.identifier}`);
};

/**
 * Converts ObjRef instance to identifier. For IdentifierRef returns the identifier as is,
 * otherwise converts the UriRef to the identifier.
 * @param ref - ref to convert
 * @param authCall - call guard to perform API calls through
 *
 * @internal
 */
export const objRefToIdentifier = async (
    ref: ObjRef,
    _authCall: TigerAuthenticatedCallGuard,
): Promise<Identifier> => {
    if (isIdentifierRef(ref)) {
        return ref.identifier;
    }

    // for now fake this as there is no API endpoint this could call
    // uses the fact that md objects have uris ending like /{md object type}/id
    const regex = /\/([^/]+)\/?$/;
    const matches = regex.exec(ref.uri);
    if (!matches) {
        throw new UnexpectedError(`Unexpected URI: "${ref.uri}"`);
    }

    return matches[1];
};

/**
 * Converts ObjRef instances to identifiers. For IdentifierRef returns the identifier as is,
 * otherwise converts the UriRefs to the identifiers.
 * @param refs - refs to convert
 * @param authCall - call guard to perform API calls through
 *
 * @internal
 */
export const objRefsToIdentifiers = (
    refs: ObjRef[],
    authCall: TigerAuthenticatedCallGuard,
): Promise<Identifier[]> => {
    // there is no bulk api yet, so do it one by one
    return Promise.all(refs.map((ref) => objRefToIdentifier(ref, authCall)));
};
