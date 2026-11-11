// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _assignIn } from "./assignIn.js";

function getArguments(..._args: unknown[]): IArguments {
    // eslint-disable-next-line prefer-rest-params
    return arguments;
}

class Foo {
    a = 1;
}

class Bar extends Foo {
    c = 3;
}

Object.assign(Foo.prototype, { b: 2 });

// Expected values match lodash-es@4.18.1 `assignIn`.
describe("assignIn", () => {
    describe("copying", () => {
        it("copies own and inherited enumerable string keys of the sources, later sources winning", () => {
            expect(_assignIn({ a: 0 }, { b: 1 }, { c: 2 })).toEqual({ a: 0, b: 1, c: 2 });
            expect(_assignIn({ a: 1 }, { a: 2 }, { a: 3 })).toEqual({ a: 3 });
            expect(_assignIn({}, new Bar())).toEqual({ a: 1, c: 3, b: 2 });
            expect(_assignIn({}, Object.assign(Object.create({ inherited: 1 }), { own: 2 }))).toEqual({
                own: 2,
                inherited: 1,
            });
            expect(_assignIn({}, Object.create(Object.create({ deep: 1 })))).toEqual({ deep: 1 });
        });

        it("ignores symbol keys and non-enumerable properties, and reads getters", () => {
            const hidden = Object.defineProperty({ a: 1 }, "hidden", { value: 2, enumerable: false });

            expect(_assignIn({}, { [Symbol("s")]: 1, a: 2 })).toEqual({ a: 2 });
            expect(_assignIn({}, hidden)).toEqual({ a: 1 });
            expect(
                _assignIn(
                    {},
                    {
                        get a() {
                            return 1;
                        },
                    },
                ),
            ).toEqual({ a: 1 });
        });

        it("copies undefined and null values and keeps nested objects by reference", () => {
            const inner = { x: 1 };
            const withUndefined = _assignIn({ a: 1 }, { a: undefined, b: undefined });

            expect(withUndefined).toEqual({ a: undefined, b: undefined });
            expect("b" in withUndefined).toBe(true);
            expect(_assignIn({ a: 1 }, { a: null })).toEqual({ a: null });
            expect(_assignIn({}, { a: inner }).a).toBe(inner);
        });

        it("returns the target itself, mutated in place, and copies keys in source order", () => {
            const target = { z: 1 };

            expect(_assignIn(target, { b: 1, a: 2, 1: 3 })).toBe(target);
            expect(Object.keys(target)).toEqual(["1", "z", "b", "a"]);
            expect(_assignIn({ a: 1 }, { b: 2 }, 5 as unknown as object)).toEqual({ a: 1, b: 2 });
        });

        it("skips values that are already there, so a frozen target only throws on a change", () => {
            const frozen = Object.freeze({ a: 1, n: NaN });
            const inherited = Object.create({ a: 1 }) as { a: number };

            expect(_assignIn(frozen, { a: 1, n: NaN })).toBe(frozen);
            expect(() => _assignIn(frozen, { a: 2 })).toThrow(TypeError);
            expect(Object.is(_assignIn({ a: 0 }, { a: -0 }).a, 0)).toBe(true);
            expect(Object.hasOwn(_assignIn(inherited, { a: 1 }), "a")).toBe(true);
        });

        it("writes a __proto__ key as an own property without touching the prototype", () => {
            const result = _assignIn({}, JSON.parse('{"__proto__":{"p":1},"a":1}'));

            expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
            expect(Object.getOwnPropertyDescriptor(result, "__proto__")?.value).toEqual({ p: 1 });
            expect(({} as Record<string, unknown>)["p"]).toBeUndefined();
            expect(_assignIn({}, { constructor: Foo }).constructor).toBe(Foo);
        });
    });

    describe("sources", () => {
        it("copies array-likes by index, strings by character and function properties", () => {
            expect(_assignIn({}, ["a", "b"])).toEqual({ 0: "a", 1: "b" });
            expect(_assignIn({}, Object.assign(["a"], { extra: 1 }))).toEqual({ 0: "a", extra: 1 });
            // oxlint-disable-next-line no-sparse-arrays
            expect(_assignIn({}, [1, , 3])).toEqual({ 0: 1, 1: undefined, 2: 3 });
            expect(_assignIn({}, "ab" as unknown as object)).toEqual({ 0: "a", 1: "b" });
            expect(_assignIn({}, Object("ab"))).toEqual({ 0: "a", 1: "b" });
            expect(_assignIn({}, new Uint8Array([1, 2]))).toEqual({ 0: 1, 1: 2 });
            expect(_assignIn({}, getArguments(1, 2))).toEqual({ 0: 1, 1: 2 });
            expect(
                _assignIn(
                    {},
                    Object.assign(() => 1, { x: 1 }),
                ),
            ).toEqual({ x: 1 });
            expect(_assignIn({}, Object.assign(new Date(0), { x: 1 }))).toEqual({ x: 1 });
            expect(_assignIn({}, Object.assign(Object.create(null), { a: 1 }))).toEqual({ a: 1 });
        });

        it("skips falsy sources and sources without enumerable keys", () => {
            expect(_assignIn({ a: 1 }, null, undefined, 0, "", false, NaN)).toEqual({ a: 1 });
            expect(_assignIn({ a: 1 }, 5 as unknown as object)).toEqual({ a: 1 });
            expect(_assignIn({ a: 1 }, true as unknown as object)).toEqual({ a: 1 });
            expect(_assignIn({ a: 1 }, new Map([[1, 2]]))).toEqual({ a: 1 });
            expect(_assignIn({ a: 1 })).toEqual({ a: 1 });
        });

        it("ignores the index and collection when used as a map or reduce callback", () => {
            const sources = [{ a: 1 }, { b: 2 }];
            const shared = { x: 1 };

            expect(sources.map((source, index) => _assignIn({}, source, index, sources))).toEqual([
                { a: 1 },
                { b: 2 },
            ]);

            const reduced = sources.reduce((acc, source, index) => _assignIn(acc, source, index, sources), {
                seed: 1,
            });

            expect(reduced).toEqual({ seed: 1, a: 1, b: 2 });
            expect(_assignIn({}, shared, "k", { k: shared })).toEqual({ x: 1 });
            expect(_assignIn({ a: 1 }, { b: 2 }, 1, { c: 3 })).toEqual({ a: 1, b: 2, c: 3 });
        });

        it("handles many sources and a source that is the target", () => {
            const self = { a: 1 };

            expect(_assignIn({}, ...Array.from({ length: 50 }, (_, index) => ({ [index]: index })))).toEqual(
                Object.fromEntries(Array.from({ length: 50 }, (_, index) => [index, index])),
            );
            expect(_assignIn(self, self)).toBe(self);
        });
    });

    describe("targets", () => {
        it("creates a new object for a nullish target and boxes a primitive one", () => {
            expect(_assignIn(null, { a: 1 })).toEqual({ a: 1 });
            expect(_assignIn(undefined, { a: 1 })).toEqual({ a: 1 });
            expect((_assignIn as unknown as () => object)()).toEqual({});

            const boxed = _assignIn(1, { a: 1 });

            expect(typeof boxed).toBe("object");
            expect(boxed.a).toBe(1);
            expect(Number(boxed)).toBe(1);
            expect(typeof _assignIn("s", { a: 1 })).toBe("object");
        });

        it("assigns into arrays and functions", () => {
            const fn = Object.assign(() => 1, { a: 0 });

            expect(_assignIn([1, 2], { 1: "b", x: 1 })).toEqual(Object.assign([1, "b"], { x: 1 }));
            expect(_assignIn([1, 2, 3], ["a"])).toEqual(["a", 2, 3]);
            expect(_assignIn(fn, { a: 1 })).toBe(fn);
            expect(fn.a).toBe(1);
        });
    });

    describe("typing", () => {
        it("types the result as the intersection of the target and the sources", () => {
            const two: { a: number; b: string } = _assignIn({ a: 1 }, { b: "x" });
            const three: { a: number; b: number; c: number } = _assignIn({ a: 1 }, { b: 2 }, { c: 3 });
            const alone: { a: number } = _assignIn({ a: 1 });
            const loose = _assignIn<{ any: boolean }>({}, { any: true }, { more: 1 }, {}, {}, {});

            expect(two).toEqual({ a: 1, b: "x" });
            expect(three).toEqual({ a: 1, b: 2, c: 3 });
            expect(alone).toEqual({ a: 1 });
            expect(loose).toEqual({ any: true, more: 1 });
        });
    });
});
