// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _get } from "./get.js";

function getArguments(..._args: unknown[]): IArguments {
    // eslint-disable-next-line prefer-rest-params
    return arguments;
}

const symbol = Symbol("s");
const object = {
    a: [{ b: { c: 3 } }],
    "a.b": 7,
    "": "empty",
    [symbol]: "sym",
    n: null,
    u: undefined,
    0: "zero",
    "-0": "negzero",
    deep: { x: { y: { z: [1, { w: "end" }] } } },
};

// Expected values match lodash-es@4.18.1 `get`.
describe("get", () => {
    describe("paths", () => {
        it("resolves dotted, bracketed and array paths", () => {
            expect(_get(object, "a[0].b.c")).toBe(3);
            expect(_get(object, "a.0.b.c")).toBe(3);
            expect(_get(object, ["a", "0", "b", "c"])).toBe(3);
            expect(_get(object, ["a", 0, "b", "c"])).toBe(3);
            expect(_get(object, "deep.x.y.z[1].w")).toBe("end");
            expect(_get(object, ["deep", "x", "y", "z", 1, "w"])).toBe("end");
            expect(_get({ a: { "b.c": 1 } }, 'a["b.c"]')).toBe(1);
            expect(_get({ a: { "b.c": 1 } }, "a['b.c']")).toBe(1);
            expect(_get({ a: [1, 2] }, "a[1]")).toBe(2);
        });

        it("prefers a key that exists over parsing it as a path, and keeps odd keys", () => {
            expect(_get(object, "a.b")).toBe(7);
            expect(_get(object, ["a.b"])).toBe(7);
            expect(_get(object, "")).toBe("empty");
            expect(_get({ "": { a: 1 } }, ".a")).toBe(1);
            expect(_get({ a: { "": 1 } }, "a.")).toBe(1);
            expect(_get({ a: { "": { b: 1 } } }, "a..b")).toBe(1);
            expect(_get({ "a b": { " c": 1 } }, "a b. c")).toBe(1);
            expect(_get({ é: { "😀": 1 } }, "é.😀")).toBe(1);
        });

        it("accepts symbols, numbers, signed zero and other non-string keys", () => {
            expect(_get(object, symbol)).toBe("sym");
            expect(_get(object, [symbol])).toBe("sym");
            expect(_get(object, 0)).toBe("zero");
            expect(_get(object, -0)).toBe("negzero");
            expect(_get({ 1.5: "frac" }, 1.5)).toBe("frac");
            expect(_get({ true: "bool" }, true as unknown as string)).toBe("bool");
            expect(_get({ null: 1 }, null as unknown as string)).toBe(1);
            expect(_get({ undefined: 1 }, undefined as unknown as string)).toBe(1);
            expect(_get({ NaN: 1 }, NaN)).toBe(1);
            expect(_get({ "[object Object]": 1 }, {} as unknown as string)).toBe(1);
            expect(_get({ "a,b": 1 }, [["a", "b"]] as unknown as string[])).toBe(1);
        });

        it("returns undefined for an empty array path and for missing or nullish intermediates", () => {
            expect(_get(object, [])).toBeUndefined();
            expect(_get(object, [], "d")).toBe("d");
            expect(_get(object, "missing")).toBeUndefined();
            expect(_get(object, "a.x.y.z")).toBeUndefined();
            expect(_get(object, "n.x")).toBeUndefined();
            expect(_get(object, "u.x")).toBeUndefined();
            expect(_get(object, undefined as unknown as string)).toBeUndefined();
            expect((_get as unknown as () => unknown)()).toBeUndefined();
        });

        it("walks a deep path", () => {
            let cursor: Record<string, unknown> = {};
            const root = cursor;

            for (let depth = 0; depth < 500; depth++) {
                cursor["n"] = {};
                cursor = cursor["n"] as Record<string, unknown>;
            }

            cursor["v"] = 1;

            expect(_get(root, "n.".repeat(500) + "v")).toBe(1);
        });
    });

    describe("default value", () => {
        it("is returned only for an undefined result, never called, and may itself be anything", () => {
            let calls = 0;

            expect(_get(object, "a.b.c", "default")).toBe("default");
            expect(_get(object, "missing", "d")).toBe("d");
            expect(_get(object, "u", "d")).toBe("d");
            expect(_get(object, "n", "d")).toBeNull();
            expect(_get(object, "missing", null)).toBeNull();
            expect(_get(object, "missing", undefined)).toBeUndefined();
            expect(_get(object, "a", () => calls++)).toBe(object.a);
            expect(calls).toBe(0);
            expect(typeof _get(object, "missing", () => 1)).toBe("function");
            expect(_get(null, "a", "d")).toBe("d");
            expect(_get(undefined, "a.b", "d")).toBe("d");
            expect(_get(object, undefined as unknown as string, "d")).toBe("d");
        });
    });

    describe("objects", () => {
        it("reads inherited properties, getters, functions and prototype chains", () => {
            let reads = 0;
            const withGetter = {
                get g() {
                    reads++;

                    return "getter";
                },
            };

            expect(typeof _get({}, "toString")).toBe("function");
            expect(_get({}, "constructor.name")).toBe("Object");
            expect(_get({}, "__proto__.constructor.name")).toBe("Object");
            expect(_get(withGetter, "g")).toBe("getter");
            expect(reads).toBe(1);
            expect(
                _get(
                    Object.assign(() => 1, { a: { b: 2 } }),
                    "a.b",
                ),
            ).toBe(2);
            expect(_get(Object.assign(Object.create(null), { a: { b: 1 } }), "a.b")).toBe(1);
        });

        it("works on arrays, strings, numbers, booleans, maps and other array-likes", () => {
            expect(_get([1, 2, 3], "length")).toBe(3);
            expect(_get([1, 2, 3], 1)).toBe(2);
            expect(_get([1, 2, 3], "1")).toBe(2);
            expect(_get([1, 2, 3], -1)).toBeUndefined();
            expect(_get("abc", "length")).toBe(3);
            expect(_get("abc", 1)).toBe("b");
            expect(typeof _get("abc", "length.toString")).toBe("function");
            expect(typeof _get(5, "toFixed")).toBe("function");
            expect(_get(5, "x", "d")).toBe("d");
            expect(typeof _get(true, "valueOf")).toBe("function");
            expect(_get(new Map([[1, 2]]), "size")).toBe(1);
            expect(_get(new Map([["a", 1]]), "a")).toBeUndefined();
            expect(_get(getArguments(1, 2), 1)).toBe(2);
            expect(_get(new Uint8Array([7, 8]), "1")).toBe(8);
        });

        it("returns undefined for nullish objects and ignores extra arguments", () => {
            expect(_get(null, "a")).toBeUndefined();
            expect(_get(undefined, "a")).toBeUndefined();

            const withExtra = _get as unknown as (o: object, p: string, d: string, x: string) => string;

            expect(withExtra(object, "m", "d", "x")).toBe("d");
            expect(_get.length).toBe(3);
        });
    });

    describe("typing", () => {
        it("types key tuples, numeric dictionaries and nullish objects, with any for string paths", () => {
            const nested = { a: { b: { c: 3 } }, list: [1, 2] };
            const one: { b: { c: number } } = _get(nested, "a");
            const two: { c: number } = _get(nested, ["a", "b"]);
            const three: number = _get(nested, ["a", "b", "c"]);
            const withDefault: number = _get(nested as typeof nested | null, ["a", "b", "c"], 0);
            const fromNull: undefined = _get(null, "a");
            const fromNullDefault: string = _get(undefined, "a", "d");
            const numeric: number | undefined = _get({ 1: 5 } as Record<number, number>, 1);
            const loose: string = _get(nested, "a.b.c") as string;

            expect([one, two, three, withDefault, fromNull, fromNullDefault, numeric, loose]).toEqual([
                { b: { c: 3 } },
                { c: 3 },
                3,
                3,
                undefined,
                "d",
                5,
                3,
            ]);
        });
    });
});
