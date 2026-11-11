// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _mergeWith } from "./mergeWith.js";

function getArguments(..._args: unknown[]): IArguments {
    // eslint-disable-next-line prefer-rest-params
    return arguments;
}

function concatArrays(objValue: unknown, srcValue: unknown): unknown {
    return Array.isArray(objValue) ? objValue.concat(srcValue) : undefined;
}

class Point {
    constructor(public x: number) {}
}

interface ICyclicArrays {
    a: number[];
    self?: ICyclicArrays;
}

interface ICyclic {
    a: number;
    self?: ICyclic;
}

// Expected values match lodash-es@4.18.1 `mergeWith`.
describe("mergeWith", () => {
    describe("customizer", () => {
        it("uses the customizer result as the merged value", () => {
            const object = { a: [1], b: [2] };
            const other = { a: [3], b: [4] };

            expect(_mergeWith(object, other, concatArrays)).toEqual({ a: [1, 3], b: [2, 4] });
            expect(_mergeWith({ a: 1 }, { a: 2 }, (objValue, srcValue) => objValue + srcValue)).toEqual({
                a: 3,
            });
        });

        it("falls back to the default merge when the customizer returns undefined", () => {
            expect(_mergeWith({ a: { b: 1 } }, { a: { c: 2 } }, () => undefined)).toEqual({
                a: { b: 1, c: 2 },
            });
            expect(
                _mergeWith({ a: { b: { c: 1 } } }, { a: { b: { d: 2 } } }, (_objValue, _srcValue, key) =>
                    key === "d" ? "custom" : undefined,
                ),
            ).toEqual({ a: { b: { c: 1, d: "custom" } } });
        });

        it("treats any other customizer result as the value, including null and 0", () => {
            expect(_mergeWith({ a: 1 }, { a: 2 }, () => null)).toEqual({ a: null });
            expect(_mergeWith({ a: 1 }, { a: 2 }, () => 0)).toEqual({ a: 0 });
            expect(_mergeWith({ a: 1 }, { a: 2 }, () => false)).toEqual({ a: false });
            expect(_mergeWith({ a: 1 }, { a: 2 }, () => "")).toEqual({ a: "" });
        });

        it("keeps a returned destination or source value by reference", () => {
            const destinationArray = [1];
            const sourceArray = [2];

            const keepsDestination = _mergeWith({ a: destinationArray }, { a: [2] }, (objValue) => objValue);
            const keepsSource = _mergeWith({ a: [1] }, { a: sourceArray }, (_objValue, srcValue) => srcValue);

            expect(keepsDestination.a).toBe(destinationArray);
            expect(keepsSource.a).toBe(sourceArray);
        });

        it("invokes the customizer with (objValue, srcValue, key, object, source, stack)", () => {
            const calls: unknown[][] = [];
            const destination = { a: 1, nested: { x: 1 } };
            const source = { a: 2, nested: { x: 2 }, added: 3 };

            _mergeWith(destination, source, (objValue, srcValue, key, object, origin, stack) => {
                calls.push([objValue, srcValue, key, object, origin, typeof stack]);
            });

            // the nested destination object is merged in place, so the recorded reference shows its final state
            expect(calls).toEqual([
                [1, 2, "a", destination, source, "object"],
                [{ x: 2 }, { x: 2 }, "nested", destination, source, "object"],
                [1, 2, "x", destination.nested, source.nested, "object"],
                [undefined, 3, "added", destination, source, "object"],
            ]);
        });

        it("passes array indices as string keys and exposes the traversal stack", () => {
            const keys: unknown[][] = [];
            const seen: unknown[][] = [];
            const source = { a: { b: { c: 1 } } };

            _mergeWith([1, 2], [3, 4], (_objValue, _srcValue, key) => {
                keys.push([key, typeof key]);
            });
            _mergeWith({}, source, (_objValue, _srcValue, key, _object, _source, stack) => {
                seen.push([key, stack.has(source), stack.has(source.a), stack.has(source.a.b)]);
            });

            expect(keys).toEqual([
                ["0", "string"],
                ["1", "string"],
            ]);
            expect(seen).toEqual([
                ["a", false, false, false],
                ["b", false, true, false],
                ["c", false, true, true],
            ]);
        });

        it("applies the customizer to nested array elements and nested objects", () => {
            expect(
                _mergeWith({ a: [1, 2, 3] }, { a: [9] }, (objValue, srcValue) =>
                    typeof objValue === "number" ? objValue * 10 + srcValue : undefined,
                ),
            ).toEqual({ a: [19, 2, 3] });
            expect(_mergeWith({ x: { a: [1] } }, { x: { a: [2] } }, concatArrays)).toEqual({
                x: { a: [1, 2] },
            });
            expect(_mergeWith({ a: [{ b: 1 }, { c: 2 }] }, { a: [{ d: 3 }] }, concatArrays)).toEqual({
                a: [{ b: 1 }, { c: 2 }, { d: 3 }],
            });
        });

        it("lets the customizer convert typed arrays", () => {
            expect(
                _mergeWith({}, { a: new Uint8Array([9, 8]) }, (_objValue, srcValue) =>
                    ArrayBuffer.isView(srcValue) ? Array.from(srcValue as Uint8Array) : undefined,
                ),
            ).toEqual({ a: [9, 8] });
        });

        it("lets the customizer mutate the destination it receives", () => {
            const result = _mergeWith({ a: [1] }, { a: [2] }, (_objValue, _srcValue, key, object) => {
                if (key === "a") {
                    object.touched = true;
                }

                return undefined;
            });

            expect(result).toEqual({ a: [2], touched: true });
        });

        it("applies the customizer across several sources, left to right", () => {
            expect(_mergeWith({ a: [1] }, { a: [2] }, { a: [3] }, concatArrays)).toEqual({ a: [1, 2, 3] });
            expect(_mergeWith({}, { 0: [0] }, { 1: [1] }, { 2: [2] }, { 3: [3] }, concatArrays)).toEqual({
                0: [0],
                1: [1],
                2: [2],
                3: [3],
            });
        });

        it("recreates cycles while a customizer is in use", () => {
            const source: ICyclicArrays = { a: [1] };
            source.self = source;

            const result = _mergeWith({ a: [0] }, source, concatArrays);

            // the top-level source is not on the stack, so its self reference becomes a fresh copy with its own cycle
            expect(result.a).toEqual([0, 1]);
            expect(result.self).not.toBe(result);
            expect(result.self?.a).toEqual([1]);
            expect(result.self?.self).toBe(result.self);
        });
    });

    describe("argument handling", () => {
        it("merges without a customizer when the last argument is not a function", () => {
            expect(_mergeWith({ a: [1] }, { a: [3] })).toEqual({ a: [3] });
            expect(_mergeWith({ a: [1] }, { a: [2] }, { a: [3] })).toEqual({ a: [3] });
            expect(_mergeWith({ a: 1 }, { b: 2 }, "str")).toEqual({ a: 1, b: 2, 0: "s", 1: "t", 2: "r" });
        });

        it("treats a function in the middle as a source, not as the customizer", () => {
            const fn = Object.assign(() => 1, { b: 2 });

            expect(
                _mergeWith({ a: 1 }, fn, { c: 3 }, (_objValue, _srcValue, key) =>
                    key === "b" ? "fnprop" : undefined,
                ),
            ).toEqual({ a: 1, b: "fnprop", c: 3 });
        });

        it("merges only the destination when given just a customizer or nothing", () => {
            expect(_mergeWith({ a: 1 }, concatArrays)).toEqual({ a: 1 });
            expect(_mergeWith({ a: 1 })).toEqual({ a: 1 });
        });

        it("ignores the index and collection when used as a reduce or map callback", () => {
            const sources = [{ a: 1 }, { b: 2 }];

            expect(sources.map((source, index) => _mergeWith({}, source, index, sources))).toEqual([
                { a: 1 },
                { b: 2 },
            ]);
            expect(
                sources.reduce((acc, source, index) => _mergeWith(acc, source, index, sources), { seed: 1 }),
            ).toEqual({
                seed: 1,
                a: 1,
                b: 2,
            });
        });

        it("keeps the customizer and merges only the first source when the collection is the guard", () => {
            const source = { a: [2] };

            expect(_mergeWith({ a: [1] }, source, 0, [source], concatArrays)).toEqual({ a: [1, 2] });
            expect(_mergeWith({ a: [1] }, source, 0, [source])).toEqual({ a: [2] });
        });

        it("does not treat a plain object third argument as an iteratee guard", () => {
            expect(_mergeWith({ a: 1 }, { b: 2 }, 1, { c: 3 })).toEqual({ a: 1, b: 2, c: 3 });
        });

        it("returns the destination and mutates it in place", () => {
            const destination = { a: { b: 1 } };
            const inner = destination.a;

            expect(_mergeWith(destination, { a: { c: 2 } }, concatArrays)).toBe(destination);
            expect(destination.a).toBe(inner);
            expect(destination).toEqual({ a: { b: 1, c: 2 } });
        });

        it("creates a new object for a nullish destination and boxes a primitive one", () => {
            expect(_mergeWith(null, { a: 1 }, concatArrays)).toEqual({ a: 1 });
            expect(_mergeWith(undefined, { a: 1 }, concatArrays)).toEqual({ a: 1 });

            const boxed = _mergeWith(3, { a: 1 }, concatArrays);

            expect(typeof boxed).toBe("object");
            expect(boxed.a).toBe(1);
            expect(Number(boxed)).toBe(3);
        });

        it("skips nullish and other falsy sources", () => {
            expect(_mergeWith({ a: 1 }, null, { b: 2 }, undefined, 0, "", false, concatArrays)).toEqual({
                a: 1,
                b: 2,
            });
        });
    });

    describe("default merging through the customizer path", () => {
        it("skips undefined source values on existing keys and merges inherited keys", () => {
            const proto = { inherited: 1 };
            const source = Object.assign(Object.create(proto), { own: 2 });

            expect(_mergeWith({ a: 1 }, { a: undefined }, () => undefined)).toEqual({ a: 1 });
            expect(_mergeWith({}, { a: undefined }, () => undefined)).toEqual({ a: undefined });
            expect(_mergeWith({}, source, () => undefined)).toEqual({ inherited: 1, own: 2 });
        });

        it("copies typed arrays and buffers, and merges them by index into arrays", () => {
            const typedCopy = _mergeWith({}, { a: new Uint8Array([9, 8]) }, () => undefined);
            const bufferCopy = _mergeWith({}, { a: Buffer.from([1, 2]) }, () => undefined);

            expect(typedCopy.a).toBeInstanceOf(Uint8Array);
            expect(Array.from(typedCopy.a as Uint8Array)).toEqual([9, 8]);
            expect(Buffer.isBuffer(bufferCopy.a)).toBe(true);
            expect(Array.from(bufferCopy.a as Buffer)).toEqual([1, 2]);
            expect(_mergeWith({ a: [1, 2, 3] }, { a: new Uint8Array([9]) }, () => undefined)).toEqual({
                a: [9, 2, 3],
            });

            // lodash-es stubs `isBuffer` in its ESM build, so a buffer merges like a typed array by index
            const intoArray = _mergeWith({ a: [7, 7, 7] }, { a: Buffer.from([1]) }, () => undefined);

            expect(Array.from(intoArray.a)).toEqual([1, 7, 7]);
        });

        it("converts arguments objects and array-likes, and handles plain objects against arrays", () => {
            expect(_mergeWith({ a: { x: 0 } }, { a: getArguments(1, 2) }, () => undefined)).toEqual({
                a: { x: 0, 0: 1, 1: 2 },
            });
            expect(_mergeWith({ a: getArguments(1, 2) }, { a: { 1: "b" } }, () => undefined)).toEqual({
                a: { 0: 1, 1: "b" },
            });
            expect(_mergeWith({ a: { length: 2, 0: "a", 1: "b" } }, { a: [1] }, () => undefined)).toEqual({
                a: [1, "b"],
            });
            expect(_mergeWith({ a: [1, 2] }, { a: { 0: "x" } }, () => undefined)).toEqual({ a: ["x", 2] });
            expect(_mergeWith({ a: { 0: "x", k: 1 } }, { a: [1, 2] }, () => undefined)).toEqual({
                a: [1, 2],
            });
        });

        it("assigns class instances, dates and functions by reference and merges into instances", () => {
            const point = new Point(1);
            const date = new Date(5);
            const fn = () => 1;

            const assigned = _mergeWith(
                { a: { y: 2 }, d: {}, f: { x: 1 } },
                { a: point, d: date, f: fn },
                () => undefined,
            );
            const intoInstance = _mergeWith({ a: new Point(1) }, { a: { y: 2 } }, () => undefined);

            expect(assigned.a).toBe(point);
            expect(assigned.d).toBe(date);
            expect(assigned.f).toBe(fn);
            expect(intoInstance.a).toBeInstanceOf(Point);
            expect(intoInstance.a).toEqual(Object.assign(new Point(1), { y: 2 }));
            expect(_mergeWith({ a: () => 1 }, { a: { x: 1 } }, () => undefined)).toEqual({ a: { x: 1 } });
        });

        it("ignores __proto__ keys and never touches Object.prototype", () => {
            const result = _mergeWith({}, JSON.parse('{"__proto__":{"polluted":1}}'), () => undefined);

            expect(result).toEqual({});
            expect(({} as Record<string, unknown>)["polluted"]).toBeUndefined();
            expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
        });

        it("recreates cycles and copies a shared source object once per key", () => {
            const shared = { v: 1 };
            const cyclic: ICyclic = { a: 1 };
            cyclic.self = cyclic;

            const withCycle = _mergeWith({}, cyclic, () => undefined);
            const withShared = _mergeWith({}, { a: shared, b: shared }, () => undefined);

            expect(withCycle.self).not.toBe(withCycle);
            expect(withCycle.self?.self).toBe(withCycle.self);
            // the stack only tracks the active recursion path, so siblings sharing a source object get separate copies
            expect(withShared.a).toEqual(shared);
            expect(withShared.a).not.toBe(shared);
            expect(withShared.a).not.toBe(withShared.b);
        });
    });

    describe("typing", () => {
        it("types the result as the intersection of the destination and the sources", () => {
            const result: { a: number[]; b: string } = _mergeWith({ a: [1] }, { b: "x" }, concatArrays);
            const three: { a: number; b: number; c: number } = _mergeWith(
                { a: 1 },
                { b: 2 },
                { c: 3 },
                concatArrays,
            );

            expect(result).toEqual({ a: [1], b: "x" });
            expect(three).toEqual({ a: 1, b: 2, c: 3 });
        });
    });
});
