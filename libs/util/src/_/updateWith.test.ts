// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _updateWith } from "./updateWith.js";

const increment = (value: number | undefined): number => (value === undefined ? 1 : value + 1);

// Expected values match lodash-es@4.18.1 `updateWith`.
describe("updateWith", () => {
    describe("updating", () => {
        it("sets the updater result at the path and returns the same object", () => {
            const object = { a: { b: 1 } };

            expect(_updateWith(object, "a.b", increment)).toBe(object);
            expect(object).toEqual({ a: { b: 2 } });
            expect(_updateWith({ a: {} }, "a.b", increment)).toEqual({ a: { b: 1 } });
            expect(_updateWith({}, "a.b.c", increment)).toEqual({ a: { b: { c: 1 } } });
            expect(_updateWith({}, ["a", 0, "b"], increment)).toEqual({ a: [{ b: 1 }] });
            expect(_updateWith([1, 2], "[1]", increment)).toEqual([1, 3]);
            expect(_updateWith([], "[2]", () => "x")).toEqual([undefined, undefined, "x"]);
        });

        it("invokes the updater with the current value only and an undefined this", () => {
            const calls: unknown[][] = [];
            const bindings: unknown[] = [];

            _updateWith({ a: 1 }, "a", function (this: unknown, ...args: unknown[]) {
                calls.push(args);
                bindings.push(this);

                return 2;
            });
            _updateWith({}, "missing", (...args: unknown[]) => {
                calls.push(args);

                return 0;
            });

            expect(calls).toEqual([[1], [undefined]]);
            expect(bindings).toEqual([undefined]);
        });

        it("treats anything but a function as the identity updater", () => {
            expect(_updateWith({ a: 1 }, "a", "x" as unknown as () => number)).toEqual({ a: 1 });
            expect(_updateWith({ a: 1 }, "a", null as unknown as () => number)).toEqual({ a: 1 });
            expect(_updateWith({ a: 1 }, "a", undefined as unknown as () => number)).toEqual({ a: 1 });
            expect(_updateWith({}, "a.b", undefined as unknown as () => number)).toEqual({
                a: { b: undefined },
            });
        });

        it("stores undefined results and propagates updater errors", () => {
            const result = _updateWith({ a: 1 }, "a", () => undefined);

            expect(result).toEqual({ a: undefined });
            expect("a" in result).toBe(true);
            expect(() =>
                _updateWith({ a: 1 }, "a", () => {
                    throw new RangeError("boom");
                }),
            ).toThrow(RangeError);
        });
    });

    describe("customizer", () => {
        it("uses the customizer result as the container for intermediate keys", () => {
            const box = { tagged: true };
            type Tagged = { a: { tagged: boolean; b: number } };

            const result = _updateWith<object, Tagged>({}, "a.b", increment, () => box);

            expect(_updateWith({}, "[0][1]", () => "a", Object)).toEqual({ 0: { 1: "a" } });
            // the given root stays an object, only the containers created below it follow the index rule
            expect(_updateWith({}, "[0][1]", () => "a")).toEqual({ 0: [undefined, "a"] });
            expect(_updateWith({}, "a[0].b", increment, Object)).toEqual({ a: { 0: { b: 1 } } });
            expect(result.a).toBe(box);
            expect(result).toEqual({ a: { tagged: true, b: 1 } });
        });

        it("falls back to the default container when the customizer returns undefined", () => {
            expect(_updateWith({}, "a.b", increment, () => undefined)).toEqual({ a: { b: 1 } });
            expect(_updateWith({ a: { x: 1 } }, "a.b", increment, (value) => value)).toEqual({
                a: { x: 1, b: 1 },
            });
            expect(_updateWith({ a: { x: 1 } }, "a.b", increment, () => ({ fresh: true }))).toEqual({
                a: { fresh: true, b: 1 },
            });
        });

        it("passes (nsValue, key, nsObject) with an undefined this, skipping the last key", () => {
            const calls: unknown[][] = [];
            const bindings: unknown[] = [];
            const object = { a: { b: {} } };
            let lastKeyCalls = 0;

            _updateWith(object, "a.b.c", increment, function (this: unknown, value, key, nsObject) {
                calls.push([value, key, nsObject]);
                bindings.push(this);

                return undefined;
            });
            _updateWith({}, "a", increment, () => {
                lastKeyCalls++;

                return undefined;
            });

            expect(calls).toEqual([
                [object.a, "a", object],
                [object.a.b, "b", object.a],
            ]);
            expect(bindings).toEqual([undefined, undefined]);
            expect(lastKeyCalls).toBe(0);
        });

        it("ignores a customizer that is not a function", () => {
            const text = "x" as unknown as () => object;
            const nothing = null as unknown as () => object;
            const empty = {} as unknown as () => object;

            expect(_updateWith({}, "a.b", increment, text)).toEqual({ a: { b: 1 } });
            expect(_updateWith({}, "a.b", increment, nothing)).toEqual({ a: { b: 1 } });
            expect(_updateWith({}, "a.b", increment, empty)).toEqual({ a: { b: 1 } });
        });

        it("assigns a null or array container as it is, and a primitive one makes the next key throw", () => {
            expect(() => _updateWith({}, "a.b", increment, () => 5)).toThrow(TypeError);
            expect(_updateWith({}, "a.b", increment, () => null)).toEqual({ a: null });
            expect(_updateWith({}, "a.b", increment, () => [])).toEqual({ a: Object.assign([], { b: 1 }) });
        });
    });

    describe("paths and objects", () => {
        it("creates arrays for index segments and objects otherwise, keeping existing containers", () => {
            expect(_updateWith({}, "a[0].b", increment)).toEqual({ a: [{ b: 1 }] });
            expect(_updateWith({}, "a.0", increment)).toEqual({ a: [1] });
            expect(_updateWith({}, "a[-1]", increment)).toEqual({ a: { "-1": 1 } });
            // lodash treats any integer below the safe range as an index, so this still creates an array
            expect(_updateWith({}, "a[4294967296]", increment)).toEqual({
                a: Object.assign([], { 4294967296: 1 }),
            });
            expect(_updateWith({ a: [] }, "a.b", increment)).toEqual({ a: Object.assign([], { b: 1 }) });
            expect(_updateWith({ a: null }, "a.b", increment)).toEqual({ a: { b: 1 } });
            expect(_updateWith({ a: 5 }, "a.b", increment)).toEqual({ a: { b: 1 } });
            expect(_updateWith({ a: "str" }, "a.b", increment)).toEqual({ a: { b: 1 } });
        });

        it("accepts string, array, symbol and number paths, including quoted and dotted keys", () => {
            const symbol = Symbol("s");

            expect(_updateWith({}, 'a["b.c"]', increment)).toEqual({ a: { "b.c": 1 } });
            expect(_updateWith({ "a.b": 1 }, "a.b", increment)).toEqual({ "a.b": 2 });
            expect(_updateWith({ "a.b": 1 }, ["a.b"], increment)).toEqual({ "a.b": 2 });
            expect(_updateWith({}, symbol, () => 1)).toEqual({ [symbol]: 1 });
            expect(_updateWith({}, 0, () => "x")).toEqual({ 0: "x" });
            expect(_updateWith({ a: 1 }, "", () => 9)).toEqual({ a: 1, "": 9 });
            expect(_updateWith({ a: 1 }, [], () => 9)).toEqual({ a: 1 });
        });

        it("never writes through __proto__, constructor or prototype keys", () => {
            const result = _updateWith({}, "__proto__.polluted", () => 1);

            expect(result).toEqual({});
            expect(({} as Record<string, unknown>)["polluted"]).toBeUndefined();
            expect(_updateWith({}, "constructor.prototype.x", () => 1)).toEqual({});
            expect(_updateWith({}, "prototype.x", () => 1)).toEqual({});
            expect(_updateWith({}, "a.__proto__.b", () => 1)).toEqual({ a: {} });
        });

        it("returns nullish and primitive objects unchanged and updates functions", () => {
            const fn = Object.assign(() => 1, { a: 0 });

            expect(_updateWith(null as unknown as object, "a", increment)).toBeNull();
            expect(_updateWith(undefined as unknown as object, "a", increment)).toBeUndefined();
            expect(_updateWith(1 as unknown as object, "a", increment)).toBe(1);
            expect(_updateWith("s" as unknown as object, "a", increment)).toBe("s");
            expect(_updateWith(fn, "a", increment)).toBe(fn);
            expect(fn.a).toBe(1);
        });

        it("skips the assignment when the value is already there, else throws on a frozen object", () => {
            const frozen = Object.freeze({ a: 1 });

            expect(_updateWith(frozen, "a", () => 1)).toBe(frozen);
            expect(() => _updateWith(frozen, "a", increment)).toThrow(TypeError);
        });

        it("ignores extra arguments", () => {
            const withExtra = _updateWith as unknown as (...args: unknown[]) => object;

            expect(withExtra({}, "a", increment, Object, "x")).toEqual({ a: 1 });
        });
    });

    describe("typing", () => {
        it("returns the object type, or a given result type", () => {
            const same: { a: number } = _updateWith({ a: 1 }, "a", increment);
            const other = _updateWith<object, { a: { b: number } }>({}, "a.b", increment);

            expect(same).toEqual({ a: 2 });
            expect(other).toEqual({ a: { b: 1 } });
        });
    });
});
