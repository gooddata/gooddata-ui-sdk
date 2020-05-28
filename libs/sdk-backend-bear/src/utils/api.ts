// (C) 2019-2020 GoodData Corporation
import { AuthenticatedPrincipal, UnexpectedError } from "@gooddata/sdk-backend-spi";
import last from "lodash/last";

/**
 * Returns a user login md5. This is used in some bear client calls as a userId.
 * @param principal - principal to get the data from
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
