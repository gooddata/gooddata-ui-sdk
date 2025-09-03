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
}

export type ICatalogItemFeedOptions = Omit<ICatalogItemQueryOptions, "origin">;

export interface ICatalogItemQueryOptions {
    backend: IAnalyticalBackend;
    workspace: string;
    origin: ObjectOrigin;
    id?: string[];
    createdBy?: string[];
    tags?: string[];
    pageSize?: number;
}
