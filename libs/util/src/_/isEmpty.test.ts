// (C) 2026 GoodData Corporation

// boxed primitives are used on purpose: lodash treats them differently from their primitive counterparts
/* oxlint-disable sonarjs/no-primitive-wrappers */

import { describe, expect, it } from "vitest";

import { _isEmpty } from "./isEmpty.js";
import { _isTypedArray } from "./isTypedArray.js";

function getArguments(..._args: unknown[]): IArguments {
    // eslint-disable-next-line prefer-rest-params
    return arguments;
}

class Point {
    public x = 1;
}

class Marker {}

// Expected values match lodash-es@4.18.1 `isEmpty` in an ES module environment.
describe("isEmpty", () => {
    describe("nullish and primitives", () => {
        it.each([
            ["null", null],
            ["undefined", undefined],
            ["true", true],
            ["false", false],
            ["0", 0],
            ["1", 1],
            ["NaN", NaN],
            ["symbol", Symbol("s")],
            ["bigint", 10n],
        ])("returns true for %s", (_name, value) => {
            expect(_isEmpty(value)).toBe(true);
        });
    });

    describe("strings", () => {
        it("returns true for empty string", () => {
            expect(_isEmpty("")).toBe(true);
        });

        it("returns false for non-empty string", () => {
            expect(_isEmpty("a")).toBe(false);
        });

        it("treats boxed strings by their length", () => {
            expect(_isEmpty(new String(""))).toBe(true);
            expect(_isEmpty(new String("ab"))).toBe(false);
        });
    });

    describe("arrays and array-likes", () => {
        it.each<[string, unknown, boolean]>([
            ["empty array", [], true],
            ["non-empty array", [1], false],
            ["empty arguments", getArguments(), true],
            ["non-empty arguments", getArguments(1), false],
            ["jQuery-like with length 0", { splice() {}, length: 0 }, true],
            ["jQuery-like with length 2", { splice() {}, length: 2 }, false],
        ])("%s", (_name, value, expected) => {
            expect(_isEmpty(value)).toBe(expected);
        });

        it("treats a plain object with a length as a non-empty object, not a collection", () => {
            // lodash checks own enumerable keys here, and `length` is one of them
            expect(_isEmpty({ length: 0 })).toBe(false);
            expect(_isEmpty({ length: 2 })).toBe(false);
            expect(_isEmpty({ length: -1 })).toBe(false);
            expect(_isEmpty({ length: "2" })).toBe(false);
        });
    });

    describe("typed arrays and buffers", () => {
        it.each<[string, unknown, boolean]>([
            ["empty Uint8Array", new Uint8Array(0), true],
            ["non-empty Uint8Array", new Uint8Array(2), false],
            ["non-empty Float64Array", new Float64Array(1), false],
            ["empty BigInt64Array", new BigInt64Array(0), true],
            ["non-empty BigInt64Array", new BigInt64Array(2), false],
            ["empty Buffer", Buffer.alloc(0), true],
            ["non-empty Buffer", Buffer.alloc(3), false],
        ])("%s", (_name, value, expected) => {
            expect(_isEmpty(value)).toBe(expected);
        });

        it("treats ArrayBuffer and DataView as objects without own keys", () => {
            expect(_isEmpty(new ArrayBuffer(1))).toBe(true);
            expect(_isEmpty(new DataView(new ArrayBuffer(1)))).toBe(true);
        });
    });

    describe("maps and sets", () => {
        it.each<[string, unknown, boolean]>([
            ["empty Map", new Map(), true],
            ["non-empty Map", new Map([[1, 2]]), false],
            ["empty Set", new Set(), true],
            ["non-empty Set", new Set([1]), false],
        ])("%s", (_name, value, expected) => {
            expect(_isEmpty(value)).toBe(expected);
        });

        it("treats WeakMap and WeakSet as empty because they have no size", () => {
            expect(_isEmpty(new WeakMap())).toBe(true);
            expect(_isEmpty(new WeakSet())).toBe(true);
        });

        it("ignores a faked Symbol.toStringTag and judges the object by its own keys", () => {
            expect(_isEmpty({ [Symbol.toStringTag]: "Map" })).toBe(true);
            expect(_isEmpty({ [Symbol.toStringTag]: "Map", size: 0 })).toBe(false);
            expect(_isEmpty({ [Symbol.toStringTag]: "Map", size: 1 })).toBe(false);
        });

        it("leaves a faked Symbol.toStringTag in place after inspecting it", () => {
            const fake = { [Symbol.toStringTag]: "Map" };
            _isEmpty(fake);

            expect(Object.hasOwn(fake, Symbol.toStringTag)).toBe(true);
            expect(fake[Symbol.toStringTag]).toBe("Map");
        });

        it("throws on Map.prototype because its size getter rejects a non-Map receiver", () => {
            expect(() => _isEmpty(Map.prototype)).toThrow(TypeError);
        });
    });

    describe("objects", () => {
        it.each<[string, unknown, boolean]>([
            ["empty object", {}, true],
            ["object with a key", { a: 1 }, false],
            ["null-prototype object", Object.create(null), true],
            ["object with only inherited keys", Object.create({ inherited: 1 }), true],
            ["frozen empty object", Object.freeze({}), true],
            ["frozen object with a key", Object.freeze({ a: 1 }), false],
            ["object with a size but no tag", { size: 0 }, false],
            ["class instance without fields", new Marker(), true],
            ["class instance with a field", new Point(), false],
            ["Date", new Date(), true],
            ["RegExp", /x/, true],
            ["Error", new Error("e"), true],
            ["Promise", Promise.resolve(), true],
            ["boxed Number", new Number(0), true],
            ["boxed Boolean", new Boolean(false), true],
            ["Math", Math, true],
            ["JSON", JSON, true],
        ])("%s", (_name, value, expected) => {
            expect(_isEmpty(value)).toBe(expected);
        });

        it("returns false for globalThis", () => {
            expect(_isEmpty(globalThis)).toBe(false);
        });
    });

    describe("functions", () => {
        it.each<[string, unknown]>([
            ["arrow function", () => {}],
            ["function expression", function () {}],
            ["async function", async function () {}],
            ["generator function", function* () {}],
            ["proxied function", new Proxy(function () {}, {})],
        ])("returns true for %s", (_name, value) => {
            expect(_isEmpty(value)).toBe(true);
        });
    });

    describe("prototypes", () => {
        it("returns true for built-in prototypes without own enumerable keys", () => {
            expect(_isEmpty(Object.prototype)).toBe(true);
            expect(_isEmpty(Array.prototype)).toBe(true);
            expect(_isEmpty(Marker.prototype)).toBe(true);
        });

        it("ignores an enumerable constructor key on a prototype object", () => {
            function Legacy() {}
            Legacy.prototype = { constructor: Legacy };

            expect(_isEmpty(Legacy.prototype)).toBe(true);
        });
    });

    describe("type narrowing", () => {
        it("narrows a string to the empty literal", () => {
            const value: string = "";

            if (_isEmpty(value)) {
                const narrowed: "" = value;
                expect(narrowed).toBe("");
            }
        });

        it("narrows a nullable object to its empty shape", () => {
            // a non-nullable object hits the plain `object` overload and is not narrowed, as in @types/lodash;
            // the value goes through a function so control-flow analysis keeps the declared union
            const value = ((): { a?: number } | null => ({}))();

            if (_isEmpty(value)) {
                const narrowed: { a?: never } | null | undefined = value;
                expect(narrowed).toEqual({});
            }
        });
    });
});

describe("isTypedArray", () => {
    it.each<[string, unknown]>([
        ["Uint8Array", new Uint8Array(1)],
        ["Uint8ClampedArray", new Uint8ClampedArray(1)],
        ["Int32Array", new Int32Array(1)],
        ["Float64Array", new Float64Array(1)],
        ["BigInt64Array", new BigInt64Array(1)],
        ["BigUint64Array", new BigUint64Array(1)],
        ["Buffer", Buffer.alloc(1)],
    ])("returns true for %s", (_name, value) => {
        expect(_isTypedArray(value)).toBe(true);
    });

    it.each<[string, unknown]>([
        ["array", [1]],
        ["ArrayBuffer", new ArrayBuffer(1)],
        ["DataView", new DataView(new ArrayBuffer(1))],
        ["array-like", { length: 1 }],
        ["null", null],
        ["string", "abc"],
    ])("returns false for %s", (_name, value) => {
        expect(_isTypedArray(value)).toBe(false);
    });
});
