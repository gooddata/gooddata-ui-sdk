// (C) 2025 GoodData Corporation

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import type { IdentifierRef } from "@gooddata/sdk-model";

import type { ObjectType } from "../objectType/types.js";

/**
 * Catalog item
 * @internal
 */
export interface ICatalogItem extends IdentifierRef {
    title: string;
    description: string;
    tags: string[];
    createdBy: string;
    updatedBy: string;
    createdAt: Date | null;
    updatedAt: Date | null;
}

export interface ICatalogItemFeedProps extends ICatalogItemQueryOptions {
    types: ObjectType[];
}

export interface ICatalogItemQueryOptions {
    backend: IAnalyticalBackend;
    workspace: string;
    id?: string[];
    createdBy?: string[];
    tags?: string[];
    pageSize?: number;
}
