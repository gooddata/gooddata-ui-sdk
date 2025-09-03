// (C) 2025 GoodData Corporation

import type { ObjectType as ModelObjectType } from "@gooddata/sdk-model";

/**
 * Represents the supported catalog object types in the Analytics Catalog UI.
 *
 * @internal
 */
export type ObjectType = Extract<
    ModelObjectType,
    "analyticalDashboard" | "insight" | "measure" | "fact" | "attribute"
>;
