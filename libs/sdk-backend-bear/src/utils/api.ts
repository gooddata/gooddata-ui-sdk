// (C) 2019-2020 GoodData Corporation
import { AuthenticatedPrincipal, UnexpectedError } from "@gooddata/sdk-backend-spi";
import last from "lodash/last";

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
    const match = /\/obj\/([^$\/\?]*)/.exec(uri);
    return match ? match[1] : "";
};
