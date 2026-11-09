// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _sortBy } from "./sortBy.js";

interface IUser {
    user: string;
    age: number;
    info?: { score: number };
}

function getUsers(): IUser[] {
    return [
        { user: "fred", age: 48, info: { score: 2 } },
        { user: "barney", age: 36, info: { score: 1 } },
        { user: "fred", age: 42 },
        { user: "barney", age: 34, info: { score: 3 } },
    ];
}

function getArguments(..._args: unknown[]): IArguments {
    // eslint-disable-next-line prefer-rest-params
    return arguments;
}

// Expected values match lodash-es@4.18.1 `sortBy`.
describe("sortBy", () => {
    describe("ordering", () => {
        it("sorts numbers, strings, booleans, bigints and dates ascending", () => {
            expect(_sortBy([3, 1, 2])).toEqual([1, 2, 3]);
            expect(_sortBy(["b", "a", "c", "A"])).toEqual(["A", "a", "b", "c"]);
            expect(_sortBy([true, false, true])).toEqual([false, true, true]);
            expect(_sortBy([3n, 1n, 2n])).toEqual([1n, 2n, 3n]);
            expect(_sortBy([new Date(5), new Date(1)]).map((date) => date.getTime())).toEqual([1, 5]);
        });

        it("compares numbers and numeric strings by value", () => {
            expect(_sortBy([3, "1", 2, "10", 1])).toEqual(["1", 1, 2, 3, "10"]);
        });

        it("treats 0 and -0 as equal", () => {
            expect(_sortBy([0, -0, 1, -1]).map((value) => (Object.is(value, -0) ? "-0" : value))).toEqual([
                -1,
                0,
                "-0",
                1,
            ]);
        });

        it("puts null, then undefined, then NaN after every other value", () => {
            expect(_sortBy([3, undefined, 1, null, NaN, 2, undefined, null, NaN])).toEqual([
                1,
                2,
                3,
                null,
                null,
                undefined,
                undefined,
                NaN,
                NaN,
            ]);
        });

        it("puts symbols after other values and keeps their input order", () => {
            const first = Symbol("b");
            const second = Symbol("a");

            expect(_sortBy([first, 2, undefined, second, null, 1, NaN])).toEqual([
                1,
                2,
                first,
                second,
                null,
                undefined,
                NaN,
            ]);
        });

        it("is stable, keeping the input order of elements with equal criteria", () => {
            const items = [
                { v: 1, i: 0 },
                { v: 1, i: 1 },
                { v: 1, i: 2 },
            ];
            const objects = [{ a: 2 }, { a: 1 }, { a: 1 }];

            expect(_sortBy(items, "v").map((item) => item.i)).toEqual([0, 1, 2]);
            // plain objects are neither greater nor smaller than each other, so they stay put
            expect(_sortBy(objects)).toEqual([{ a: 2 }, { a: 1 }, { a: 1 }]);
            expect(_sortBy(getUsers(), "user").map((user) => user.age)).toEqual([36, 34, 48, 42]);
        });

        it("sorts large inputs with many duplicates stably", () => {
            const items = Array.from({ length: 300 }, (_, i) => ({ k: i % 3, i }));
            const result = _sortBy(items, "k");

            expect(result.map((item) => item.k)).toEqual(items.map((item) => item.k).sort((a, b) => a - b));
            expect(result.slice(0, 100).map((item) => item.i)).toEqual(
                Array.from({ length: 100 }, (_, i) => i * 3),
            );
        });
    });

    describe("iteratees", () => {
        it("accepts a function, invoked with the value only", () => {
            expect(_sortBy(getUsers(), (user) => user.age).map((user) => user.age)).toEqual([34, 36, 42, 48]);
            expect(_sortBy([3, 1, 2], (...args: unknown[]) => args.length)).toEqual([3, 1, 2]);
        });

        it("accepts property names and deep paths", () => {
            expect(_sortBy(getUsers(), "age").map((user) => user.age)).toEqual([34, 36, 42, 48]);
            expect(_sortBy(getUsers(), "info.score").map((user) => user.info?.score)).toEqual([
                1,
                2,
                3,
                undefined,
            ]);
            expect(_sortBy([{ 0: "b" }, { 0: "a" }], 0)).toEqual([{ 0: "a" }, { 0: "b" }]);
        });

        it("accepts a symbol property name", () => {
            const key = Symbol("k");

            expect(_sortBy([{ [key]: 2 }, { [key]: 1 }], key).map((item) => item[key])).toEqual([1, 2]);
        });

        it("accepts several iteratees, as separate arguments or in one array, applied in order", () => {
            const asArguments = _sortBy(getUsers(), "user", (user) => Math.floor(user.age / 10));
            const asArray = _sortBy(getUsers(), ["user", "age"]);

            expect(asArguments.map((user) => `${user.user} ${user.age}`)).toEqual([
                "barney 36",
                "barney 34",
                "fred 48",
                "fred 42",
            ]);
            expect(asArray.map((user) => `${user.user} ${user.age}`)).toEqual([
                "barney 34",
                "barney 36",
                "fred 42",
                "fred 48",
            ]);
        });

        it("flattens iteratee arrays one level and reads each nested array as a property path", () => {
            // the lodash typings only accept two-element nested arrays, hence the casts on the result
            const twoPaths = _sortBy(getUsers(), [["user"], ["age"]]) as IUser[];
            const deepPath = _sortBy(getUsers(), [["info", "score"]]);
            // a function inside a nested array is a path segment, not an iteratee, so it resolves to undefined
            const functionInPath = _sortBy(getUsers(), [["user"], [(user: IUser) => user.age]]) as IUser[];

            expect(twoPaths.map((user) => user.age)).toEqual([34, 36, 42, 48]);
            expect(deepPath.map((user) => user.info?.score)).toEqual([1, 2, 3, undefined]);
            expect(functionInPath.map((user) => user.age)).toEqual([36, 34, 48, 42]);
        });

        it("accepts a matches shorthand object, sorting non-matching elements first", () => {
            expect(_sortBy(getUsers(), { user: "fred" }).map((user) => user.age)).toEqual([36, 34, 48, 42]);
        });

        it("sorts by identity for a missing, undefined, null or empty iteratee", () => {
            expect(_sortBy([3, 1, 2])).toEqual([1, 2, 3]);
            expect(_sortBy([3, 1, 2], undefined as unknown as string)).toEqual([1, 2, 3]);
            expect(_sortBy([3, 1, 2], null as unknown as string)).toEqual([1, 2, 3]);
            expect(_sortBy([3, 1, 2], [])).toEqual([1, 2, 3]);
        });
    });

    describe("collections", () => {
        it("sorts the own enumerable values of an object", () => {
            expect(_sortBy({ b: 2, a: 3, c: 1 })).toEqual([1, 2, 3]);
            expect(_sortBy({ x: { n: 2 }, y: { n: 1 } }, "n")).toEqual([{ n: 1 }, { n: 2 }]);
            expect(_sortBy(Object.assign(Object.create({ inherited: 0 }), { own: 1 }))).toEqual([1]);
        });

        it("sorts strings, arguments objects and array-likes by element", () => {
            expect(_sortBy("cba")).toEqual(["a", "b", "c"]);
            expect(_sortBy(getArguments(3, 1, 2))).toEqual([1, 2, 3]);
            expect(_sortBy({ length: 3, 0: "b", 1: "c", 2: "a" })).toEqual(["a", "b", "c"]);
        });

        it("visits holes as undefined, which sort last", () => {
            // oxlint-disable-next-line no-sparse-arrays
            expect(_sortBy([3, , 1])).toEqual([1, 3, undefined]);
        });

        it("returns an empty array for null, undefined, primitives and empty input", () => {
            expect(_sortBy(null)).toEqual([]);
            expect(_sortBy(undefined)).toEqual([]);
            expect(_sortBy(5 as unknown as number[])).toEqual([]);
            expect(_sortBy([])).toEqual([]);
        });

        it("returns a new array with the elements by reference and leaves the input untouched", () => {
            const first = { a: 2 };
            const second = { a: 1 };
            const input = [first, second];
            const result = _sortBy(input, "a");

            expect(result).not.toBe(input);
            expect(result[0]).toBe(second);
            expect(result[1]).toBe(first);
            expect(input).toEqual([first, second]);
        });
    });

    describe("iteratee call guard", () => {
        it("ignores the index and collection when used as a map callback", () => {
            expect(
                [
                    [3, 1, 2],
                    [2, 1],
                ].map((value, index, array) => _sortBy(value, index, array)),
            ).toEqual([
                [1, 2, 3],
                [1, 2],
            ]);
        });

        it("keeps only the first iteratee when the next two look like an index and its collection", () => {
            const collection = [{ a: 2 }, { a: 1 }];

            expect(_sortBy(collection, "a", 0, collection).map((item) => item.a)).toEqual([1, 2]);
            expect(_sortBy([3, 1, 2], (value) => -value, 0, { x: 1 })).toEqual([3, 2, 1]);
        });
    });

    describe("typing", () => {
        it("returns the element type for lists and the value type for objects", () => {
            const numbers: number[] = _sortBy([2, 1]);
            const users: IUser[] = _sortBy(getUsers(), "age");
            const values: number[] = _sortBy({ a: 2, b: 1 });

            expect(numbers).toEqual([1, 2]);
            expect(users[0]?.age).toBe(34);
            expect(values).toEqual([1, 2]);
        });
    });
});
