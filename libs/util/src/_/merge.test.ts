// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _merge } from "./merge.js";

function getArguments(..._args: unknown[]): IArguments {
    // eslint-disable-next-line prefer-rest-params
    return arguments;
}

class Point {
    constructor(public x: number) {}
}

// Expected values match lodash-es@4.18.1 `merge`.
describe("merge", () => {
    describe("plain objects", () => {
        it("merges nested plain objects recursively and returns the destination", () => {
            const destination = { a: { b: 1, c: { d: 1 } }, e: 1 };
            const result = _merge(destination, { a: { c: { f: 2 }, g: 3 }, h: 4 });

            expect(result).toBe(destination);
            expect(result).toEqual({ a: { b: 1, c: { d: 1, f: 2 }, g: 3 }, e: 1, h: 4 });
        });

        it("applies sources left to right, so later sources win", () => {
            expect(_merge({ a: 1 }, { a: 2, b: 2 }, { b: 3, c: 3 }, { c: 4 })).toEqual({ a: 2, b: 3, c: 4 });
            expect(_merge({ a: 0 }, { b: 1 }, { c: 2 }, { d: 3 }, { e: 4 }, { f: 5 })).toEqual({
                a: 0,
                b: 1,
                c: 2,
                d: 3,
                e: 4,
                f: 5,
            });
        });

        it("keeps destination objects by reference and copies source objects", () => {
            const nested = { x: 1 };
            const sourceNested = { y: 2 };
            const result = _merge({ a: nested, b: {} }, { a: { z: 3 }, b: sourceNested, c: sourceNested });

            expect(result.a).toBe(nested);
            expect(result.a).toEqual({ x: 1, z: 3 });
            expect(result.b).not.toBe(sourceNested);
            expect(result.c).not.toBe(sourceNested);
            expect(result.b).not.toBe(result.c);
            expect(result.c).toEqual({ y: 2 });
        });

        it("merges own and inherited enumerable string keys of the source", () => {
            function Foo(this: { own: number }) {
                this.own = 1;
            }

            Foo.prototype.inherited = 2;

            expect(_merge({}, new (Foo as unknown as new () => object)())).toEqual({ own: 1, inherited: 2 });
        });

        it("reads values from source getters and ignores symbol keys", () => {
            const sym = Symbol("s");
            const result = _merge(
                {},
                {
                    get g() {
                        return 5;
                    },
                    [sym]: 1,
                },
            );

            expect(result).toEqual({ g: 5 });
            expect(sym in result).toBe(false);
        });

        it("merges deeper levels and numeric string keys", () => {
            expect(_merge({ a: { b: { c: { d: 1 } } } }, { a: { b: { c: { e: 2 }, f: 3 } } })).toEqual({
                a: { b: { c: { d: 1, e: 2 }, f: 3 } },
            });
            expect(_merge({ 1: "a" }, { 1: "b", 2: "c" })).toEqual({ 1: "b", 2: "c" });
        });
    });

    describe("undefined and falsy values", () => {
        it("skips undefined source values when the destination has the key", () => {
            const result = _merge({ a: 1, b: 2 }, { a: undefined, b: null, c: undefined });

            expect(result).toEqual({ a: 1, b: null, c: undefined });
            expect("c" in result).toBe(true);
        });

        it("skips null, undefined and other falsy sources", () => {
            expect(_merge({ a: 1 }, null, undefined, 0, "", false, { b: 2 })).toEqual({ a: 1, b: 2 });
        });

        it("spreads a string source by index and ignores a number source", () => {
            expect(_merge({}, "ab")).toEqual({ 0: "a", 1: "b" });
            expect(_merge({ a: 1 }, 1)).toEqual({ a: 1 });
        });

        it("returns the destination unchanged with no sources or with itself as the source", () => {
            const destination = { a: { b: 1 } };

            expect(_merge(destination)).toBe(destination);
            expect(_merge(destination, destination)).toBe(destination);
            expect(destination).toEqual({ a: { b: 1 } });
        });

        it("leaves an equal destination value alone, so 0 and -0 do not replace each other", () => {
            expect(Object.is(_merge({ a: 0 }, { a: -0 }).a, 0)).toBe(true);
            expect(Object.is(_merge({ a: -0 }, { a: 0 }).a, -0)).toBe(true);
            expect(_merge({ a: NaN }, { a: NaN, b: NaN })).toEqual({ a: NaN, b: NaN });
        });
    });

    describe("arrays", () => {
        it("merges arrays by index, keeping extra destination elements", () => {
            const array = [1, 2, 3];
            const result = _merge({ a: array }, { a: [9] });

            expect(result.a).toBe(array);
            expect(result.a).toEqual([9, 2, 3]);
            expect(_merge({ a: [1] }, { a: [9, 8, 7] })).toEqual({ a: [9, 8, 7] });
            expect(_merge({ a: [{ b: 2 }, { d: 4 }] }, { a: [{ c: 3 }, { e: 5 }] })).toEqual({
                a: [
                    { b: 2, c: 3 },
                    { d: 4, e: 5 },
                ],
            });
            expect(_merge({ a: [[1, 2], [3]] }, { a: [[9], [8, 7], [6]] })).toEqual({
                a: [[9, 2], [8, 7], [6]],
            });
        });

        it("replaces a non-array destination value with a copy of the source array", () => {
            const source = [1, 2];

            expect(_merge({ a: 1 }, { a: source }).a).not.toBe(source);
            expect(_merge({ a: 1 }, { a: source })).toEqual({ a: [1, 2] });
            expect(_merge({ a: { x: 1 } }, { a: source })).toEqual({ a: [1, 2] });
            expect(_merge({ a: "str" }, { a: [1] })).toEqual({ a: [1] });
        });

        it("turns an array-like destination into a real array", () => {
            const result = _merge({ a: { 0: "z", length: 1 } }, { a: [1, 2] });

            expect(Array.isArray(result.a)).toBe(true);
            expect(result.a).toEqual([1, 2]);
        });

        it("merges a plain object source into an array destination by key", () => {
            const result = _merge({ a: [1, 2] }, { a: { 0: 9, x: 1 } });

            expect(Array.isArray(result.a)).toBe(true);
            expect(result.a[0]).toBe(9);
            expect(result.a[1]).toBe(2);
            expect((result.a as number[] & { x: number }).x).toBe(1);
        });

        it("skips holes in a sparse source and fills holes in a sparse destination", () => {
            // oxlint-disable-next-line no-sparse-arrays
            expect(_merge({ a: [1, 2, 3] }, { a: [, 9] })).toEqual({ a: [1, 9, 3] });

            // oxlint-disable-next-line no-sparse-arrays
            const result = _merge({ a: [, 2] }, { a: [1] });

            expect(0 in result.a).toBe(true);
            expect(result.a).toEqual([1, 2]);
        });

        it("merges into a top-level array destination", () => {
            expect(_merge([1, 2], [9], { 1: 8 })).toEqual([9, 8]);
        });
    });

    describe("non-plain values", () => {
        it("assigns class instances, dates, regexps, functions, maps, sets and errors by reference", () => {
            const point = new Point(1);
            const date = new Date(0);
            const regexp = /x/g;
            const fn = (): number => 1;
            const map = new Map([[1, 2]]);
            const set = new Set([1]);
            const error = new Error("boom");
            const result = _merge(
                { p: { x: 0 }, d: new Date(5), r: /y/, f: (): number => 2, m: new Map(), s: new Set(), e: 1 },
                { p: point, d: date, r: regexp, f: fn, m: map, s: set, e: error },
            );

            expect(result.p).toBe(point);
            expect(result.d).toBe(date);
            expect(result.r).toBe(regexp);
            expect(result.f).toBe(fn);
            expect(result.m).toBe(map);
            expect(result.s).toBe(set);
            expect(result.e).toBe(error);
        });

        it("merges a plain source into a class instance destination, keeping the instance", () => {
            const point = new Point(1);
            const result = _merge({ p: point }, { p: { y: 2 } });

            expect(result.p).toBe(point);
            expect(result.p).toEqual({ x: 1, y: 2 });
        });

        it("replaces a function destination with a new plain object", () => {
            const result = _merge({ f: (): number => 1 }, { f: { a: 1 } });

            expect(typeof result.f).toBe("object");
            expect(result.f).toEqual({ a: 1 });
        });

        it("replaces a boxed primitive destination by reference", () => {
            // oxlint-disable-next-line sonarjs/no-primitive-wrappers
            const boxed = new String("x");
            // oxlint-disable-next-line sonarjs/no-primitive-wrappers
            const result = _merge({ a: new Number(1) }, { a: boxed });

            expect(result.a).toBe(boxed);
        });

        it("copies a typed array source, or merges it by index into an array-like destination", () => {
            const typed = new Uint8Array([1, 2, 3]);
            const intoNumber = _merge({ t: 1 }, { t: typed });
            const intoArray = _merge({ t: [9, 9] }, { t: typed });
            // a typed array destination is array-like, so lodash copies it into a plain array first
            const intoTyped = _merge({ t: new Uint8Array([9]) }, { t: new Uint8Array([1, 2]) });

            expect(intoNumber.t).toBeInstanceOf(Uint8Array);
            expect(intoNumber.t).not.toBe(typed);
            expect(Array.from(intoNumber.t)).toEqual([1, 2, 3]);
            expect(intoArray.t).toEqual([1, 2, 3]);
            expect(Array.isArray(intoTyped.t)).toBe(true);
            expect(intoTyped.t).toEqual([1, 2]);
        });

        it("copies buffers from the source", () => {
            const buffer = Buffer.alloc(2).fill(104);
            const result = _merge({ b: 1 }, { b: buffer });

            expect(Buffer.isBuffer(result.b)).toBe(true);
            expect(result.b).not.toBe(buffer);
            expect(Array.from(result.b)).toEqual([104, 104]);
        });

        it("converts arguments objects to plain objects on either side", () => {
            const fromSource = _merge({}, { a: getArguments(1, 2) });
            const fromDestination = _merge({ a: getArguments("a", "b") }, { a: { 2: "c" } });

            expect(Object.prototype.toString.call(fromSource.a)).toBe("[object Object]");
            expect(fromSource.a).toEqual({ 0: 1, 1: 2 });
            expect(Object.prototype.toString.call(fromDestination.a)).toBe("[object Object]");
            expect(fromDestination.a).toEqual({ 0: "a", 1: "b", 2: "c" });
        });

        it("treats null-prototype objects as plain objects", () => {
            const destinationValue = Object.create(null) as { a: number };
            const sourceValue = Object.create(null) as { a: number };
            destinationValue.a = 1;
            sourceValue.a = 1;

            const asDestination = _merge({ o: destinationValue }, { o: { b: 2 } });
            const asSource = _merge({}, { o: sourceValue });

            expect(asDestination.o).toBe(destinationValue);
            expect(asDestination.o).toEqual({ a: 1, b: 2 });
            expect(asSource.o).not.toBe(sourceValue);
            expect(Object.getPrototypeOf(asSource.o)).toBe(Object.prototype);
            expect(asSource.o).toEqual({ a: 1 });
        });
    });

    describe("destination coercion", () => {
        it("creates a new plain object for a null or undefined destination", () => {
            expect(_merge(null, { a: 1 })).toEqual({ a: 1 });
            expect(_merge(undefined, { a: 1 })).toEqual({ a: 1 });
        });

        it("boxes a primitive destination", () => {
            const fromNumber = _merge(1, { a: 1 });
            const fromString = _merge("ab", { a: 1 });

            expect(fromNumber).toBeInstanceOf(Number);
            expect(Number(fromNumber)).toBe(1);
            expect(fromNumber.a).toBe(1);
            expect(fromString).toBeInstanceOf(String);
            expect(String(fromString)).toBe("ab");
            expect(fromString.a).toBe(1);
        });
    });

    describe("circular references", () => {
        it("recreates a cycle in the source inside the copy", () => {
            const source: { a: number; self?: unknown } = { a: 1 };
            source.self = source;

            const result = _merge({}, source);
            const copy = result.self as typeof source;

            expect(copy).not.toBe(source);
            expect(copy.a).toBe(1);
            expect(copy.self).toBe(copy);
        });

        it("points a nested cycle at the merged destination value", () => {
            const inner: { v: number; back?: unknown } = { v: 1 };
            inner.back = inner;

            const result = _merge({ x: { v: 0 } }, { x: inner });

            expect(result.x.v).toBe(1);
            expect(result.x.back).toBe(result.x);
        });

        it("merges into a destination that contains a cycle", () => {
            const destination: { a: { b: number; self?: unknown; c?: number } } = { a: { b: 1 } };
            destination.a.self = destination.a;

            const result = _merge(destination, { a: { c: 2 } });

            expect(result.a.c).toBe(2);
            expect(result.a.self).toBe(result.a);
        });
    });

    describe("prototype pollution", () => {
        it("ignores __proto__ keys at any depth", () => {
            const result = _merge({}, JSON.parse('{"__proto__": {"polluted": true}}'));
            const nested = _merge({ a: {} }, JSON.parse('{"a": {"__proto__": {"polluted": true}}}'));

            expect(Object.keys(result)).toEqual([]);
            expect(Object.keys(nested.a)).toEqual([]);
            expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
            expect(({} as { polluted?: boolean }).polluted).toBeUndefined();
        });

        it("assigns a constructor key as an own property without touching Object.prototype", () => {
            const result = _merge({}, JSON.parse('{"constructor": {"prototype": {"polluted": true}}}'));

            expect(Object.keys(result)).toEqual(["constructor"]);
            expect(result.constructor).toEqual({ prototype: { polluted: true } });
            expect(({} as { polluted?: boolean }).polluted).toBeUndefined();
            expect(_merge({ constructor: { x: 1 } }, { constructor: { y: 2 } })).toEqual({
                constructor: { x: 1, y: 2 },
            });
        });
    });

    describe("iteratee call guard", () => {
        it("ignores the index and collection when used as a reduce callback", () => {
            expect([{ a: 1 }, { b: 2 }, { c: 3 }].reduce(_merge)).toEqual({ a: 1, b: 2, c: 3 });
        });

        it("merges a third object source normally", () => {
            expect(_merge({ a: 1 }, { b: 2 }, { c: 3 })).toEqual({ a: 1, b: 2, c: 3 });
            expect(_merge({ a: 1 }, { b: 2 }, { a: 1 })).toEqual({ a: 1, b: 2 });
        });
    });

    describe("typing", () => {
        it("types the result as the intersection of the destination and the sources", () => {
            const result: { a: number } & { b: string } = _merge({ a: 1 }, { b: "x" });
            const three: { a: number } & { b: string } & { c: boolean } = _merge(
                { a: 1 },
                { b: "x" },
                { c: true },
            );

            expect(result).toEqual({ a: 1, b: "x" });
            expect(three).toEqual({ a: 1, b: "x", c: true });
        });
    });
});
