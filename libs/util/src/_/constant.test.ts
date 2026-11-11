// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _constant } from "./constant.js";

// Expected values match lodash-es@4.18.1 `constant`.
describe("constant", () => {
    describe("returned function", () => {
        it("returns the same value on every call, by reference", () => {
            const object = { a: 1 };
            const getObject = _constant(object);
            const fn = () => 1;

            expect(getObject()).toBe(object);
            expect(getObject()).toBe(getObject());
            expect(_constant(fn)()).toBe(fn);
            expect(_constant([1])()).toEqual([1]);
        });

        it("works for every primitive, including undefined, signed zero, NaN, symbols and bigints", () => {
            const symbol = Symbol("s");

            expect(_constant(undefined)()).toBeUndefined();
            expect(_constant(null)()).toBeNull();
            expect(_constant(0)()).toBe(0);
            expect(Object.is(_constant(-0)(), -0)).toBe(true);
            expect(_constant(NaN)()).toBeNaN();
            expect(_constant("s")()).toBe("s");
            expect(_constant(true)()).toBe(true);
            expect(_constant(symbol)()).toBe(symbol);
            expect(_constant(1n)()).toBe(1n);
            expect((_constant as unknown as () => () => unknown)()()).toBeUndefined();
        });

        it("ignores its arguments and this binding, and never calls a function value", () => {
            let calls = 0;
            const getter = _constant(() => {
                calls++;
            });

            expect((_constant(1) as unknown as (a: number, b: number) => number)(2, 3)).toBe(1);
            expect(_constant(1).call({ x: 1 })).toBe(1);
            getter();
            expect(calls).toBe(0);
        });

        it("is a fresh zero-argument function each time", () => {
            expect(typeof _constant(1)).toBe("function");
            expect(_constant(1).length).toBe(0);
            expect(_constant(1)).not.toBe(_constant(1));
            expect((_constant as unknown as (a: number, b: number) => () => number)(1, 2)()).toBe(1);
        });

        it("behaves like a plain function when called with new", () => {
            const object = { a: 1 };
            const Ctor = _constant(object) as unknown as new () => object;
            const Primitive = _constant(1) as unknown as new () => object;

            expect(new Ctor()).toBe(object);
            expect(typeof new Primitive()).toBe("object");
        });
    });

    describe("typing", () => {
        it("keeps the value type", () => {
            const getNumber: () => number = _constant(1);
            const getLiteral: () => "a" = _constant("a" as const);

            expect(getNumber()).toBe(1);
            expect(getLiteral()).toBe("a");
        });
    });
});
