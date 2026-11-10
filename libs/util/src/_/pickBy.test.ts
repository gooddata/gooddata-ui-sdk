// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _pickBy } from "./pickBy.js";

function getArguments(..._args: unknown[]): IArguments {
    // eslint-disable-next-line prefer-rest-params
    return arguments;
}

const isNumber = (value: unknown): boolean => typeof value === "number";

// Expected values match lodash-es@4.18.1 `pickBy`.
describe("pickBy", () => {
    describe("predicate", () => {
        it("keeps the properties the predicate returns truthy for, in a new object", () => {
            const object = { a: 1, b: "2", c: 3 };
            const result = _pickBy(object, isNumber);

            expect(result).toEqual({ a: 1, c: 3 });
            expect(result).not.toBe(object);
            expect(object).toEqual({ a: 1, b: "2", c: 3 });
        });

        it("invokes the predicate with the value and the key only, and an undefined this", () => {
            const seen: unknown[][] = [];
            const result = _pickBy({ a: 1, b: 2, c: 3 }, function (this: unknown, ...args: unknown[]) {
                seen.push([...args, this]);

                return args[1] === "b" || args[0] === 3;
            });

            expect(result).toEqual({ b: 2, c: 3 });
            expect(seen).toEqual([
                [1, "a", undefined],
                [2, "b", undefined],
                [3, "c", undefined],
            ]);
        });

        it("treats any truthy result as a hit", () => {
            expect(_pickBy({ a: 1, b: 2, c: 3 }, (value) => (value === 2 ? "yes" : 0))).toEqual({ b: 2 });
            expect(_pickBy({ a: 1, b: 2 }, () => true)).toEqual({ a: 1, b: 2 });
            expect(_pickBy({ a: 1, b: 2 }, () => false)).toEqual({});
        });

        it("keeps truthy values when the predicate is missing, undefined or null", () => {
            const object = { a: 1, b: 0, c: "", d: null, e: undefined, f: false, g: "x", h: NaN };

            expect(_pickBy(object)).toEqual({ a: 1, g: "x" });
            expect(_pickBy(object, undefined)).toEqual({ a: 1, g: "x" });
            expect(_pickBy(object, null as unknown as undefined)).toEqual({ a: 1, g: "x" });
        });

        it("accepts the property, deep property, matches and matchesProperty shorthands", () => {
            expect(_pickBy({ a: { active: true }, b: { active: false }, c: {} }, "active")).toEqual({
                a: { active: true },
            });
            expect(_pickBy({ a: { n: { ok: 1 } }, b: { n: { ok: 0 } } }, "n.ok")).toEqual({
                a: { n: { ok: 1 } },
            });
            expect(_pickBy({ a: { x: 1, y: 2 }, b: { x: 2 }, c: { x: 1 } }, { x: 1 })).toEqual({
                a: { x: 1, y: 2 },
                c: { x: 1 },
            });
            expect(_pickBy({ a: { x: 1 }, b: { x: 2 } }, ["x", 1])).toEqual({ a: { x: 1 } });
        });

        it("reads a non-function, non-shorthand predicate as a property name", () => {
            expect(_pickBy({ a: { 5: true }, b: { 5: false } }, 5 as unknown as string)).toEqual({
                a: { 5: true },
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

            expect(_pickBy(instance, isNumber)).toEqual({ own: 1, inherited: 2 });
            expect(Object.keys(_pickBy({ z: 1, a: 2, m: 3, 1: 4, 0: 5 }, () => true))).toEqual([
                "0",
                "1",
                "z",
                "a",
                "m",
            ]);
        });

        it("visits symbol keys and passes them to the predicate", () => {
            const sym = Symbol("s");
            const kept = _pickBy({ [sym]: 1, a: "x", b: 2 }, isNumber);
            const bySymbol = _pickBy({ [sym]: 1, a: 1 }, (_value, key) => typeof key === "symbol");

            expect(kept).toEqual({ [sym]: 1, b: 2 });
            expect(Reflect.ownKeys(kept)).toEqual(["b", sym]);
            expect(Reflect.ownKeys(bySymbol)).toEqual([sym]);
        });

        it("skips non-enumerable keys and reads getters", () => {
            const hidden = Object.defineProperty({ a: 1 }, "hidden", { value: 2, enumerable: false });
            const getter = {
                get g() {
                    return 5;
                },
                h: 1,
            };

            expect(_pickBy(hidden, () => true)).toEqual({ a: 1 });
            expect(_pickBy(getter, (value) => value === 5)).toEqual({ g: 5 });
        });

        it("keeps keys holding undefined and keeps values by reference", () => {
            const nested = { n: 1 };
            const array = [1];
            const result = _pickBy({ a: undefined, b: nested, c: array }, () => true);

            expect(result).toEqual({ a: undefined, b: nested, c: array });
            expect("a" in result).toBe(true);
            expect(result["b"]).toBe(nested);
            expect(result["c"]).toBe(array);
        });

        it("never writes __proto__ or constructor keys into the result", () => {
            const withProto = _pickBy(JSON.parse('{"__proto__": {"polluted": true}, "a": 1}'), () => true);
            const withConstructor = _pickBy(
                { constructor: { prototype: { polluted: true } }, a: 1 },
                () => true,
            );

            expect(Object.keys(withProto)).toEqual(["a"]);
            expect(Object.getPrototypeOf(withProto)).toBe(Object.prototype);
            expect(Object.keys(withConstructor)).toEqual(["a"]);
            expect(({} as { polluted?: boolean }).polluted).toBeUndefined();
        });
    });

    describe("sources", () => {
        it("returns an empty object for null and undefined", () => {
            expect(_pickBy(null, isNumber)).toEqual({});
            expect(_pickBy(undefined, isNumber)).toEqual({});
            expect(_pickBy({}, isNumber)).toEqual({});
        });

        it("maps arrays, arguments objects, typed arrays and strings to index keys", () => {
            expect(_pickBy([1, "a", 2], isNumber)).toEqual({ 0: 1, 2: 2 });
            expect(_pickBy(getArguments(1, "b", 3), isNumber)).toEqual({ 0: 1, 2: 3 });
            expect(_pickBy(new Uint8Array([1, 2, 3]), (value) => value !== 2)).toEqual({ 0: 1, 2: 3 });
            expect(_pickBy("ab" as unknown as object, (value) => value === "a")).toEqual({ 0: "a" });
        });

        it("returns an empty object for a primitive without enumerable keys", () => {
            expect(_pickBy(5 as unknown as object, isNumber)).toEqual({});
        });

        it("works with null-prototype objects and functions carrying properties", () => {
            const nullProto = Object.assign(Object.create(null), { a: 1, b: "x" }) as {
                a: number;
                b: string;
            };
            const fn = Object.assign(function named(): void {}, { a: 1, b: "x" });

            expect(_pickBy(nullProto, isNumber)).toEqual({ a: 1 });
            expect(_pickBy(fn, isNumber)).toEqual({ a: 1 });
        });

        it("always returns a plain object", () => {
            expect(Object.getPrototypeOf(_pickBy([1], () => true))).toBe(Object.prototype);
            expect(Object.getPrototypeOf(_pickBy(Object.create(null), () => true))).toBe(Object.prototype);
        });
    });

    describe("typing", () => {
        it("keeps dictionaries as dictionaries and narrows objects to a partial", () => {
            const dictionary: Record<string, number> = _pickBy(
                { a: 1, b: 2 } as Record<string, number>,
                (v) => v > 1,
            );
            const numeric: { [index: number]: string } = _pickBy({ 0: "a", 1: "b" }, (v) => v === "a");
            const partial: Partial<{ a: number; b: string }> = _pickBy({ a: 1, b: "x" }, isNumber);

            expect(dictionary).toEqual({ b: 2 });
            expect(numeric).toEqual({ 0: "a" });
            expect(partial).toEqual({ a: 1 });
        });
    });
});
