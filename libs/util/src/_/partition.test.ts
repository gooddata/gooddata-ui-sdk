// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _partition } from "./partition.js";

const barney = { user: "barney", age: 36, active: false };
const fred = { user: "fred", age: 40, active: true };
const pebbles = { user: "pebbles", age: 1, active: false };
const users = [barney, fred, pebbles];

function getArguments(..._args: unknown[]): IArguments {
    // eslint-disable-next-line prefer-rest-params
    return arguments;
}

// Expected values match lodash-es@4.18.1 `partition`.
describe("partition", () => {
    describe("predicate forms", () => {
        it("splits by a function", () => {
            expect(_partition(users, (o) => o.active)).toEqual([[fred], [barney, pebbles]]);
        });

        it("splits by truthiness when the predicate is omitted or null", () => {
            expect(
                _partition([1, 0, "", "a", null, undefined, NaN, true], undefined as unknown as string),
            ).toEqual([
                [1, "a", true],
                [0, "", null, undefined, NaN],
            ]);
            expect(_partition([1, 0, 2], null as unknown as string)).toEqual([[1, 2], [0]]);
        });

        it("treats any truthy predicate result as a match, objects included", () => {
            expect(_partition([1, 2], () => ({}))).toEqual([[1, 2], []]);
            expect(_partition([1, 2], () => 0)).toEqual([[], [1, 2]]);
        });

        it("invokes the predicate with the value only", () => {
            const calls: unknown[][] = [];

            _partition([1, 2], (...args: unknown[]) => calls.push(args) > 0);

            expect(calls).toEqual([[1], [2]]);
        });

        it("splits by a property name or deep path", () => {
            expect(_partition(users, "active")).toEqual([[fred], [barney, pebbles]]);
            expect(_partition([{ a: { b: 1 } }, { a: { b: 0 } }], "a.b")).toEqual([
                [{ a: { b: 1 } }],
                [{ a: { b: 0 } }],
            ]);
        });

        it("splits by a [path, value] pair or a partial object", () => {
            expect(_partition(users, ["active", false])).toEqual([[barney, pebbles], [fred]]);
            expect(_partition(users, { age: 1, active: false })).toEqual([[pebbles], [barney, fred]]);
        });
    });

    describe("collections", () => {
        it("accepts array-likes, strings and arguments objects", () => {
            expect(_partition({ length: 3, 0: 1, 1: 0, 2: 2 }, (v) => v)).toEqual([[1, 2], [0]]);
            expect(_partition("a b", (ch) => ch !== " ")).toEqual([["a", "b"], [" "]]);
            expect(_partition(getArguments(1, 0, 2), (v) => v)).toEqual([[1, 2], [0]]);
        });

        it("visits holes in sparse arrays as undefined", () => {
            // oxlint-disable-next-line no-sparse-arrays
            expect(_partition([1, , 0], (v) => v)).toEqual([[1], [undefined, 0]]);
        });

        it("iterates the own enumerable values of a plain object, ignoring inherited ones", () => {
            expect(_partition({ k1: 1, k2: 0, k3: 2 }, (v) => v)).toEqual([[1, 2], [0]]);
            expect(
                _partition(Object.assign(Object.create({ inherited: 1 }), { own: 2, own2: 0 }), (v) => v),
            ).toEqual([[2], [0]]);
        });

        it("returns two empty groups for null, undefined, primitives, maps and empty collections", () => {
            expect(_partition(null, "x")).toEqual([[], []]);
            expect(_partition(undefined, "x")).toEqual([[], []]);
            expect(_partition(5 as unknown as object, (v) => v)).toEqual([[], []]);
            expect(_partition(new Map([[1, 2]]) as unknown as object, (v) => v)).toEqual([[], []]);
            expect(_partition([], "x")).toEqual([[], []]);
            expect(_partition({}, "x")).toEqual([[], []]);
        });
    });

    describe("result", () => {
        it("keeps collection order within each group and holds the original elements by reference", () => {
            const [active, inactive] = _partition(users, "active");

            expect(active[0]).toBe(fred);
            expect(inactive).toEqual([barney, pebbles]);
            expect(users).toEqual([barney, fred, pebbles]);
        });

        it("returns fresh arrays on every call", () => {
            const first = _partition([1], (v) => v);
            const second = _partition([1], (v) => v);

            expect(first).not.toBe(second);
            expect(first[0]).not.toBe(second[0]);
            expect(first[1]).not.toBe(second[1]);
        });

        it("handles large collections", () => {
            const [odd, even] = _partition(
                Array.from({ length: 500 }, (_, i) => i),
                (v) => v % 2 === 1,
            );

            expect(odd).toHaveLength(250);
            expect(even[0]).toBe(0);
        });
    });

    describe("typing", () => {
        it("narrows the groups with a type guard predicate", () => {
            const mixed: (string | number)[] = ["a", 1, "b", 2];
            const [strings, numbers] = _partition(mixed, (v): v is string => typeof v === "string");
            const onlyStrings: string[] = strings;
            const onlyNumbers: number[] = numbers;

            expect(onlyStrings).toEqual(["a", "b"]);
            expect(onlyNumbers).toEqual([1, 2]);
        });

        it("keeps the element type for other predicates and the value type for objects", () => {
            const byKey: [{ user: string }[], { user: string }[]] = _partition(users, "active");
            const byValue: [number[], number[]] = _partition({ k1: 1, k2: 0 }, (v) => v > 0);

            expect(byKey[0]).toHaveLength(1);
            expect(byValue).toEqual([[1], [0]]);
        });
    });
});
