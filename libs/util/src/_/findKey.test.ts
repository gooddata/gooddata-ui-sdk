// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _findKey } from "./findKey.js";

function getArguments(..._args: unknown[]): IArguments {
    // eslint-disable-next-line prefer-rest-params
    return arguments;
}

interface IUser {
    age: number;
    active: boolean;
}

const users: Record<string, IUser> = {
    barney: { age: 36, active: true },
    fred: { age: 40, active: false },
    pebbles: { age: 1, active: true },
};

// Expected values match lodash-es@4.18.1 `findKey`.
describe("findKey", () => {
    describe("predicate", () => {
        it("returns the key of the first own property the predicate matches, in key order", () => {
            expect(_findKey(users, (user) => user.age < 40)).toBe("barney");
            expect(_findKey({ a: 1, b: 2, c: 2 }, (value) => value === 2)).toBe("b");
            expect(_findKey({ b: 1, a: 2, 1: 3, 0: 4 }, () => true)).toBe("0");
            expect(_findKey({ 2: 1 }, () => true)).toBe("2");

            const truthy = (value: number) => (value === 2 ? "yes" : 0) as unknown as boolean;

            expect(_findKey({ a: 1, b: 2 }, truthy)).toBe("b");
        });

        it("returns undefined when nothing matches or there is nothing to inspect", () => {
            expect(_findKey(users, (user) => user.age > 100)).toBeUndefined();
            expect(_findKey({}, () => true)).toBeUndefined();
            expect(_findKey(null, () => true)).toBeUndefined();
            expect(_findKey(undefined, () => true)).toBeUndefined();
            expect((_findKey as unknown as () => undefined)()).toBeUndefined();
        });

        it("accepts matches, matches-property, property path and identity shorthands", () => {
            expect(_findKey(users, { age: 1, active: true })).toBe("pebbles");
            expect(_findKey(users, ["active", false])).toBe("fred");
            expect(_findKey(users, "active")).toBe("barney");
            expect(_findKey({ x: { a: { b: 0 } }, y: { a: { b: 1 } } }, "a.b")).toBe("y");
            expect(_findKey({ a: 0, b: "", c: 1, d: 2 })).toBe("c");
            expect(_findKey({ a: 0, b: 1 }, undefined)).toBe("b");
            expect(_findKey({ a: 0, b: 1 }, null as unknown as undefined)).toBe("b");
        });

        it("passes (value, key, object) with an undefined this and stops at the match", () => {
            const calls: unknown[][] = [];
            const bindings: unknown[] = [];
            const object = { a: 1, b: 2, c: 3 };

            _findKey(object, function (this: unknown, value, key, collection) {
                calls.push([value, key, collection]);
                bindings.push(this);

                return value === 2;
            });

            expect(calls).toEqual([
                [1, "a", object],
                [2, "b", object],
            ]);
            expect(bindings).toEqual([undefined, undefined]);
        });

        it("propagates errors thrown by the predicate", () => {
            expect(() =>
                _findKey({ a: 1 }, () => {
                    throw new RangeError("boom");
                }),
            ).toThrow(RangeError);
        });
    });

    describe("objects", () => {
        it("inspects own enumerable string keys only, reading getters", () => {
            let reads = 0;
            const withGetter = {
                get a() {
                    reads++;

                    return 1;
                },
            };

            const withInherited = Object.assign(Object.create({ inherited: 1 }), { own: 2 });
            const hidden = Object.defineProperty({}, "h", { value: 1, enumerable: false });

            expect(_findKey(withInherited, () => true)).toBe("own");
            expect(_findKey(Object.create({ inherited: 1 }), () => true)).toBeUndefined();
            expect(_findKey({ [Symbol("s")]: 1 }, () => true)).toBeUndefined();
            expect(_findKey(hidden, () => true)).toBeUndefined();
            expect(_findKey(withGetter, () => true)).toBe("a");
            expect(reads).toBe(1);
        });

        it("walks arrays, strings, array-likes, arguments objects and typed arrays by index", () => {
            const seen: unknown[][] = [];

            // lodash types array values as the union with the array methods, hence the cast
            expect(_findKey([3, 5, 7], (value) => (value as number) > 4)).toBe("1");
            expect(_findKey(Object.assign([1], { extra: true }), (value) => value === true)).toBe("extra");
            // oxlint-disable-next-line no-sparse-arrays
            expect(_findKey([1, , 3], (value) => value === undefined)).toBe("1");
            expect(_findKey("abc" as unknown as string[], (char) => char === "b")).toBe("1");
            expect(_findKey({ length: 2, 0: "a", 1: "b" }, (value) => value === "b")).toBe("1");
            // a plain array-like object is walked over all its own keys, so `length` is a candidate too
            expect(_findKey({ length: 2, 0: "a", 1: "b" }, (value) => value === 2)).toBe("length");
            expect(_findKey(getArguments(1, 2), (value) => value === 2)).toBe("1");
            expect(_findKey(new Uint8Array([1, 2]), (value) => value === 2)).toBe("1");
            _findKey("ab" as unknown as string[], (value, key, collection) => {
                seen.push([value, key, collection instanceof String]);

                return false;
            });
            expect(seen).toEqual([
                ["a", "0", true],
                ["b", "1", true],
            ]);
        });

        it("finds nothing in falsy, primitive and keyless objects", () => {
            expect(_findKey(0 as unknown as object, () => true)).toBeUndefined();
            expect(_findKey("" as unknown as string[], () => true)).toBeUndefined();
            expect(_findKey(false as unknown as object, () => true)).toBeUndefined();
            expect(_findKey(5 as unknown as object, () => true)).toBeUndefined();
            expect(_findKey(new Map([[1, 2]]), () => true)).toBeUndefined();
            expect(_findKey(new Set([1]), () => true)).toBeUndefined();
            expect(_findKey(new Date(0), () => true)).toBeUndefined();
            expect(_findKey(Object(5), () => true)).toBeUndefined();
        });

        it("inspects class instances, functions with properties and null-prototype objects", () => {
            class Counter {
                a = 1;

                method(): void {
                    // own enumerable keys only, methods on the prototype are skipped
                }
            }

            expect(_findKey(new Counter(), () => true)).toBe("a");
            expect(
                _findKey(
                    Object.assign(() => 1, { x: 1 }),
                    () => true,
                ),
            ).toBe("x");
            expect(_findKey(Object.assign(Object.create(null), { a: 1 }), () => true)).toBe("a");
        });

        it("leaves the object untouched and ignores extra arguments", () => {
            const object = { a: 1 };

            _findKey(object, () => true);
            expect(object).toEqual({ a: 1 });

            const withExtra = _findKey as unknown as (o: object, p: () => boolean, x: string) => string;

            expect(withExtra(object, () => true, "x")).toBe("a");
        });
    });

    describe("typing", () => {
        it("returns a string or undefined and types the predicate by the object values", () => {
            const key: string | undefined = _findKey(users, (user) => user.active && user.age > 10);

            expect(key).toBe("barney");
        });
    });
});
