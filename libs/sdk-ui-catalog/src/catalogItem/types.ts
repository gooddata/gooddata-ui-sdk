// (C) 2025-2026 GoodData Corporation

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import type {
    CertificationStatus,
    IDataSetMetadataObject,
    IParameterDefinition,
    IdentifierRef,
    MetricType,
    ObjectOrigin,
} from "@gooddata/sdk-model";

import type { ObjectType } from "../objectType/types.js";

/**
 * Catalog item reference.
 * @public
 */
export interface ICatalogItemRef extends IdentifierRef {
    type: ObjectType;
}

/**
 * Fields common to every catalog item variant.
 * @public
 */
export interface ICatalogItemBase extends ICatalogItemRef {
    title: string;
    description: string;
    certification?: {
        status: CertificationStatus;
        message?: string;
        certifiedAt?: Date | null;
        certifiedBy?: string;
    };
    tags: string[];
    createdBy: string;
    updatedBy: string;
    createdAt: Date | null;
    updatedAt: Date | null;
    isLocked: boolean;
    isEditable: boolean;
    isHidden?: boolean;
}

/**
 * Catalog item.
 *
 * Narrow by `item.type` before accessing type-specific fields such as
 * `visualizationType`, `dataSet`, `definition`, `format`, or `metricType`.
 * @public
 */
export type ICatalogItem =
    | ICatalogItemDashboard
    | ICatalogItemInsight
    | ICatalogItemMeasure
    | ICatalogItemParameter
    | ICatalogItemAttribute
    | ICatalogItemFact
    | ICatalogItemDataSet;

/**
 * Catalog item for analytical dashboards.
 * @public
 */
export interface ICatalogItemDashboard extends ICatalogItemBase {
    type: "analyticalDashboard";
}

/**
 * Catalog item for insights (visualizations).
 * @public
 */
export interface ICatalogItemInsight extends ICatalogItemBase {
    type: "insight";
    visualizationType: VisualizationType;
}

/**
 * Visualization type
 * @public
 */
export type VisualizationType =
    | "scatter"
    | "donut"
    | "area"
    | "table"
    | "headline"
    | "column"
    | "line"
    | "treemap"
    | "pyramid"
    | "funnel"
    | "heatmap"
    | "bubble"
    | "pie"
    | "bar"
    | "combo"
    | "bullet"
    | "waterfall"
    | "dependencywheel"
    | "sankey"
    | "pushpin"
    | "repeater";

/**
 * Catalog item for measures (metrics).
 * @public
 */
export interface ICatalogItemMeasure extends ICatalogItemBase {
    type: "measure";
    isHiddenFromKda?: boolean;
    format?: string | null;
    metricType?: MetricType;
}

/**
 * Catalog item for parameters.
 * @public
 */
export interface ICatalogItemParameter extends ICatalogItemBase {
    type: "parameter";
    definition: IParameterDefinition;
}

/**
 * Catalog item for attributes.
 * @public
 */
export interface ICatalogItemAttribute extends ICatalogItemBase {
    type: "attribute";
    dataSet?: IDataSetMetadataObject;
}

/**
 * Catalog item for facts.
 * @public
 */
export interface ICatalogItemFact extends ICatalogItemBase {
    type: "fact";
    dataSet?: IDataSetMetadataObject;
}

/**
 * Catalog item for date datasets.
 * @public
 */
export interface ICatalogItemDataSet extends ICatalogItemBase {
    type: "dataSet";
    dataSet: IDataSetMetadataObject;
}

/**
 * Catalog items that support the `isHidden` flag.
 * @internal
 */
export type ICatalogItemHidable = Extract<
    ICatalogItem,
    { type: "insight" | "measure" | "attribute" | "fact" }
>;

export type ICatalogItemFeedOptions = Omit<ICatalogItemQueryOptions, "origin" | "tags">;

export interface ICatalogItemQueryOptions {
    backend: IAnalyticalBackend;
    workspace: string;
    search?: string;
    origin: ObjectOrigin;
    id?: string[];
    excludeId?: string[];
    createdBy?: string[];
    excludeCreatedBy?: string[];
    tags?: string[];
    excludeTags?: string[];
    isHidden?: boolean;
    certification?: boolean;
    pageSize?: number;
}
