// (C) 2026 GoodData Corporation

import { type IAuditable } from "../../../base/metadata.js";
import { assertNever } from "../../../base/typeUtils.js";
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
export type IParameterDefinition = INumberParameterDefinition | IStringParameterDefinition;

/**
 * @alpha
 */
export type ParameterType = IParameterDefinition["type"];

/**
 * @alpha
 */
export type ParameterValue = IParameterDefinition["defaultValue"];

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
 * String parameter definition.
 *
 * @public
 */
export interface IStringParameterDefinition {
    type: "STRING";
    defaultValue: string;
    constraints?: IStringParameterConstraints;
}

/**
 * String parameter constraints.
 *
 * @public
 */
export interface IStringParameterConstraints {
    minLength?: number;
    maxLength?: number;
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

/**
 * Tests whether the provided parameter definition is a {@link INumberParameterDefinition}.
 *
 * @param def - parameter definition to test
 * @alpha
 */
export function isNumberParameterDefinition(def: IParameterDefinition): def is INumberParameterDefinition {
    return def.type === "NUMBER";
}

/**
 * Tests whether the provided parameter definition is a {@link IStringParameterDefinition}.
 *
 * @param def - parameter definition to test
 * @alpha
 */
export function isStringParameterDefinition(def: IParameterDefinition): def is IStringParameterDefinition {
    return def.type === "STRING";
}

/**
 * Returns the default value of a NUMBER parameter, or `undefined` for any other type.
 *
 * @remarks
 * A NUMBER parameter always carries a default, so `undefined` unambiguously means "not a NUMBER parameter".
 *
 * @alpha
 */
export function getNumberParameterDefaultValue(
    definition: IParameterDefinition | undefined,
): number | undefined {
    return definition && isNumberParameterDefinition(definition) ? definition.defaultValue : undefined;
}

/**
 * Tests whether `value` is valid for the given parameter definition.
 *
 * @alpha
 */
export function isValidParameterValue(definition: IParameterDefinition, value: ParameterValue): boolean {
    switch (definition.type) {
        case "NUMBER":
            return typeof value === "number" && isValidNumberParameterValue(value, definition.constraints);
        case "STRING":
            return typeof value === "string" && isValidStringParameterValue(value, definition.constraints);
        default:
            assertNever(definition);
            return false;
    }
}

/**
 * Tests whether `value` is a finite number within the optional `min`/`max` bounds (inclusive).
 *
 * @alpha
 */
export function isValidNumberParameterValue(
    value: number,
    constraints: INumberParameterConstraints = {},
): boolean {
    const { min, max } = constraints;
    return (
        Number.isFinite(value) && (min === undefined || value >= min) && (max === undefined || value <= max)
    );
}

function isValidStringParameterValue(value: string, constraints: IStringParameterConstraints = {}): boolean {
    const { minLength, maxLength } = constraints;
    return (
        (minLength === undefined || value.length >= minLength) &&
        (maxLength === undefined || value.length <= maxLength)
    );
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === "object";
}
