// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _negate } from "./negate.js";

const isEven = (value: number): boolean => value % 2 === 0;

// Expected values match lodash-es@4.18.1 `negate`.
describe("negate", () => {
    describe("negation", () => {
        it("creates a function returning the opposite boolean", () => {
            const isOdd = _negate(isEven);

            expect(isOdd(1)).toBe(true);
            expect(isOdd(2)).toBe(false);
            expect([1, 2, 3, 4, 5, 6].filter(isOdd)).toEqual([1, 3, 5]);
        });

        it("coerces the predicate result to a boolean before negating", () => {
            const results = ["", 0, null, undefined, NaN, -0, "a", 1, {}, []].map((value) =>
                _negate(() => value as unknown as boolean)(),
            );

            expect(results).toEqual([true, true, true, true, true, true, false, false, false, false]);
        });

        it("negates twice back to the original truthiness", () => {
            expect([1, 2, 3].map(_negate(_negate(isEven)))).toEqual([false, true, false]);
        });

        it("forwards every argument for any arity", () => {
            const seen: unknown[][] = [];
            const negated = _negate((...args: unknown[]) => {
                seen.push(args);

                return false;
            });

            negated();
            negated(1);
            negated(1, 2);
            negated(1, 2, 3);
            negated(1, 2, 3, 4);
            negated(1, 2, 3, 4, 5);

            expect(seen).toEqual([[], [1], [1, 2], [1, 2, 3], [1, 2, 3, 4], [1, 2, 3, 4, 5]]);
        });

        it("keeps the this binding of the call for any arity", () => {
            const context = { tag: "ctx" };
            const seesContext = _negate(function (this: unknown, ..._args: unknown[]) {
                return this === context;
            });

            expect(seesContext.call(context)).toBe(false);
            expect(seesContext.call(context, 1)).toBe(false);
            expect(seesContext.call(context, 1, 2)).toBe(false);
            expect(seesContext.call(context, 1, 2, 3)).toBe(false);
            expect(seesContext.call(context, 1, 2, 3, 4)).toBe(false);
            expect(seesContext.call(null)).toBe(true);
            expect(seesContext()).toBe(true);

            const holder = { negated: seesContext };

            expect(holder.negated()).toBe(true);
        });
    });

    describe("predicate handling", () => {
        it("throws a TypeError for anything but a function", () => {
            const notFunctions = [undefined, null, 1, "fn", {}, [], /x/, Symbol("f"), true];

            for (const notAFunction of notFunctions) {
                const create = () => _negate(notAFunction as unknown as () => boolean);

                expect(create).toThrow(TypeError);
                expect(create).toThrow("Expected a function");
            }

            expect(() => (_negate as unknown as () => unknown)()).toThrow(TypeError);
        });

        it("does not call the predicate until the result is invoked, then once per call", () => {
            let calls = 0;
            const negated = _negate((..._args: unknown[]) => {
                calls++;

                return true;
            });

            expect(calls).toBe(0);
            negated();
            negated(1);
            negated(1, 2, 3, 4);
            expect(calls).toBe(3);
        });

        it("propagates errors thrown by the predicate", () => {
            const negated = _negate(() => {
                throw new RangeError("boom");
            });

            expect(negated).toThrow(RangeError);
        });

        it("negates the truthiness of non-boolean predicates like async ones", () => {
            expect(_negate((async () => false) as unknown as () => boolean)()).toBe(false);
            expect((_negate(isEven.bind(null, 2)) as (value: number) => boolean)(999)).toBe(false);
        });

        it("ignores extra arguments and returns a plain function", () => {
            const withExtra = _negate as unknown as (a: typeof isEven, b: string) => typeof isEven;
            const negated = withExtra(isEven, "x");

            expect(negated(2)).toBe(false);
            expect(typeof _negate(isEven)).toBe("function");
            expect(_negate(isEven).length).toBe(0);
        });
    });

    describe("typing", () => {
        it("keeps the parameter types of the predicate", () => {
            const isShort: (value: string, limit: number) => boolean = _negate(
                (value: string, limit: number) => value.length > limit,
            );

            expect(isShort("ab", 3)).toBe(true);
            expect(isShort("abcd", 3)).toBe(false);
        });
    });
});
