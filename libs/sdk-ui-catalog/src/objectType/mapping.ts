// (C) 2025 GoodData Corporation

import type { GenAIObjectType } from "@gooddata/sdk-model";

import type { ObjectType } from "./types.js";

/**
 * Maps the catalog ObjectType to the GenAIObjectType.
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

/**
 * Maps the GenAIObjectType to the catalog ObjectType.
 */
export function mapObjectType(type: GenAIObjectType): ObjectType {
    if (type === "dashboard") {
        return "analyticalDashboard";
    }
    if (type === "visualization") {
        return "insight";
    }
    if (type === "metric") {
        return "measure";
    }
    return type as ObjectType;
}
