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
 * Allowed value of a string parameter. When a definition's `constraints` carry a non-empty
 * `allowedValues` list, the parameter value must equal one entry's `value` and the entries are
 * offered in list order; an absent or empty list means free text restricted only by the length
 * constraints.
 *
 * @public
 */
export interface IParameterAllowedValue {
    value: string;
    title?: string;
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
    allowedValues?: IParameterAllowedValue[];
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
 * Returns `value` when it is valid for `definition`, the definition's `defaultValue` otherwise.
 *
 * @alpha
 */
export function sanitizeParameterValue(
    definition: IParameterDefinition,
    value: ParameterValue,
): ParameterValue {
    return isValidParameterValue(definition, value) ? value : definition.defaultValue;
}

/**
 * Tests whether `value`'s runtime kind matches the given parameter definition's type, ignoring
 * constraints.
 *
 * @alpha
 */
export function parameterValueMatchesType(definition: IParameterDefinition, value: ParameterValue): boolean {
    switch (definition.type) {
        case "NUMBER":
            return typeof value === "number";
        case "STRING":
            return typeof value === "string";
        default:
            assertNever(definition);
            return false;
    }
}

/**
 * Tests whether `value` is a valid value for a NUMBER parameter with the given `constraints`;
 * non-finite values are always invalid.
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

/**
 * Tests whether `value` is a valid value for a STRING parameter with the given `constraints`
 * (length bounds and `allowedValues` membership; see {@link IParameterAllowedValue}).
 *
 * @alpha
 */
export function isValidStringParameterValue(
    value: string,
    constraints: IStringParameterConstraints = {},
): boolean {
    const { minLength, maxLength, allowedValues } = constraints;
    return (
        (minLength === undefined || value.length >= minLength) &&
        (maxLength === undefined || value.length <= maxLength) &&
        (allowedValues === undefined ||
            allowedValues.length === 0 ||
            allowedValues.some((allowed) => allowed.value === value))
    );
}

/**
 * Returns the title to show for `value` under the given parameter definition. When the definition
 * has no title for `value`, returns the plain value as a string.
 *
 * @alpha
 */
export function getParameterValueTitle(definition: IParameterDefinition, value: ParameterValue): string {
    const allowedValue = getParameterAllowedValues(definition)?.find((allowed) => allowed.value === value);
    return allowedValue ? getParameterAllowedValueTitle(allowedValue) : String(value);
}

/**
 * Returns the allowed values enumerated by the parameter definition, or `undefined` when the
 * definition does not enumerate any and thus accepts free text.
 *
 * @alpha
 */
export function getParameterAllowedValues(
    definition: IParameterDefinition,
): IParameterAllowedValue[] | undefined {
    if (!isStringParameterDefinition(definition)) {
        return undefined;
    }
    const allowedValues = definition.constraints?.allowedValues;
    return allowedValues?.length ? allowedValues : undefined;
}

/**
 * Returns the `title` of the allowed value. If the allowed value has no `title`, returns its
 * `value`.
 *
 * @alpha
 */
export function getParameterAllowedValueTitle(allowedValue: IParameterAllowedValue): string {
    return allowedValue.title ?? allowedValue.value;
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === "object";
}
