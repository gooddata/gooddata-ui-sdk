// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _pick } from "./pick.js";

function getArguments(..._args: unknown[]): IArguments {
    // eslint-disable-next-line prefer-rest-params
    return arguments;
}

// Expected values match lodash-es@4.18.1 `pick`.
describe("pick", () => {
    describe("keys", () => {
        it("creates a new object with the picked own properties, in path order", () => {
            const object = { a: 1, b: "2", c: 3 };
            const result = _pick(object, ["c", "a"]);

            expect(result).not.toBe(object);
            expect(result).toEqual({ a: 1, c: 3 });
            expect(Object.keys(result)).toEqual(["c", "a"]);
            expect(object).toEqual({ a: 1, b: "2", c: 3 });
        });

        it("accepts paths individually, in arrays and nested one level deep", () => {
            const object = { a: 1, b: 2, c: 3, d: 4 };

            expect(_pick(object, "a", "c")).toEqual({ a: 1, c: 3 });
            expect(_pick(object, ["a", "b"], "c", ["d"])).toEqual({ a: 1, b: 2, c: 3, d: 4 });
            expect(_pick(object, [["a"], ["b"]] as unknown as string[])).toEqual({ a: 1, b: 2 });
        });

        it("skips missing keys, keeps keys holding undefined and ignores duplicates", () => {
            const result = _pick({ a: undefined, b: 1 }, "a", "b", "z", "a");

            expect(result).toEqual({ a: undefined, b: 1 });
            expect(Object.keys(result)).toEqual(["a", "b"]);
        });

        it("picks inherited, non-enumerable and getter properties", () => {
            function Foo(this: { own: number }) {
                this.own = 1;
            }

            Foo.prototype.inherited = 2;

            const instance = new (Foo as unknown as new () => { own: number; inherited: number })();
            const hidden = Object.defineProperty({}, "hidden", { value: 1, enumerable: false });
            const getter = {
                get g() {
                    return 5;
                },
            };

            expect(_pick(instance, "own", "inherited", "missing")).toEqual({ own: 1, inherited: 2 });
            expect(_pick(hidden, "hidden")).toEqual({ hidden: 1 });
            expect(_pick(getter, "g")).toEqual({ g: 5 });
        });

        it("accepts numeric, symbol, empty and coerced property names", () => {
            const sym = Symbol("s");

            expect(_pick({ 1: "a", 2: "b" }, 1)).toEqual({ 1: "a" });
            expect(_pick({ 1: "a", 2: "b" }, "1")).toEqual({ 1: "a" });
            expect(_pick({ [sym]: 1, a: 2 }, sym)).toEqual({ [sym]: 1 });
            expect(_pick({ "": 1, a: 2 }, "")).toEqual({ "": 1 });
            expect(_pick({ true: 1 }, true as unknown as string)).toEqual({ true: 1 });
            expect(_pick({ null: 1 }, null as unknown as string)).toEqual({ null: 1 });
            expect(_pick({ undefined: 1 }, undefined as unknown as string)).toEqual({ undefined: 1 });
        });

        it("keeps picked values by reference", () => {
            const nested = { c: 1 };
            const array = [1, 2];
            const map = new Map([[1, 2]]);
            const result = _pick({ a: nested, b: array, m: map }, "a", "b", "m");

            expect(result.a).toBe(nested);
            expect(result.b).toBe(array);
            expect(result.m).toBe(map);
        });
    });

    describe("deep paths", () => {
        it("picks a nested value into fresh containers along the path", () => {
            const inner = { c: 1, d: 2 };
            const object = { a: { b: inner }, e: 3 };
            const result = _pick(object, "a.b.c");

            expect(result).toEqual({ a: { b: { c: 1 } } });
            expect(result.a).not.toBe(object.a);
            expect(result.a?.b).not.toBe(inner);
            expect(object).toEqual({ a: { b: { c: 1, d: 2 } }, e: 3 });
        });

        it("accepts array paths and bracket notation, creating arrays for index segments", () => {
            const byArray = _pick({ a: { b: { c: 1, d: 2 } } }, [["a", "b", "c"]] as unknown as string[]);
            const byBracket = _pick({ a: [{ b: 1 }, { b: 2 }] }, "a[1].b");
            const byIndex = _pick({ a: [1, 2, 3] }, "a.1", "a[2]");

            expect(byArray).toEqual({ a: { b: { c: 1 } } });
            expect(Array.isArray(byBracket.a)).toBe(true);
            expect(byBracket.a).toEqual([undefined, { b: 2 }]);
            expect(Array.isArray(byIndex.a)).toBe(true);
            expect(byIndex.a).toEqual([undefined, 2, 3]);
        });

        it("skips a deep path that does not resolve and keeps one resolving to undefined", () => {
            expect(_pick({ a: {} }, "a.b.c")).toEqual({});
            expect(_pick({ a: { b: undefined } }, "a.b")).toEqual({ a: { b: undefined } });
        });

        it("merges deep and shallow paths of the same root, with the whole value winning either way", () => {
            const deepThenShallow = _pick({ a: { b: 1, c: 2 } }, "a.b", "a");
            const shallowThenDeep = _pick({ a: { b: 1, c: 2 } }, "a", "a.b");

            expect(deepThenShallow).toEqual({ a: { b: 1, c: 2 } });
            expect(shallowThenDeep).toEqual({ a: { b: 1, c: 2 } });
            expect(_pick({ a: { b: 1, c: 2, d: 3 } }, "a.b", "a.d")).toEqual({ a: { b: 1, d: 3 } });
        });

        it("prefers an own key containing a dot over the deep path", () => {
            expect(_pick({ "a.b": 1, a: { b: 2 } }, "a.b")).toEqual({ "a.b": 1 });
            expect(_pick({ a: { b: 2 } }, "a.b")).toEqual({ a: { b: 2 } });
        });

        it("keeps the deep value itself by reference", () => {
            const leaf = { d: 1 };
            const result = _pick({ a: { b: leaf } }, "a.b");

            expect(result.a?.b).toBe(leaf);
        });
    });

    describe("sources", () => {
        it("returns an empty object for null and undefined", () => {
            expect(_pick(null, "a")).toEqual({});
            expect(_pick(undefined, "a")).toEqual({});
        });

        it("returns an empty object with no paths", () => {
            expect(_pick({ a: 1 })).toEqual({});
            expect(_pick({ a: 1 }, [])).toEqual({});
        });

        it("picks from arrays, arguments objects, strings and functions, including inherited members", () => {
            function named(): void {}

            expect(_pick(["a", "b", "c"], 0, 2, "length")).toEqual({ 0: "a", 2: "c", length: 3 });
            expect(_pick(getArguments("x", "y"), 0, "length")).toEqual({ 0: "x", length: 2 });
            expect(_pick("abc" as unknown as object, 0, "length")).toEqual({ 0: "a", length: 3 });
            expect(_pick(named, "name", "length", "call")).toEqual({
                name: "named",
                length: 0,
                call: Function.prototype.call,
            });
            expect(_pick(5 as unknown as object, "toFixed")).toEqual({ toFixed: Number.prototype.toFixed });
        });

        it("picks only own keys from a null-prototype object", () => {
            const object = Object.assign(Object.create(null), { a: 1 }) as { a: number };

            expect(_pick(object, "a", "toString" as "a")).toEqual({ a: 1 });
        });

        it("always returns a plain object", () => {
            expect(Object.getPrototypeOf(_pick(["a"], 0))).toBe(Object.prototype);
            expect(Object.getPrototypeOf(_pick(Object.create(null), "a"))).toBe(Object.prototype);
        });
    });

    describe("prototype safety", () => {
        it("never assigns __proto__, constructor or prototype keys", () => {
            expect(_pick({ a: 1 }, "__proto__")).toEqual({});
            expect(Object.keys(_pick({ a: 1 }, "constructor"))).toEqual([]);
            expect(_pick(JSON.parse('{"__proto__": {"polluted": true}}'), "__proto__.polluted")).toEqual({});
            expect(_pick({}, "constructor.prototype.polluted")).toEqual({});
            expect(({} as { polluted?: boolean }).polluted).toBeUndefined();
        });
    });

    describe("typing", () => {
        it("narrows to Pick for known keys and to a partial object for arbitrary paths", () => {
            const object = { a: 1, b: "2", c: true };
            const picked: Pick<typeof object, "a" | "c"> = _pick(object, "a", "c");
            const partial: Partial<typeof object> = _pick(object, "a.b", "c");

            expect(picked).toEqual({ a: 1, c: true });
            expect(partial).toEqual({ c: true });
        });
    });
});
