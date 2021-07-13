// (C) 2019-2021 GoodData Corporation
import { IClientWorkspaceIdentifiers } from "./interfaces";

/**
 * @internal
 */
export async function resolveLCMWorkspaceIdentifiers(
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    backend: any,
    context: IClientWorkspaceIdentifiers,
): Promise<IClientWorkspaceIdentifiers> {
    const bootstrapResource = await getBootstrapResource(backend, {
        clientId: context.client,
        productId: context.dataProduct,
        projectId: context.workspace,
    });

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
