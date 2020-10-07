// (C) 2019-2020 GoodData Corporation
import { IMetadataObject, isMetadataObject } from "../types";

/**
 * Measure metadata object
 *
 * @public
 */
export interface IMeasureMetadataObject extends IMetadataObject {
    type: "measure";

    /**
     * Measure MAQL expression
     */
    expression: string;

    /**
     * Measure formatting
     */
    format: string;
}

/**
 * Tests whether the provided object is of type {@link IMeasureMetadataObject}.
 *
 * @param obj - object to test
 * @public
 */
export function isMeasureMetadataObject(obj: unknown): obj is IMeasureMetadataObject {
    return isMetadataObject(obj) && obj.type === "measure";
}
