// (C) 2019-2020 GoodData Corporation

import { IExecutionDefinition } from "@gooddata/sdk-model";
import { IPreparedExecution } from "../workspace/execution";
import { IWorkspaceQueryFactory, IAnalyticalWorkspace } from "../workspace";
import { IAuthenticationProvider, AuthenticatedPrincipal } from "../auth";
import { IUserService } from "../user";

/**
 * Specifies platform agnostic configuration of an analytical backend. Only config items that make sense for
 * any and all analytical backend implementations are specified here.
 *
 * @public
 */
export type AnalyticalBackendConfig = {
    readonly hostname?: string;
};

/**
 * Factory function to create new instances of Analytical Backend realization using optionally both platform agnostic
 * and platform specific configuration.
 *
 * This factory function implementation MUST be exposed as the default export of packages which contain
 * realizations of the Analytical Backend SPI.
 *
 *
 * @param config - platform agnostic configuration
 * @param implConfig - platform specific configuration
 * @public
 */
export type AnalyticalBackendFactory = (
    config?: AnalyticalBackendConfig,
    implConfig?: any,
) => IAnalyticalBackend;

/**
 * This is the root of the Analytical Backend SPI. It allows configuration related to communication with the backend
 * and access to analytical workspaces.
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
    readonly config: AnalyticalBackendConfig;

    /**
     * Capabilities available on this backend.
     */
    readonly capabilities: BackendCapabilities;

    /**
     * Creates new instance of backend on the provided hostname. It is valid NOT TO specify any hostname, in
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
     * Tests authentication against this backend. This requires network communication and is thus
     * asynchronous. If the current backend (or session it lives in) is not authenticated, then
     * this method MUST NOT call the authentication provider.
     *
     * @returns promise of authenticated principal is returned if authenticated, null is returned if not authenticated.
     */
    isAuthenticated(): Promise<AuthenticatedPrincipal | null>;

    /**
     * Triggers authentication process against the backend.
     *
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
    authenticate(force?: boolean): Promise<AuthenticatedPrincipal>;

    /**
     * Triggers deauthentication process against the backend.
     *
     * @returns promise of the completed process, or rejection if deauthentication failed.
     */
    deauthenticate(): Promise<void>;

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
    workspaces(): IWorkspaceQueryFactory;
}

/**
 * Analytical Backend communicates its capabilities via objects of this type. In return, the capabilities
 * can then be used by applications to enable / disable particular features.
 *
 * @public
 */
export type BackendCapabilities = {
    /**
     * Indicates whether the backend is capable to address objects using URIs
     */
    supportsObjectUris?: boolean;

    /**
     * Indicates whether the backend is capable to calculate and include totals in the resulting data view.
     */
    canCalculateTotals?: boolean;

    /**
     * Indicates whether the backend is capable to sort the result data view.
     */
    canSortData?: boolean;

    /**
     * Indicates whether the backend can recognize attribute elements by URI.
     */
    supportsElementUris?: boolean;

    /**
     * Indicates maximum result dimensions that the backend is able to produce.
     */
    maxDimensions?: number;

    /**
     * Indicates whether backend can export data to CSV file.
     */
    canExportCsv?: boolean;

    /**
     * Indicates whether backend can export data to Excel.
     */
    canExportXlsx?: boolean;

    /**
     * Indicates whether backend can transform an existing result into a different shape / sorting / totals.
     */
    canTransformExistingResult?: boolean;

    /**
     * Indicates whether backend can execute an existing, persistent insight by reference.
     */
    canExecuteByReference?: boolean;

    /**
     * Indicates whether backend supports adding CSV datasets and switching between them.
     */
    supportsCsvUploader?: boolean;

    /**
     * Indicates whether backend supports ranking filters.
     */
    supportsRankingFilter?: boolean;

    /**
     * Catchall for additional capabilities
     */
    [key: string]: undefined | boolean | number | string;
};

//
// Supporting / convenience functions
//

/**
 * Prepares execution of the provided definition against a backend.
 *
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
