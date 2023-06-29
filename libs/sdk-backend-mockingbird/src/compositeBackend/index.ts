// (C) 2019-2023 GoodData Corporation

import {
    IAuthenticatedPrincipal,
    IAnalyticalBackend,
    IAnalyticalWorkspace,
    IAuthenticationProvider,
    IUserService,
    IWorkspacesQueryFactory,
    NotSupported,
    IOrganization,
    IOrganizations,
    IEntitlements,
} from "@gooddata/sdk-backend-spi";

import { invariant } from "ts-invariant";

/**
 * @internal
 */
export type CompositeBackendPart = {
    /**
     * Specify workspace for which this backend has data.
     */
    workspace: string;

    /**
     * The instance of backend.
     */
    backend: IAnalyticalBackend;
};

/**
 * Creates a composite backend from one or more other test backends, each serving a test data for different
 * workspace. Composite backend will delegate all workspace services to the instance of backend which declares
 * that it has data for that workspace. If no backend is found during lookup, composite backend will fall-back to
 * the first backend on the list and whatever happens, happens (NO_DATA etc).
 *
 * For all other services available on the top-level backend API, the composite backend delegates to the first backend
 * on the list.
 *
 * Note on backend capabilities: the composite backend will inherit capabilities from the first backend component. It
 * will not do any other processing in regards to capabilities. This can potentially be limiting and breaking in
 * situations when the backend is composed from multiple different implementations, each with different capabilities.
 *
 * @param components - backends to compose from, must contain at least one backend
 * @internal
 */
export function compositeBackend(...components: CompositeBackendPart[]): IAnalyticalBackend {
    invariant(components.length > 0, "composite backend can be created from at least one other backend");

    const primaryBackend = components[0].backend;
    const config = primaryBackend.config;

    const backend: IAnalyticalBackend = {
        capabilities: primaryBackend.capabilities,
        config,
        onHostname(_hostname: string): IAnalyticalBackend {
            return backend;
        },
        withTelemetry(_component: string, _props: object): IAnalyticalBackend {
            return backend;
        },
        withAuthentication(_: IAuthenticationProvider): IAnalyticalBackend {
            return this;
        },
        organization(organizationId: string): IOrganization {
            return primaryBackend.organization(organizationId);
        },
        organizations(): IOrganizations {
            return primaryBackend.organizations();
        },
        currentUser(): IUserService {
            return primaryBackend.currentUser();
        },
        workspace(id: string): IAnalyticalWorkspace {
            const targetBackend = components.find((b) => b.workspace === id)?.backend ?? primaryBackend;

            return targetBackend.workspace(id);
        },
        workspaces(): IWorkspacesQueryFactory {
            throw new NotSupported("not supported");
        },
        authenticate(): Promise<IAuthenticatedPrincipal> {
            return primaryBackend.authenticate();
        },
        deauthenticate(): Promise<void> {
            return primaryBackend.deauthenticate();
        },
        isAuthenticated(): Promise<IAuthenticatedPrincipal | null> {
            return primaryBackend.isAuthenticated();
        },
        entitlements(): IEntitlements {
            return primaryBackend.entitlements();
        },
    };

    return backend;
}
