// (C) 2025 GoodData Corporation

import type { ObjectType } from "../objectType/types.js";

export interface ICatalogItem {
    id: string;
    type: ObjectType;
    title: string;
    tags: string[];
    createdBy: string;
    updatedAt: Date;
}
