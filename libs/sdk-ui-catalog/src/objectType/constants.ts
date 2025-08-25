// (C) 2025 GoodData Corporation

import type { ObjectType } from "./types.js";

export const ObjectTypes = {
    DASHBOARD: "dashboard",
    VISUALIZATION: "visualization",
    METRIC: "metric",
    FACT: "fact",
    ATTRIBUTE: "attribute",
} as const satisfies Record<string, ObjectType>;
