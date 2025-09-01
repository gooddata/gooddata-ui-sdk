// (C) 2025 GoodData Corporation

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import type { ObjectType } from "../objectType/types.js";

export interface ICatalogItem {
    id: string;
    type: ObjectType;
    title: string;
    tags: string[];
    createdBy: string;
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
