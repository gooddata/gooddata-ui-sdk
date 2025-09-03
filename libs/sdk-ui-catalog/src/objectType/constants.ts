// (C) 2025 GoodData Corporation

import type { ObjectType } from "./types.js";

export const ObjectTypes = {
    DASHBOARD: "analyticalDashboard",
    VISUALIZATION: "insight",
    METRIC: "measure",
    FACT: "fact",
    ATTRIBUTE: "attribute",
} as const satisfies Record<string, ObjectType>;
