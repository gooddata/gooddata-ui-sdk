// (C) 2019-2024 GoodData Corporation
import { IMetadataObject, IMetadataObjectDefinition, isMetadataObject } from "../types.js";
import { IAuditable } from "../../../base/metadata.js";

/**
 * @public
 */
export interface IMeasureMetadataObjectBase {
    type: "measure";

    /**
     * Measure MAQL expression
     */
    expression: string;

    /**
     * Measure formatting
     * Prefer set format value, if the format is empty string backend implementation-dependent default will be used.
     */
    format: string;

    /**
     * Measure is locked for editing
     */
    isLocked?: boolean;

    /**
     * Measure tags.
     */
    tags?: string[];
}

/**
 * Measure metadata object
 *
 * @public
 */
export type IMeasureMetadataObject = IMetadataObject & IMeasureMetadataObjectBase & IAuditable;

/**
 * Measure metadata object definition
 *
 * @public
 */
export type IMeasureMetadataObjectDefinition = IMetadataObjectDefinition & IMeasureMetadataObjectBase;

/**
 * Tests whether the provided object is of type {@link IMeasureMetadataObject}.
 *
 * @param obj - object to test
 * @public
 */
export function isMeasureMetadataObject(obj: unknown): obj is IMeasureMetadataObject {
    return isMetadataObject(obj) && obj.type === "measure";
}

/**
 * Tests whether the provided object is of type {@link IMeasureMetadataObjectDefinition}.
 *
 * @param obj - object to test
 * @public
 */
export function isMeasureMetadataObjectDefinition(obj: unknown): obj is IMeasureMetadataObjectDefinition {
    return (obj as IMetadataObject).type === "measure" && (obj as IMetadataObject).ref === undefined;
}
