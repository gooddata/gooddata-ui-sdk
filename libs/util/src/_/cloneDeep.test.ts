// (C) 2026 GoodData Corporation

// boxed primitives are used on purpose: lodash clones them into new boxed objects
/* oxlint-disable sonarjs/no-primitive-wrappers */

import { describe, expect, it } from "vitest";

import { _cloneDeep } from "./cloneDeep.js";

class Point {
    constructor(public x: number) {}
}

class WithGetter {
    public a = 1;

    public get b(): number {
        return 2;
    }
}

function getArguments(..._args: unknown[]): IArguments {
    // eslint-disable-next-line prefer-rest-params
    return arguments;
}

const sym = Symbol("k");

// Expected values match lodash-es@4.18.1 `cloneDeep` in an ES module environment, except where a test says otherwise.
describe("cloneDeep", () => {
    describe("primitives and functions", () => {
        it.each<[string, unknown]>([
            ["null", null],
            ["undefined", undefined],
            ["number", 1],
            ["NaN", NaN],
            ["string", "s"],
            ["bigint", 10n],
            ["symbol", sym],
            ["boolean", true],
        ])("returns %s as is", (_name, value) => {
            expect(_cloneDeep(value)).toBe(value);
        });

        it("returns an empty object for a top-level function or class", () => {
            expect(_cloneDeep(() => {})).toEqual({});
            expect(_cloneDeep(Point)).toEqual({});
        });
    });

    describe("uncloneable objects", () => {
        it("returns an empty object for an uncloneable top-level value", () => {
            expect(_cloneDeep(new Error("boom"))).toEqual({});
            expect(_cloneDeep(new WeakMap())).toEqual({});
            expect(_cloneDeep(new WeakSet())).toEqual({});
            expect(_cloneDeep(Promise.resolve(1))).toEqual({});
        });

        it("keeps uncloneable nested values by reference", () => {
            const fn = () => {};
            const error = new Error("boom");
            const weakMap = new WeakMap();
            const promise = Promise.resolve(1);
            const clone = _cloneDeep({ fn, error, weakMap, promise });

            expect(clone.fn).toBe(fn);
            expect(clone.error).toBe(error);
            expect(clone.weakMap).toBe(weakMap);
            expect(clone.promise).toBe(promise);
        });
    });

    describe("arrays", () => {
        it("clones nested arrays recursively", () => {
            const value = [1, "a", null, undefined, [2, [3, { a: 4 }]]];
            const clone = _cloneDeep(value);

            expect(clone).toEqual(value);
            expect(clone).not.toBe(value);
            expect(clone[4]).not.toBe(value[4]);
            expect((clone[4] as unknown[])[1]).not.toBe((value[4] as unknown[])[1]);
        });

        it("turns sparse holes into explicit undefined entries", () => {
            // oxlint-disable-next-line no-sparse-arrays
            const clone = _cloneDeep([1, , 3]);

            expect(clone).toHaveLength(3);
            expect(1 in clone).toBe(true);
            expect(clone[1]).toBeUndefined();
        });

        it("copies the index and input properties of a RegExp#exec result", () => {
            const value = /b(c)/.exec("abcd") as RegExpExecArray;
            const clone = _cloneDeep(value);

            expect([...clone]).toEqual(["bc", "c"]);
            expect(clone.index).toBe(1);
            expect(clone.input).toBe("abcd");
        });

        it("does not copy non-index properties of arrays", () => {
            const value = Object.assign([1, 2], { extra: "x", [sym]: "y" });
            const clone = _cloneDeep(value);

            expect([...clone]).toEqual([1, 2]);
            expect(Object.hasOwn(clone, "extra")).toBe(false);
            expect(Object.hasOwn(clone, sym)).toBe(false);
        });

        it("clones an arguments object into a plain object of its indices", () => {
            const clone = _cloneDeep(getArguments(1, { a: 2 }));

            expect(Object.getPrototypeOf(clone)).toBe(Object.prototype);
            expect(clone).toEqual({ 0: 1, 1: { a: 2 } });
        });
    });

    describe("plain objects", () => {
        it("clones nested objects recursively", () => {
            const value = { a: { b: { c: [1, { d: 2 }] } }, e: "x" };
            const clone = _cloneDeep(value);

            expect(clone).toEqual(value);
            expect(clone).not.toBe(value);
            expect(clone.a).not.toBe(value.a);
            expect(clone.a.b).not.toBe(value.a.b);
            expect(clone.a.b.c[1]).not.toBe(value.a.b.c[1]);
        });

        it("copies own enumerable symbol keys and clones their values", () => {
            const value = { [sym]: { nested: 1 }, plain: 2 };
            const clone = _cloneDeep(value);

            expect(clone[sym]).toEqual({ nested: 1 });
            expect(clone[sym]).not.toBe(value[sym]);
            expect(clone.plain).toBe(2);
        });

        it("keeps the prototype but copies only own properties", () => {
            const proto = { inherited: 1 };
            const value = Object.assign(Object.create(proto), { own: 2 });
            const clone = _cloneDeep(value);

            expect(Object.getPrototypeOf(clone)).toBe(proto);
            expect(Object.hasOwn(clone, "own")).toBe(true);
            expect(Object.hasOwn(clone, "inherited")).toBe(false);
            expect(clone.inherited).toBe(1);
        });

        it("gives a null-prototype object an ordinary Object prototype, as lodash does", () => {
            const value = Object.assign(Object.create(null), { a: 1 });
            const clone = _cloneDeep(value);

            expect(Object.getPrototypeOf(clone)).toBe(Object.prototype);
            expect(clone).toEqual({ a: 1 });
        });

        it("does not freeze the clone of a frozen object", () => {
            const clone = _cloneDeep(Object.freeze({ a: Object.freeze({ b: 1 }) }));

            expect(Object.isFrozen(clone)).toBe(false);
            expect(Object.isFrozen(clone.a)).toBe(false);
            expect(clone).toEqual({ a: { b: 1 } });
        });

        it("clones a prototype object into a plain empty object", () => {
            const clone = _cloneDeep(Point.prototype);

            expect(Object.getPrototypeOf(clone)).toBe(Object.prototype);
            expect(Object.keys(clone)).toEqual([]);
        });

        it("keeps a __proto__ key as an own property instead of changing the prototype", () => {
            const value = JSON.parse('{"__proto__": {"polluted": true}, "a": 1}') as Record<string, unknown>;
            const clone = _cloneDeep(value);

            expect(Object.getPrototypeOf(clone)).toBe(Object.prototype);
            expect(Object.hasOwn(clone, "__proto__")).toBe(true);
            expect((clone as { __proto__: unknown }).__proto__).toEqual({ polluted: true });
            expect(({} as Record<string, unknown>)["polluted"]).toBeUndefined();
        });
    });

    describe("class instances", () => {
        it("keeps the class prototype and clones own fields", () => {
            const value = new Point(1);
            const clone = _cloneDeep(value);

            expect(clone).toBeInstanceOf(Point);
            expect(clone).not.toBe(value);
            expect(clone.x).toBe(1);
        });

        it("keeps prototype getters reachable without copying them", () => {
            const clone = _cloneDeep(new WithGetter());

            expect(clone).toBeInstanceOf(WithGetter);
            expect(Object.hasOwn(clone, "b")).toBe(false);
            expect(clone.b).toBe(2);
        });

        it("clones legacy constructor-function instances", () => {
            function Legacy(this: { x: number }, x: number) {
                this.x = x;
            }
            Legacy.prototype.inherited = 1;
            const value = new (Legacy as unknown as new (x: number) => { x: number; inherited: number })(1);
            const clone = _cloneDeep(value);

            expect(Object.getPrototypeOf(clone)).toBe(Legacy.prototype);
            expect(clone.x).toBe(1);
            expect(clone.inherited).toBe(1);
            expect(Object.hasOwn(clone, "inherited")).toBe(false);
        });
    });

    describe("references", () => {
        it("reconstructs cycles in the clone", () => {
            const value: Record<string, unknown> = { a: 1 };
            value["self"] = value;
            value["list"] = [value, { back: value }];
            const clone = _cloneDeep(value);

            expect(clone).not.toBe(value);
            expect(clone["self"]).toBe(clone);
            expect((clone["list"] as unknown[])[0]).toBe(clone);
            expect(((clone["list"] as unknown[])[1] as { back: unknown }).back).toBe(clone);
        });

        it("clones a shared reference once and keeps it shared", () => {
            const shared = { s: 1 };
            const clone = _cloneDeep({ a: shared, b: shared });

            expect(clone.a).not.toBe(shared);
            expect(clone.a).toBe(clone.b);
        });
    });

    describe("maps and sets", () => {
        it("clones map values but keeps map keys by reference", () => {
            const key = { k: 1 };
            const value = new Map<unknown, unknown>([
                [key, { v: 1 }],
                ["s", [1, 2]],
            ]);
            const clone = _cloneDeep(value);

            expect(clone).toBeInstanceOf(Map);
            expect(clone).not.toBe(value);
            expect(clone).toEqual(value);
            expect(clone.get(key)).not.toBe(value.get(key));
            expect([...clone.keys()][0]).toBe(key);
        });

        it("clones set values", () => {
            const item = { a: 1 };
            const value = new Set<unknown>([item, [1], "x"]);
            const clone = _cloneDeep(value);

            expect(clone).toBeInstanceOf(Set);
            expect(clone).toEqual(value);
            expect(clone.has(item)).toBe(false);
            expect([...clone][0]).toEqual(item);
        });

        it("copies own enumerable properties set on a map", () => {
            const value = Object.assign(new Map([[1, 2]]), { extra: { deep: true } });
            const clone = _cloneDeep(value);

            expect(clone.extra).toEqual({ deep: true });
            expect(clone.extra).not.toBe(value.extra);
        });
    });

    describe("binary data", () => {
        it("clones typed arrays into a new buffer", () => {
            const value = new Uint8Array([1, 2, 3]);
            const clone = _cloneDeep(value);

            expect(clone).toBeInstanceOf(Uint8Array);
            expect(clone).toEqual(value);
            expect(clone.buffer).not.toBe(value.buffer);
        });

        it("keeps the offset and length of a typed array view and copies the whole buffer", () => {
            const value = new Uint8Array(new ArrayBuffer(8), 2, 4);
            value.set([9, 8, 7, 6]);
            const clone = _cloneDeep(value);

            expect(clone.byteOffset).toBe(2);
            expect(clone.length).toBe(4);
            expect(clone.buffer.byteLength).toBe(8);
            expect(clone.buffer).not.toBe(value.buffer);
            expect([...clone]).toEqual([9, 8, 7, 6]);
        });

        it("clones array buffers", () => {
            const value = new Uint8Array([1, 2, 3]).buffer;
            const clone = _cloneDeep(value);

            expect(clone).toBeInstanceOf(ArrayBuffer);
            expect(clone).not.toBe(value);
            expect([...new Uint8Array(clone)]).toEqual([1, 2, 3]);
        });

        it("clones data views with their offset and length", () => {
            const value = new DataView(new ArrayBuffer(8), 2, 4);
            value.setUint8(0, 7);
            const clone = _cloneDeep(value);

            expect(clone).toBeInstanceOf(DataView);
            expect(clone.byteOffset).toBe(2);
            expect(clone.byteLength).toBe(4);
            expect(clone.buffer).not.toBe(value.buffer);
            expect(clone.getUint8(0)).toBe(7);
        });

        it("clones BigInt typed arrays, which lodash cannot", () => {
            // lodash-es@4.18.1 returns `{}` for a top-level BigInt64Array and keeps a nested one by reference
            // because its cloneable-tag table predates them; the shared _isTypedArray here recognises them
            const value = new BigInt64Array([1n, 2n]);
            const clone = _cloneDeep(value);

            expect(clone).toBeInstanceOf(BigInt64Array);
            expect(clone).not.toBe(value);
            expect([...clone]).toEqual([1n, 2n]);
            expect(_cloneDeep({ value }).value).not.toBe(value);
        });

        it("clones a Buffer into a Buffer with its own memory", () => {
            // this is what lodash-es does in any ES module environment, where a Buffer is just a Uint8Array;
            // under CommonJS lodash takes a Buffer-specific path whose "clone" shares memory with the source
            const value = Buffer.from("hello");
            const clone = _cloneDeep(value);

            expect(Buffer.isBuffer(clone)).toBe(true);
            expect(clone.toString()).toBe("hello");
            clone[0] = 0;
            expect(value[0]).toBe("h".charCodeAt(0));
        });
    });

    describe("dates, regexps and boxed primitives", () => {
        it("clones dates", () => {
            const value = new Date(2020, 1, 1);
            const clone = _cloneDeep(value);

            expect(clone).toBeInstanceOf(Date);
            expect(clone).not.toBe(value);
            expect(clone.getTime()).toBe(value.getTime());
        });

        it("keeps an invalid date invalid", () => {
            expect(Number.isNaN(_cloneDeep(new Date(NaN)).getTime())).toBe(true);
        });

        it("clones regexps with source, flags and lastIndex", () => {
            const value = /ab+c/gi;
            value.lastIndex = 3;
            const clone = _cloneDeep(value);

            expect(clone).toBeInstanceOf(RegExp);
            expect(clone).not.toBe(value);
            expect(clone.source).toBe("ab+c");
            expect(clone.flags).toBe("gi");
            expect(clone.lastIndex).toBe(3);
        });

        it("clones boxed primitives into new boxed objects", () => {
            const value = { n: new Number(1), s: new String("ab"), b: new Boolean(false), sy: Object(sym) };
            const clone = _cloneDeep(value);

            expect(clone.n).toBeInstanceOf(Number);
            expect(clone.n).not.toBe(value.n);
            expect(clone.n.valueOf()).toBe(1);
            expect(clone.s).toBeInstanceOf(String);
            expect(clone.s.valueOf()).toBe("ab");
            expect(clone.b).toBeInstanceOf(Boolean);
            expect(clone.b.valueOf()).toBe(false);
            expect(typeof clone.sy).toBe("object");
            expect(clone.sy).not.toBe(value.sy);
            expect(clone.sy.valueOf()).toBe(sym);
        });
    });

    describe("mixed structures", () => {
        it("clones a deep mix of containers", () => {
            const value = {
                a: [{ b: new Map([[1, new Set<unknown>([[1, 2], { c: new Date(1) }])]]) }],
                d: { e: { f: [[[1]]] } },
            };
            const clone = _cloneDeep(value);

            expect(clone).toEqual(value);
            expect(clone.a[0]!.b).not.toBe(value.a[0]!.b);
            expect(clone.a[0]!.b.get(1)).not.toBe(value.a[0]!.b.get(1));
            expect(clone.d.e.f[0]![0]).not.toBe(value.d.e.f[0]![0]);
        });

        it("leaves the source untouched", () => {
            const value = { a: [1, { b: 2 }], m: new Map([[1, [1]]]) };
            const clone = _cloneDeep(value);

            (clone.a[1] as { b: number }).b = 99;
            clone.m.get(1)!.push(2);

            expect((value.a[1] as { b: number }).b).toBe(2);
            expect(value.m.get(1)).toEqual([1]);
        });
    });

    describe("typing", () => {
        it("returns the same type as its argument", () => {
            const value = { a: 1, b: [new Date()] };
            const clone: { a: number; b: Date[] } = _cloneDeep(value);

            expect(clone.b[0]).toBeInstanceOf(Date);
        });
    });
});
