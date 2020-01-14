// (C) 2019-2020 GoodData Corporation
import { isUriRef, ObjRef, Uri } from "@gooddata/sdk-model";
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
