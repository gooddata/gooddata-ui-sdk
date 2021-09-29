// (C) 2019-2021 GoodData Corporation
import { IClientWorkspaceIdentifiers } from "./interfaces";

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
    clientWorkspace: IClientWorkspaceIdentifiers,
): Promise<IClientWorkspaceIdentifiers> {
    const bootstrapResource = await getBootstrapResource(backend, {
        clientId: clientWorkspace.client,
        productId: clientWorkspace.dataProduct,
        projectId: clientWorkspace.workspace,
    });

    if (!bootstrapResource) {
        return {};
    }

    return getLCMWorkspaceIdentifiersFromBootstrapResource(bootstrapResource);
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

type AuthApiCall = (call: (client: any) => Promise<any>) => any;

function getBackendAuthApiCallPrivateMethod(backend: any): AuthApiCall {
    return backend.authApiCall ?? emptyPromise;
}

function getBearClientBootstrapResourceMethod(client: any): GetBootstrapResource {
    const method = client?.user?.getBootstrapResource.bind(client?.user);

    return method ?? emptyPromise;
}

type BootstrapResourceOptions = {
    projectId?: string;
    productId?: string;
    clientId?: string;
};
type GetBootstrapResource = (options: BootstrapResourceOptions) => Promise<any>;

async function getBootstrapResource(backend: any, options: BootstrapResourceOptions): Promise<any> {
    const unwrappedBackend = unwrapDecoratedBackend(backend);
    const authApiCall = getBackendAuthApiCallPrivateMethod(unwrappedBackend);

    return authApiCall(async (client) => {
        const getBootstrapResource = getBearClientBootstrapResourceMethod(client);

        return getBootstrapResource(options);
    });
}

function getLCMWorkspaceIdentifiersFromBootstrapResource(
    bootstrapResource: any,
): IClientWorkspaceIdentifiers {
    const {
        clientId: client,
        dataProductId: dataProduct,
        segmentId: segment,
    } = bootstrapResource?.bootstrapResource.current.projectLcm ?? {};

    const workspace = bootstrapResource?.bootstrapResource?.current?.project?.links?.self?.split?.("/").pop();

    return {
        dataProduct,
        client,
        segment,
        workspace,
    };
}
