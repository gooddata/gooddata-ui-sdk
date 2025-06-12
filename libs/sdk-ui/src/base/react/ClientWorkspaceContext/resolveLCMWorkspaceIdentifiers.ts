// (C) 2019-2022 GoodData Corporation

import partial from "lodash/partial.js";
import last from "lodash/last.js";

import { IClientWorkspaceIdentifiers } from "./interfaces.js";

/**
 * Resolves LCM workspace identifiers. This function will use the data product and client information
 * and consult the backend in order to obtain identifier of workspace contains analytics for that
 * data product & client combination.
 *
 * Note that at the moment only the bear Analytical Backend supports the workspace identification using
 * LCM workspace identifiers. Attempting to use this function for other backends will yield empty
 * result.
 *
 * @param backend - analytical backend to resolve client workspace identifiers on
 * @param clientWorkspace - client workspace identifiers; must contain data product and client identifier
 * @returns resolved IClientWorkspaceIdentifiers or an empty object if resolution is not possible
 * @alpha
 */
export async function resolveLCMWorkspaceIdentifiers(
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    backend: any,
    { client, dataProduct, workspace }: IClientWorkspaceIdentifiers,
): Promise<IClientWorkspaceIdentifiers> {
    const projectLcmIdentifiers = await getProjectLcmIdentifiers(backend, workspace, dataProduct, client);

    if (!projectLcmIdentifiers) {
        return {};
    }

    return getLCMWorkspaceIdentifiersFromProjectLcmIdentifiers(projectLcmIdentifiers);
}

function emptyPromise() {
    return Promise.resolve();
}

function unwrapDecoratedBackend(backend: any): any {
    if (backend?.decorated) {
        return unwrapDecoratedBackend(backend.decorated);
    }

    return backend;
}

type AuthApiCall = (
    call: (client: any, principal: { getPrincipal: () => Promise<any> }) => Promise<any>,
) => any;

function getBackendAuthApiCallPrivateMethod(backend: any): AuthApiCall {
    return backend.authApiCall ?? emptyPromise;
}

async function extractDomainIdFromPrincipal(getPrincipal: () => Promise<any>) {
    const principal = await getPrincipal();
    const domainLink: string = principal.userMeta?.links?.domain ?? "";
    return last(domainLink.split("/")) ?? null;
}

async function getBearClientProjectLcmIdentifiersMethod(
    client: any,
    getPrincipal: () => Promise<any>,
): Promise<GetProjectLcmIdentifiers> {
    const method = client?.project?.getProjectLcmIdentifiers.bind(client?.project);
    const domainId = getPrincipal ? await extractDomainIdFromPrincipal(getPrincipal) : null;
    const methodWithSetDomain: GetProjectLcmIdentifiers = partial(method, domainId);

    return methodWithSetDomain ?? emptyPromise;
}

type GetProjectLcmIdentifiers = (projectId?: string, productId?: string, clientId?: string) => Promise<any>;

async function getProjectLcmIdentifiers(
    backend: any,
    projectId?: string,
    productId?: string,
    clientId?: string,
): Promise<any> {
    const unwrappedBackend = unwrapDecoratedBackend(backend);
    const authApiCall = getBackendAuthApiCallPrivateMethod(unwrappedBackend);

    return authApiCall(async (client, { getPrincipal }) => {
        const getProjectLcmIdentifiers = await getBearClientProjectLcmIdentifiersMethod(client, getPrincipal);

        return getProjectLcmIdentifiers(projectId, productId, clientId);
    });
}

function getLCMWorkspaceIdentifiersFromProjectLcmIdentifiers(
    projectLcmResponse: any,
): IClientWorkspaceIdentifiers {
    const {
        clientId: client,
        dataProductId: dataProduct,
        segmentId: segment,
        projectId: workspace,
    } = projectLcmResponse?.projectLcm ?? {};

    return {
        dataProduct,
        client,
        segment,
        workspace,
    };
}
