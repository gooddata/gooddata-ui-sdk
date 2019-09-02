// (C) 2019 GoodData Corporation

import { IElementQueryFactory } from "../elements";
import { IExecutionFactory } from "../execution";
import { IFeatureFlagsQuery } from "../featureFlags";
import { IWorkspaceMetadata } from "../metadata";

/**
 * TODO: SDK8: add public doc
 *
 * @public
 */
export interface IAnalyticalBackend {
    readonly capabilities: BackendCapabilities;

    workspace(id: string): IAnalyticalWorkspace;
}

/**
 * TODO: SDK8: add public doc
 *
 * @public
 */
export interface IAnalyticalWorkspace {
    featureFlags(): IFeatureFlagsQuery;
    execution(): IExecutionFactory;
    elements(): IElementQueryFactory;
    metadata(): IWorkspaceMetadata;
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
    supportsObjectUris: boolean;

    /**
     * Indicates whether the backend is capable to calculate and include totals in the resulting data view.
     */
    canCalculateTotals: boolean;

    /**
     * Indicates whether the backend is capable to sort the result data view.
     */
    canSortData: boolean;

    /**
     * Indicates whether the backend can recognize attribute elements by URI.
     */
    supportsElementUris: boolean;

    /**
     * Indicates maximum result dimensions that the backend is able to produce.
     */
    maxDimensions: number;

    /**
     * Indicates whether backend can export data to CSV file.
     */
    canExportCsv: boolean;

    /**
     * Indicates whether backend can export data to Excel
     */
    canExportXlsx: boolean;
};
