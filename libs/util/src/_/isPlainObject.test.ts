// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _isPlainObject } from "./isPlainObject.js";

function Foo(this: { a: number }) {
    this.a = 1;
}

class Bar {}

function getArguments(..._args: unknown[]): IArguments {
    // eslint-disable-next-line prefer-rest-params
    return arguments;
}

// Expected values match lodash-es@4.18.1 `isPlainObject`.
describe("isPlainObject", () => {
    describe("plain objects", () => {
        it("accepts object literals, Object instances and null-prototype objects", () => {
            expect(_isPlainObject({})).toBe(true);
            expect(_isPlainObject({ x: 0, y: 0 })).toBe(true);
            expect(_isPlainObject(new Object())).toBe(true);
            expect(_isPlainObject(Object.create(null))).toBe(true);
            expect(_isPlainObject(Object.assign(Object.create(null), { a: 1 }))).toBe(true);
            expect(_isPlainObject(JSON.parse("{}"))).toBe(true);
            expect(_isPlainObject(JSON.parse('{"__proto__": {"a": 1}}'))).toBe(true);
        });

        it("accepts objects whose prototype is Object.prototype however they were made", () => {
            expect(_isPlainObject(Object.create(Object.prototype))).toBe(true);
            expect(_isPlainObject(Object.prototype)).toBe(true);
            expect(_isPlainObject(Foo.prototype)).toBe(true);
            expect(_isPlainObject(Bar.prototype)).toBe(true);
            expect(_isPlainObject(Object.freeze({}))).toBe(true);
            expect(_isPlainObject(new Proxy({}, {}))).toBe(true);
        });

        it("judges by the prototype's constructor, not the object's own", () => {
            expect(_isPlainObject({ constructor: Foo })).toBe(true);
            expect(_isPlainObject(Object.create({ constructor: Object }))).toBe(true);
            expect(_isPlainObject(Object.create({ constructor: function Object() {} }))).toBe(false);
            expect(_isPlainObject(Object.create({ constructor: 1 }))).toBe(false);
            expect(_isPlainObject(Object.create(Object.create(null)))).toBe(false);
            expect(_isPlainObject(Object.create(Object.create(Object.prototype)))).toBe(false);
        });

        it("trusts a forged Object toStringTag", () => {
            expect(_isPlainObject({ [Symbol.toStringTag]: "Object" })).toBe(true);
            expect(_isPlainObject(Object.assign([], { [Symbol.toStringTag]: "Object" }))).toBe(false);
        });
    });

    describe("other values", () => {
        it("rejects class and constructor instances", () => {
            expect(_isPlainObject(new (Foo as unknown as new () => object)())).toBe(false);
            expect(_isPlainObject(new Bar())).toBe(false);
            expect(_isPlainObject(new (class extends Object {})())).toBe(false);
        });

        it("rejects arrays, arguments objects and built-in objects", () => {
            expect(_isPlainObject([])).toBe(false);
            expect(_isPlainObject([1, 2, 3])).toBe(false);
            expect(_isPlainObject(getArguments())).toBe(false);
            expect(_isPlainObject(new Date(0))).toBe(false);
            expect(_isPlainObject(/x/)).toBe(false);
            expect(_isPlainObject(new Map())).toBe(false);
            expect(_isPlainObject(new Set())).toBe(false);
            expect(_isPlainObject(new Error("e"))).toBe(false);
            expect(_isPlainObject(Promise.resolve())).toBe(false);
            expect(_isPlainObject(new Uint8Array(1))).toBe(false);
            expect(_isPlainObject(Math)).toBe(false);
            expect(_isPlainObject(JSON)).toBe(false);
            expect(_isPlainObject(globalThis)).toBe(false);
            expect(_isPlainObject(new Proxy([], {}))).toBe(false);
        });

        it("rejects functions and boxed primitives", () => {
            expect(_isPlainObject(function (): void {})).toBe(false);
            expect(_isPlainObject((): void => {})).toBe(false);
            expect(_isPlainObject(class {})).toBe(false);
            expect(_isPlainObject(Object)).toBe(false);
            expect(_isPlainObject(Object(1))).toBe(false);
            expect(_isPlainObject(Object("s"))).toBe(false);
            expect(_isPlainObject(Object(Symbol("s")))).toBe(false);
        });

        it("rejects primitives, null and undefined", () => {
            expect(_isPlainObject(null)).toBe(false);
            expect(_isPlainObject(undefined)).toBe(false);
            expect(_isPlainObject()).toBe(false);
            expect(_isPlainObject(0)).toBe(false);
            expect(_isPlainObject(NaN)).toBe(false);
            expect(_isPlainObject("")).toBe(false);
            expect(_isPlainObject("str")).toBe(false);
            expect(_isPlainObject(true)).toBe(false);
            expect(_isPlainObject(Symbol("s"))).toBe(false);
            expect(_isPlainObject(1n)).toBe(false);
        });
    });

    describe("typing", () => {
        it("accepts any value and returns a boolean", () => {
            const result: boolean = _isPlainObject({ a: 1 });

            expect(result).toBe(true);
        });
    });
});
