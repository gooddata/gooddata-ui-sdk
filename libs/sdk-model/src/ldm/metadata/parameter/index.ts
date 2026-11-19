// (C) 2026 GoodData Corporation

import { type DateAttributeGranularity } from "../../../base/dateGranularities.js";
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
 * Parameter metadata object whose definition is a {@link IScalarParameterDefinition}.
 *
 * @alpha
 */
export interface IScalarParameterMetadataObject extends IParameterMetadataObject {
    definition: IScalarParameterDefinition;
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
export type IParameterDefinition =
    | INumberParameterDefinition
    | IStringParameterDefinition
    | IDateRangeParameterDefinition;

/**
 * Definition of a parameter that holds a single value, which can be overridden at runtime (for example
 * in an execution, on a dashboard or in an automation).
 *
 * @remarks
 * A {@link IDateRangeParameterDefinition} is not scalar: date filters reference it, and the backend
 * resolves its period during execution.
 *
 * @alpha
 */
export type IScalarParameterDefinition = INumberParameterDefinition | IStringParameterDefinition;

/**
 * @alpha
 */
export type ParameterType = IParameterDefinition["type"];

/**
 * Type of a {@link IScalarParameterDefinition}.
 *
 * @alpha
 */
export type ScalarParameterType = IScalarParameterDefinition["type"];

/**
 * Runtime value of a {@link IScalarParameterDefinition}.
 *
 * @alpha
 */
export type ParameterValue = IScalarParameterDefinition["defaultValue"];

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
 * Granularity of the period held by a {@link IDateRangeParameterDefinition}.
 *
 * @remarks
 * The calendar granularities that date filters use (see {@link DateFilterGranularity}), except that a
 * week is `GDC.time.week`: an ISO-8601 week, whose days the backend shifts by the week start. Fiscal
 * granularities are not supported.
 *
 * @public
 */
export type DateRangeParameterGranularity = Extract<
    DateAttributeGranularity,
    | "GDC.time.year"
    | "GDC.time.quarter"
    | "GDC.time.month"
    | "GDC.time.week"
    | "GDC.time.date"
    | "GDC.time.hour"
    | "GDC.time.minute"
    | "GDC.time.second"
>;

/**
 * Period held by a {@link IDateRangeParameterDefinition}.
 *
 * @remarks
 * `from` and `to` are inclusive backend period literals in the format of the granularity: `"2025"` for
 * `GDC.time.year`, `"2025-3"` for `GDC.time.quarter`, `"2025-08"` for `GDC.time.month`, `"2025-33"` for
 * `GDC.time.week` (the ISO-8601 week number), `"2025-08-14"` for `GDC.time.date`, `"2025-08-14 09"` for
 * `GDC.time.hour`, `"2025-08-14 09:30"` for `GDC.time.minute` and `"2025-08-14 09:30:15"` for
 * `GDC.time.second`. A missing end leaves the period unbounded on that side. The backend does not
 * guarantee that at least one end is set.
 *
 * @public
 */
export interface IDateRangeParameterPeriod {
    granularity: DateRangeParameterGranularity;
    from?: string;
    to?: string;
}

/**
 * Date range parameter definition. It holds one named period that date filters reference.
 *
 * @public
 */
export interface IDateRangeParameterDefinition {
    type: "DATE_RANGE";
    defaultValue: IDateRangeParameterPeriod;
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
 * Tests whether the provided parameter definition is a {@link IDateRangeParameterDefinition}.
 *
 * @param def - parameter definition to test
 * @alpha
 */
export function isDateRangeParameterDefinition(
    def: IParameterDefinition,
): def is IDateRangeParameterDefinition {
    return def.type === "DATE_RANGE";
}

/**
 * Tests whether the provided parameter definition is a {@link IScalarParameterDefinition}.
 *
 * @param def - parameter definition to test
 * @alpha
 */
export function isScalarParameterDefinition(def: IParameterDefinition): def is IScalarParameterDefinition {
    return isNumberParameterDefinition(def) || isStringParameterDefinition(def);
}

/**
 * Tests whether the provided parameter has a {@link IScalarParameterDefinition}.
 *
 * @param parameter - parameter to test
 * @alpha
 */
export function isScalarParameterMetadataObject(
    parameter: IParameterMetadataObject,
): parameter is IScalarParameterMetadataObject {
    return isScalarParameterDefinition(parameter.definition);
}

/**
 * Tests whether `value` is valid for the given parameter definition.
 *
 * @alpha
 */
export function isValidParameterValue(
    definition: IScalarParameterDefinition,
    value: ParameterValue,
): boolean {
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
    definition: IScalarParameterDefinition,
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
export function parameterValueMatchesType(
    definition: IScalarParameterDefinition,
    value: ParameterValue,
): boolean {
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
