// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type Condition, evaluateCondition } from "./index.js";

type Actual = Record<string, unknown>;

const actual: Actual = { a: true, b: false, plan: "enterprise", limit: 5, sizeLimit: null, config: {} };

function evaluate(condition: unknown, values: Actual = actual): boolean {
    return evaluateCondition(condition as Condition<Actual>, values);
}

describe("evaluateCondition", () => {
    describe("valid conditions", () => {
        const Scenarios: Array<[boolean, string, unknown]> = [
            [true, "matching boolean", { a: true }],
            [false, "mismatching boolean", { a: false }],
            [true, "false requirement on a missing value", { missing: false }],
            [false, "true requirement on a missing value", { missing: true }],
            [true, "matching string", { plan: "enterprise" }],
            [false, "mismatching string", { plan: "free" }],
            [true, "matching number", { limit: 5 }],
            [true, "null requirement on a null value", { sizeLimit: null }],
            [false, "null requirement on a missing value", { missing: null }],
            [false, "null requirement on a non-null value", { limit: null }],
            [false, "array requirement", { a: [] }],
            [false, "object requirement on a different object", { config: {} }],
            [true, "implicit AND of matches", { a: true, b: false }],
            [false, "implicit AND with one mismatch", { a: true, b: true }],
            [true, "empty plain object", {}],
            [true, "$or with one match", { $or: [{ a: false }, { b: false }] }],
            [false, "$or without a match", { $or: [{ a: false }, { b: true }] }],
            [true, "$and of matches", { $and: [{ a: true }, { b: false }] }],
            [false, "$and with one mismatch", { $and: [{ a: true }, { b: true }] }],
            [true, "nested $and inside $or", { $or: [{ $and: [{ a: true }, { plan: "enterprise" }] }] }],
            [
                false,
                "nested $and inside $or with a mismatch",
                { $or: [{ $and: [{ a: true }, { b: true }] }] },
            ],
        ];

        it.each(Scenarios)("should return %s for %s", (expected, _desc, condition) => {
            expect(evaluate(condition)).toBe(expected);
        });

        it("should return true for an object requirement on the same object", () => {
            const config = { model: "x" };
            expect(evaluate({ config }, { config })).toBe(true);
        });

        it("should return false for a plain condition without actual values", () => {
            expect(evaluateCondition<Actual>({ missing: false }, undefined)).toBe(false);
        });
    });

    describe("malformed conditions", () => {
        const Scenarios: Array<[string, unknown]> = [
            ["empty array", []],
            ["array of conditions", [{ a: true }]],
            ["null", null],
            ["undefined", undefined],
            ["string", "a"],
            ["number", 1],
            ["boolean", true],
            ["empty $or", { $or: [] }],
            ["empty $and", { $and: [] }],
            ["$or with a nested empty array", { $or: [[]] }],
            ["$and with a nested empty array", { $and: [[]] }],
            ["$or with a null operand", { $or: [null] }],
            ["$or with a string operand", { $or: ["a"] }],
            ["$or operand that is not an array", { $or: { a: true } }],
            ["$and operand that is null", { $and: null }],
            ["$or operand that is a string", { $or: "a" }],
            ["$and with a nested empty $and", { $and: [{ $and: [] }] }],
            ["deeply nested malformed operand", { $or: [{ $and: [{ a: true }, []] }] }],
            ["$or mixed with a plain key", { $or: [{ a: true }], b: true }],
            ["$or mixed with $and", { $or: [{ a: true }], $and: [{ a: true }] }],
            ["unknown $ operator", { $not: false }],
        ];

        it.each(Scenarios)("should return false for %s", (_desc, condition) => {
            expect(evaluate(condition)).toBe(false);
        });

        it("should not let a malformed $or operand grant access next to a valid one", () => {
            expect(evaluate({ $or: [[], { a: false }] })).toBe(false);
            expect(evaluate({ $or: [[], { a: true }] })).toBe(true);
        });
    });
});
