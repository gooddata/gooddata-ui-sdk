// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _findLastIndex } from "./findLastIndex.js";

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
const numbers = [1, 2, 3, 2, 1];

// Expected values match lodash-es@4.18.1 `findLastIndex`.
describe("findLastIndex", () => {
    describe("predicate", () => {
        it("returns the index of the last element the predicate matches, or -1", () => {
            expect(_findLastIndex(users, (user) => user.user === "pebbles")).toBe(2);
            expect(_findLastIndex(numbers, (value) => value === 2)).toBe(3);
            expect(_findLastIndex(numbers, (value) => value === 9)).toBe(-1);

            const truthy = (value: number) => (value === 2 ? "yes" : 0) as unknown as boolean;

            expect(_findLastIndex(numbers, truthy)).toBe(3);
        });

        it("accepts matches, matches-property, property path and identity shorthands", () => {
            expect(_findLastIndex(users, { user: "barney", active: true })).toBe(0);
            expect(_findLastIndex(users, ["active", false])).toBe(2);
            expect(_findLastIndex(users, "active")).toBe(0);
            expect(_findLastIndex([{ a: { b: 1 } }, { a: { b: 0 } }], "a.b")).toBe(0);
            expect(_findLastIndex([0, 1, 0])).toBe(1);
            expect(_findLastIndex([0, 1, 0], undefined)).toBe(1);
            expect(_findLastIndex([0, 1, 0], null as unknown as undefined)).toBe(1);
        });

        it("passes (value, index, array) with an undefined this, from the end, stopping at the match", () => {
            const calls: unknown[][] = [];
            const bindings: unknown[] = [];
            const array = [1, 2, 3, 4];

            _findLastIndex(array, function (this: unknown, value, index, collection) {
                calls.push([value, index, collection]);
                bindings.push(this);

                return value === 3;
            });

            expect(calls).toEqual([
                [4, 3, array],
                [3, 2, array],
            ]);
            expect(bindings).toEqual([undefined, undefined]);
        });

        it("propagates errors thrown by the predicate", () => {
            expect(() =>
                _findLastIndex([1], () => {
                    throw new RangeError("boom");
                }),
            ).toThrow(RangeError);
        });
    });

    describe("fromIndex", () => {
        it("starts the backwards search at fromIndex, clamped into the array", () => {
            const isTwo = (value: number) => value === 2;
            const isOne = (value: number) => value === 1;

            expect(_findLastIndex(numbers, isTwo, 2)).toBe(1);
            expect(_findLastIndex(numbers, isTwo, 1)).toBe(1);
            expect(_findLastIndex(numbers, isTwo, 0)).toBe(-1);
            expect(_findLastIndex(numbers, isOne, 10)).toBe(4);
            expect(_findLastIndex(numbers, isOne, Infinity)).toBe(4);
        });

        it("counts a negative fromIndex from the end", () => {
            const isTwo = (value: number) => value === 2;
            const isOne = (value: number) => value === 1;

            expect(_findLastIndex(numbers, isTwo, -2)).toBe(3);
            expect(_findLastIndex(numbers, isOne, -1)).toBe(4);
            expect(_findLastIndex(numbers, isOne, -10)).toBe(0);
            expect(_findLastIndex(numbers, isOne, -Infinity)).toBe(0);
            expect(_findLastIndex(numbers, isTwo, -1.5)).toBe(3);
        });

        it("coerces fromIndex to an integer the way lodash does", () => {
            const isTwo = (value: number) => value === 2;
            const isOne = (value: number) => value === 1;

            expect(_findLastIndex(numbers, isTwo, 3.7)).toBe(3);
            expect(_findLastIndex(numbers, isOne, NaN)).toBe(0);
            expect(_findLastIndex(numbers, isOne, -0)).toBe(0);
            expect(_findLastIndex(numbers, isTwo, "1" as unknown as number)).toBe(1);
            expect(_findLastIndex(numbers, isTwo, "-2" as unknown as number)).toBe(3);
            expect(_findLastIndex(numbers, isOne, null as unknown as number)).toBe(0);
            expect(_findLastIndex(numbers, isTwo, true as unknown as number)).toBe(1);
            expect(_findLastIndex(numbers, isOne, {} as unknown as number)).toBe(0);
            expect(() => _findLastIndex(numbers, isOne, 1n as unknown as number)).toThrow(TypeError);
        });
    });

    describe("arrays", () => {
        it("returns -1 for empty, nullish and lengthless input", () => {
            expect(_findLastIndex([], () => true)).toBe(-1);
            expect(_findLastIndex(null, () => true)).toBe(-1);
            expect(_findLastIndex(undefined, () => true)).toBe(-1);
            expect((_findLastIndex as unknown as () => number)()).toBe(-1);
            expect(_findLastIndex({ length: 0 } as unknown as number[], () => true)).toBe(-1);
            expect(_findLastIndex({ a: 1 } as unknown as number[], () => true)).toBe(-1);
            expect(_findLastIndex(5 as unknown as number[], () => true)).toBe(-1);
        });

        it("accepts strings, array-like objects, arguments objects and typed arrays", () => {
            expect(_findLastIndex("abcb" as unknown as string[], (char) => char === "b")).toBe(3);
            expect(_findLastIndex({ length: 3, 0: 1, 1: 2, 2: 1 }, (value) => value === 1)).toBe(2);

            const args = getArguments(1, 2, 1) as unknown as number[];

            expect(_findLastIndex(args, (value) => value === 1)).toBe(2);
            expect(_findLastIndex(new Uint8Array([1, 2, 1]), (value) => value === 1)).toBe(2);
        });

        it("visits holes as undefined, handles NaN and a large array, and leaves the input untouched", () => {
            const seen: unknown[] = [];
            const array = [1, 2];
            // oxlint-disable-next-line no-sparse-arrays
            const sparse = [1, , 3];

            expect(
                _findLastIndex(sparse, (value) => {
                    seen.push(value);

                    return value === undefined;
                }),
            ).toBe(1);
            expect(seen).toEqual([3, undefined]);
            expect(_findLastIndex([NaN, 1], Number.isNaN)).toBe(0);

            const large = Array.from({ length: 10000 }, (_, index) => index);

            expect(_findLastIndex(large, (value) => value === 5000)).toBe(5000);
            _findLastIndex(array, () => true);
            expect(array).toEqual([1, 2]);
        });

        it("ignores extra arguments", () => {
            type WithExtra = (a: number[], p: (v: number) => boolean, f: number, x: string) => number;

            const withExtra = _findLastIndex as unknown as WithExtra;

            expect(withExtra(numbers, (value) => value === 2, 2, "x")).toBe(1);
            expect(_findLastIndex.length).toBe(3);
        });
    });

    describe("typing", () => {
        it("returns a number and types the predicate by the element", () => {
            const index: number = _findLastIndex(users, (user) => user.active);

            expect(index).toBe(0);
        });
    });
});
