// (C) 2025-2026 GoodData Corporation

import type { ObjectType as ModelObjectType } from "@gooddata/sdk-model";

/**
 * Represents the supported catalog object types in the Analytics Catalog UI.
 *
 * @public
 */
export type ObjectType = Extract<
    ModelObjectType,
    "analyticalDashboard" | "insight" | "measure" | "parameter" | "fact" | "attribute" | "dataSet"
>;

/**
 * Represents the object types that can be created from the Analytics Catalog.
 *
 * @public
 */
export type CatalogCreateObjectType = Extract<
    ObjectType,
    "analyticalDashboard" | "insight" | "measure" | "parameter"
>;
