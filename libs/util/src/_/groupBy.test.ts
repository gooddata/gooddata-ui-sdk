// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _groupBy } from "./groupBy.js";

const a = { x: 1, t: "a" };
const b = { x: 2, t: "b" };
const c = { x: 1, t: "c" };

function getArguments(..._args: unknown[]): IArguments {
    // eslint-disable-next-line prefer-rest-params
    return arguments;
}

// Expected values match lodash-es@4.18.1 `groupBy`.
describe("groupBy", () => {
    describe("iteratee forms", () => {
        it("groups by the result of a function", () => {
            expect(_groupBy([6.1, 4.2, 6.3], Math.floor)).toEqual({ 4: [4.2], 6: [6.1, 6.3] });
        });

        it("groups by identity when the iteratee is omitted or null", () => {
            expect(_groupBy([1, 2, 1])).toEqual({ 1: [1, 1], 2: [2] });
            expect(_groupBy([1, 2, 1], null as unknown as string)).toEqual({ 1: [1, 1], 2: [2] });
        });

        it("invokes the iteratee with the value only", () => {
            const calls: unknown[][] = [];

            _groupBy([1, 2], (...args: unknown[]) => calls.push(args));

            expect(calls).toEqual([[1], [2]]);
        });

        it("groups by a property name", () => {
            expect(_groupBy(["one", "two", "three"], "length")).toEqual({ 3: ["one", "two"], 5: ["three"] });
            expect(_groupBy([a, b, c], "x")).toEqual({ 1: [a, c], 2: [b] });
            expect(_groupBy([[1, 2], [1, 3], [2]], 0)).toEqual({
                1: [
                    [1, 2],
                    [1, 3],
                ],
                2: [[2]],
            });
        });

        it("groups everything under 'undefined' for a missing property", () => {
            expect(_groupBy([a, b], "zz")).toEqual({ undefined: [a, b] });
        });

        it("groups by a deep path", () => {
            const nested = [{ a: { b: 1 } }, { a: { b: 2 } }, { a: { b: 1 } }];

            expect(_groupBy(nested, "a.b")).toEqual({ 1: [nested[0], nested[2]], 2: [nested[1]] });
        });

        it("groups by whether a [path, value] pair or a partial object matches", () => {
            expect(_groupBy([a, b, c], ["x", 1])).toEqual({ true: [a, c], false: [b] });
            expect(_groupBy([a, b, c], { x: 1 })).toEqual({ true: [a, c], false: [b] });
        });
    });

    describe("keys", () => {
        it("stringifies keys the way property access does", () => {
            expect(_groupBy([1, "1", null, undefined, NaN, true], (v) => v)).toEqual({
                1: [1, "1"],
                null: [null],
                undefined: [undefined],
                NaN: [NaN],
                true: [true],
            });
            expect(_groupBy([0, -0], (v) => v)).toEqual({ 0: [0, -0] });
            expect(_groupBy([1, 2], () => ({}))).toEqual({ "[object Object]": [1, 2] });
        });

        it("supports symbol keys", () => {
            const sym = Symbol("odd");
            const result = _groupBy([1, 2, 3], (v) => (v % 2 ? sym : "even"));

            expect(result[sym as unknown as string]).toEqual([1, 3]);
            expect(result["even"]).toEqual([2]);
        });

        it("keeps keys that collide with Object.prototype members as own properties", () => {
            const result = _groupBy([1, 2], () => "constructor");

            expect(Object.hasOwn(result, "constructor")).toBe(true);
            expect(result["constructor"]).toEqual([1, 2]);
            expect(_groupBy([1, 2], () => "hasOwnProperty")["hasOwnProperty"]).toEqual([1, 2]);
        });

        it("defines a __proto__ key as an own property instead of changing the prototype", () => {
            const result = _groupBy([1, 2], () => "__proto__");

            expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
            expect(Object.hasOwn(result, "__proto__")).toBe(true);
            expect((result as { __proto__: unknown }).__proto__).toEqual([1, 2]);
        });

        it("orders groups by first occurrence and values by collection order", () => {
            expect(Object.keys(_groupBy(["b", "a", "b", "c"], (v) => v))).toEqual(["b", "a", "c"]);
            expect(_groupBy([3, 1, 2, 1], (v) => v % 2)).toEqual({ 1: [3, 1, 1], 0: [2] });
        });
    });

    describe("collections", () => {
        it("accepts array-likes, strings and arguments objects", () => {
            expect(_groupBy({ length: 3, 0: "a", 1: "a", 2: "b" }, (v) => v)).toEqual({
                a: ["a", "a"],
                b: ["b"],
            });
            expect(_groupBy("abca", (ch) => ch)).toEqual({ a: ["a", "a"], b: ["b"], c: ["c"] });
            expect(_groupBy(getArguments(1, 2, 1), (v) => v)).toEqual({ 1: [1, 1], 2: [2] });
        });

        it("visits holes in sparse arrays as undefined", () => {
            // oxlint-disable-next-line no-sparse-arrays
            expect(_groupBy([1, , 1], (v) => v)).toEqual({ 1: [1, 1], undefined: [undefined] });
        });

        it("iterates the own enumerable values of a plain object", () => {
            expect(_groupBy({ k1: 1, k2: 2, k3: 1 }, (v) => v)).toEqual({ 1: [1, 1], 2: [2] });
            expect(_groupBy({ k1: "x", k2: "yy" }, (v) => v.length)).toEqual({ 1: ["x"], 2: ["yy"] });
        });

        it("ignores inherited properties of an object collection", () => {
            const object = Object.assign(Object.create({ inherited: 1 }), { own: 2 });

            expect(_groupBy(object, (v) => v)).toEqual({ 2: [2] });
        });

        it("treats maps and sets as objects without own enumerable values", () => {
            expect(_groupBy(new Map([[1, 2]]) as unknown as object, (v) => v)).toEqual({});
            expect(_groupBy(new Set([1, 2]) as unknown as object, (v) => v)).toEqual({});
        });

        it("returns an empty object for null, undefined, primitives and empty collections", () => {
            expect(_groupBy(null, "x")).toEqual({});
            expect(_groupBy(undefined, "x")).toEqual({});
            expect(_groupBy(5 as unknown as object, (v) => v)).toEqual({});
            expect(_groupBy([], "x")).toEqual({});
            expect(_groupBy({}, "x")).toEqual({});
        });
    });

    describe("result", () => {
        it("holds the original elements by reference in a new plain object", () => {
            const input = [a, b];
            const result = _groupBy(input, "x");

            expect(result[1]?.[0]).toBe(a);
            expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
            expect(input).toEqual([a, b]);
        });

        it("handles large collections", () => {
            const result = _groupBy(
                Array.from({ length: 500 }, (_, i) => i % 3),
                (v) => v,
            );

            expect(Object.keys(result)).toEqual(["0", "1", "2"]);
            expect(result[0]).toHaveLength(167);
        });
    });

    describe("typing", () => {
        it("types the groups by the element type for arrays and by the value type for objects", () => {
            const byKey: Record<string, { x: number; t: string }[]> = _groupBy([a, b], "x");
            const byValue: Record<string, number[]> = _groupBy({ k1: 1, k2: 2 }, (v) => v);

            expect(Object.keys(byKey)).toEqual(["1", "2"]);
            expect(Object.keys(byValue)).toEqual(["1", "2"]);
        });
    });
});
