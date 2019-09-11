// (C) 2019 GoodData Corporation

import { IElementQueryFactory } from "../elements";
import { IExecutionFactory } from "../execution";
import { IFeatureFlagsQuery } from "../featureFlags";
import { IWorkspaceMetadata } from "../metadata";
import { IWorkspaceStyling } from "../styling";

/**
 * TODO: SDK8: add public doc
 *
 * @public
 */
export type AnalyticalBackendConfig = {
    readonly hostname?: string;
    readonly credentials?: UserCredentials;
};

/**
 * TODO: SDK8: add public doc
 *
 * @public
 */
export type UserCredentials = {
    readonly username: string;
    readonly password: string;
};

/**
 * TODO: SDK8: add public doc
 *
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
     * @param props props
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
 * TODO: SDK8: add public doc
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
