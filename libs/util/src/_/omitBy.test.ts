// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _omitBy } from "./omitBy.js";

function getArguments(..._args: unknown[]): IArguments {
    // eslint-disable-next-line prefer-rest-params
    return arguments;
}

const isNumber = (value: unknown): boolean => typeof value === "number";

// Expected values match lodash-es@4.18.1 `omitBy`.
describe("omitBy", () => {
    describe("predicate", () => {
        it("drops the properties the predicate returns truthy for, into a new object", () => {
            const object = { a: 1, b: "2", c: 3 };
            const result = _omitBy(object, isNumber);

            expect(result).toEqual({ b: "2" });
            expect(result).not.toBe(object);
            expect(object).toEqual({ a: 1, b: "2", c: 3 });
        });

        it("invokes the predicate with the value and the key only, and an undefined this", () => {
            const seen: unknown[][] = [];
            const result = _omitBy({ a: 1, b: 2, c: 3 }, function (this: unknown, ...args: unknown[]) {
                seen.push([...args, this]);

                return args[1] === "b" || args[0] === 3;
            });

            expect(result).toEqual({ a: 1 });
            expect(seen).toEqual([
                [1, "a", undefined],
                [2, "b", undefined],
                [3, "c", undefined],
            ]);
        });

        it("treats any truthy result as a hit", () => {
            expect(_omitBy({ a: 1, b: 2, c: 3 }, (value) => (value === 2 ? "yes" : 0))).toEqual({
                a: 1,
                c: 3,
            });
            expect(_omitBy({ a: 1, b: 2 }, () => false)).toEqual({ a: 1, b: 2 });
            expect(_omitBy({ a: 1, b: 2 }, () => true)).toEqual({});
        });

        it("drops truthy values when the predicate is missing, undefined or null", () => {
            const object = { a: 1, b: 0, c: "", d: null, e: undefined, f: false, g: "x", h: NaN };
            const expected = { b: 0, c: "", d: null, e: undefined, f: false, h: NaN };

            expect(_omitBy(object)).toEqual(expected);
            expect(_omitBy(object, undefined)).toEqual(expected);
            expect(_omitBy(object, null as unknown as undefined)).toEqual(expected);
        });

        it("accepts the property, deep property, matches and matchesProperty shorthands", () => {
            expect(_omitBy({ a: { active: true }, b: { active: false }, c: {} }, "active")).toEqual({
                b: { active: false },
                c: {},
            });
            expect(_omitBy({ a: { n: { ok: 1 } }, b: { n: { ok: 0 } } }, "n.ok")).toEqual({
                b: { n: { ok: 0 } },
            });
            expect(_omitBy({ a: { x: 1, y: 2 }, b: { x: 2 }, c: { x: 1 } }, { x: 1 })).toEqual({
                b: { x: 2 },
            });
            expect(_omitBy({ a: { x: 1 }, b: { x: 2 } }, ["x", 1])).toEqual({ b: { x: 2 } });
        });

        it("reads a non-function, non-shorthand predicate as a property name", () => {
            expect(_omitBy({ a: { 5: true }, b: { 5: false } }, 5 as unknown as string)).toEqual({
                b: { 5: false },
            });
        });
    });

    describe("keys", () => {
        it("visits own and inherited enumerable keys and keeps their order", () => {
            function Foo(this: { own: number; other: string }) {
                this.own = 1;
                this.other = "x";
            }

            Foo.prototype.inherited = 2;
            Foo.prototype.text = "y";

            const instance = new (Foo as unknown as new () => object)();

            expect(_omitBy(instance, isNumber)).toEqual({ other: "x", text: "y" });
            expect(Object.keys(_omitBy({ z: 1, a: 2, m: 3, 1: 4, 0: 5 }, () => false))).toEqual([
                "0",
                "1",
                "z",
                "a",
                "m",
            ]);
        });

        it("visits symbol keys and passes them to the predicate", () => {
            const sym = Symbol("s");
            const kept = _omitBy({ [sym]: "x", a: 1 }, isNumber);
            const dropped = _omitBy({ [sym]: 1, a: 1 }, (_value, key) => typeof key === "symbol");

            expect(kept).toEqual({ [sym]: "x" });
            expect(Reflect.ownKeys(kept)).toEqual([sym]);
            expect(dropped).toEqual({ a: 1 });
            expect(Reflect.ownKeys(dropped)).toEqual(["a"]);
        });

        it("skips non-enumerable keys and reads getters", () => {
            const hidden = Object.defineProperty({ a: 1 }, "hidden", { value: 2, enumerable: false });
            const getter = {
                get g() {
                    return 5;
                },
                h: 1,
            };

            expect(_omitBy(hidden, () => false)).toEqual({ a: 1 });
            expect(_omitBy(getter, (value) => value === 1)).toEqual({ g: 5 });
        });

        it("keeps keys holding undefined and keeps values by reference", () => {
            const nested = { n: 1 };
            const array = [1];
            const result = _omitBy({ a: undefined, b: nested, c: array }, () => false);

            expect(result).toEqual({ a: undefined, b: nested, c: array });
            expect("a" in result).toBe(true);
            expect(result["b"]).toBe(nested);
            expect(result["c"]).toBe(array);
        });

        it("never writes __proto__ or constructor keys into the result", () => {
            const withProto = _omitBy(JSON.parse('{"__proto__": {"polluted": true}, "a": 1}'), () => false);
            const withConstructor = _omitBy(
                { constructor: { prototype: { polluted: true } }, a: 1 },
                () => false,
            );

            expect(Object.keys(withProto)).toEqual(["a"]);
            expect(Object.getPrototypeOf(withProto)).toBe(Object.prototype);
            expect(Object.keys(withConstructor)).toEqual(["a"]);
            expect(({} as { polluted?: boolean }).polluted).toBeUndefined();
        });
    });

    describe("sources", () => {
        it("returns an empty object for null and undefined", () => {
            expect(_omitBy(null, isNumber)).toEqual({});
            expect(_omitBy(undefined, isNumber)).toEqual({});
            expect(_omitBy({}, isNumber)).toEqual({});
        });

        it("maps arrays, arguments objects, typed arrays and strings to index keys", () => {
            expect(_omitBy([1, "a", 2], isNumber)).toEqual({ 1: "a" });
            expect(_omitBy(getArguments(1, "b", 3), isNumber)).toEqual({ 1: "b" });
            expect(_omitBy(new Uint8Array([1, 2, 3]), (value) => value === 2)).toEqual({ 0: 1, 2: 3 });
            expect(_omitBy("ab" as unknown as object, (value) => value === "a")).toEqual({ 1: "b" });
        });

        it("returns an empty object for a primitive without enumerable keys", () => {
            expect(_omitBy(5 as unknown as object, isNumber)).toEqual({});
        });

        it("works with null-prototype objects and functions carrying properties", () => {
            const nullProto = Object.assign(Object.create(null), { a: 1, b: "x" }) as {
                a: number;
                b: string;
            };
            const fn = Object.assign(function named(): void {}, { a: 1, b: "x" });

            expect(_omitBy(nullProto, isNumber)).toEqual({ b: "x" });
            expect(_omitBy(fn, isNumber)).toEqual({ b: "x" });
        });

        it("always returns a plain object", () => {
            expect(Object.getPrototypeOf(_omitBy([1], () => false))).toBe(Object.prototype);
            expect(Object.getPrototypeOf(_omitBy(Object.create(null), () => false))).toBe(Object.prototype);
        });
    });

    describe("typing", () => {
        it("keeps dictionaries as dictionaries and narrows objects to a partial", () => {
            const dictionary: Record<string, number> = _omitBy(
                { a: 1, b: 2 } as Record<string, number>,
                (v) => v > 1,
            );
            const numeric: { [index: number]: string } = _omitBy({ 0: "a", 1: "b" }, (v) => v === "a");
            const partial: Partial<{ a: number; b: string }> = _omitBy({ a: 1, b: "x" }, isNumber);

            expect(dictionary).toEqual({ a: 1 });
            expect(numeric).toEqual({ 1: "b" });
            expect(partial).toEqual({ b: "x" });
        });
    });
});
