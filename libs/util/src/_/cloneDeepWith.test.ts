// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _cloneDeepWith } from "./cloneDeepWith.js";

class Point {
    constructor(public x: number) {}
}

// Expected values match lodash-es@4.18.1 `cloneDeepWith`.
describe("cloneDeepWith", () => {
    describe("without a usable customizer", () => {
        it("deep clones like cloneDeep when no customizer is given", () => {
            const source = { a: 1, b: { c: [1, { d: 2 }] } };
            const result = _cloneDeepWith(source);

            expect(result).toEqual(source);
            expect(result).not.toBe(source);
            expect(result.b).not.toBe(source.b);
            expect(result.b.c[1]).not.toBe(source.b.c[1]);
        });

        it("ignores a customizer that is not a function", () => {
            const source = { a: { b: 1 } };

            for (const notAFunction of [undefined, null, 1, "x", {}]) {
                const customizer = notAFunction as unknown as () => undefined;
                const result = _cloneDeepWith(source, customizer);

                expect(result).toEqual(source);
                expect(result.a).not.toBe(source.a);
            }
        });
    });

    describe("customizer results", () => {
        it("falls back to deep cloning when the customizer returns undefined", () => {
            const source = { a: { b: [1] }, t: new Uint8Array([1, 2]), p: new Point(1), d: new Date(5) };
            const result = _cloneDeepWith(source, () => undefined);

            expect(result).toEqual(source);
            expect(result.a).not.toBe(source.a);
            expect(result.a.b).not.toBe(source.a.b);
            expect(result.t.buffer).not.toBe(source.t.buffer);
            expect(result.p).toBeInstanceOf(Point);
            expect(result.d).not.toBe(source.d);
        });

        it("uses any other result as the value, without cloning it", () => {
            const shared = { z: { y: 1 } };
            const replaceA = (_value: unknown, key: unknown) => (key === "a" ? shared : undefined);
            const result = _cloneDeepWith({ a: 1, b: 2 }, replaceA);

            expect(result).toEqual({ a: shared, b: 2 });
            expect(result.a).toBe(shared);
            expect(result.a.z).toBe(shared.z);
        });

        it("honours falsy results other than undefined", () => {
            const result = _cloneDeepWith({ a: 1, b: 2, c: 3, d: 4 }, (_value, key) => {
                switch (key) {
                    case "a":
                        return null;
                    case "b":
                        return 0;
                    case "c":
                        return false;
                    case "d":
                        return "";
                    default:
                        return undefined;
                }
            });

            expect(result).toEqual({ a: null, b: 0, c: false, d: "" });
        });

        it("replaces the whole result when the customizer answers at the top level", () => {
            const atRoot = (_value: unknown, key: unknown) => (key === undefined ? "root" : undefined);
            const replaced = _cloneDeepWith({ a: 1 }, atRoot);

            expect(replaced).toBe("root");
            expect(_cloneDeepWith(1, (value) => (value as number) + 1)).toBe(2);
            expect(_cloneDeepWith(null, () => "n")).toBe("n");
            expect(_cloneDeepWith(undefined, () => "u")).toBe("u");
            expect(_cloneDeepWith("a", () => undefined)).toBe("a");
        });

        it("keeps a value by reference when the customizer returns it", () => {
            const inner = { x: 1 };
            const result = _cloneDeepWith({ a: inner }, (value) => (value === inner ? value : undefined));

            expect(result.a).toBe(inner);
        });

        it("transforms values of a given kind anywhere in the tree", () => {
            const source = { a: 1, b: { c: [2, { d: 3 }] }, s: new Set([4]), m: new Map([["k", 5]]) };
            const tenfold = (value: unknown) => (typeof value === "number" ? value * 10 : undefined);
            const dates = (value: unknown) => (value instanceof Date ? "date!" : undefined);
            const functions = (value: unknown) => (typeof value === "function" ? "fn!" : undefined);
            const lengths = (value: unknown, key: unknown) =>
                key === 1 && Array.isArray(value) ? value.length : undefined;

            expect(_cloneDeepWith(source, tenfold)).toEqual({
                a: 10,
                b: { c: [20, { d: 30 }] },
                s: new Set([40]),
                m: new Map([["k", 50]]),
            });
            expect(_cloneDeepWith({ d: new Date(5) }, dates)).toEqual({ d: "date!" });
            expect(_cloneDeepWith({ f: () => 1 }, functions)).toEqual({ f: "fn!" });
            expect(_cloneDeepWith([1, [2, 3]], lengths)).toEqual([1, 2]);
            expect(_cloneDeepWith({ t: new Uint8Array([1, 2]) }, tenfold)).toEqual({
                t: new Uint8Array([10, 20]),
            });
        });

        it("does not descend into a value the customizer replaced", () => {
            let calls = 0;

            _cloneDeepWith({ a: { b: { c: 1 } } }, (_value, key) => {
                calls++;

                return key === "a" ? "replaced" : undefined;
            });

            expect(calls).toBe(2);
        });

        it("propagates an error thrown by the customizer", () => {
            expect(() =>
                _cloneDeepWith({ a: 1 }, () => {
                    throw new RangeError("boom");
                }),
            ).toThrow(RangeError);
        });
    });

    describe("customizer arguments", () => {
        it("passes only the value at the top level and (value, key, object, stack) below", () => {
            const calls: unknown[][] = [];
            const source = { a: { b: 1 }, c: [2] };

            _cloneDeepWith(source, (value, key, object, stack) => {
                calls.push([value, key, object, typeof stack]);
            });

            expect(calls).toEqual([
                [source, undefined, undefined, "undefined"],
                [source.a, "a", source, "object"],
                [1, "b", source.a, "object"],
                [source.c, "c", source, "object"],
                [2, 0, source.c, "object"],
            ]);
        });

        it("visits values depth first, parents before children", () => {
            const keys: unknown[] = [];

            _cloneDeepWith({ a: { b: { c: 1 } }, d: [1, 2] }, (_value, key) => {
                keys.push(key === undefined ? "<root>" : key);
            });

            expect(keys).toEqual(["<root>", "a", "b", "c", "d", 0, 1]);
        });

        it("passes set entries as their own key and map entries with their key, keeping map keys", () => {
            const calls: unknown[][] = [];
            const mapKey = { k: 1 };
            const source = { s: new Set([1, 2]), m: new Map([[mapKey, 3]]) };

            const result = _cloneDeepWith(source, (value, key, object) => {
                const container: unknown = object;

                if (container === source.s || container === source.m) {
                    calls.push([value, key]);
                }
            });

            expect(calls).toEqual([
                [1, 1],
                [2, 2],
                [3, mapKey],
            ]);
            expect([...result.m.keys()][0]).toBe(mapKey);
        });

        it("passes symbol keys and index keys as they are", () => {
            const symbol = Symbol("k");
            const keys: unknown[] = [];

            _cloneDeepWith({ [symbol]: { a: 1 }, list: ["x"] }, (_value, key) => {
                keys.push(key);
            });

            expect(keys).toEqual([undefined, "list", 0, symbol, "a"]);
        });

        it("exposes the stack of objects being cloned", () => {
            const seen: unknown[][] = [];
            const source = { a: { b: { c: 1 } } };

            _cloneDeepWith(source, (_value, key, _object, stack) => {
                const hasRoot = stack ? stack.has(source) : "no stack";
                const hasNested = stack ? stack.has(source.a) : "no stack";

                seen.push([key, hasRoot, hasNested]);
            });

            expect(seen).toEqual([
                [undefined, "no stack", "no stack"],
                ["a", true, false],
                ["b", true, true],
                ["c", true, true],
            ]);
        });

        it("is called with an undefined this", () => {
            let thisWasUndefined = false;

            _cloneDeepWith({ a: 1 }, function (this: unknown) {
                thisWasUndefined = this === undefined;
            });

            expect(thisWasUndefined).toBe(true);
        });
    });

    describe("structure", () => {
        it("recreates cycles while customizing other values", () => {
            const source: { a: number; self?: unknown } = { a: 1 };
            source.self = source;

            const result = _cloneDeepWith(source, (_value, key) => (key === "a" ? 9 : undefined));

            expect(result.a).toBe(9);
            expect(result.self).toBe(result);
        });

        it("ignores extra arguments", () => {
            expect(
                (_cloneDeepWith as unknown as (a: unknown, b: unknown, c: unknown) => unknown)(
                    { a: 1 },
                    () => undefined,
                    "extra",
                ),
            ).toEqual({ a: 1 });
        });
    });

    describe("typing", () => {
        it("returns the value type without a customizer and any with one", () => {
            const typed: { a: number } = _cloneDeepWith({ a: 1 });
            const loose: string = _cloneDeepWith({ a: 1 }, () => "x");

            expect(typed).toEqual({ a: 1 });
            expect(loose).toBe("x");
        });
    });
});
