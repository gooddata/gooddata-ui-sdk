// (C) 2019-2020 GoodData Corporation
import { isUriRef, ObjRef, Uri, isIdentifierRef } from "@gooddata/sdk-model";
import { TigerAuthenticatedCallGuard } from "../types";

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
 * for UriRef calls the backend and gets the identifier.
 * @param ref - ref to convert
 * @param workspace - workspace id to use
 * @param authCall - call guard to perform API calls through
 *
 * @internal
 */
export const objRefToIdentifier = async (
    ref: ObjRef,
    authCall: TigerAuthenticatedCallGuard,
): Promise<Uri> => {
    return isIdentifierRef(ref) ? ref.identifier : authCall(async () => "dummyId");
};
