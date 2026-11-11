// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _mapValues } from "./mapValues.js";

function getArguments(..._args: unknown[]): IArguments {
    // eslint-disable-next-line prefer-rest-params
    return arguments;
}

const users = { fred: { user: "fred", age: 40 }, pebbles: { user: "pebbles", age: 1 } };

// Expected values match lodash-es@4.18.1 `mapValues`.
describe("mapValues", () => {
    describe("iteratee", () => {
        it("maps every own value into a new object with the same keys", () => {
            const result = _mapValues(users, (user) => user.age);

            expect(result).toEqual({ fred: 40, pebbles: 1 });
            expect(result).not.toBe(users);
            expect(users.fred).toEqual({ user: "fred", age: 40 });
        });

        it("invokes the iteratee with the value, the key and the object, and an undefined this", () => {
            const object = { a: 1, b: 2 };
            const seen: unknown[][] = [];

            _mapValues(object, function (this: unknown, ...args: unknown[]) {
                seen.push([...args, this]);

                return args[0];
            });

            expect(seen).toEqual([
                [1, "a", object, undefined],
                [2, "b", object, undefined],
            ]);
        });

        it("accepts the property, deep path, matches and matchesProperty shorthands", () => {
            expect(_mapValues(users, "age")).toEqual({ fred: 40, pebbles: 1 });
            expect(_mapValues({ x: { a: { b: 1 } }, y: { a: { b: 2 } } }, "a.b")).toEqual({ x: 1, y: 2 });
            expect(_mapValues({ x: { a: 1 }, y: { a: 2 } }, { a: 1 })).toEqual({ x: true, y: false });
            expect(_mapValues({ x: { a: 1 }, y: { a: 2 } }, ["a", 2])).toEqual({ x: false, y: true });
            expect(_mapValues({ x: [5, 6], y: [7, 8] }, 1 as unknown as string)).toEqual({ x: 6, y: 8 });
        });

        it("copies the values when the iteratee is missing, undefined or null", () => {
            const nested = { c: 2 };
            const copy = _mapValues({ a: 1, b: nested });

            expect(copy).toEqual({ a: 1, b: nested });
            expect(copy["b"]).toBe(nested);
            expect(_mapValues({ a: 1 }, undefined as unknown as string)).toEqual({ a: 1 });
            expect(_mapValues({ a: 1 }, null as unknown as string)).toEqual({ a: 1 });
        });

        it("stores undefined results and lets iteratee errors propagate", () => {
            const result = _mapValues({ a: 1 }, () => undefined);

            expect(result).toEqual({ a: undefined });
            expect("a" in result).toBe(true);
            expect(() =>
                _mapValues({ a: 1 }, () => {
                    throw new RangeError("boom");
                }),
            ).toThrow(RangeError);
        });
    });

    describe("keys", () => {
        it("visits own enumerable string keys only, in key order", () => {
            function Foo(this: { a: number; b: number }) {
                this.a = 1;
                this.b = 2;
            }

            Foo.prototype.c = 3;

            const sym = Symbol("s");
            const hidden = Object.defineProperty({ a: 1 }, "hidden", { value: 2, enumerable: false });

            expect(_mapValues(new (Foo as unknown as new () => object)(), (v: number) => v * 10)).toEqual({
                a: 10,
                b: 20,
            });
            expect(_mapValues({ [sym]: 1, a: 2 }, (v) => v)).toEqual({ a: 2 });
            expect(_mapValues(hidden, (v) => v)).toEqual({ a: 1 });
            expect(Object.keys(_mapValues({ z: 1, a: 2, 1: 3, 0: 4 }, (v) => v))).toEqual([
                "0",
                "1",
                "z",
                "a",
            ]);
        });

        it("reads getters and keeps own __proto__ and constructor keys as own keys", () => {
            const getter = {
                get g() {
                    return 5;
                },
            };
            const withProto = _mapValues(JSON.parse('{"__proto__": {"polluted": true}, "a": 1}'), (v) => v);

            expect(_mapValues(getter, (v) => v + 1)).toEqual({ g: 6 });
            expect(Object.hasOwn(withProto, "__proto__")).toBe(true);
            expect(Object.getPrototypeOf(withProto)).toBe(Object.prototype);
            expect(({} as { polluted?: boolean }).polluted).toBeUndefined();
            expect(_mapValues({ constructor: 1, a: 2 }, (v) => v)).toEqual({ constructor: 1, a: 2 });
        });
    });

    describe("objects", () => {
        it("returns an empty object for null, undefined, primitives and empty objects", () => {
            expect(_mapValues(null, (v: unknown) => v)).toEqual({});
            expect(_mapValues(undefined, (v: unknown) => v)).toEqual({});
            expect(_mapValues(5 as unknown as object, (v: unknown) => v)).toEqual({});
            expect(_mapValues({}, (v: unknown) => v)).toEqual({});
        });

        it("maps arrays, arguments objects, strings and typed arrays to index keys", () => {
            expect(_mapValues(["a", "b"], (v, k) => v + k)).toEqual({ 0: "a0", 1: "b1" });
            // oxlint-disable-next-line no-sparse-arrays
            expect(_mapValues([1, , 3], (v) => v)).toEqual({ 0: 1, 1: undefined, 2: 3 });
            expect(_mapValues(getArguments("x", "y"), (v, k) => k + String(v))).toEqual({ 0: "0x", 1: "1y" });
            expect(_mapValues("ab", (c, i) => c + i)).toEqual({ 0: "a0", 1: "b1" });
            expect(_mapValues(new Uint8Array([1, 2]), (v) => Number(v) * 2)).toEqual({ 0: 2, 1: 4 });
            expect(_mapValues(Object.assign([1], { extra: "x" }), (v) => v)).toEqual({ 0: 1, extra: "x" });
        });

        it("keeps the length key of a plain array-like object and maps functions and null-prototype objects", () => {
            expect(_mapValues({ length: 2, 0: "a", 1: "b" }, (v) => v)).toEqual({
                0: "a",
                1: "b",
                length: 2,
            });
            expect(
                _mapValues(
                    Object.assign(() => 1, { a: 1 }),
                    (v) => v,
                ),
            ).toEqual({ a: 1 });
            expect(
                _mapValues(
                    Object.assign(Object.create(null), { a: 1 }) as { a: number },
                    (v: number) => v + 1,
                ),
            ).toEqual({ a: 2 });
        });

        it("sees no keys on Maps and Dates", () => {
            expect(_mapValues(new Map([["a", 1]]), (v) => v)).toEqual({});
            expect(_mapValues(new Date(0), (v) => v)).toEqual({});
        });

        it("always returns a plain object", () => {
            expect(Object.getPrototypeOf(_mapValues([1], (v) => v))).toBe(Object.prototype);
            expect(Object.getPrototypeOf(_mapValues(Object.create(null), (v) => v))).toBe(Object.prototype);
        });
    });

    describe("typing", () => {
        it("maps the value types and keeps the keys", () => {
            const ages: { fred: number; pebbles: number } = _mapValues(users, (user) => user.age);
            const names: Record<string, string> = _mapValues({ a: 1, b: 2 } as Record<string, number>, (v) =>
                String(v),
            );
            // the dictionary overload wins for a plain object literal, as in the lodash typings
            const copy: Record<string, { user: string; age: number }> = _mapValues(users);

            expect(ages.fred).toBe(40);
            expect(names).toEqual({ a: "1", b: "2" });
            expect(copy).toEqual(users);
        });
    });
});
