// (C) 2026 GoodData Corporation

import { isIdentifierRef } from "../../objRef/index.js";

import { isPublisherEntityIdV2 } from "./factory.js";

/**
 * @alpha
 */
export interface IPublisherValidationIssueV2 {
    /**
     * Where the problem is, for example `content.sections[1].pages[0].layout.children[2].id`.
     * Empty for the validated value itself.
     */
    path: string;
    message: string;
}

export type Issues = IPublisherValidationIssueV2[];

export type Check = (value: unknown, path: string, issues: Issues) => void;

interface IField {
    check: Check;
    required: boolean;
    emptyStringAllowed?: boolean;
}

interface IOptionalField extends IField {
    required: false;
}

interface IRequiredField extends IField {
    required: true;
}

/**
 * One field per key of `T`, required exactly where `T` requires the key. With `satisfies`, a key added
 * to or removed from `T` without the same change here is a compile error.
 */
export type KeyTable<T> = {
    [K in keyof Required<T>]: undefined extends T[K] ? IOptionalField : IRequiredField;
};

/**
 * Also rejects keys that `T` lacks. A key spread in from another table skips the excess property check.
 */
type ExactKeyTable<T, Table> = Table & Record<Exclude<keyof Table, keyof Required<T>>, never>;

export function optional(check: Check): IOptionalField {
    return { check, required: false };
}

export function required(check: Check): IRequiredField {
    return { check, required: true };
}

/** A required key for which `""` is a value of its own rather than an empty one. */
export function requiredAllowingEmptyString(check: Check): IRequiredField {
    return { check, required: true, emptyStringAllowed: true };
}

export function joinPath(path: string, segment: string | number): string {
    if (typeof segment === "number") {
        return `${path}[${segment}]`;
    }
    return path === "" ? segment : `${path}.${segment}`;
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

const maxDescriptionLength = 80;

export function describeValue(value: unknown): string {
    const description =
        value === null ? "null" : Array.isArray(value) ? "an array" : (JSON.stringify(value) ?? typeof value);
    return description.length > maxDescriptionLength
        ? `${description.slice(0, maxDescriptionLength - 1)}…`
        : description;
}

export function objectOf<T>(): <Table extends KeyTable<T>>(table: ExactKeyTable<T, Table>) => Check {
    return <Table extends KeyTable<T>>(table: ExactKeyTable<T, Table>): Check => {
        const fields: Record<string, IField> = table;
        return (value, path, issues) => {
            if (!isPlainObject(value)) {
                issues.push({ path, message: `Expected an object, got ${describeValue(value)}.` });
                return;
            }
            for (const [key, fieldValue] of Object.entries(value)) {
                const keyPath = joinPath(path, key);
                const field = Object.hasOwn(fields, key) ? fields[key] : undefined;
                if (field === undefined) {
                    issues.push({ path: keyPath, message: `Unknown key "${key}".` });
                } else if (fieldValue === null || (fieldValue === "" && field.emptyStringAllowed !== true)) {
                    issues.push({
                        path: keyPath,
                        message: field.required
                            ? `Expected a value, got ${describeValue(fieldValue)}.`
                            : "Leave the key out instead of an empty value.",
                    });
                } else if (fieldValue !== undefined) {
                    field.check(fieldValue, keyPath, issues);
                }
            }
            for (const [key, field] of Object.entries(fields)) {
                if (field.required && value[key] === undefined) {
                    issues.push({ path: joinPath(path, key), message: `Missing required key "${key}".` });
                }
            }
        };
    };
}

/** The first key of `variants` that `value` holds. */
function variantKey<Variants extends Record<string, Check>>(
    value: unknown,
    variants: Variants,
): (keyof Variants & string) | undefined {
    return isPlainObject(value) ? Object.keys(variants).find((key) => Object.hasOwn(value, key)) : undefined;
}

/**
 * Checks an object that is told apart by the key it holds. Another variant's key next to it is reported
 * by the chosen variant as an unknown key.
 */
export function oneKeyOf(variants: Record<string, Check>, expected: string): Check {
    return (value, path, issues) => {
        const key = variantKey(value, variants);
        if (key === undefined) {
            issues.push({ path, message: `Expected ${expected}, got ${describeValue(value)}.` });
        } else {
            variants[key](value, path, issues);
        }
    };
}

export function arrayOf(item: Check): Check {
    return (value, path, issues) => {
        if (!Array.isArray(value)) {
            issues.push({ path, message: `Expected an array, got ${describeValue(value)}.` });
            return;
        }
        value.forEach((element, i) => item(element, joinPath(path, i), issues));
    };
}

// The backend's JSON Schema `maxLength` counts code points, so an emoji counts once.
export function characterCount(value: string): number {
    return Array.from(value).length;
}

export function nonEmptyStringOfAtMost(maxLength: number): Check {
    return satisfying(
        (value) => isNonEmptyString(value) && characterCount(value) <= maxLength,
        `a non-empty string of at most ${maxLength} characters`,
    );
}

/** Compares items by identity, so it only finds repeated primitives, never repeated objects. */
export function uniqueArrayOf(item: Check): Check {
    const items = arrayOf(item);
    return (value, path, issues) => {
        const issueCount = issues.length;
        items(value, path, issues);
        if (issues.length > issueCount || !Array.isArray(value)) {
            return;
        }
        const seen = new Set<unknown>();
        value.forEach((element: unknown, i) => {
            if (seen.has(element)) {
                issues.push({
                    path: joinPath(path, i),
                    message: `Expected unique items, got ${describeValue(element)} again.`,
                });
            }
            seen.add(element);
        });
    };
}

export function satisfying(predicate: (value: unknown) => boolean, expected: string): Check {
    return (value, path, issues) => {
        if (!predicate(value)) {
            issues.push({ path, message: `Expected ${expected}, got ${describeValue(value)}.` });
        }
    };
}

export function isFiniteNumber(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value);
}

