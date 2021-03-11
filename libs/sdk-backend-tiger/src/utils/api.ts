// (C) 2019-2021 GoodData Corporation
import { isUriRef, ObjRef, Uri, isIdentifierRef } from "@gooddata/sdk-model";
import sdk from "@gooddata/api-client-tiger";
import { TigerAuthenticatedCallGuard } from "../types";
import { UnexpectedError } from "@gooddata/sdk-backend-spi";

/**
 * Returns organization name
 *
 * @public
 */
export const getOrganizationTitle = async (): Promise<string> => {
    // TODO: replace with direct call of TigerClient (once methods are generated from OpenAPI)
    const data = (await sdk.axios.get("/api/entities/organization")).data;
    return data.data.attributes.name;
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
