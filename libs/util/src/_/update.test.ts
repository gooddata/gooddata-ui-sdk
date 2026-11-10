// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _update } from "./update.js";

const square = (n: number): number => n * n;
const increment = (n: number | undefined): number => (n ? n + 1 : 0);

// Expected values match lodash-es@4.18.1 `update`.
describe("update", () => {
    describe("updating", () => {
        it("replaces the value at the path with the updater's result and returns the object", () => {
            const object = { a: [{ b: { c: 3 } }] };
            const result = _update(object, "a[0].b.c", square);

            expect(result).toBe(object);
            expect(object).toEqual({ a: [{ b: { c: 9 } }] });
            expect(_update({ a: 1 }, "a", square)).toEqual({ a: 1 });
            expect(_update({ a: { b: 2 } }, ["a", "b"], square)).toEqual({ a: { b: 4 } });
            expect(_update({ a: { b: { c: 2 } } }, "a.b.c", square)).toEqual({ a: { b: { c: 4 } } });
        });

        it("invokes the updater once with the current value only and an undefined this", () => {
            const seen: unknown[][] = [];
            const result = _update({ a: { b: "x" } }, "a.b", function (this: unknown, ...args: unknown[]) {
                seen.push([...args, this]);

                return `${String(args[0])}!`;
            });

            expect(seen).toEqual([["x", undefined]]);
            expect(result).toEqual({ a: { b: "x!" } });
        });

        it("passes undefined to the updater for a missing path and stores whatever it returns", () => {
            expect(_update({}, "a", (value: unknown) => [value, typeof value])).toEqual({
                a: [undefined, "undefined"],
            });
            expect(_update({ a: 1 }, "b", increment)).toEqual({ a: 1, b: 0 });

            const cleared = _update({ a: 1 }, "a", () => undefined);

            expect(cleared).toEqual({ a: undefined });
            expect("a" in cleared).toBe(true);
        });

        it("falls back to identity when the updater is not a function", () => {
            expect(_update({ a: 1 }, "a", 5 as unknown as () => number)).toEqual({ a: 1 });
            expect(_update({ a: 1 }, "a", undefined as unknown as () => number)).toEqual({ a: 1 });
            expect(_update({ a: 1 }, "a", null as unknown as () => number)).toEqual({ a: 1 });

            const created = _update({}, "a.b", "nope" as unknown as () => number);

            expect(created).toEqual({ a: { b: undefined } });
            expect("b" in created.a).toBe(true);
        });

        it("lets an updater error propagate", () => {
            expect(() =>
                _update({ a: 1 }, "a", () => {
                    throw new RangeError("boom");
                }),
            ).toThrow(RangeError);
        });
    });

    describe("path creation", () => {
        it("creates plain objects for missing segments and arrays for index segments", () => {
            const object = { a: [{ b: { c: 3 } }] };

            _update(object, "x[0].y.z", increment);
            expect(object).toEqual({ a: [{ b: { c: 3 } }], x: [{ y: { z: 0 } }] });
            expect(Array.isArray((object as unknown as { x: unknown }).x)).toBe(true);

            expect(_update({}, "a.b.c", increment)).toEqual({ a: { b: { c: 0 } } });

            const dotted = _update({}, "a.0.b", increment);
            const byArray = _update({}, ["a", 1, "b"], increment);

            expect(Array.isArray(dotted.a)).toBe(true);
            expect(dotted).toEqual({ a: [{ b: 0 }] });
            expect(Array.isArray(byArray.a)).toBe(true);
            expect(byArray.a).toHaveLength(2);
            expect(byArray.a[1]).toEqual({ b: 0 });
        });

        it("only treats canonical unsigned indexes as array segments", () => {
            expect(Array.isArray(_update({}, "a[-1]", increment).a)).toBe(false);
            expect(_update({}, "a[-1]", increment)).toEqual({ a: { "-1": 0 } });
            expect(Array.isArray(_update({}, "a.01", increment).a)).toBe(false);
            expect(_update({}, "a.01", increment)).toEqual({ a: { "01": 0 } });
            expect(Array.isArray(_update({}, "a[4294967296]", increment).a)).toBe(true);
        });

        it("extends an existing array and replaces non-object intermediates", () => {
            const extended = _update({ a: [1] }, "a[3]", increment);

            expect(extended.a).toHaveLength(4);
            expect(extended.a[3]).toBe(0);
            expect(_update({ a: null }, "a.b", increment)).toEqual({ a: { b: 0 } });
            expect(_update({ a: 5 }, "a.b", increment)).toEqual({ a: { b: 0 } });
            expect(_update({ a: "str" }, "a.b", increment)).toEqual({ a: { b: 0 } });
        });

        it("keeps object intermediates, arrays and functions included", () => {
            const array: number[] & { b?: number } = [];
            const fn: (() => number) & { b?: number } = () => 1;

            _update({ a: array }, "a.b", increment);
            _update({ a: fn }, "a.b", increment);

            expect(array.b).toBe(0);
            expect(fn.b).toBe(0);
        });
    });

    describe("paths", () => {
        it("prefers an own key containing a dot over the deep path, and keeps dots literal in a path array", () => {
            expect(_update({ "a.b": 1, a: { b: 2 } }, "a.b", square)).toEqual({ "a.b": 1, a: { b: 2 } });
            expect(_update({ "a.b": 1 }, ["a.b"], square)).toEqual({ "a.b": 1 });
            expect(_update({ a: { "b.c": 1 } }, 'a["b.c"]', square)).toEqual({ a: { "b.c": 1 } });
        });

        it("accepts number and symbol keys", () => {
            const sym = Symbol("s");

            expect(_update({ 1: "x" }, 1, (value: string) => value + value)).toEqual({ 1: "xx" });
            expect(_update({ [sym]: 2 }, sym, square)[sym]).toBe(4);
            expect(_update({ a: { [sym]: 3 } }, ["a", sym], square).a[sym]).toBe(9);
        });

        it("writes an empty string path as the empty key and ignores an empty path array", () => {
            expect(_update({ a: 1 }, "", increment)).toEqual({ a: 1, "": 0 });
            expect(_update({ a: 1 }, [], increment)).toEqual({ a: 1 });
        });

        it("refuses __proto__, constructor and prototype segments", () => {
            const target = {};

            expect(_update({}, "__proto__.polluted", () => true)).toEqual({});
            expect(_update({}, ["__proto__", "polluted"], () => true)).toEqual({});
            expect(_update({}, "constructor.prototype.polluted", () => true)).toEqual({});
            expect(_update({ a: {} }, "a.prototype.x", () => 1)).toEqual({ a: {} });
            expect(Object.getPrototypeOf(_update(target, "__proto__", () => ({ polluted: true })))).toBe(
                Object.prototype,
            );
            expect(({} as { polluted?: boolean }).polluted).toBeUndefined();
        });
    });

    describe("objects", () => {
        it("returns null, undefined and primitives untouched", () => {
            expect(_update(null as unknown as object, "a", square)).toBeNull();
            expect(_update(undefined as unknown as object, "a", square)).toBeUndefined();
            expect(_update(5 as unknown as object, "a", square)).toBe(5);
            expect(_update("abc" as unknown as object, "a", square)).toBe("abc");
        });

        it("updates arrays, functions and null-prototype objects in place", () => {
            const array = [1, 2];
            const fn: (() => number) & { a?: number } = Object.assign(() => 1, { a: 2 });
            const nullProto = Object.assign(Object.create(null), { a: 1 }) as { a: number; b?: unknown };

            expect(_update(array, "1", square)).toBe(array);
            expect(array).toEqual([1, 4]);
            expect(_update(array, [0], square)).toEqual([1, 4]);
            _update(fn, "a", square);
            expect(fn.a).toBe(4);
            _update(nullProto, "a.b", increment);
            expect(nullProto).toEqual({ a: { b: 0 } });
        });
    });

    describe("typing", () => {
        it("takes an object, a path and an updater and returns the object type as any", () => {
            const result: { a: number } = _update({ a: 1 }, "a", (value: number) => value + 1);

            expect(result).toEqual({ a: 2 });
        });
    });
});
