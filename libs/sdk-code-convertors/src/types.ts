// (C) 2024-2026 GoodData Corporation

import {
    type AfmExecution,
    type AfmObjectIdentifier,
    type DeclarativeAnalyticalDashboard,
    type DeclarativeAttributeHierarchy,
    type DeclarativeComputedAttribute,
    type DeclarativeDashboardPlugin,
    type DeclarativeDataset,
    type DeclarativeDateDataset,
    type DeclarativeFilterContext,
    type DeclarativeMetric,
    type DeclarativeVisualizationObject,
} from "@gooddata/api-client-tiger";
import type {
    AttributeHierarchy,
    ComputedAttribute,
    Dashboard,
    Dataset,
    DateDataset,
    Metadata,
    Metric,
    Parameter,
    Plugin,
    Visualisation,
} from "@gooddata/sdk-code-schemas/v1";
import { type IDashboardDefinition, type IDashboardFilterGroupsConfig } from "@gooddata/sdk-model";

import { type DeclarativeStringParameter } from "./utils/parameterUtils.js";

/** @public */
export type Profile = {
    host: string;
    token: string;
    workspace_id: string;
    data_source?: string;
};

/** The YAML-side shape of any object AAC can carry; shared so entity types cannot drift apart. @public */
export type EntityData =
    | Dataset
    | DateDataset
    | Metric
    | ComputedAttribute
    | Parameter
    | Visualisation
    | Dashboard
    | Plugin
    | AttributeHierarchy;

/** The declarative-API shape of any object AAC can carry; the counterpart of {@link EntityData}. @public */
export type DeclarativeEntityData =
    | DeclarativeDataset
    | DeclarativeDateDataset
    | DeclarativeMetric
    | DeclarativeComputedAttribute
    | DeclarativeStringParameter
    | DeclarativeVisualizationObject
    | DeclarativeDashboardPlugin
    | DeclarativeAttributeHierarchy
    | {
          dashboard: DeclarativeAnalyticalDashboard;
          // Undefined for V3 dashboards where tabs are the sole source and no
          // root-level filter context exists.
          filterContext?: DeclarativeFilterContext;
          tabFilterContexts?: DeclarativeFilterContext[];
      };

/** @public */
export type ExportEntities = Array<{
    id: string;
    type: Metadata["type"];
    path: string;
    data: EntityData;
    declarative?: DeclarativeEntityData;
}>;

/** @public */
export type FromEntities = Array<{
    id: string;
    type: Metadata["type"];
    path: string;
    data?: EntityData;
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
    measureValueFilterConfigs?: IDashboardDefinition["measureValueFilterConfigs"];
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
