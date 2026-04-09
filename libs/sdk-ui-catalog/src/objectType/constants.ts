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
    ATTRIBUTE: "attribute",
    FACT: "fact",
    DATASET: "dataSet",
} as const satisfies Record<string, ObjectType>;

/**
 * Analytics Catalog default object type order.
 */
export const OBJECT_TYPE_ORDER: ObjectType[] = [
    ObjectTypes.DASHBOARD,
    ObjectTypes.VISUALIZATION,
    ObjectTypes.METRIC,
    ObjectTypes.PARAMETER,
    ObjectTypes.ATTRIBUTE,
    ObjectTypes.FACT,
    ObjectTypes.DATASET,
];
