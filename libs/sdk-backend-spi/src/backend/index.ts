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
 * TODO: SDK8: add public doc
 *
 * @public
 */
export interface IAnalyticalBackend {
    readonly config: AnalyticalBackendConfig;
    readonly capabilities: BackendCapabilities;

    onHostname(hostname: string): IAnalyticalBackend;
    withCredentials(username: string, password: string): IAnalyticalBackend;
    withTelemetry(componentName: string, props: object): IAnalyticalBackend;
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