const minInt32 = -(2 ** 31);
const maxInt32 = 2 ** 31 - 1;

export function isInt32(value: unknown): value is number {
    return typeof value === "number" && Number.isInteger(value) && value >= minInt32 && value <= maxInt32;
}

export function isNonEmptyString(value: unknown): value is string {
    return typeof value === "string" && value !== "";
}

export function isLength(value: unknown): value is number {
    return isFiniteNumber(value) && value >= 0;
}

export function oneOf(values: readonly unknown[]): Check {
    return satisfying((value) => values.includes(value), values.map((v) => JSON.stringify(v)).join(", "));
}

export function matching(pattern: RegExp, expected: string): Check {
    return satisfying((value) => isNonEmptyString(value) && pattern.test(value), expected);
}

export function numberIn(min: number, max: number): Check {
    return satisfying(
        (value) => isFiniteNumber(value) && value >= min && value <= max,
        `a number from ${min} to ${max}`,
    );
}

export const nonEmptyString = satisfying(isNonEmptyString, "a non-empty string");
export const trueOrFalse = satisfying((value) => typeof value === "boolean", "true or false");
export const finiteNumber = satisfying(isFiniteNumber, "a finite number");
export const int32 = satisfying(isInt32, `an integer from ${minInt32} to ${maxInt32}`);
export const px = satisfying(isLength, "a length of 0 or more");
export const opacity = numberIn(0, 1);
export const positive = satisfying((value) => isFiniteNumber(value) && value > 0, "a number greater than 0");
export const entityRef = satisfying(
    (value) => isIdentifierRef(value) && isPublisherEntityIdV2(value.identifier),
    "an identifier reference whose id has 1 to 255 letters, digits, dots, underscores or hyphens and does not start with a dot",
);
export const id = matching(/^[A-Za-z0-9_.-]{1,64}$/, "an id matching [A-Za-z0-9_.-]{1,64}");
