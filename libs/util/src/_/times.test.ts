// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _times } from "./times.js";

// Expected values match lodash-es@4.18.1 `times`.
describe("times", () => {
    describe("invocation", () => {
        it("invokes the iteratee n times with the index and collects the results", () => {
            expect(_times(3, String)).toEqual(["0", "1", "2"]);
            expect(_times(4, (index) => index * 2)).toEqual([0, 2, 4, 6]);
            expect(_times(4, () => "a")).toEqual(["a", "a", "a", "a"]);
            expect(_times(1, (index) => index)).toEqual([0]);
        });

        it("passes only the index, in order, once each", () => {
            const seen: unknown[][] = [];

            _times(3, (...args: unknown[]) => {
                seen.push(args);
            });

            expect(seen).toEqual([[0], [1], [2]]);
        });

        it("calls the iteratee with an undefined this", () => {
            const bindings: unknown[] = [];

            _times(2, function (this: unknown) {
                bindings.push(this);
            });

            expect(bindings).toEqual([undefined, undefined]);
        });

        it("keeps results by reference and records undefined results as entries", () => {
            const object = {};
            const byReference = _times(2, () => object);
            const undefineds = _times(2, () => undefined);

            expect(byReference[0]).toBe(object);
            expect(byReference[1]).toBe(object);
            expect(undefineds).toEqual([undefined, undefined]);
            expect(0 in undefineds).toBe(true);
        });

        it("propagates errors thrown by the iteratee", () => {
            expect(() =>
                _times(3, (index) => {
                    if (index === 1) {
                        throw new RangeError("boom");
                    }

                    return index;
                }),
            ).toThrow(RangeError);
        });

        it("handles a large count", () => {
            const result = _times(100000);

            expect(result).toHaveLength(100000);
            expect(result[99999]).toBe(99999);
        });
    });

    describe("iteratee defaults", () => {
        it("returns the indices when no iteratee is given", () => {
            expect(_times(3)).toEqual([0, 1, 2]);
            expect(_times(3, undefined as unknown as (index: number) => number)).toEqual([0, 1, 2]);
        });

        it("treats anything but a function as the identity iteratee", () => {
            for (const notAFunction of [null, 1, "x", {}, [], /x/, Symbol("f"), true]) {
                const iteratee = notAFunction as unknown as (index: number) => number;

                expect(_times(3, iteratee)).toEqual([0, 1, 2]);
            }
        });

        it("ignores extra arguments", () => {
            type WithExtra = (n: number, fn: (i: number) => number, x: string) => number[];

            const withExtra = _times as unknown as WithExtra;

            expect(withExtra(2, (i) => i, "x")).toEqual([0, 1]);
        });
    });

    describe("count coercion", () => {
        it("returns an empty array for counts below 1", () => {
            expect(_times(0)).toEqual([]);
            expect(_times(-1)).toEqual([]);
            expect(_times(-0)).toEqual([]);
            expect(_times(0.5)).toEqual([]);
            expect(_times(-Infinity)).toEqual([]);
            expect(_times(NaN)).toEqual([]);
            expect(_times(-5e-324)).toEqual([]);
        });

        it("returns an empty array for counts above the safe integer range", () => {
            expect(_times(Infinity)).toEqual([]);
            expect(_times(Number.MAX_VALUE)).toEqual([]);
            expect(_times(9007199254740992)).toEqual([]);
        });

        it("truncates fractional counts", () => {
            expect(_times(2.9)).toEqual([0, 1]);
            expect(_times(2.1)).toEqual([0, 1]);
        });

        it("coerces other count values the way lodash does", () => {
            expect(_times("3" as unknown as number)).toEqual([0, 1, 2]);
            expect(_times(" 2 " as unknown as number)).toEqual([0, 1]);
            expect(_times("0x3" as unknown as number)).toEqual([0, 1, 2]);
            expect(_times("1e1" as unknown as number)).toHaveLength(10);
            expect(_times("x" as unknown as number)).toEqual([]);
            expect(_times("" as unknown as number)).toEqual([]);
            expect(_times(null as unknown as number)).toEqual([]);
            expect(_times(undefined as unknown as number)).toEqual([]);
            expect(_times(true as unknown as number)).toEqual([0]);
            expect(_times(false as unknown as number)).toEqual([]);
            expect(_times([3] as unknown as number)).toEqual([0, 1, 2]);
            expect(_times([1, 2] as unknown as number)).toEqual([]);
            expect(_times({} as unknown as number)).toEqual([]);
            expect(_times({ valueOf: () => 2 } as unknown as number)).toEqual([0, 1]);
            expect(_times(Symbol("3") as unknown as number)).toEqual([]);
            expect(() => _times(10n as unknown as number)).toThrow(TypeError);
            expect((_times as unknown as () => number[])()).toEqual([]);
        });
    });

    describe("typing", () => {
        it("returns the iteratee result type, or numbers without an iteratee", () => {
            const strings: string[] = _times(2, String);
            const numbers: number[] = _times(2);

            expect(strings).toEqual(["0", "1"]);
            expect(numbers).toEqual([0, 1]);
        });
    });
});
