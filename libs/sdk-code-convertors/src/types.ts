// (C) 2024-2026 GoodData Corporation

import {
    type AfmExecution,
    type AfmObjectIdentifier,
    type DeclarativeAnalyticalDashboard,
    type DeclarativeAttributeHierarchy,
    type DeclarativeDashboardPlugin,
    type DeclarativeDataset,
    type DeclarativeDateDataset,
    type DeclarativeFilterContext,
    type DeclarativeMetric,
    type DeclarativeVisualizationObject,
} from "@gooddata/api-client-tiger";
import { type IDashboardDefinition, type IDashboardFilterGroupsConfig } from "@gooddata/sdk-model";

import type {
    AttributeHierarchy,
    Dashboard,
    Dataset,
    DateDataset,
    Metadata,
    Metric,
    Plugin,
    Visualisation,
} from "./schemas/v1/metadata.js";

/** @public */
export type Profile = {
    host: string;
    token: string;
    workspace_id: string;
    data_source?: string;
};

/** @public */
export type ExportEntities = Array<{
    id: string;
    type: Metadata["type"];
    path: string;
    data: Dataset | DateDataset | Metric | Visualisation | Dashboard | Plugin | AttributeHierarchy;
    declarative?:
        | DeclarativeDataset
        | DeclarativeDateDataset
        | DeclarativeMetric
        | DeclarativeVisualizationObject
        | DeclarativeDashboardPlugin
        | DeclarativeAttributeHierarchy
        | { dashboard: DeclarativeAnalyticalDashboard; filterContext: DeclarativeFilterContext };
}>;

/** @public */
export type FromEntities = Array<{
    id: string;
    type: Metadata["type"];
    path: string;
    data?: Dataset | DateDataset | Metric | Visualisation | Dashboard | Plugin | AttributeHierarchy;
}>;

/** @public */
export enum BucketsType {
    Measures = "measures",
    SecondaryMeasures = "secondary_measures",
    TertiaryMeasures = "tertiary_measures",
    Attribute = "attribute",
    Columns = "columns",
    View = "view",
    Stack = "stack",
    Trend = "trend",
    Segment = "segment",
    AttributeFrom = "attribute_from",
    AttributeTo = "attribute_to",
    Size = "size",
    Color = "color",
    Location = "location",
    Area = "area",
}

/** @public */
export type DashboardTab = {
    localIdentifier: string;
    title: string;
    layout: IDashboardDefinition["layout"];
    filterContextRef?: AfmObjectIdentifier;
    dateFilterConfig?: IDashboardDefinition["dateFilterConfig"];
    dateFilterConfigs?: IDashboardDefinition["dateFilterConfigs"];
    attributeFilterConfigs?: IDashboardDefinition["attributeFilterConfigs"];
    filterGroupsConfig?: IDashboardFilterGroupsConfig;
};

/** @public */
export type ToExecutionResults = {
    execution: AfmExecution;
    fields: Record<
        string,
        {
            title?: string;
        }
    >;
    sorting: Record<string, "ASC" | "DESC">;
};
