// (C) 2025 GoodData Corporation

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import type { IdentifierRef, ObjectOrigin } from "@gooddata/sdk-model";

import type { ObjectType } from "../objectType/types.js";

/**
 * Catalog item reference.
 * @internal
 */
export interface ICatalogItemRef extends IdentifierRef {
    type: ObjectType;
}

/**
 * Visualization type
 * @internal
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
 * Catalog item
 * @internal
 */
export interface ICatalogItem extends ICatalogItemRef {
    title: string;
    description: string;
    tags: string[];
    createdBy: string;
    updatedBy: string;
    createdAt: Date | null;
    updatedAt: Date | null;
    isLocked: boolean;
    visualizationType?: VisualizationType;
}

export type ICatalogItemFeedOptions = Omit<ICatalogItemQueryOptions, "origin" | "tags">;

export interface ICatalogItemQueryOptions {
    backend: IAnalyticalBackend;
    workspace: string;
    origin: ObjectOrigin;
    id?: string[];
    createdBy?: string[];
    tags?: string[];
    pageSize?: number;
}
