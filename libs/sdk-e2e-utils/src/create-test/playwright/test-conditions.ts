// (C) 2026 GoodData Corporation

import type { ITestConditions, TestConditionsValueConstraint } from "./types.js";

/** Combine a describe's or test's own conditions with the inherited ones (`child` replaces `parent` by default). */
export function combineConditions<TestConditionsValue extends TestConditionsValueConstraint>(
    testConditions: ITestConditions<TestConditionsValue> | undefined,
    parent: TestConditionsValue | undefined,
    child: TestConditionsValue | undefined,
): TestConditionsValue | undefined {
    if (child === undefined) {
        return parent;
    }
    return testConditions?.merge ? testConditions.merge(parent, child) : child;
}

/**
 * Throw if `conditions` is set (not `undefined`) but empty or of a type that isn't allowed. Empty values
 * shouldn't be set at all. `0` is a valid number; objects other than plain objects, arrays, `Map` and
 * `Set` (class instances, `Date`, ...) aren't checked for emptiness.
 *
 * @param conditions - the value from `details.conditions`
 * @param where - call description used in the error message, e.g. `test.describe("title")`
 */
export function assertValidConditions(conditions: unknown, where: string): void {
    if (conditions === undefined) {
        return;
    }

    const problem = getConditionsProblem(conditions);
    if (problem) {
        throw new Error(`${where}: \`conditions\` ${problem}. Leave \`conditions\` out instead.`);
    }
}

function getConditionsProblem(conditions: unknown): string | undefined {
    // `null` and `boolean` are already rejected by the types; this catches values cast past them.
    if (conditions === null) {
        return "is null";
    }
    if (typeof conditions === "boolean") {
        return "is a boolean, which isn't an allowed conditions value";
    }
    if (typeof conditions === "string") {
        return conditions === "" ? "is set but empty (empty string)" : undefined;
    }
    if (typeof conditions === "number") {
        return Number.isNaN(conditions) ? "is set but not a number (NaN)" : undefined;
    }
    if (Array.isArray(conditions)) {
        return conditions.length === 0 ? "is set but empty (empty array)" : undefined;
    }
    if (conditions instanceof Map || conditions instanceof Set) {
        return conditions.size === 0 ? `is set but empty (empty ${conditions.constructor.name})` : undefined;
    }
    if (typeof conditions === "object") {
        const prototype: unknown = Object.getPrototypeOf(conditions);
        const isPlainObject = prototype === Object.prototype || prototype === null;
        return isPlainObject && Object.keys(conditions).length === 0
            ? "is set but empty (object without keys)"
            : undefined;
    }
    return undefined;
}

/**
 * Throw if `testConditions.required` is set and a test ends up without conditions, neither its own
 * nor inherited from an enclosing describe.
 *
 * @param where - call description used in the error message, e.g. `test("title")`
 */
export function assertRequiredConditions<TestConditionsValue extends TestConditionsValueConstraint>(
    testConditions: ITestConditions<TestConditionsValue> | undefined,
    conditions: TestConditionsValue | undefined,
    where: string,
    file: string,
): void {
    if (testConditions?.required && conditions === undefined) {
        throw new Error(
            `${where}: \`testConditions.required\` is set, but neither this test nor any enclosing ` +
                `test.describe() sets \`conditions\` (${file}).`,
        );
    }
}

/**
 * Whether a test runs. Without conditions anywhere in its chain (or without `testConditions`
 * configured), the predicate isn't called and the test runs.
 */
export function shouldRunTest<TestConditionsValue extends TestConditionsValueConstraint>(
    testConditions: ITestConditions<TestConditionsValue> | undefined,
    conditions: TestConditionsValue | undefined,
    file: string,
    titlePath: string[],
): boolean {
    if (!testConditions || conditions === undefined) {
        return true;
    }
    return testConditions.shouldRun(conditions, { file, titlePath });
}
