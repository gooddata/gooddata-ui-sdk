// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _defaults } from "./defaults.js";

function getArguments(..._args: unknown[]): IArguments {
    // eslint-disable-next-line prefer-rest-params
    return arguments;
}

// Expected values match lodash-es@4.18.1 `defaults`.
describe("defaults", () => {
    describe("filling", () => {
        it("assigns source properties for keys that are undefined, first source winning", () => {
            expect(_defaults({ a: 1 }, { b: 2 }, { a: 3 })).toEqual({ a: 1, b: 2 });
            expect(_defaults({ a: undefined, b: 1 }, { a: 2, b: 3 })).toEqual({ a: 2, b: 1 });
            expect(_defaults({}, { a: 1 }, { a: 2 })).toEqual({ a: 1 });
            expect(_defaults({ a: { x: 1 } }, { a: { y: 2 } })).toEqual({ a: { x: 1 } });
        });

        it("keeps null and other falsy values, only undefined counts as missing", () => {
            expect(_defaults({ a: null }, { a: 2 })).toEqual({ a: null });
            expect(_defaults({ a: 0, b: "", c: false, d: NaN }, { a: 1, b: 1, c: 1, d: 1 })).toEqual({
                a: 0,
                b: "",
                c: false,
                d: NaN,
            });
        });

        it("assigns an undefined source value as an own property", () => {
            const result = _defaults({}, { a: undefined });

            expect(result).toEqual({ a: undefined });
            expect("a" in result).toBe(true);
        });

        it("overrides values inherited from Object.prototype, keeping own and other inherited ones", () => {
            const inheritedToString = Object.create({ toString: Object.prototype.toString });
            const customProto = Object.create({ a: 1 }) as { a: number };
            const result = _defaults({}, { toString: "t", constructor: "c", hasOwnProperty: "h" });

            expect([result.toString, result.constructor, result.hasOwnProperty]).toEqual(["t", "c", "h"]);
            expect(_defaults({ toString: "mine" }, { toString: "t" }).toString).toBe("mine");
            expect(_defaults(inheritedToString, { toString: "t" }).toString).toBe("t");
            expect(_defaults(customProto, { a: 2 }).a).toBe(1);
            expect(Object.hasOwn(_defaults(customProto, { a: 2 }), "a")).toBe(false);
        });

        it("reads own and inherited enumerable string keys of the sources, including getters", () => {
            const proto = { inherited: 1 };
            const hidden = Object.defineProperty({ a: 1 }, "hidden", { value: 2, enumerable: false });

            const withInherited = Object.assign(Object.create(proto), { own: 2 });

            expect(_defaults({}, withInherited)).toEqual({ own: 2, inherited: 1 });
            expect(_defaults({}, Object.create(Object.create({ deep: 1 })))).toEqual({ deep: 1 });
            expect(_defaults({}, { [Symbol("s")]: 1, a: 2 })).toEqual({ a: 2 });
            expect(_defaults({}, hidden)).toEqual({ a: 1 });
            expect(
                _defaults(
                    {},
                    {
                        get a() {
                            return 1;
                        },
                    },
                ),
            ).toEqual({ a: 1 });
        });

        it("assigns through a target setter whose getter yields undefined", () => {
            const target = {
                stored: undefined as number | undefined,
                get a(): number | undefined {
                    return undefined;
                },
                set a(value: number | undefined) {
                    this.stored = value;
                },
            };

            _defaults(target, { a: 1 });

            expect(target.stored).toBe(1);
        });
    });

    describe("sources and targets", () => {
        it("copies array-likes by index, strings by character and function properties", () => {
            expect(_defaults({}, ["a", "b"])).toEqual({ 0: "a", 1: "b" });
            // oxlint-disable-next-line no-sparse-arrays
            expect(_defaults({}, [1, , 3])).toEqual({ 0: 1, 1: undefined, 2: 3 });
            expect(_defaults({}, "ab" as unknown as object)).toEqual({ 0: "a", 1: "b" });
            expect(_defaults({ 0: "keep" }, new Uint8Array([1, 2]))).toEqual({ 0: "keep", 1: 2 });
            expect(_defaults({}, getArguments(1, 2))).toEqual({ 0: 1, 1: 2 });
            expect(
                _defaults(
                    {},
                    Object.assign(() => 1, { x: 1 }),
                ),
            ).toEqual({ x: 1 });
        });

        it("ignores nullish and primitive sources", () => {
            expect(_defaults({ a: 1 }, null)).toEqual({ a: 1 });
            expect(_defaults({ a: 1 }, undefined)).toEqual({ a: 1 });
            expect(_defaults({ a: 1 }, 5 as unknown as object, 0, "", false, NaN)).toEqual({ a: 1 });
            expect(_defaults({ a: 1 })).toEqual({ a: 1 });
        });

        it("returns the target itself, creates one for nullish targets and boxes primitives", () => {
            const target = { z: 1 };
            const fn = Object.assign(() => 1, { a: undefined as number | undefined });

            expect(_defaults(target, { b: 1, a: 2 })).toBe(target);
            expect(Object.keys(target)).toEqual(["z", "b", "a"]);
            expect(_defaults(null, { a: 1 })).toEqual({ a: 1 });
            expect(_defaults(undefined, { a: 1 })).toEqual({ a: 1 });
            expect((_defaults as unknown as () => object)()).toEqual({});
            expect(typeof _defaults(1, { a: 1 })).toBe("object");
            expect(_defaults([1, undefined], { 1: "b", 2: "c" })).toEqual([1, "b", "c"]);
            expect(_defaults(fn, { a: 1 })).toBe(fn);
            expect(fn.a).toBe(1);
        });

        it("never changes a prototype through a __proto__ key", () => {
            const plain = _defaults({}, JSON.parse('{"__proto__":{"p":1},"a":1}'));
            const bare = _defaults(Object.create(null), JSON.parse('{"__proto__":{"p":1}}'));

            // a plain target already has the accessor from Object.prototype, so the key is not undefined
            expect(plain).toEqual({ a: 1 });
            expect(Object.getPrototypeOf(plain)).toBe(Object.prototype);
            expect(({} as Record<string, unknown>)["p"]).toBeUndefined();
            // a null-prototype target has no accessor, so the assignment creates an own property
            expect(Object.getPrototypeOf(bare)).toBeNull();
            expect(Object.hasOwn(bare, "__proto__")).toBe(true);
            expect(Object.getOwnPropertyDescriptor(bare, "__proto__")?.value).toEqual({ p: 1 });
        });

        it("throws on a frozen target only when a key has to be set", () => {
            expect(_defaults(Object.freeze({ a: 1 }), { a: 2 })).toEqual({ a: 1 });
            expect(() => _defaults(Object.freeze({}), { a: 2 })).toThrow(TypeError);
            expect(() => _defaults(Object.freeze({ a: undefined }), { a: 2 })).toThrow(TypeError);
        });

        it("ignores the index and collection when used as a map or reduce callback", () => {
            const sources = [{ a: 1 }, { b: 2 }];

            expect(sources.map((source, index) => _defaults({}, source, index, sources))).toEqual([
                { a: 1 },
                { b: 2 },
            ]);

            const reduced = sources.reduce((acc, source, index) => _defaults(acc, source, index, sources), {
                seed: 1,
            });

            expect(reduced).toEqual({ seed: 1, a: 1, b: 2 });
            expect(_defaults({ a: 1 }, { b: 2 }, 1, { c: 3 })).toEqual({ a: 1, b: 2, c: 3 });
        });
    });

    describe("typing", () => {
        it("types the result as the non-nullable intersection of the sources and the target", () => {
            const two: { a: number; b: string } = _defaults({ a: 1 }, { b: "x" });
            const three: { a: number; b: number; c: number } = _defaults({ a: 1 }, { b: 2 }, { c: 3 });
            const alone: { a: number } = _defaults({ a: 1 });
            const loose: { a: number } = _defaults({}, { a: 1 }, {}, {}, {}, {});

            expect(two).toEqual({ a: 1, b: "x" });
            expect(three).toEqual({ a: 1, b: 2, c: 3 });
            expect(alone).toEqual({ a: 1 });
            expect(loose).toEqual({ a: 1 });
        });
    });
});
