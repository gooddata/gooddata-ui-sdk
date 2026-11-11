// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _invert } from "./invert.js";

function getArguments(..._args: unknown[]): IArguments {
    // eslint-disable-next-line prefer-rest-params
    return arguments;
}

// Expected values match lodash-es@4.18.1 `invert`.
describe("invert", () => {
    describe("inverting", () => {
        it("swaps keys and values, later duplicates overwriting earlier ones", () => {
            expect(_invert({ a: 1, b: 2, c: 1 })).toEqual({ "1": "c", "2": "b" });
            expect(_invert({ a: "x", b: "y" })).toEqual({ x: "a", y: "b" });
            expect(_invert({ a: 1, b: 1, c: 1 })).toEqual({ "1": "c" });
            expect(_invert({ 1: "a", 2: "b" })).toEqual({ a: "1", b: "2" });
            expect(_invert({})).toEqual({});
        });

        it("coerces values to property keys the way property assignment does", () => {
            expect(_invert({ a: null, b: undefined })).toEqual({ null: "a", undefined: "b" });
            expect(_invert({ a: true, b: false, c: NaN, d: -0, e: Infinity })).toEqual({
                true: "a",
                false: "b",
                NaN: "c",
                "0": "d",
                Infinity: "e",
            });
            expect(_invert({ a: { toString: () => "custom" } })).toEqual({ custom: "a" });
            expect(_invert({ a: [1, 2], b: [] })).toEqual({ "1,2": "a", "": "b" });
            expect(_invert({ a: { b: 1 } })).toEqual({ "[object Object]": "a" });
            expect(_invert({ a: 10n })).toEqual({ "10": "a" });
            expect(_invert({ a: " x ", b: "" })).toEqual({ " x ": "a", "": "b" });
        });

        it("keeps symbol values as symbol keys and stringifies values without a callable toString", () => {
            const symbol = Symbol("s");
            const nullPrototype = Object.create(null) as object;

            expect(_invert({ a: symbol })).toEqual({ [symbol]: "a" });
            expect(_invert({ a: nullPrototype })).toEqual({ "[object Object]": "a" });
        });

        it("does not change the prototype of the result for a __proto__ value", () => {
            const inverted = _invert({ a: "__proto__", b: 2 });

            expect(inverted).toEqual({ "2": "b" });
            expect(Object.getPrototypeOf(inverted)).toBe(Object.prototype);
            expect(_invert({ a: "constructor" })).toEqual({ constructor: "a" });
        });

        it("returns a new plain object and leaves the input untouched", () => {
            const object = { a: 1, b: 2 };
            const inverted = _invert(object);

            expect(inverted).not.toBe(object);
            expect(Object.getPrototypeOf(inverted)).toBe(Object.prototype);
            expect(object).toEqual({ a: 1, b: 2 });
        });

        it("ignores any extra argument", () => {
            const withExtra = _invert as (object: object, extra: unknown) => unknown;

            expect(withExtra({ a: 1 }, (value: number) => value * 2)).toEqual({ "1": "a" });
        });
    });

    describe("keys", () => {
        it("inverts only own enumerable string keyed properties", () => {
            function Foo(this: { a: number }) {
                this.a = 1;
            }

            Foo.prototype.b = 2;

            const hidden = Object.defineProperty({ a: 1 }, "hidden", { value: 2, enumerable: false });
            const symbol = Symbol("s");

            expect(_invert(new (Foo as unknown as new () => object)())).toEqual({ "1": "a" });
            expect(_invert(Foo.prototype)).toEqual({ "2": "b" });
            expect(_invert(hidden)).toEqual({ "1": "a" });
            expect(_invert({ [symbol]: 1, a: 2 })).toEqual({ "2": "a" });
        });

        it("inverts null prototype objects, functions and map instances by their own properties", () => {
            const nullPrototype = Object.create(null) as Record<string, number>;
            const fn = Object.assign(() => 1, { prop: "v" });

            nullPrototype["a"] = 1;

            expect(_invert(nullPrototype)).toEqual({ "1": "a" });
            expect(_invert(fn)).toEqual({ v: "prop" });
            expect(_invert(new Map([["a", 1]]))).toEqual({});
        });

        it("uses indices for arrays, strings, arguments and typed arrays", () => {
            const array = Object.assign(["x"], { extra: "y" });

            expect(_invert(["a", "b", "a"])).toEqual({ a: "2", b: "1" });
            expect(_invert(array)).toEqual({ x: "0", y: "extra" });
            // oxlint-disable-next-line no-sparse-arrays
            expect(_invert([1, , 3])).toEqual({ "1": "0", undefined: "1", "3": "2" });
            expect(_invert("aba" as unknown as object)).toEqual({ a: "2", b: "1" });
            expect(_invert(Object("ab") as object)).toEqual({ a: "0", b: "1" });
            expect(_invert(getArguments("a", "b"))).toEqual({ a: "0", b: "1" });
            expect(_invert(new Uint8Array([7, 8]))).toEqual({ "7": "0", "8": "1" });
        });

        it("returns an empty object for primitives without keys and for nullish input", () => {
            expect(_invert(42 as unknown as object)).toEqual({});
            expect(_invert(true as unknown as object)).toEqual({});
            expect(_invert(null as unknown as object)).toEqual({});
            expect(_invert(undefined as unknown as object)).toEqual({});
        });

        it("handles many keys", () => {
            const entries = Array.from({ length: 500 }, (_, index) => [`k${index}`, index % 250] as const);
            const inverted = _invert(Object.fromEntries(entries));

            expect(Object.keys(inverted)).toHaveLength(250);
            expect(inverted["0"]).toBe("k250");
        });
    });

    describe("typing", () => {
        it("returns a string dictionary", () => {
            const inverted: Record<string, string> = _invert({ a: 1 });

            expect(inverted["1"]).toBe("a");
        });
    });
});
