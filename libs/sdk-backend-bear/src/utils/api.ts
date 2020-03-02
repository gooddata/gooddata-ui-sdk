// (C) 2019-2020 GoodData Corporation
import { isUriRef, ObjRef, Uri } from "@gooddata/sdk-model";
import { AuthenticatedPrincipal, UnexpectedError } from "@gooddata/sdk-backend-spi";
import last from "lodash/last";

import { AuthenticatedCallGuard } from "../commonTypes";

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
    authCall: AuthenticatedCallGuard,
): Promise<Uri> => {
    return isUriRef(ref) ? ref.uri : authCall(sdk => sdk.md.getObjectUri(workspace, ref.identifier));
};

/**
 * Returns a user login md5. This is used in some bear client calls as a userId.
 * @param principal - principal to get the data from
 *
 * @internal
 */
export const userLoginMd5FromAuthenticatedPrincipal = (principal: AuthenticatedPrincipal): string => {
    const selfLink: string = principal.userMeta?.links?.self;
    const userLoginMd5 = last(selfLink.split("/"));

    if (!userLoginMd5) {
        throw new UnexpectedError("Cannot obtain the current user login md5");
    }

    return userLoginMd5;
};
