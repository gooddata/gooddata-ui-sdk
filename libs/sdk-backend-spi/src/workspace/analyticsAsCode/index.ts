// (C) 2026 GoodData Corporation

import type {
    AttributeHierarchy,
    ComputedAttribute,
    Dashboard,
    Dataset,
    DateDataset,
    Metric,
    Parameter,
    Plugin,
    Visualisation,
} from "@gooddata/sdk-code-schemas/v1";

/**
 * One analytics-as-code document: a YAML file of the AaC schema, parsed to an object.
 *
 * @alpha
 */
export type AnalyticsAsCodeDocument =
    | Dataset
    | DateDataset
    | Metric
    | ComputedAttribute
    | Parameter
    | Visualisation
    | Dashboard
    | Plugin
    | AttributeHierarchy;

/**
 * Options of {@link IWorkspaceAnalyticsAsCodeService.deploy}.
 *
 * @alpha
 */
export interface IAnalyticsAsCodeDeployOptions {
    /**
     * Data source of the datasets that do not name their own `data_source`.
     */
    dataSourceId?: string;
}

/**
 * Service that provisions a workspace from analytics-as-code documents.
 *
 * @alpha
 */
export interface IWorkspaceAnalyticsAsCodeService {
    /**
     * Replaces the logical data model and the analytical objects of the workspace with the documents.
     *
     * @remarks
     * The documents must be valid against the AaC schema. The ids must be unique in each kind of object.
     * The objects that the documents do not contain are removed from the workspace.
     *
     * @param documents - all documents of the workspace
     * @param options - the deploy options
     */
    deploy(documents: AnalyticsAsCodeDocument[], options?: IAnalyticsAsCodeDeployOptions): Promise<void>;
}
