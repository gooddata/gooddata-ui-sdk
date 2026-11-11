// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _reduce } from "./reduce.js";

function getArguments(..._args: unknown[]): IArguments {
    // eslint-disable-next-line prefer-rest-params
    return arguments;
}

const sum = (total: number, value: number): number => total + value;

// Expected values match lodash-es@4.18.1 `reduce`.
describe("reduce", () => {
    describe("arrays", () => {
        it("folds the elements into the accumulator from left to right", () => {
            expect(_reduce([1, 2, 3], sum, 0)).toBe(6);
            expect(_reduce([1, 2, 3], sum, 10)).toBe(16);
            expect(_reduce([[1], [2]], (all, value) => all.concat(value), [] as number[])).toEqual([1, 2]);
            expect(_reduce(["a", "b"], (text, value) => text + value, "")).toBe("ab");
        });

        it("uses the first element as the accumulator when none is given", () => {
            let calls = 0;

            expect(_reduce([1, 2, 3], sum)).toBe(6);
            expect(_reduce([42], () => (calls++, 0))).toBe(42);
            expect(calls).toBe(0);
            expect(_reduce([], sum)).toBeUndefined();
        });

        it("decides by argument count, so an explicit undefined accumulator is used as is", () => {
            expect(_reduce([1, 2], sum, undefined as unknown as number)).toBeNaN();
            expect(_reduce([], sum, 7)).toBe(7);

            type WithExtra = (a: number[], b: typeof sum, c: number, d: string) => number;

            const withExtra = _reduce as unknown as WithExtra;

            expect(withExtra([1, 2], sum, 10, "x")).toBe(13);
        });

        it("invokes the iteratee with (accumulator, value, index, array) and an undefined this", () => {
            const calls: unknown[][] = [];
            const bindings: unknown[] = [];
            const array = [10, 20, 30];

            _reduce(
                array,
                function (this: unknown, accumulator: string, value, index, collection) {
                    calls.push([accumulator, value, index, collection]);
                    bindings.push(this);

                    return `${accumulator}${value}`;
                },
                "",
            );

            expect(calls).toEqual([
                ["", 10, 0, array],
                ["10", 20, 1, array],
                ["1020", 30, 2, array],
            ]);
            expect(bindings).toEqual([undefined, undefined, undefined]);
        });

        it("visits holes as undefined and leaves the array untouched", () => {
            const seen: unknown[] = [];
            // oxlint-disable-next-line no-sparse-arrays
            const sparse = [1, , 3];

            _reduce(sparse, (total: number, value) => (seen.push(value), total), 0);

            expect(seen).toEqual([1, undefined, 3]);
            expect(sparse).toHaveLength(3);
        });

        it("keeps the accumulator by reference and handles a large array", () => {
            const bucket: number[] = [];

            expect(_reduce([1, 2], (all, value) => (all.push(value), all), bucket)).toBe(bucket);
            expect(
                _reduce(
                    Array.from({ length: 10000 }, (_, index) => index),
                    sum,
                    0,
                ),
            ).toBe(49995000);
        });
    });

    describe("other collections", () => {
        it("folds own enumerable string keys of objects in key order", () => {
            const proto = { inherited: 1 };
            const withInherited = Object.assign(Object.create(proto), { own: 2 });

            expect(_reduce({ a: 1, b: 2, c: 3 }, sum, 0)).toBe(6);
            expect(_reduce({ a: 1, b: 2 }, sum)).toBe(3);

            const joinKeys = (keys: string, _value: unknown, key: string) => keys + key;

            expect(_reduce({ b: 1, a: 2, 1: 3, 0: 4 }, joinKeys, "")).toBe("01ba");
            expect(_reduce(withInherited, joinKeys, "")).toBe("own");
            expect(_reduce({ [Symbol("s")]: 1, a: 2 }, joinKeys, "")).toBe("a");
        });

        it("invokes the iteratee with the string key and the object", () => {
            const calls: unknown[][] = [];
            const object = { x: 1, y: 2 };

            _reduce(
                object,
                (total: number, value, key, collection) => {
                    calls.push([total, value, key, collection]);

                    return total + value;
                },
                0,
            );

            expect(calls).toEqual([
                [0, 1, "x", object],
                [1, 2, "y", object],
            ]);
        });

        it("iterates strings by character, passing the boxed string as the collection", () => {
            const collections: unknown[] = [];

            expect(_reduce("abc", (text, char) => text + char.toUpperCase(), "")).toBe("ABC");
            expect(_reduce("abc", (text, char) => text + char)).toBe("abc");
            expect(_reduce("", (text, char) => text + char)).toBeUndefined();
            _reduce(
                "ab",
                (text, char, _index, collection) => {
                    collections.push(collection);

                    return text + char;
                },
                "",
            );
            expect(collections[0]).toBeInstanceOf(String);
        });

        it("accepts array-like objects, arguments objects and typed arrays", () => {
            expect(_reduce({ length: 2, 0: "a", 1: "b" }, (text, value) => text + value, "")).toBe("ab");
            expect(_reduce(getArguments(1, 2, 3) as unknown as number[], sum)).toBe(6);
            expect(_reduce(new Uint8Array([1, 2, 3]), sum)).toBe(6);

            const arrayLikeWithExtra = { length: 1, 0: "a", extra: "b" } as ArrayLike<string>;

            expect(_reduce(arrayLikeWithExtra, (keys, _value, key) => keys + key, "")).toBe("0");
        });

        it("returns the accumulator for nullish, primitive and keyless collections", () => {
            expect(_reduce(null, sum)).toBeUndefined();
            expect(_reduce(null, sum, 5)).toBe(5);
            expect(_reduce(undefined, sum, 5)).toBe(5);
            expect(_reduce(5 as unknown as number[], sum, 1)).toBe(1);
            expect(_reduce(new Map([[1, 2]]) as unknown as number[], sum, 9)).toBe(9);
            expect(_reduce(new Set([1]) as unknown as number[], sum, 9)).toBe(9);
            expect(_reduce(Object.assign(() => 1, { a: 1, b: 2 }) as unknown as number[], sum, 0)).toBe(3);

            // a string length makes it a plain object, iterated by own keys with the integer keys first
            const notArrayLike = { length: "2", 0: "a" } as unknown as Record<string, string>;

            expect(_reduce(notArrayLike, (keys, _value, key) => keys + key, "")).toBe("0length");
        });
    });

    describe("iteratee", () => {
        it("accepts iteratee shorthands applied to the accumulator, as lodash does", () => {
            const property = "x" as unknown as () => never;
            const matches = { a: 1 } as unknown as () => never;

            expect(_reduce([1, 2], property, { x: 9 })).toBeUndefined();
            expect(_reduce([{ x: 1 }, { x: 2 }], property)).toBe(1);
            // the match is tested against the accumulator, which is the boolean result after the first step
            expect(_reduce([1], matches, { a: 1 })).toBe(true);
            expect(_reduce([1, 2], matches, { a: 1 })).toBe(false);
            expect(_reduce([1, 2, 3], undefined as unknown as () => never, 0)).toBe(0);
            expect(_reduce([1, 2, 3], null as unknown as () => never)).toBe(1);
            expect((_reduce as unknown as (a: number[]) => number)([1, 2, 3])).toBe(1);
        });

        it("propagates errors and keeps undefined results", () => {
            expect(() =>
                _reduce(
                    [1, 2],
                    () => {
                        throw new RangeError("boom");
                    },
                    0,
                ),
            ).toThrow(RangeError);
            expect(_reduce([1, 2, 3], () => undefined, 0 as unknown as undefined)).toBeUndefined();
            expect((_reduce as unknown as () => unknown)()).toBeUndefined();
        });
    });

    describe("typing", () => {
        it("types the accumulator and element for arrays, lists and objects", () => {
            const total: number = _reduce([1, 2], sum, 0);
            const maybe: number | undefined = _reduce([1, 2], sum);
            const keys: string = _reduce({ a: 1, b: 2 }, (all, _value, key) => all + key, "");
            const fromList: string = _reduce({ length: 1, 0: "a" }, (all, value) => all + value, "");

            expect(total).toBe(3);
            expect(maybe).toBe(3);
            expect(keys).toBe("ab");
            expect(fromList).toBe("a");
        });
    });
});
