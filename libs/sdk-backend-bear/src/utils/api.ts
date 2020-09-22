// (C) 2019-2020 GoodData Corporation
import { AuthenticatedPrincipal, UnexpectedError } from "@gooddata/sdk-backend-spi";
import last from "lodash/last";
import { Identifier, isIdentifierRef, isUriRef, ObjRef, Uri } from "@gooddata/sdk-model";
import { BearAuthenticatedCallGuard } from "../types/auth";

/**
 * Returns a user uri. This is used in some bear client calls
 * @param getPrincipal - function to obtain currently authenticated principal to get the data from
 *
 * @internal
 */
export const userUriFromAuthenticatedPrincipal = async (
    getPrincipal: () => Promise<AuthenticatedPrincipal>,
): Promise<string> => {
    const principal = await getPrincipal();
    const selfLink: string = principal.userMeta?.links?.self;

    if (!selfLink) {
        throw new UnexpectedError("Cannot obtain the current user uri");
    }

    return selfLink;
};

/**
 * Returns a user login md5. This is used in some bear client calls as a userId.
 * @param getPrincipal - function to obtain currently authenticated principal to get the data from
 *
 * @internal
 */
export const userLoginMd5FromAuthenticatedPrincipal = async (
    getPrincipal: () => Promise<AuthenticatedPrincipal>,
): Promise<string> => {
    const principal = await getPrincipal();
    const selfLink: string = principal.userMeta?.links?.self ?? "";
    const userLoginMd5 = last(selfLink.split("/"));

    if (!userLoginMd5) {
        throw new UnexpectedError("Cannot obtain the current user login md5");
    }

    return userLoginMd5;
};

/**
 * Returns the objectId from the given URI.
 * @param uri - URI to get objectId from
 */
export const getObjectIdFromUri = (uri: string): string => {
    // eslint-disable-next-line no-useless-escape
    const match = /\/obj\/([^$\/\?]*)/.exec(uri);
    return match ? match[1] : "";
};

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
    authCall: BearAuthenticatedCallGuard,
): Promise<Uri> => {
    return isUriRef(ref) ? ref.uri : authCall((sdk) => sdk.md.getObjectUri(workspace, ref.identifier));
};

/**
 * Converts ObjRef instances to URIs. For UriRefs, it returns the URIs as they are,
 * for IdentifierRefs calls the backend and gets the URIs.
 * @param refs - refs to convert
 * @param workspace - workspace id to use
 * @param authCall - call guard to perform API calls through
 *
 * @internal
 */
export const objRefsToUris = async (
    refs: ObjRef[],
    workspace: string,
    authCall: BearAuthenticatedCallGuard,
): Promise<Uri[]> => {
    const identifiers = refs.filter(isIdentifierRef).map((filter) => filter.identifier);
    const identifiersToUrisPairs = await authCall((sdk) =>
        sdk.md.getUrisFromIdentifiers(workspace, identifiers),
    );

    return refs.map((ref) => {
        if (isUriRef(ref)) {
            return ref.uri;
        } else {
            const foundPair = identifiersToUrisPairs.find((pair) => pair.identifier === ref.identifier);
            if (!foundPair) {
                throw new Error(`URI for ${ref.identifier} have not been found`);
            }
            return foundPair.uri;
        }
    });
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
    authCall: BearAuthenticatedCallGuard,
): Promise<Identifier> => {
    return isIdentifierRef(ref) ? ref.identifier : authCall((sdk) => sdk.md.getObjectIdentifier(ref.uri));
};

/**
 * Converts ObjRef instances to identifiers. For IdentifierRefs returns the identifiers as is,
 * for UriRefs calls the backend and gets the identifiers.
 * @param refs - refs to convert
 * @param workspace - workspace id to use
 * @param authCall - call guard to perform API calls through
 *
 * @internal
 */
export const objRefsToIdentifiers = async (
    refs: ObjRef[],
    authCall: BearAuthenticatedCallGuard,
): Promise<Identifier[]> => {
    return Promise.all(refs.map((ref) => objRefToIdentifier(ref, authCall)));
};
