// (C) 2025-2026 GoodData Corporation

import type { ObjectType } from "./types.js";

/**
 * Analytics Catalog object type enum.
 */
export const ObjectTypes = {
    DASHBOARD: "analyticalDashboard",
    VISUALIZATION: "insight",
    METRIC: "measure",
    PARAMETER: "parameter",
    COMPUTED_ATTRIBUTE: "computedAttribute",
    ATTRIBUTE: "attribute",
    FACT: "fact",
    DATASET: "dataSet",
} as const satisfies Record<string, ObjectType>;

/**
 * Analytics Catalog object type filter groups in display order.
 */
export const FILTER_GROUPS = [
    { id: ObjectTypes.DASHBOARD, types: [ObjectTypes.DASHBOARD] },
    { id: ObjectTypes.VISUALIZATION, types: [ObjectTypes.VISUALIZATION] },
    { id: ObjectTypes.METRIC, types: [ObjectTypes.METRIC] },
    { id: ObjectTypes.PARAMETER, types: [ObjectTypes.PARAMETER] },
    { id: ObjectTypes.ATTRIBUTE, types: [ObjectTypes.ATTRIBUTE, ObjectTypes.COMPUTED_ATTRIBUTE] },
    { id: ObjectTypes.FACT, types: [ObjectTypes.FACT] },
    { id: ObjectTypes.DATASET, types: [ObjectTypes.DATASET] },
] as const satisfies readonly { id: ObjectType; types: readonly ObjectType[] }[];

/**
 * Object types offered as filter group buttons.
 */
export type FilterableObjectType = (typeof FILTER_GROUPS)[number]["id"];
