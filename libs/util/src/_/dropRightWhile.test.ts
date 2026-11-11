// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _dropRightWhile } from "./dropRightWhile.js";

function getArguments(..._args: unknown[]): IArguments {
    // eslint-disable-next-line prefer-rest-params
    return arguments;
}

interface IUser {
    user: string;
    active: boolean;
}

const users: IUser[] = [
    { user: "barney", active: true },
    { user: "fred", active: false },
    { user: "pebbles", active: false },
];

// Expected values match lodash-es@4.18.1 `dropRightWhile`.
describe("dropRightWhile", () => {
    describe("predicate", () => {
        it("drops elements from the end while the predicate is truthy", () => {
            expect(_dropRightWhile(users, (user) => !user.active)).toEqual([users[0]]);
            expect(_dropRightWhile([1, 2, 3, 4], (value) => value > 2)).toEqual([1, 2]);
            expect(_dropRightWhile([1, 2, 3], (value) => value > 5)).toEqual([1, 2, 3]);
            expect(_dropRightWhile([1, 2, 3], () => true)).toEqual([]);

            const truthy = (value: number) => (value > 1 ? "yes" : 0) as unknown as boolean;

            expect(_dropRightWhile([1, 2, 3], truthy)).toEqual([1]);
        });

        it("accepts matches, matches-property, property path and index shorthands", () => {
            expect(_dropRightWhile(users, { user: "pebbles", active: false })).toEqual(users.slice(0, 2));
            expect(_dropRightWhile(users, ["active", false])).toEqual([users[0]]);
            expect(_dropRightWhile(users, "active")).toEqual(users);
            expect(_dropRightWhile([{ a: { b: 1 } }, { a: { b: 2 } }], { a: { b: 2 } })).toEqual([
                { a: { b: 1 } },
            ]);
            expect(_dropRightWhile([{ a: { b: 0 } }, { a: { b: 1 } }], "a.b")).toEqual([{ a: { b: 0 } }]);
            expect(
                _dropRightWhile(
                    [
                        [1, 0],
                        [1, 1],
                    ],
                    1,
                ),
            ).toEqual([[1, 0]]);
        });

        it("uses the identity when no predicate is given", () => {
            expect(_dropRightWhile([0, 1, "", 2, 3])).toEqual([0, 1, ""]);
            expect(_dropRightWhile([1, 2, 3])).toEqual([]);
            expect(_dropRightWhile([0, "", null])).toEqual([0, "", null]);
            expect(_dropRightWhile([1, 0], undefined)).toEqual([1, 0]);
            expect(_dropRightWhile([1, 0], null as unknown as undefined)).toEqual([1, 0]);
        });

        it("passes (value, index, array) with an undefined this, from the end, until falsy", () => {
            const calls: unknown[][] = [];
            const bindings: unknown[] = [];
            const array = [1, 2, 3, 4, 5];

            _dropRightWhile(array, function (this: unknown, value, index, collection) {
                calls.push([value, index, collection]);
                bindings.push(this);

                return value > 3;
            });

            expect(calls).toEqual([
                [5, 4, array],
                [4, 3, array],
                [3, 2, array],
            ]);
            expect(bindings).toEqual([undefined, undefined, undefined]);
        });

        it("propagates errors thrown by the predicate", () => {
            expect(() =>
                _dropRightWhile([1], () => {
                    throw new RangeError("boom");
                }),
            ).toThrow(RangeError);
        });
    });

    describe("arrays", () => {
        it("returns a new dense array of kept references, leaving the input untouched", () => {
            const object = {};
            const array = [object, 1, 2];
            const result = _dropRightWhile(array, (value) => value !== object);

            expect(result).toEqual([object]);
            expect(result[0]).toBe(object);
            expect(result).not.toBe(array);
            expect(array).toEqual([object, 1, 2]);
            expect(_dropRightWhile([1, 2], () => false)).not.toBe(array);
        });

        it("visits holes as undefined and keeps signed zero and NaN", () => {
            const seen: unknown[] = [];
            // oxlint-disable-next-line no-sparse-arrays
            const result = _dropRightWhile([1, , 3, ,], (value) => {
                seen.push(value);

                return value === undefined;
            });

            expect(result).toEqual([1, undefined, 3]);
            expect(seen).toEqual([undefined, 3]);

            const [negativeZero] = _dropRightWhile([-0, 1], (value) => value === 1);

            expect(Object.is(negativeZero, -0)).toBe(true);
            expect(_dropRightWhile([1, NaN], Number.isNaN)).toEqual([1]);
        });

        it("returns an empty array for empty, nullish and lengthless input", () => {
            expect(_dropRightWhile([], () => true)).toEqual([]);
            expect(_dropRightWhile(null, () => true)).toEqual([]);
            expect(_dropRightWhile(undefined, () => true)).toEqual([]);
            expect((_dropRightWhile as unknown as () => unknown[])()).toEqual([]);
            expect(_dropRightWhile({ length: 0 } as unknown as number[], () => true)).toEqual([]);
            expect(_dropRightWhile({ a: 1 } as unknown as number[], () => true)).toEqual([]);
            expect(_dropRightWhile(5 as unknown as number[], () => true)).toEqual([]);
        });

        it("accepts strings, array-like objects, arguments objects and typed arrays", () => {
            expect(_dropRightWhile("abcc" as unknown as string[], (char) => char === "c")).toEqual([
                "a",
                "b",
            ]);
            expect(_dropRightWhile({ length: 3, 0: 1, 1: 2, 2: 3 }, (value) => value > 1)).toEqual([1]);

            const args = getArguments(1, 2, 3) as unknown as number[];

            expect(_dropRightWhile(args, (value) => value > 1)).toEqual([1]);
            expect(_dropRightWhile(new Uint8Array([1, 2, 3]), (value) => value > 1)).toEqual([1]);
        });

        it("handles a large array and ignores extra arguments", () => {
            const large = Array.from({ length: 10000 }, (_, index) => index);

            expect(_dropRightWhile(large, (value) => value >= 5000)).toHaveLength(5000);

            type WithExtra = (a: number[], p: (v: number) => boolean, x: string) => unknown;

            const withExtra = _dropRightWhile as unknown as WithExtra;

            expect(withExtra([1, 2], (value) => value > 1, "x")).toEqual([1]);
        });
    });

    describe("typing", () => {
        it("returns the element type of the array", () => {
            const kept: IUser[] = _dropRightWhile(users, "active");
            const numbers: number[] = _dropRightWhile([1, 2], (value) => value > 1);

            expect(kept).toEqual(users);
            expect(numbers).toEqual([1]);
        });
    });
});
