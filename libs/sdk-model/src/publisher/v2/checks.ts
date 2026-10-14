// (C) 2026 GoodData Corporation

import { isObjRef } from "../../objRef/index.js";

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
                } else if (fieldValue === null || fieldValue === "") {
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

export function arrayOf(item: Check): Check {
    return (value, path, issues) => {
        if (!Array.isArray(value)) {
            issues.push({ path, message: `Expected an array, got ${describeValue(value)}.` });
            return;
        }
        value.forEach((element, i) => item(element, joinPath(path, i), issues));
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
export const px = satisfying(isLength, "a length of 0 or more");
export const opacity = numberIn(0, 1);
export const positive = satisfying((value) => isFiniteNumber(value) && value > 0, "a number greater than 0");
export const objRef = satisfying(isObjRef, "an object reference");
export const id = matching(/^[A-Za-z0-9_.-]{1,64}$/, "an id matching [A-Za-z0-9_.-]{1,64}");
