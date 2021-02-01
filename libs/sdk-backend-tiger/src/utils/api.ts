// (C) 2019-2021 GoodData Corporation
import { isUriRef, ObjRef, Uri, isIdentifierRef } from "@gooddata/sdk-model";
import { UnexpectedError, IAuthenticatedPrincipal } from "@gooddata/sdk-backend-spi";
import last from "lodash/last";
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
 * @param authCall - call guard to perform API calls through
 *
 * @internal
 */
export const objRefToIdentifier = async (
    ref: ObjRef,
    _authCall: TigerAuthenticatedCallGuard,
): Promise<Uri> => {
    if (isIdentifierRef(ref)) {
        return ref.identifier;
    }

    // for now fake this as there is no API endpoint this could call
    // uses the fact that md objects have uris ending like /{md object type}/id
    // eslint-disable-next-line no-useless-escape
    const regex = /\/([^\/]+)\/?$/;
    const matches = regex.exec(ref.uri);
    if (!matches) {
        throw new UnexpectedError(`Unexpected URI: "${ref.uri}"`);
    }

    return matches[1];
};

/**
 * Returns a user login md5. This is used in some bear client calls as a userId.
 * If there is no user available, returns null instead.
 * @param getPrincipal - function to obtain currently authenticated principal to get the data from
 *
 * @internal
 */
export const userLoginMd5FromAuthenticatedPrincipalWithAnonymous = async (
    getPrincipal: () => Promise<IAuthenticatedPrincipal>,
): Promise<string | null> => {
    const principal = await getPrincipal();
    const selfLink: string = principal.userMeta?.links?.self ?? "";
    const userLoginMd5 = last(selfLink.split("/"));
    return userLoginMd5 ?? null;
};

/**
 * Returns a user login md5. This is used in some bear client calls as a userId.
 * If there is no user available, throws an error.
 * @param getPrincipal - function to obtain currently authenticated principal to get the data from
 *
 * @internal
 */
export const userLoginMd5FromAuthenticatedPrincipal = async (
    getPrincipal: () => Promise<IAuthenticatedPrincipal>,
): Promise<string> => {
    const userLoginMd5 = await userLoginMd5FromAuthenticatedPrincipalWithAnonymous(getPrincipal);

    if (!userLoginMd5) {
        throw new UnexpectedError("Cannot obtain the current user login md5");
    }

    return userLoginMd5;
};
