// (C) 2019-2023 GoodData Corporation

import { IExecutionDefinition } from "@gooddata/sdk-model";
import { IPreparedExecution } from "../workspace/execution/index.js";
import { IWorkspacesQueryFactory, IAnalyticalWorkspace } from "../workspace/index.js";
import { IUserService } from "../user/index.js";
import { NotAuthenticated } from "../errors/index.js";
import { IBackendCapabilities } from "./capabilities.js";
import { IOrganization, IOrganizations } from "../organization/index.js";
import { IEntitlements } from "../entitlements/index.js";

/**
 * Specifies platform agnostic configuration of an analytical backend.
 *
 * @remarks
 * Only config items that make sense for any and all analytical backend implementations are specified here.
 *
 * @public
 */
export interface IAnalyticalBackendConfig {
    /**
     * Server hostname (including protocol and port).
     *
     * @remarks
     * If not specified and running in browser, then the
     * backend will communicate with origin.
     */
    readonly hostname?: string;
}

/**
 * Factory function to create new instances of Analytical Backend realization using both platform agnostic
 * and platform specific configuration.
 *
 * @remarks
 * This factory function implementation MUST be exposed as the default export of packages which contain
 * realizations of the Analytical Backend SPI.
 *
 *
 * @param config - platform agnostic configuration
 * @param implConfig - platform specific configuration
 * @public
 */
export type AnalyticalBackendFactory = (
    config?: IAnalyticalBackendConfig,
    implConfig?: any,
) => IAnalyticalBackend;

/**
 * The root of the Analytical Backend SPI.
 *
 * @remarks
 * It allows configuration related to communication with the backend and access to analytical workspaces.
 *
 * The analytical backend instance MUST be immutable. Changes to configuration of the backend MUST create a new
 * instance to work with.
 *
 * @public
 */
export interface IAnalyticalBackend {
    /**
     * Configuration used for communication with this backend.
     */
    readonly config: IAnalyticalBackendConfig;

    /**
     * Capabilities available on this backend.
     */
    readonly capabilities: IBackendCapabilities;

    /**
     * Creates new instance of backend on the provided hostname.
     *
     * @remarks
     * It is valid NOT TO specify any hostname, in
     * which case the analytical backend assumes it should communicate with the current origin.
     *
     * @param hostname - host[:port]
     * @returns new, unauthenticated instance
     */
    onHostname(hostname: string): IAnalyticalBackend;

    /**
     * Sets telemetry information that SHOULD be sent to backend to track component usage.
     *
     * @param componentName - name of component
     * @param props - props
     * @returns a new instance of backend, set up with the provided telemetry
     */
    withTelemetry(componentName: string, props: object): IAnalyticalBackend;

    /**
     * Sets authentication provider to be used when backend discovers current session is
     * not authenticated.
     *
     * @param provider - authentication provider to use
     * @returns a new instance of backend, set up with the provider
     */
    withAuthentication(provider: IAuthenticationProvider): IAnalyticalBackend;

    /**
     * Tests authentication against this backend.
     *
     * @remarks
     * This requires network communication and is thus
     * asynchronous. If the current backend (or session it lives in) is not authenticated, then
     * this method MUST NOT call the authentication provider.
     *
     * @returns promise of authenticated principal is returned if authenticated, null is returned if not authenticated.
     */
    isAuthenticated(): Promise<IAuthenticatedPrincipal | null>;

    /**
     * Triggers authentication process against the backend.
     *
     * @remarks
     * If the 'force' parameter is specified, then the method MUST always lead to a call to the authentication
     * provider.
     *
     * If the 'force' parameter is not specified, then the method MAY lead to a call to the authentication provider -
     * if the backend lives in an already authenticated session, principal is returned. If the session is not
     * authenticated, then the provider WILL BE called.
     *
     * @param force - indicates whether authentication should be forced = must always be done even if the current
     *  session is already authenticated; defaults to false
     * @returns promise of authenticated principal, or rejection if authentication has failed.
     */
    authenticate(force?: boolean): Promise<IAuthenticatedPrincipal>;

    /**
     * Triggers deauthentication process against the backend.
     *
     * @returns promise of the completed process, or rejection if deauthentication failed.
     */
    deauthenticate(): Promise<void>;

