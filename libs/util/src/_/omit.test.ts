// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _omit } from "./omit.js";

const sym = Symbol("s");

class Point {
    public x = 1;
    public y = 2;
}

(Point.prototype as Point & { inherited: string }).inherited = "p";

function getArguments(..._args: unknown[]): IArguments {
    // eslint-disable-next-line prefer-rest-params
    return arguments;
}

// Expected values match lodash-es@4.18.1 `omit`.
describe("omit", () => {
    describe("paths argument", () => {
        it("omits a single key", () => {
            expect(_omit({ a: 1, b: 2 }, "a")).toEqual({ b: 2 });
        });

        it("accepts keys as rest arguments, in arrays, and nested one level deep", () => {
            expect(_omit({ a: 1, b: 2, c: 3 }, "a", "c")).toEqual({ b: 2 });
            expect(_omit({ a: 1, b: 2, c: 3 }, ["a", "c"])).toEqual({ b: 2 });
            // nested arrays are flattened one level at runtime; @types/lodash does not type that
            expect(_omit({ a: 1, b: 2, c: 3, d: 4 }, "a", ["b", ["c"]] as unknown as string[])).toEqual({
                d: 4,
            });
        });

        it("ignores unknown keys, duplicates and an empty array path", () => {
            expect(_omit({ a: 1 }, "z")).toEqual({ a: 1 });
            expect(_omit({ a: 1, b: 2 }, "a", "a")).toEqual({ b: 2 });
            expect(_omit({ a: 1 }, [])).toEqual({ a: 1 });
        });

        it("stringifies non-string keys the way property access does", () => {
            expect(_omit({ 1: "x", 2: "y" }, 1)).toEqual({ 2: "y" });
            expect(_omit({ "-0": "x", 0: "y" }, -0)).toEqual({ 0: "y" });
            expect(_omit({ a: 1, undefined: 2 }, undefined as unknown as string)).toEqual({ a: 1 });
            expect(_omit({ "": 1, a: 2 }, "")).toEqual({ a: 2 });
        });

        it("omits symbol keys", () => {
            expect(_omit({ [sym]: 1, a: 1, b: 2 }, sym)).toEqual({ a: 1, b: 2 });
            // an array nested inside the paths array is one path; @types/lodash does not type that
            expect(_omit({ a: { [sym]: 1, b: 2 } }, [["a", sym]] as unknown as string[])).toEqual({
                a: { b: 2 },
            });
        });
    });

    describe("result object", () => {
        it("always returns a new plain object", () => {
            const object = { a: 1 };
            const result = _omit(object);

            expect(result).not.toBe(object);
            expect(result).toEqual({ a: 1 });
            expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
        });

        it("returns an empty object for null, undefined and primitives", () => {
            expect(_omit(null, "a")).toEqual({});
            expect(_omit(undefined, "a")).toEqual({});
            expect(_omit(5 as unknown as object, "a")).toEqual({});
        });

        it("copies inherited enumerable properties as own properties", () => {
            const proto = { inherited: 1 };
            const object = Object.assign(Object.create(proto), { own: 2 });
            const result = _omit(object, "nothing");

            expect(result).toEqual({ own: 2, inherited: 1 });
            expect(Object.hasOwn(result, "inherited")).toBe(true);
            expect(_omit(object, "inherited")).toEqual({ own: 2 });
        });

        it("flattens a class instance into a plain object with its prototype's enumerable properties", () => {
            const result = _omit(new Point(), "x");

            expect(result).toEqual({ y: 2, inherited: "p" });
            expect(result).not.toBeInstanceOf(Point);
        });

        it("turns array-likes into index-keyed objects", () => {
            expect(_omit([1, 2, 3], 1)).toEqual({ 0: 1, 2: 3 });
            expect(_omit([1, 2, 3])).toEqual({ 0: 1, 1: 2, 2: 3 });
            expect(_omit("ab" as unknown as object, 0)).toEqual({ 1: "b" });
            expect(_omit(getArguments("a", "b"), 0)).toEqual({ 1: "b" });
        });

        it("gives a null-prototype source an ordinary prototype", () => {
            const result = _omit(Object.assign(Object.create(null), { a: 1, b: 2 }), "a");

            expect(result).toEqual({ b: 2 });
            expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
        });

        it("keeps nested values by reference when every path is shallow", () => {
            const inner = { b: 1 };
            const result = _omit({ a: inner, c: 2 }, "c");

            expect(result.a).toBe(inner);
        });
    });

    describe("deep paths", () => {
        it("removes a nested key through a dot path or an array path", () => {
            const object = { a: { b: { c: 1, d: 2 }, e: 3 }, f: 4 };

            expect(_omit(object, "a.b.c")).toEqual({ a: { b: { d: 2 }, e: 3 }, f: 4 });
            expect(_omit(object, [["a", "b", "c"]] as unknown as string[])).toEqual({
                a: { b: { d: 2 }, e: 3 },
                f: 4,
            });
        });

        it("combines shallow and deep paths", () => {
            expect(_omit({ a: { b: 1, e: 3 }, f: 4 }, "f", "a.e")).toEqual({ a: { b: 1 } });
        });

        it("clones plain objects along the way so the source is untouched", () => {
            const object = { a: { b: { c: 1 } } };
            const result = _omit(object, "a.b.c");

            expect(object).toEqual({ a: { b: { c: 1 } } });
            expect(result.a).not.toBe(object.a);
        });

        it("clones every plain object in the result once any path is deep", () => {
            const untouched = { k: 1 };
            const result = _omit({ a: { b: 1 }, untouched }, "a.b");

            expect(result.untouched).toEqual(untouched);
            expect(result.untouched).not.toBe(untouched);
        });

        it("keeps non-plain values by reference and therefore mutates them, as lodash does", () => {
            const array = [1, { a: 1 }];
            const point = new Point();
            const result = _omit({ array, point }, "array[1].a", "point.x");

            expect(result.array).toBe(array);
            expect(array[1]).toEqual({});
            expect(result.point).toBe(point);
            expect(Object.hasOwn(point, "x")).toBe(false);
        });

        it("is a no-op for a path whose parent does not exist or whose target is inherited", () => {
            const date = new Date(1);
            const result = _omit({ a: { b: 1 }, date }, "a.zz.c", "date.getTime");

            expect(result).toEqual({ a: { b: 1 }, date });
            expect(typeof date.getTime).toBe("function");
        });

        it("prefers an existing key that looks like a path over parsing it", () => {
            expect(_omit({ "a.b": 1, a: { b: 2 }, c: 3 }, "a.b")).toEqual({ a: { b: 2 }, c: 3 });
            expect(_omit({ a: { b: 2 }, c: 3 }, "a.b")).toEqual({ a: {}, c: 3 });
        });
    });

    describe("prototype pollution guard", () => {
        it("refuses __proto__ anywhere in a path when it is not an own key", () => {
            expect(_omit({ a: 1 }, "__proto__")).toEqual({ a: 1 });
            expect(_omit({ a: { b: 1 } }, "a.__proto__.x")).toEqual({ a: { b: 1 } });
        });

        it("refuses constructor and prototype as intermediate segments but not as final keys", () => {
            expect(_omit({ a: 1 }, "constructor.prototype.x")).toEqual({ a: 1 });
            expect(_omit({ constructor: 1, a: 2 }, "constructor")).toEqual({ a: 2 });
            expect(_omit({ a: { prototype: 1, b: 2 } }, "a.prototype")).toEqual({ a: { b: 2 } });
            expect(({} as Record<string, unknown>)["x"]).toBeUndefined();
        });
    });

    describe("typing", () => {
        it("removes the omitted keys from the result type", () => {
            const result: { b: number } = _omit({ a: 1, b: 2 }, "a");

            expect(result.b).toBe(2);
        });

        it("falls back to a partial of the source type for computed paths", () => {
            const key: string = "a";
            const result: Partial<{ a: number; b: number }> = _omit({ a: 1, b: 2 }, key);

            expect(result).toEqual({ b: 2 });
        });
    });
});
