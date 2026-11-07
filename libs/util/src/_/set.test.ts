// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _set } from "./set.js";

const sym = Symbol("s");

type Target = Record<PropertyKey, unknown>;

const empty = (): Target => ({});

// Expected values match lodash-es@4.18.1 `set`.
describe("set", () => {
    describe("return value", () => {
        it("returns the same object it mutated", () => {
            const object = empty();

            expect(_set(object, "a", 1)).toBe(object);
        });

        it("returns null and undefined targets as they are", () => {
            expect(_set(null as unknown as object, "a", 1)).toBeNull();
            expect(_set(undefined as unknown as object, "a", 1)).toBeUndefined();
        });

        it("returns primitive targets untouched", () => {
            expect(_set(1 as unknown as object, "a", 1)).toBe(1);
            expect(_set("s" as unknown as object, "a", 1)).toBe("s");
            expect(_set(true as unknown as object, "a", 1)).toBe(true);
        });
    });

    describe("string paths", () => {
        it("sets a plain key, creating or overwriting it", () => {
            expect(_set(empty(), "a", 1)).toEqual({ a: 1 });
            expect(_set({ a: 1 }, "a", 2)).toEqual({ a: 2 });
        });

        it("creates intermediate objects for a dot path", () => {
            expect(_set(empty(), "a.b.c", 1)).toEqual({ a: { b: { c: 1 } } });
        });

        it("walks into existing objects without replacing them", () => {
            const inner = { c: 3, keep: true };
            const object = { a: { b: inner } };

            _set(object, "a.b.c", 4);

            expect(object.a.b).toBe(inner);
            expect(object).toEqual({ a: { b: { c: 4, keep: true } } });
        });

        it("creates arrays for bracket index segments", () => {
            expect(_set(empty(), "a[0].b", 1)).toEqual({ a: [{ b: 1 }] });
            expect(_set(empty(), "a[0][1].b.c[2]", "x")).toEqual({
                a: [[undefined, { b: { c: [undefined, undefined, "x"] } }]],
            });
        });

        it("creates arrays for numeric dot segments and objects for non-index ones", () => {
            expect(_set(empty(), "a.0", 1)).toEqual({ a: [1] });
            expect(_set(empty(), "a.01", 1)).toEqual({ a: { "01": 1 } });
            expect(_set(empty(), "a[-1]", 1)).toEqual({ a: { "-1": 1 } });
            expect(_set(empty(), "a[1.5]", 1)).toEqual({ a: { "1.5": 1 } });
        });

        it("reads bracket keys in quotes literally, including dots and escaped quotes", () => {
            expect(_set(empty(), '["a.b"].c', 1)).toEqual({ "a.b": { c: 1 } });
            expect(_set(empty(), "['k'].c", 1)).toEqual({ k: { c: 1 } });
            expect(_set(empty(), '["a\\"b"]', 1)).toEqual({ 'a"b': 1 });
        });

        it("treats unquoted non-numeric bracket content and empty brackets as plain segments", () => {
            expect(_set(empty(), "a[ 0 ]", 1)).toEqual({ a: { " 0 ": 1 } });
            expect(_set(empty(), "a[]", 1)).toEqual({ a: { "": 1 } });
        });

        it("uses an unterminated bracket path as one literal key", () => {
            expect(_set(empty(), "a[b", 1)).toEqual({ "a[b": 1 });
        });

        it("keeps empty segments produced by leading, trailing and doubled dots", () => {
            expect(_set(empty(), ".a", 1)).toEqual({ "": { a: 1 } });
            expect(_set(empty(), "a.", 1)).toEqual({ a: { "": 1 } });
            expect(_set(empty(), "a..b", 1)).toEqual({ a: { "": { b: 1 } } });
            expect(_set(empty(), "", 1)).toEqual({ "": 1 });
        });

        it("allows spaces and non-ASCII characters in segments", () => {
            expect(_set(empty(), "a b.c d", 1)).toEqual({ "a b": { "c d": 1 } });
            expect(_set(empty(), "ä.ö", 1)).toEqual({ ä: { ö: 1 } });
        });

        it("prefers an existing key that looks like a path over parsing it", () => {
            expect(_set({ "a.b": 1 }, "a.b", 2)).toEqual({ "a.b": 2 });
            expect(_set({ "a.b": { c: 1 } }, "a.b.c", 2)).toEqual({ "a.b": { c: 1 }, a: { b: { c: 2 } } });
        });
    });

    describe("array paths", () => {
        it("uses each element as one segment without parsing it", () => {
            expect(_set(empty(), ["x", "0", "y", "z"], 5)).toEqual({ x: [{ y: { z: 5 } }] });
            expect(_set(empty(), ["a.b"], 1)).toEqual({ "a.b": 1 });
        });

        it("accepts numbers and symbols as segments", () => {
            expect(_set(empty(), ["x", 0, "y"], 5)).toEqual({ x: [{ y: 5 }] });
            expect(_set(empty(), ["a", sym], 1)).toEqual({ a: { [sym]: 1 } });
        });

        it("leaves the object untouched for an empty path", () => {
            const object = { a: 1 };

            expect(_set(object, [], 2)).toBe(object);
            expect(object).toEqual({ a: 1 });
        });
    });

    describe("non-string paths", () => {
        it("stringifies numbers, booleans, null, undefined and NaN into a single key", () => {
            expect(_set(empty(), 0, "zero")).toEqual({ 0: "zero" });
            expect(_set(empty(), true as unknown as string, 1)).toEqual({ true: 1 });
            expect(_set(empty(), null as unknown as string, 1)).toEqual({ null: 1 });
            expect(_set(empty(), undefined as unknown as string, 1)).toEqual({ undefined: 1 });
            expect(_set(empty(), NaN, 1)).toEqual({ NaN: 1 });
        });

        it("keeps the sign of negative zero in the key", () => {
            expect(Object.keys(_set(empty(), -0, 1))).toEqual(["-0"]);
            expect(Object.keys(_set(empty(), [-0], 1))).toEqual(["-0"]);
        });

        it("uses a symbol as the key", () => {
            expect(_set(empty(), sym, 1)).toEqual({ [sym]: 1 });
        });

        it("indexes an array target by number", () => {
            expect(_set([] as unknown[], 1, "one")).toEqual([undefined, "one"]);
            expect(_set([1, 2], "1", 9)).toEqual([1, 9]);
        });
    });

    describe("replacing intermediate values", () => {
        it("replaces a primitive or null intermediate with a fresh container", () => {
            expect(_set({ a: 1 }, "a.b", 2)).toEqual({ a: { b: 2 } });
            expect(_set({ a: null }, "a.b", 2)).toEqual({ a: { b: 2 } });
            expect(_set({ a: "str" }, "a.b", 2)).toEqual({ a: { b: 2 } });
        });

        it("writes onto a function intermediate because functions are objects", () => {
            const fn = Object.assign(() => {}, {}) as (() => void) & { b?: number };

            _set({ a: fn }, "a.b", 2);

            expect(fn.b).toBe(2);
        });
    });

    describe("values", () => {
        it("sets undefined as an own property", () => {
            expect(Object.hasOwn(_set({ a: 1 }, "a", undefined), "a")).toBe(true);
            expect(Object.hasOwn(_set(empty(), "a", undefined), "a")).toBe(true);
        });

        it("stores object values by reference", () => {
            const value = { shared: true };

            expect(_set(empty(), "a", value)["a"]).toBe(value);
        });
    });

    describe("targets", () => {
        it("works on class instances and null-prototype objects", () => {
            class Point {
                public x = 1;
            }
            const point = _set(new Point(), "y.z", 2) as Point & { y: { z: number } };

            expect(point).toBeInstanceOf(Point);
            expect(point.y.z).toBe(2);
            expect(_set(Object.create(null) as Target, "a.b", 1)).toEqual({ a: { b: 1 } });
        });

        it("throws when the target or an intermediate cannot be extended", () => {
            expect(() => _set(Object.freeze({}), "a", 1)).toThrow(TypeError);
            expect(() => _set({ a: Object.seal({}) }, "a.b", 1)).toThrow(TypeError);
        });
    });

    describe("prototype pollution guard", () => {
        it.each(["__proto__.polluted", "constructor.prototype.polluted"])("ignores the path %s", (path) => {
            const object = empty();

            expect(_set(object, path, 1)).toBe(object);
            expect(object).toEqual({});
            expect(({} as Target)["polluted"]).toBeUndefined();
        });

        it("stops at a forbidden segment but keeps the containers created before it", () => {
            expect(_set(empty(), "a.prototype.b", 1)).toEqual({ a: {} });
        });

        it("ignores __proto__ given as an array segment", () => {
            expect(_set(empty(), ["__proto__", "polluted"], 1)).toEqual({});
            expect(({} as Target)["polluted"]).toBeUndefined();
        });
    });

    describe("typing", () => {
        it("returns the type of the object by default", () => {
            const object = { a: 1 };
            const result: { a: number } = _set(object, "a", 2);

            expect(result).toBe(object);
        });

        it("lets the caller name the resulting type", () => {
            const result = _set<{ a: { b: number } }>({}, "a.b", 1);

            expect(result.a.b).toBe(1);
        });
    });
});
