// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _clone } from "./clone.js";

function getArguments(..._args: unknown[]): IArguments {
    // eslint-disable-next-line prefer-rest-params
    return arguments;
}

class Point {
    constructor(public x: number) {}
}

class Items extends Array<number> {}

// Expected values match lodash-es@4.18.1 `clone`.
describe("clone", () => {
    describe("shallow semantics", () => {
        it("returns a new object whose nested values are the same references", () => {
            const nested = { c: 2 };
            const source = { a: 1, b: nested };
            const result = _clone(source);

            expect(result).toEqual(source);
            expect(result).not.toBe(source);
            expect(result.b).toBe(nested);
        });

        it("returns a new array whose elements are the same references", () => {
            const inner = [2];
            const object = { a: 3 };
            const source = [1, inner, object];
            const result = _clone(source);

            expect(result).toEqual(source);
            expect(result).not.toBe(source);
            expect(result[1]).toBe(inner);
            expect(result[2]).toBe(object);
        });

        it("leaves the source untouched when the clone is mutated at the top level only", () => {
            const source = { a: 1, n: { b: 2 } };
            const result = _clone(source);

            result.a = 9;
            result.n.b = 9;

            expect(source.a).toBe(1);
            expect(source.n.b).toBe(9);
        });

        it("keeps a cycle pointing at the original object", () => {
            const source: { a: number; self?: unknown } = { a: 1 };
            source.self = source;

            const result = _clone(source);

            expect(result).not.toBe(source);
            expect(result.self).toBe(source);
        });

        it("keeps functions nested in objects by reference", () => {
            const fn = () => 1;

            expect(_clone({ f: fn }).f).toBe(fn);
        });
    });

    describe("primitives and functions", () => {
        it("returns primitives as they are", () => {
            expect(_clone(1)).toBe(1);
            expect(_clone("a")).toBe("a");
            expect(_clone(true)).toBe(true);
            expect(_clone(null)).toBeNull();
            expect(_clone(undefined)).toBeUndefined();
            expect(_clone(NaN)).toBeNaN();
            expect(Object.is(_clone(-0), -0)).toBe(true);
            expect(_clone(10n)).toBe(10n);

            const symbol = Symbol("s");

            expect(_clone(symbol)).toBe(symbol);
        });

        it("returns a plain object with the own properties of a function", () => {
            expect(_clone(() => 1)).toEqual({});
            expect(typeof _clone(() => 1)).toBe("object");
            expect(_clone(Object.assign(() => 1, { a: 1 }))).toEqual({ a: 1 });
        });

        it("returns an empty object for generator functions, errors, weak collections and promises", () => {
            expect(_clone(function* () {})).toEqual({});
            expect(_clone(new Error("e"))).toEqual({});
            expect(_clone(new TypeError("t"))).toEqual({});
            expect(_clone(new WeakMap())).toEqual({});
            expect(_clone(new WeakSet())).toEqual({});
            expect(_clone(Promise.resolve(1))).toEqual({});
            expect(_clone(Math)).toEqual({});
        });
    });

    describe("objects", () => {
        it("copies own enumerable string and symbol keys only", () => {
            const symbol = Symbol("k");
            const hiddenSymbol = Symbol("hidden");
            const source = Object.defineProperties(
                { a: 1, [symbol]: 2 },
                { hidden: { value: 3, enumerable: false }, [hiddenSymbol]: { value: 4, enumerable: false } },
            );
            const result = _clone(source);

            expect(result).toEqual({ a: 1, [symbol]: 2 });
            expect(Reflect.ownKeys(result)).toEqual(["a", symbol]);
            expect(_clone(Object.assign(Object.create({ inherited: 1 }), { own: 2 }))).toEqual({ own: 2 });
        });

        it("evaluates getters and keeps key order", () => {
            const result = _clone({
                get a() {
                    return 1;
                },
            });

            expect(Object.getOwnPropertyDescriptor(result, "a")?.value).toBe(1);
            expect(Object.keys(_clone({ b: 1, a: 2, 1: 3, 0: 4 }))).toEqual(["0", "1", "b", "a"]);
        });

        it("keeps the prototype of class instances and turns null-prototype objects into plain ones", () => {
            const point = new Point(1);
            const result = _clone(point);

            expect(result).not.toBe(point);
            expect(result).toBeInstanceOf(Point);
            expect(result.x).toBe(1);

            const nullProto = Object.assign(Object.create(null), { a: 1 });

            expect(Object.getPrototypeOf(_clone(nullProto))).toBe(Object.prototype);
            expect(_clone(nullProto)).toEqual({ a: 1 });
        });

        it("clones a frozen object into a writable one and unwraps proxies", () => {
            expect(Object.isFrozen(_clone(Object.freeze({ a: 1 })))).toBe(false);

            const target = { a: 1 };
            const proxy = new Proxy(target, {});
            const result = _clone(proxy);

            expect(result).not.toBe(proxy);
            expect(result).toEqual({ a: 1 });
        });

        it("copies __proto__ and constructor keys as own properties", () => {
            const result = _clone(JSON.parse('{"__proto__":{"p":1},"a":1}'));

            expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
            expect(Object.getOwnPropertyDescriptor(result, "__proto__")?.value).toEqual({ p: 1 });
            expect(result.a).toBe(1);
            expect((result as { p?: number }).p).toBeUndefined();
            expect(_clone({ constructor: Point }).constructor).toBe(Point);
        });

        it("converts arguments objects into plain objects", () => {
            const result = _clone(getArguments(1, 2));

            expect(Array.isArray(result)).toBe(false);
            expect(Object.prototype.toString.call(result)).toBe("[object Object]");
            expect(result).toEqual({ 0: 1, 1: 2 });
        });

        it("handles large objects and arrays", () => {
            const object = Object.fromEntries(
                Array.from({ length: 500 }, (_, index) => [`k${index}`, index]),
            );
            const array = Array.from({ length: 1000 }, (_, index) => index);

            expect(_clone(object)).toEqual(object);
            expect(_clone(array)).toEqual(array);
        });
    });

    describe("arrays", () => {
        it("copies indices only, filling holes, and keeps subclasses and regexp match metadata", () => {
            const symbol = Symbol("s");
            const withExtras = Object.assign([1, 2], { extra: true, [symbol]: 1 });
            const extrasClone = _clone(withExtras);

            expect(extrasClone).toEqual([1, 2]);
            expect("extra" in extrasClone).toBe(false);
            expect(symbol in extrasClone).toBe(false);

            // oxlint-disable-next-line no-sparse-arrays
            const sparse = [1, , 3];
            const sparseClone = _clone(sparse);

            expect(sparseClone).toEqual([1, undefined, 3]);
            expect(1 in sparseClone).toBe(true);

            const items = Items.from([1, 2]);
            const itemsClone = _clone(items);

            expect(itemsClone).toBeInstanceOf(Items);
            expect(itemsClone).not.toBe(items);

            const match = /a(b)/.exec("ab") as RegExpExecArray;
            const matchClone = _clone(match);

            expect(matchClone.index).toBe(0);
            expect(matchClone.input).toBe("ab");
            expect([...matchClone]).toEqual(["ab", "b"]);
        });
    });

    describe("built-ins", () => {
        it("creates new dates and regexps with the same state", () => {
            const date = new Date(5);
            const dateClone = _clone(date);

            expect(dateClone).not.toBe(date);
            expect(dateClone).toBeInstanceOf(Date);
            expect(dateClone.getTime()).toBe(5);
            expect(_clone(new Date(NaN)).getTime()).toBeNaN();

            const regexp = Object.assign(/ab/gi, { lastIndex: 1 });
            const regexpClone = _clone(regexp);

            expect(regexpClone).not.toBe(regexp);
            expect(regexpClone.source).toBe("ab");
            expect(regexpClone.flags).toBe("gi");
            expect(regexpClone.lastIndex).toBe(1);
            expect(_clone(/x/dimsu).flags).toBe("dimsu");
        });

        it("creates new maps and sets, shallow-copying each entry one level as lodash does", () => {
            const value = { a: 1, nested: { b: 2 } };
            const map = new Map<unknown, unknown>([[1, value]]);
            const mapClone = _clone(map);

            expect(mapClone).not.toBe(map);
            expect(mapClone).toBeInstanceOf(Map);
            expect(mapClone.get(1)).toEqual(value);
            expect(mapClone.get(1)).not.toBe(value);
            expect((mapClone.get(1) as typeof value).nested).toBe(value.nested);
            mapClone.set(2, 2);
            expect(map.size).toBe(1);

            const set = new Set<unknown>([1, value]);
            const setClone = _clone(set);

            expect(setClone).not.toBe(set);
            expect([...setClone][1]).toEqual(value);
            expect([...setClone][1]).not.toBe(value);
            setClone.add(2);
            expect(set.size).toBe(2);
        });

        it("clones boxed primitives, except a boxed bigint which lodash cannot clone", () => {
            expect(_clone(Object(1))).toEqual(Object(1));
            expect(_clone(Object("ab"))).toEqual(Object("ab"));
            expect(_clone(Object(false))).toEqual(Object(false));
            expect(_clone(Object(10n))).toEqual({});
            expect(_clone(Object(1))).not.toBe(Object(1));

            const symbol = Symbol("s");

            expect(_clone(Object(symbol)).valueOf()).toBe(symbol);
        });

        it("creates typed array and data views on the same buffer, but copies array buffers", () => {
            const typed = new Uint8Array([1, 2, 3]);
            const typedClone = _clone(typed);

            expect(typedClone).not.toBe(typed);
            expect(typedClone).toBeInstanceOf(Uint8Array);
            expect(typedClone.buffer).toBe(typed.buffer);
            expect([...typedClone]).toEqual([1, 2, 3]);

            const view = new Uint16Array(new ArrayBuffer(8), 2, 2);
            const viewClone = _clone(view);

            expect(viewClone.buffer).toBe(view.buffer);
            expect(viewClone.byteOffset).toBe(2);
            expect(viewClone).toHaveLength(2);

            const dataView = new DataView(new Uint8Array([1, 2, 3, 4]).buffer, 1, 2);
            const dataViewClone = _clone(dataView);

            expect(dataViewClone).not.toBe(dataView);
            expect(dataViewClone.buffer).toBe(dataView.buffer);
            expect(dataViewClone.byteOffset).toBe(1);
            expect(dataViewClone.byteLength).toBe(2);

            const buffer = new Uint8Array([1, 2, 3]).buffer;
            const bufferClone = _clone(buffer);

            expect(bufferClone).not.toBe(buffer);
            expect([...new Uint8Array(bufferClone)]).toEqual([1, 2, 3]);

            // lodash cannot clone BigInt typed arrays and returns an empty object; this port treats them like any
            // other typed array
            const bigints = new BigInt64Array([1n]);
            const bigintsClone = _clone(bigints);

            expect(bigintsClone).toEqual(new BigInt64Array([1n]));
            expect(bigintsClone.buffer).toBe(bigints.buffer);
        });

        it("clones a Buffer into a Buffer with its own memory", () => {
            const buffer = Buffer.alloc(3, 7);
            const result = _clone(buffer);

            expect(Buffer.isBuffer(result)).toBe(true);
            expect(result).not.toBe(buffer);
            expect([...result]).toEqual([7, 7, 7]);
            result[0] = 9;
            expect(buffer[0]).toBe(7);
        });
    });

    describe("typing", () => {
        it("returns the type of the value", () => {
            const object: { a: number } = _clone({ a: 1 });
            const array: number[] = _clone([1, 2]);
            const date: Date = _clone(new Date(0));

            expect(object).toEqual({ a: 1 });
            expect(array).toEqual([1, 2]);
            expect(date.getTime()).toBe(0);
        });
    });
});
