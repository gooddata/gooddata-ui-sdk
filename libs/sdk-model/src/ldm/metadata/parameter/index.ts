// (C) 2026 GoodData Corporation

import { type IAuditable } from "../../../base/metadata.js";
import { type IMetadataObject, type IMetadataObjectDefinition, isMetadataObject } from "../types.js";

/**
 * Parameter metadata object.
 *
 * @public
 */
export interface IParameterMetadataObject extends IMetadataObject, IAuditable {
    type: "parameter";
    definition: IParameterDefinition;
    areRelationsValid?: boolean;
    isLocked?: boolean;
}

/**
 * Parameter metadata object definition.
 *
 * @public
 */
export interface IParameterMetadataObjectDefinition extends IMetadataObjectDefinition {
    type: "parameter";
    definition: IParameterDefinition;
}

/**
 * Parameter definition.
 *
 * @public
 */
export type IParameterDefinition = INumberParameterDefinition;

/**
 * Number parameter definition.
 *
 * @public
 */
export interface INumberParameterDefinition {
    type: "NUMBER";
    defaultValue: number;
    constraints?: INumberParameterConstraints;
}

/**
 * Number parameter constraints.
 *
 * @public
 */
export interface INumberParameterConstraints {
    min?: number;
    max?: number;
}

/**
 * Tests whether the provided object is of type {@link IParameterMetadataObject}.
 *
 * @param obj - object to test
 * @public
 */
export function isParameterMetadataObject(obj: unknown): obj is IParameterMetadataObject {
    return isMetadataObject(obj) && obj.type === "parameter";
}

/**
 * Tests whether the provided object is of type {@link IParameterMetadataObjectDefinition}.
 *
 * @param obj - object to test
 * @public
 */
export function isParameterMetadataObjectDefinition(obj: unknown): obj is IParameterMetadataObjectDefinition {
    return isObjectRecord(obj) && obj["type"] === "parameter" && !("ref" in obj);
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === "object";
}
