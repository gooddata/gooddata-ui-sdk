// (C) 2025 GoodData Corporation

import type { GenAIObjectType } from "@gooddata/sdk-model";

import type { ObjectType } from "./types.js";

/**
 * Maps the ObjectType to the GenAIObjectType.
 */
export function mapGenAIObjectType(type: ObjectType): GenAIObjectType {
    if (type === "analyticalDashboard") {
        return "dashboard";
    }
    if (type === "insight") {
        return "visualization";
    }
    if (type === "measure") {
        return "metric";
    }
    return type;
}
