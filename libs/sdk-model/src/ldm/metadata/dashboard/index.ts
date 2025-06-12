// (C) 2019-2021 GoodData Corporation
import { IMetadataObject, isMetadataObject } from "../types.js";

/**
 * Dashboard metadata object
 *
 * @public
 */
export interface IDashboardMetadataObject extends IMetadataObject {
    type: "analyticalDashboard";
}

/**
 * Tests whether the provided object is of type {@link IDashboardMetadataObject}.
 *
 * @param obj - object to test
 * @public
 */
export function isDashboardMetadataObject(obj: unknown): obj is IDashboardMetadataObject {
    return isMetadataObject(obj) && obj.type === "analyticalDashboard";
}
