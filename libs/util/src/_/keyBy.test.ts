// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _keyBy } from "./keyBy.js";

function getArguments(..._args: unknown[]): IArguments {
    // eslint-disable-next-line prefer-rest-params
    return arguments;
}

const array = [
    { dir: "left", code: 97 },
    { dir: "right", code: 100 },
    { dir: "left", code: 98 },
];

// Expected values match lodash-es@4.18.1 `keyBy`.
describe("keyBy", () => {
    describe("iteratees", () => {
        it("keys each element by the iteratee result, the last element winning for a repeated key", () => {
            const byCode = _keyBy(array, (item) => String.fromCharCode(item.code));
            const byDir = _keyBy(array, "dir");

            expect(byCode).toEqual({ a: array[0], b: array[2], d: array[1] });
            expect(byDir).toEqual({ left: array[2], right: array[1] });
            expect(byDir["left"]).toBe(array[2]);
            expect(Object.keys(byDir)).toEqual(["left", "right"]);
        });

        it("invokes a function iteratee with the value only", () => {
            expect(_keyBy([1, 2], (...args: unknown[]) => args.length)).toEqual({ 1: 2 });
        });

        it("keys by identity when the iteratee is missing, undefined or null", () => {
            expect(_keyBy([3, 1, 3, "x"])).toEqual({ 1: 1, 3: 3, x: "x" });
            expect(_keyBy([3, 1], undefined)).toEqual({ 1: 1, 3: 3 });
            expect(_keyBy([3, 1], null as unknown as undefined)).toEqual({ 1: 1, 3: 3 });
        });

        it("accepts deep property paths and the matches shorthands", () => {
            const nested = [{ a: { b: "x" } }, { a: { b: "y" } }];
            const flat = [{ a: 1 }, { a: 2 }, { a: 1 }];

            expect(_keyBy(nested, "a.b")).toEqual({ x: nested[0], y: nested[1] });
            expect(_keyBy(flat, { a: 1 })).toEqual({ true: flat[2], false: flat[1] });
            expect(_keyBy(flat, ["a", 1])).toEqual({ true: flat[2], false: flat[1] });
            // an array iteratee is the matchesProperty shorthand, not a path
            expect(_keyBy(nested, ["a", "b"])).toEqual({ false: nested[1] });
        });
    });

    describe("keys", () => {
        it("coerces keys to property names and keeps symbol keys as symbols", () => {
            const sym = Symbol("s");
            const items = [{ k: 1 }, { k: "1" }, { k: true }, { k: null }, { k: undefined }, { k: NaN }];
            const coerced = _keyBy([{ k: { toString: (): string => "obj" } }, { k: [1, 2] }], "k");
            const withSymbol = _keyBy([{ k: sym }, { k: "s" }], "k");

            expect(_keyBy(items, "k")).toEqual({
                1: items[1],
                true: items[2],
                null: items[3],
                undefined: items[4],
                NaN: items[5],
            });
            expect(Object.keys(coerced)).toEqual(["obj", "1,2"]);
            expect(Reflect.ownKeys(withSymbol)).toEqual(["s", sym]);
            expect(withSymbol[sym as unknown as string]).toEqual({ k: sym });
            expect(_keyBy([1, 2], () => undefined)).toEqual({ undefined: 2 });
        });

        it("orders integer-like keys first, as any object does, then the rest in insertion order", () => {
            expect(Object.keys(_keyBy([{ k: 10 }, { k: 2 }, { k: "b" }, { k: "a" }], "k"))).toEqual([
                "2",
                "10",
                "b",
                "a",
            ]);
        });

        it("defines a __proto__ key as an own property without changing the prototype", () => {
            const result = _keyBy(
                [
                    { k: "__proto__", v: 1 },
                    { k: "constructor", v: 2 },
                ],
                "k",
            );

            expect(Object.hasOwn(result, "__proto__")).toBe(true);
            expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
            expect(result["constructor"]).toEqual({ k: "constructor", v: 2 });
            expect(({} as { v?: number }).v).toBeUndefined();
        });

        it("returns a new plain object holding the elements by reference", () => {
            const result = _keyBy(array, "code");

            expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
            expect(result[97]).toBe(array[0]);
            expect(array).toHaveLength(3);
        });
    });

    describe("collections", () => {
        it("iterates the own enumerable values of an object", () => {
            const inherited = Object.assign(Object.create({ inherited: { id: "z" } }), { own: { id: "o" } });

            expect(_keyBy({ x: { id: "a" }, y: { id: "b" } }, "id")).toEqual({
                a: { id: "a" },
                b: { id: "b" },
            });
            expect(_keyBy(inherited, "id")).toEqual({ o: { id: "o" } });
        });

        it("iterates strings, arguments objects, array-likes and typed arrays by element", () => {
            expect(_keyBy("aba")).toEqual({ a: "a", b: "b" });
            expect(_keyBy(getArguments("a", "b", "a"))).toEqual({ a: "a", b: "b" });
            expect(_keyBy({ length: 2, 0: "a", 1: "b" })).toEqual({ a: "a", b: "b" });
            expect(_keyBy(new Uint8Array([1, 2, 1]))).toEqual({ 1: 1, 2: 2 });
        });

        it("visits holes in sparse arrays as undefined", () => {
            // oxlint-disable-next-line no-sparse-arrays
            expect(_keyBy([1, , 2])).toEqual({ 1: 1, 2: 2, undefined: undefined });
        });

        it("returns an empty object for null, undefined, primitives and empty input", () => {
            expect(_keyBy(null, "k")).toEqual({});
            expect(_keyBy(undefined, "k")).toEqual({});
            expect(_keyBy(5 as unknown as number[], "k")).toEqual({});
            expect(_keyBy([], "k")).toEqual({});
        });

        it("handles large collections", () => {
            const items = Array.from({ length: 500 }, (_, i) => ({ k: i % 50, i }));
            const result = _keyBy(items, "k");

            expect(Object.keys(result)).toHaveLength(50);
            expect(result[7]).toBe(items[457]);
        });
    });

    describe("typing", () => {
        it("returns a dictionary of the element type for lists and of the value type for objects", () => {
            const fromList: Record<string, { dir: string; code: number }> = _keyBy(array, "dir");
            const fromObject: Record<string, { id: string }> = _keyBy({ x: { id: "a" } }, "id");

            expect(fromList["right"]?.code).toBe(100);
            expect(fromObject["a"]?.id).toBe("a");
        });
    });
});
