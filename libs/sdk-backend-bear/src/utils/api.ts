// (C) 2019-2022 GoodData Corporation
import { GdcUser } from "@gooddata/api-model-bear";
import { IAuthenticatedPrincipal, UnexpectedError, UnexpectedResponseError } from "@gooddata/sdk-backend-spi";
import { Identifier, isIdentifierRef, isUriRef, IUser, ObjRef, Uri } from "@gooddata/sdk-model";
import last from "lodash/last.js";
import uniq from "lodash/uniq.js";
import { invariant } from "ts-invariant";

import { convertUser } from "../convertors/fromBackend/UsersConverter.js";

import { BearAuthenticatedCallGuard } from "../types/auth.js";
import isEmpty from "lodash/isEmpty.js";
import { isApiResponseError } from "./errorHandling.js";

/**
 * Returns a user uri. This is used in some bear client calls.
 * If there is no user available, returns null instead.
 * @param getPrincipal - function to obtain currently authenticated principal to get the data from
 *
 * @internal
 */
export const userUriFromAuthenticatedPrincipalWithAnonymous = async (
    getPrincipal: () => Promise<IAuthenticatedPrincipal>,
): Promise<string | null> => {
    const principal = await getPrincipal();
    const selfLink: string = principal.userMeta?.links?.self;
    return selfLink ?? null;
};

/**
 * Returns a user uri. This is used in some bear client calls
 * If there is no user available, throws an error.
 * @param getPrincipal - function to obtain currently authenticated principal to get the data from
 *
 * @internal
 */
export const userUriFromAuthenticatedPrincipal = async (
    getPrincipal: () => Promise<IAuthenticatedPrincipal>,
): Promise<string> => {
    const selfLink = await userUriFromAuthenticatedPrincipalWithAnonymous(getPrincipal);

    if (!selfLink) {
        throw new UnexpectedError("Cannot obtain the current user uri");
    }

    return selfLink;
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

/**
 * Returns the objectId from the given URI.
 * @param uri - URI to get objectId from
 */
export const getObjectIdFromUri = (uri: string): string => {
    const match = /\/obj\/([^$/?]*)/.exec(uri);
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
    return isUriRef(ref)
        ? ref.uri
        : authCall((sdk) => {
              return sdk.md.getObjectUri(workspace, ref.identifier).catch((e: unknown) => {
                  // Nasty but necessary :( Resolution of id -> uri happens using POST request which succeeds and
                  // tells that the object does not exist && the api-client-bear does not have proper exception
                  // to communicate this with. It sends ApiResponseError and includes the response of the POST
                  // which has all green statuses.
                  //
                  // Backend must reconcile here and do explicit categorization otherwise the upstream handlers
                  // will throw this into UnexpectedError category (reserved for really unexpected stuff happening which
                  // kind of makes sense if you get ApiResponseError with status code 200 :))
                  if (isApiResponseError(e) && e.message?.search("not found") > -1) {
                      throw new UnexpectedResponseError(
                          `Object with ${ref.identifier} does not exist.`,
                          404,
                          e.responseBody,
                      );
                  }

                  throw e;
              });
          });
};

/**
 * Converts ObjRef instances to URIs. For UriRefs, it returns the URIs as they are,
 * for IdentifierRefs calls the backend and gets the URIs.
 * @param refs - refs to convert
 * @param workspace - workspace id to use
 * @param authCall - call guard to perform API calls through
 * @param throwOnUnresolved - whether to throw an error if id to uri cannot be resolved for some ref; default is true
 * @returns resolved URIs; when throwOnUnresolved is true, then order of appearance of the resolved URIs
 *  is guaranteed to match the order on the input; otherwise if throwOnUnresolved is false and some identifiers
 *  could not be resolved, the returned array will be smaller with no indication as to which identifiers could
 *  not be resolved
 * @internal
 */
export const objRefsToUris = async (
    refs: ObjRef[],
    workspace: string,
    authCall: BearAuthenticatedCallGuard,
    throwOnUnresolved: boolean = true,
): Promise<Uri[]> => {
    if (isEmpty(refs)) {
        return [];
    }

    const identifiers = refs.filter(isIdentifierRef).map((filter) => filter.identifier);
    const identifiersToUrisPairs = await authCall((sdk) =>
        sdk.md.getUrisFromIdentifiers(workspace, identifiers),
    );
    const translatedUris: Uri[] = [];

    refs.forEach((ref) => {
        if (isUriRef(ref)) {
            translatedUris.push(ref.uri);
        } else {
            const foundPair = identifiersToUrisPairs.find((pair) => pair.identifier === ref.identifier);

            if (!foundPair) {
                if (throwOnUnresolved) {
                    throw new UnexpectedError(
                        "REFERENCED_OBJECT_NOT_FOUND",
                        new Error(`Referenced object for ${ref.identifier} not found`),
                    );
                } else {
                    // eslint-disable-next-line no-console
                    console.debug(
                        `Unable to translate identifier ${ref.identifier} to object URI. The ref will be skipped.`,
                    );
                    return;
                }
            }

            translatedUris.push(foundPair.uri);
        }
    });

    return translatedUris;
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

/**
 * Gets an updated userMap loading information for any missing users. The map is keyed by the user URI.
 */
export const updateUserMap = async (
    userMap: Map<string, IUser>,
    requestedUserUris: string[],
    authCall: BearAuthenticatedCallGuard,
): Promise<Map<string, IUser>> => {
    const usersToLoad = requestedUserUris.filter((uri) => !userMap.has(uri));
    const uniqueUsersToLoad = uniq(usersToLoad);

    const results = await Promise.all(
        uniqueUsersToLoad.map((uri) => {
            return authCall(async (sdk): Promise<IUser | undefined> => {
                try {
                    const result = await sdk.xhr.getParsed<GdcUser.IWrappedAccountSetting>(uri);
                    return convertUser(result.accountSetting);
                } catch (ex) {
                    // for inactive users, non-admins will get Forbidden from the server
                    // so on error we assume that the user that was requested is no longer there (is inactive)
                    return undefined;
                }
            });
        }),
    );

    results.forEach((result) => {
        if (result) {
            const uri = isUriRef(result.ref) ? result.ref.uri : undefined;
            invariant(uri, "User must have uri in bear backend instances.");
            userMap.set(uri, result);
        }
    });

    return userMap;
};