    /**
     * Returns an organization available on the backend.
     * @param organizationId - unique ID of the organization
     */
    organization(organizationId: string): IOrganization;

    /**
     * Returns a service that can be obtained to obtain organizations.
     */
    organizations(): IOrganizations;

    /**
     * Returns a service for interacting with the currently authenticated user.
     *
     * @returns an instance that can be used to interact with the user
     */
    currentUser(): IUserService;

    /**
     * Returns an analytical workspace available on this backend.
     *
     * @param id - identifier of the workspace
     * @returns an instance that can be used to interact with the workspace
     */
    workspace(id: string): IAnalyticalWorkspace;

    /**
     * Returns service that can be used to obtain available workspaces.
     */
    workspaces(): IWorkspacesQueryFactory;

    /**
     * Returns service that can be used to obtain license entitlements.
     */
    entitlements(): IEntitlements;
}

/**
 * Type of the function to be called when the Analytical Backend raises a {@link NotAuthenticated} error.
 * See {@link IAuthenticationProvider.onNotAuthenticated} for more details.
 *
 * @public
 */
export type NotAuthenticatedHandler = (context: IAuthenticationContext, error: NotAuthenticated) => void;

/**
 * Defines authentication provider to use when instance of {@link IAnalyticalBackend} discovers that
 * the current session is not authentication.
 *
 * @public
 */
export interface IAuthenticationProvider {
    /**
     * Perform custom initialization of the client that the Analytical Backend uses to communicate
     * with the server.
     *
     * @remarks
     * If implemented, this function WILL BE called by the backend every time a new instance of API client
     * is created.
     *
     * Note: the configuration and construction of Analytical Backend instance is cumulative. Backend implementations
     * MAY create multiple instances of clients during construction.
     *
     * @param client - an instance of client
     */
    initializeClient?(client: any): void;

    /**
     * Specify function to be called when the Analytical Backend raises a {@link NotAuthenticated} error.
     *
     * @param context - context in which the authentication is done
     * @param error - an instance of {@link NotAuthenticated} error
     */
    onNotAuthenticated?: NotAuthenticatedHandler;

    /**
     * Perform authentication.
     *
     * @param context - context in which the authentication is done
     */
    authenticate(context: IAuthenticationContext): Promise<IAuthenticatedPrincipal>;

    /**
     * Returns the currently authenticated principal, or undefined if not authenticated.
     * Does not trigger authentication if no principal is available.
     */
    getCurrentPrincipal(context: IAuthenticationContext): Promise<IAuthenticatedPrincipal | null>;

    /**
     * Clear existing authentication.
     *
     * @param context - context in which the authentication is done
     */
    deauthenticate(context: IAuthenticationContext): Promise<void>;
}

/**
 * Describes user, which is currently authenticated to the backend.
 *
 * @public
 */
export interface IAuthenticatedPrincipal {
    /**
     * Unique identifier of the authenticated user.
     *
     * @remarks
     * The identifier semantics MAY differ between backend
     * implementations. The client code SHOULD NOT make assumptions on the content (such as userId being
     * valid email and so on).
     */
    userId: string;

    /**
     * Backend-specific user metadata.
     */
    userMeta?: any;
}

/**
 * Describes context in which the authentication is done.
 *
 * @remarks
 * To cater for custom authentication schemes. the API client of the underlying backend IS exposed anonymously
 * to the provider - the provider SHOULD use the provided API client to exercise any backend-specific authentication
 * mechanisms.
 *
 * @public
 */
export interface IAuthenticationContext {
    /**
     * An instance of analytical backend which triggered the authentication.
     */
    backend: IAnalyticalBackend;

    /**
     * API client used to communicate with the backend.
     *
     * @remarks
     * This can be used to perform any backend-specific,
     * non-standard authentication.
     */
    client: any;
}

//
// Supporting / convenience functions
//

/**
 * Prepares execution of the provided definition against a backend.
 *
 * @remarks
 * This is a convenience function which uses the backend methods to create and prepare an execution.
 *
 * @param definition - execution definition to prepare execution for
 * @param backend - backend to use
 * @returns new prepared execution
 * @public
 */
export function prepareExecution(
    backend: IAnalyticalBackend,
    definition: IExecutionDefinition,
): IPreparedExecution {
    return backend.workspace(definition.workspace).execution().forDefinition(definition);
}
