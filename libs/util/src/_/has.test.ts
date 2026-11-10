// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _has } from "./has.js";

function getArguments(..._args: unknown[]): IArguments {
    // eslint-disable-next-line prefer-rest-params
    return arguments;
}

const sym = Symbol("s");
const object = {
    a: { b: 2 },
    "a.b": 3,
    arr: [1, [2, 3]],
    n: null,
    u: undefined,
    [sym]: 1,
    "": "empty",
    1: "one",
};

// Expected values match lodash-es@4.18.1 `has`.
describe("has", () => {
    describe("own properties", () => {
        it("finds own keys, whatever their value", () => {
            expect(_has(object, "a")).toBe(true);
            expect(_has(object, "n")).toBe(true);
            expect(_has(object, "u")).toBe(true);
            expect(_has(object, "")).toBe(true);
            expect(_has(object, [""])).toBe(true);
            expect(_has(object, "missing")).toBe(false);
        });

        it("accepts numeric and symbol keys, alone or in a path array", () => {
            expect(_has(object, 1)).toBe(true);
            expect(_has(object, "1")).toBe(true);
            expect(_has(object, sym)).toBe(true);
            expect(_has(object, [sym])).toBe(true);
        });

        it("ignores inherited properties", () => {
            const other = Object.create({ a: Object.create({ b: 2 }) }) as object;

            expect(_has(object, "toString")).toBe(false);
            expect(_has(object, "constructor")).toBe(false);
            expect(_has(object, "__proto__")).toBe(false);
            expect(_has(other, "a")).toBe(false);
            expect(_has(other, "a.b")).toBe(false);
            expect(_has(new Date(0), "getTime")).toBe(false);
            expect(_has(new Map([["a", 1]]), "a")).toBe(false);
        });

        it("finds non-enumerable own properties and getters", () => {
            expect(_has(Object.defineProperty({}, "hidden", { value: 1, enumerable: false }), "hidden")).toBe(
                true,
            );
            expect(
                _has(
                    {
                        get g() {
                            return 1;
                        },
                    },
                    "g",
                ),
            ).toBe(true);
            expect(_has(/x/, "lastIndex")).toBe(true);
        });
    });

    describe("deep paths", () => {
        it("walks dot, bracket and array paths through own properties only", () => {
            expect(_has(object, "a.b")).toBe(true);
            expect(_has(object, ["a", "b"])).toBe(true);
            expect(_has(object, "a.b.c")).toBe(false);
            expect(_has(object, "a.c")).toBe(false);
            expect(_has(object, "a.toString")).toBe(false);
            expect(_has(object, "arr.1.0")).toBe(true);
            expect(_has(object, "arr[1][1]")).toBe(true);
            expect(_has(object, ["arr", 1, 1])).toBe(true);
            expect(_has(object, "arr.2")).toBe(false);
            expect(_has(object, "arr.length")).toBe(true);
            expect(_has({ a: { b: { c: 1 } } }, "a[b].c")).toBe(true);
            expect(_has({ a: { b: { c: 1 } } }, 'a["b"].c')).toBe(true);
            expect(_has({ a: { "b c": 1 } }, "a.b c")).toBe(true);
        });

        it("prefers an own key containing a dot over the deep path, and a path array keeps dots literal", () => {
            expect(_has(object, ["a.b"])).toBe(true);
            expect(_has({ "a[b]": 1 }, "a[b]")).toBe(true);
            expect(_has({ ".": 1 }, ".")).toBe(true);
        });

        it("reads empty segments and does not skip a leading dot", () => {
            expect(_has({ a: { "": 1 } }, "a.")).toBe(true);
            expect(_has({ a: { "": 1 } }, ["a", ""])).toBe(true);
            expect(_has({ a: { b: 1 } }, ".a.b")).toBe(false);
        });

        it("stops at null or undefined along the path", () => {
            expect(_has(object, "n.x")).toBe(false);
            expect(_has(object, "u.x")).toBe(false);
            expect(_has({ a: [] }, "a.0")).toBe(false);
            expect(_has({ a: [undefined] }, "a.0")).toBe(true);
        });
    });

    describe("indexes", () => {
        it("treats a valid index of an array or arguments object as present, holes included", () => {
            expect(_has([1, 2, 3], 0)).toBe(true);
            expect(_has([1, 2, 3], "0")).toBe(true);
            expect(_has([1, 2, 3], 3)).toBe(false);
            expect(_has([1, 2, 3], -1)).toBe(false);
            expect(_has([1, 2, 3], "1.5")).toBe(false);
            expect(_has([1, 2, 3], "01")).toBe(false);
            expect(_has([1, 2, 3], "length")).toBe(true);
            // oxlint-disable-next-line no-sparse-arrays
            expect(_has([1, , 3], 1)).toBe(true);
            expect(_has(getArguments("x", "y"), 0)).toBe(true);
            expect(_has(getArguments("x", "y"), 2)).toBe(false);
        });

        it("checks indexes of strings, typed arrays and array-likes as own properties", () => {
            expect(_has("abc", 0)).toBe(true);
            expect(_has("abc", "length")).toBe(true);
            expect(_has("abc", 3)).toBe(false);
            expect(_has({ a: "str" }, "a.0")).toBe(true);
            expect(_has({ a: new Uint8Array([1, 2]) }, "a.1")).toBe(true);
            expect(_has({ a: new Uint8Array([1, 2]) }, "a.2")).toBe(false);
            expect(_has({ a: { 0: "x", length: 1 } }, "a.0")).toBe(true);
            expect(_has({ a: { length: 2 } }, "a.1")).toBe(false);
        });
    });

    describe("objects", () => {
        it("returns false for null and undefined", () => {
            expect(_has(null, "a")).toBe(false);
            expect(_has(undefined, "a")).toBe(false);
        });

        it("boxes primitives and inspects functions", () => {
            expect(_has(5, "toFixed")).toBe(false);
            expect(_has(function named(): void {}, "name")).toBe(true);
            expect(_has(function named(): void {}, "prototype")).toBe(true);
            expect(_has(function named(): void {}, "call")).toBe(false);
            expect(_has((): void => {}, "prototype")).toBe(false);
        });

        it("works with null-prototype objects", () => {
            expect(_has(Object.assign(Object.create(null), { a: { b: 1 } }), "a.b")).toBe(true);
            expect(_has(Object.create(null), "a")).toBe(false);
        });

        it("coerces unusual paths to property names", () => {
            expect(_has({ null: 1 }, null as unknown as string)).toBe(true);
            expect(_has({ undefined: 1 }, undefined as unknown as string)).toBe(true);
            expect(_has({ true: 1 }, true as unknown as string)).toBe(true);
            expect(_has({}, null as unknown as string)).toBe(false);
            expect(_has({ "1,2": 1 }, [1, 2])).toBe(false);
            expect(_has({ 1: { 2: 1 } }, [1, 2])).toBe(true);
        });
    });

    describe("typing", () => {
        it("narrows the object to one that has the key", () => {
            const value: { a?: number } = { a: 1 };

            if (_has(value, "a")) {
                // the key is now known to exist; its declared type, optional or not, is kept as in lodash
                const narrowed: number | undefined = value.a;

                expect(narrowed).toBe(1);
            }

            const result: boolean = _has(value, "a.b");

            expect(result).toBe(false);
        });
    });
});
