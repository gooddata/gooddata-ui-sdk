// (C) 2019 GoodData Corporation

import { IElementQueryFactory } from "../elements";
import { IExecutionFactory, IPreparedExecution } from "../execution";
import { IFeatureFlagsQuery } from "../featureFlags";
import { IWorkspaceMetadata } from "../metadata";
import { IWorkspaceStyling } from "../styling";
import { IExecutionDefinition } from "../execution/executionDefinition";

/**
 * TODO: SDK8: add public doc
 *
 * @public
 */
export type AnalyticalBackendConfig = {
    readonly hostname?: string;
    readonly username?: string;
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
     * Sets credentials to use for authentication against the backend.
     *
     * @param username - user name, typically an email address
     * @param password - password, do not give this to anyone
     * @returns a new instance, set up with the provided credentials
     */
    withCredentials(username: string, password: string): IAnalyticalBackend;

    /**
     * Sets telemetry information that SHOULD be sent to backend to track component usage.
     *
     * @param componentName - name of component
     * @param props - props
     * @returns a new instance, set up with the provided telemetry
     */
    withTelemetry(componentName: string, props: object): IAnalyticalBackend;

    /**
     * Tests authentication against this backend. This requires network communication and is thus
     * asynchronous.
     *
     * @returns promise of authentication status - true if auth, false if not
     */
    isAuthenticated(): Promise<boolean>;

    /**
     * Returns an analytical workspace available on this backend.
     *
     * @param id - identifier of the workspace
     * @returns an instance that can be used to interact with the workspace
     */
    workspace(id: string): IAnalyticalWorkspace;
}

/**
 * TODO: SDK8: add public doc
 *
 * @public
 */
export interface IAnalyticalWorkspace {
    readonly workspace: string;

    featureFlags(): IFeatureFlagsQuery;

    execution(): IExecutionFactory;

    elements(): IElementQueryFactory;

    metadata(): IWorkspaceMetadata;

    styling(): IWorkspaceStyling;
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
     * Indicates whether backend can export data to Excel
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
    return backend
        .workspace(definition.workspace)
        .execution()
        .forItems([...definition.attributes, ...definition.measures], definition.filters)
        .withDimensions(...definition.dimensions)
        .withSorting(...definition.sortBy);
}
