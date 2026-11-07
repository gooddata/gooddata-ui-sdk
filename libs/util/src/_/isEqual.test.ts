// (C) 2026 GoodData Corporation

// boxed primitives are used on purpose: lodash treats them as equal to their primitive counterparts
/* oxlint-disable sonarjs/no-primitive-wrappers */

import { describe, expect, it } from "vitest";

import { _eq } from "./eq.js";
import { _isEqual } from "./isEqual.js";

class Point {
    constructor(public x: number) {}
}

class Other {
    constructor(public x: number) {}
}

function getArguments(..._args: unknown[]): IArguments {
    // eslint-disable-next-line prefer-rest-params
    return arguments;
}

const sym = Symbol("k");
const buffer = (...bytes: number[]) => new Uint8Array(bytes).buffer;

type Case = [name: string, a: unknown, b: unknown, expected: boolean];

// Expected values match lodash-es@4.18.1 `isEqual`, except where a test says otherwise.
function expectPairs(cases: Case[]) {
    it.each(cases)("%s", (_name, a, b, expected) => {
        expect(_isEqual(a, b)).toBe(expected);
        expect(_isEqual(b, a)).toBe(expected);
    });
}

describe("isEqual", () => {
    describe("primitives", () => {
        expectPairs([
            ["same numbers", 1, 1, true],
            ["different numbers", 1, 2, false],
            ["number and numeric string", 1, "1", false],
            ["NaN and NaN", NaN, NaN, true],
            ["+0 and -0", 0, -0, true],
            ["null and null", null, null, true],
            ["null and undefined", null, undefined, false],
            ["undefined and undefined", undefined, undefined, true],
            ["same booleans", true, true, true],
            ["different booleans", true, false, false],
            ["same strings", "a", "a", true],
            ["different strings", "a", "b", false],
            ["same bigints", 10n, 10n, true],
            ["different bigints", 10n, 11n, false],
            ["same symbol", sym, sym, true],
            ["different symbols with the same description", sym, Symbol("k"), false],
            ["registered symbols with the same key", Symbol.for("x"), Symbol.for("x"), true],
        ]);
    });

    describe("boxed primitives", () => {
        expectPairs([
            ["two boxed numbers", new Number(1), new Number(1), true],
            ["boxed number and primitive", new Number(1), 1, true],
            ["boxed NaN and boxed NaN", new Number(NaN), new Number(NaN), true],
            ["two boxed strings", new String("a"), new String("a"), true],
            ["boxed string and primitive", new String("a"), "a", true],
            ["two boxed booleans", new Boolean(true), new Boolean(true), true],
            ["boxed boolean and primitive", new Boolean(true), true, true],
            ["two boxed symbols", Object(sym), Object(sym), true],
            ["boxed symbol and primitive", Object(sym), sym, true],
        ]);
    });

    describe("arrays", () => {
        expectPairs([
            ["empty arrays", [], [], true],
            ["same elements", [1, 2], [1, 2], true],
            ["same elements, different order", [1, 2], [2, 1], false],
            ["nested equal", [1, [2, [3]]], [1, [2, [3]]], true],
            ["nested different", [1, [2, [3]]], [1, [2, [4]]], false],
            ["different length", [1, 2], [1, 2, 3], false],
            ["NaN elements", [NaN], [NaN], true],
            ["+0 and -0 elements", [0], [-0], true],
            ["array and array-like object", [1], { 0: 1, length: 1 }, false],
            ["array and arguments", [1, 2], getArguments(1, 2), false],
        ]);

        it("treats sparse holes as undefined", () => {
            // oxlint-disable-next-line no-sparse-arrays
            expect(_isEqual([1, , 3], [1, undefined, 3])).toBe(true);
            // oxlint-disable-next-line no-sparse-arrays
            expect(_isEqual([1, , 3], [1, , 3])).toBe(true);
        });

        it("compares arguments objects by their indexed values", () => {
            expect(_isEqual(getArguments(1, 2), getArguments(1, 2))).toBe(true);
            expect(_isEqual(getArguments(1, 2), getArguments(1, 3))).toBe(false);
            expect(_isEqual(getArguments(1, 2), { 0: 1, 1: 2, length: 2 })).toBe(false);
        });

        it("handles cyclic arrays", () => {
            const a: unknown[] = [1];
            a.push(a);
            const b: unknown[] = [1];
            b.push(b);

            expect(_isEqual(a, b)).toBe(true);
        });
    });

    describe("plain objects", () => {
        expectPairs([
            ["empty objects", {}, {}, true],
            ["same key and value", { a: 1 }, { a: 1 }, true],
            ["same key, different value", { a: 1 }, { a: 2 }, false],
            ["different key", { a: 1 }, { b: 1 }, false],
            ["same keys, different insertion order", { a: 1, b: 2 }, { b: 2, a: 1 }, true],
            ["deeply nested equal", { a: { b: { c: 1 } } }, { a: { b: { c: 1 } } }, true],
            ["nested arrays and objects equal", { a: [1, { b: 2 }] }, { a: [1, { b: 2 }] }, true],
            ["nested arrays and objects different", { a: [1, { b: 2 }] }, { a: [1, { b: 3 }] }, false],
            ["explicit undefined versus missing key", { a: undefined }, {}, false],
            ["explicit undefined on both sides", { a: undefined }, { a: undefined }, true],
            ["enumerable constructor key on both sides", { constructor: 1 }, { constructor: 1 }, true],
            ["enumerable constructor key on one side", { constructor: Object }, {}, false],
            ["length key is an ordinary key", { length: 0 }, { length: 0 }, true],
            ["length key with extra index key", { length: 1 }, { length: 1, 0: "x" }, false],
            ["object with size but no tag is a plain object", { size: 0 }, { size: 0 }, true],
        ]);

        it("ignores inherited keys", () => {
            expect(_isEqual(Object.create({ inherited: 1 }), {})).toBe(true);
        });

        it("ignores a frozen flag", () => {
            expect(_isEqual(Object.freeze({ a: [1] }), { a: [1] })).toBe(true);
        });

        it("compares own enumerable symbol keys", () => {
            expect(_isEqual({ [sym]: 1 }, { [sym]: 1 })).toBe(true);
            expect(_isEqual({ [sym]: 1 }, { [sym]: 2 })).toBe(false);
            expect(_isEqual({ [sym]: 1 }, {})).toBe(false);
            expect(_isEqual({}, { [sym]: 1 })).toBe(false);
        });

        it("treats null-prototype objects like plain objects", () => {
            const make = () => Object.assign(Object.create(null), { a: 1 });

            expect(_isEqual(make(), make())).toBe(true);
            expect(_isEqual(make(), { a: 1 })).toBe(true);
            expect(_isEqual({ a: 1 }, make())).toBe(true);
        });

        it("handles cyclic objects", () => {
            const a: Record<string, unknown> = { a: 1 };
            a["self"] = a;
            const b: Record<string, unknown> = { a: 1 };
            b["self"] = b;
            const c: Record<string, unknown> = { a: 1 };
            c["self"] = { a: 1, self: c };

            expect(_isEqual(a, b)).toBe(true);
            expect(_isEqual(a, c)).toBe(false);
        });

        it("compares lodash-wrapped objects by their unwrapped value", () => {
            const wrapped = () => ({ __wrapped__: true, value: () => ({ a: 1 }) });

            expect(_isEqual(wrapped(), wrapped())).toBe(true);
            expect(_isEqual(wrapped(), { a: 1 })).toBe(true);
            expect(_isEqual({ a: 1 }, wrapped())).toBe(true);
        });

        it("ignores a faked Symbol.toStringTag and compares own keys", () => {
            const fake = () => ({ [Symbol.toStringTag]: "Map", size: 0 });

            expect(_isEqual(fake(), fake())).toBe(true);
            expect(_isEqual({ a: fake() }, { a: fake() })).toBe(true);
        });
    });

    describe("class instances and constructors", () => {
        expectPairs([
            ["same class, same fields", new Point(1), new Point(1), true],
            ["same class, different fields", new Point(1), new Point(2), false],
            ["different classes, same fields", new Point(1), new Other(1), false],
            ["class instance and plain object", new Point(1), { x: 1 }, false],
            [
                "two instances created from a prototype",
                Object.create(Point.prototype),
                Object.create(Point.prototype),
                true,
            ],
            ["same prototype object", Point.prototype, Point.prototype, true],
            ["different prototype objects", Point.prototype, Other.prototype, false],
            ["Map.prototype with itself", Map.prototype, Map.prototype, true],
        ]);

        it("compares legacy constructor-function instances", () => {
            function Legacy(this: { x: number }, x: number) {
                this.x = x;
            }
            const make = (x: number) => new (Legacy as unknown as new (x: number) => { x: number })(x);

            expect(_isEqual(make(1), make(1))).toBe(true);
            expect(_isEqual(make(1), { x: 1 })).toBe(false);
        });
    });

    describe("maps and sets", () => {
        expectPairs([
            ["empty maps", new Map(), new Map(), true],
            ["same entries", new Map([[1, 2]]), new Map([[1, 2]]), true],
            ["same key, different value", new Map([[1, 2]]), new Map([[1, 3]]), false],
            [
                "same entries, different order",
                new Map([
                    [1, 2],
                    [3, 4],
                ]),
                new Map([
                    [3, 4],
                    [1, 2],
                ]),
                true,
            ],
            ["deeply equal object keys", new Map([[{ a: 1 }, 1]]), new Map([[{ a: 1 }, 1]]), true],
            [
                "different sizes",
                new Map([[1, 2]]),
                new Map([
                    [1, 2],
                    [3, 4],
                ]),
                false,
            ],
            ["NaN keys", new Map([[NaN, 1]]), new Map([[NaN, 1]]), true],
            ["empty sets", new Set(), new Set(), true],
            ["same values, different order", new Set([1, 2]), new Set([2, 1]), true],
            ["different values", new Set([1, 2]), new Set([1, 3]), false],
            ["deeply equal object values", new Set([{ a: 1 }]), new Set([{ a: 1 }]), true],
            ["different sizes", new Set([1]), new Set([1, 2]), false],
            ["map and set", new Map(), new Set(), false],
            ["map and plain object", new Map(), {}, false],
            [
                "nested maps and sets equal",
                { a: new Map([[1, { b: [new Set([1])] }]]) },
                { a: new Map([[1, { b: [new Set([1])] }]]) },
                true,
            ],
            [
                "nested maps and sets different",
                { a: new Map([[1, { b: [new Set([1])] }]]) },
                { a: new Map([[1, { b: [new Set([2])] }]]) },
                false,
            ],
        ]);

        it("compares arrays nested inside maps and sets without regard to order, as lodash does", () => {
            expect(_isEqual(new Set([[1, 2]]), new Set([[2, 1]]))).toBe(true);
            expect(_isEqual(new Map([[1, [1, 2]]]), new Map([[1, [2, 1]]]))).toBe(true);
            expect(_isEqual([1, 2], [2, 1])).toBe(false);
        });

        it("never considers weak collections equal because they cannot be enumerated", () => {
            expect(_isEqual(new WeakMap(), new WeakMap())).toBe(false);
            expect(_isEqual(new WeakSet(), new WeakSet())).toBe(false);
        });
    });

    describe("typed arrays, array buffers and data views", () => {
        expectPairs([
            ["equal Uint8Arrays", new Uint8Array([1, 2]), new Uint8Array([1, 2]), true],
            ["different Uint8Arrays", new Uint8Array([1, 2]), new Uint8Array([1, 3]), false],
            ["same bytes, different typed array class", new Uint8Array([1, 2]), new Int8Array([1, 2]), false],
            ["typed array and plain array", new Uint8Array([1, 2]), [1, 2], false],
            ["NaN in Float64Arrays", new Float64Array([NaN]), new Float64Array([NaN]), true],
            ["equal array buffers", buffer(1, 2, 3), buffer(1, 2, 3), true],
            ["different array buffers", buffer(1, 2, 3), buffer(1, 2, 4), false],
            ["equal data views", new DataView(buffer(1, 2, 3)), new DataView(buffer(1, 2, 3)), true],
            ["different data views", new DataView(buffer(1, 2, 3)), new DataView(buffer(1, 2, 4)), false],
            [
                "equal data views with the same offset",
                new DataView(buffer(1, 2, 3), 1),
                new DataView(buffer(1, 2, 3), 1),
                true,
            ],
            [
                "data views with different offsets",
                new DataView(buffer(1, 2, 3), 1),
                new DataView(buffer(1, 2, 3), 0),
                false,
            ],
            ["data view and its buffer", new DataView(buffer(1, 2, 3)), buffer(1, 2, 3), false],
            ["equal buffers", Buffer.from("ab"), Buffer.from("ab"), true],
            ["different buffers", Buffer.from("ab"), Buffer.from("ac"), false],
            ["buffer and plain array", Buffer.from([1]), [1], false],
        ]);

        it("treats a Buffer as the Uint8Array it is", () => {
            // this is what lodash-es does in any ES module environment, where its CommonJS-only Buffer
            // detection never activates; vitest's module runner injects CommonJS globals, which is why the
            // verbatim lodash copy disagreed here while every real consumer agreed
            expect(_isEqual(Buffer.from("ab"), new Uint8Array([97, 98]))).toBe(true);
            expect(_isEqual(new Uint8Array([97, 98]), Buffer.from("ab"))).toBe(true);
        });

        it("compares BigInt typed arrays, which lodash cannot", () => {
            // lodash-es@4.18.1 reports two equal BigInt64Arrays as unequal because its typed-array detection
            // predates them; the shared _isTypedArray here recognises them, so they compare element-wise.
            expect(_isEqual(new BigInt64Array([1n]), new BigInt64Array([1n]))).toBe(true);
            expect(_isEqual(new BigInt64Array([1n]), new BigInt64Array([2n]))).toBe(false);
        });
    });

    describe("dates, regexps and errors", () => {
        expectPairs([
            ["same dates", new Date(2020, 1, 1), new Date(2020, 1, 1), true],
            ["different dates", new Date(2020, 1, 1), new Date(2020, 1, 2), false],
            ["two invalid dates", new Date(NaN), new Date(NaN), true],
            ["date and its timestamp", new Date(2020, 1, 1), new Date(2020, 1, 1).getTime(), false],
            ["same regexps", /a/g, /a/g, true],
            ["regexps with different flags", /a/g, /a/i, false],
            ["regexp and its source string", /a/, "/a/", false],
            ["errors with the same message", new Error("x"), new Error("x"), true],
            ["errors with different messages", new Error("x"), new Error("y"), false],
            ["errors of different classes", new Error("x"), new TypeError("x"), false],
            ["type errors with the same message", new TypeError("x"), new TypeError("x"), true],
            [
                "errors compared by name and message only",
                Object.assign(new Error("x"), { code: 1 }),
                Object.assign(new Error("x"), { code: 2 }),
                true,
            ],
        ]);
    });

    describe("functions, promises and namespaces", () => {
        it("compares functions by reference", () => {
            const fn = () => {};

            expect(_isEqual(fn, fn)).toBe(true);
            expect(_isEqual(fn, () => {})).toBe(false);
            expect(
                _isEqual(
                    function () {},
                    function () {},
                ),
            ).toBe(false);
        });

        it("compares promises by reference", () => {
            const promise = Promise.resolve(1);

            expect(_isEqual(promise, promise)).toBe(true);
            expect(_isEqual(Promise.resolve(1), Promise.resolve(1))).toBe(false);
        });

        it("compares namespace objects by reference", () => {
            expect(_isEqual(Math, Math)).toBe(true);
            expect(_isEqual(JSON, Math)).toBe(false);
        });
    });

    describe("mixed types", () => {
        expectPairs([
            ["object and array", { a: 1 }, [1], false],
            ["array and index-keyed object", [1], { 0: 1 }, false],
            ["string and array", "1", [1], false],
            ["number and array", 1, [1], false],
            ["object and null", {}, null, false],
            ["object and undefined", {}, undefined, false],
            ["zero and null", 0, null, false],
            ["empty string and null", "", null, false],
            ["empty string and empty array", "", [], false],
        ]);
    });
});

describe("eq", () => {
    it("uses SameValueZero semantics", () => {
        expect(_eq(1, 1)).toBe(true);
        expect(_eq("a", "a")).toBe(true);
        expect(_eq(NaN, NaN)).toBe(true);
        expect(_eq(0, -0)).toBe(true);
        expect(_eq("a", new String("a"))).toBe(false);
        expect(_eq({ a: 1 }, { a: 1 })).toBe(false);
        expect(_eq(null, undefined)).toBe(false);
    });

    it("compares objects by reference", () => {
        const object = { a: 1 };

        expect(_eq(object, object)).toBe(true);
    });
});
