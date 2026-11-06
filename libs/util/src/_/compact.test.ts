// (C) 2026 GoodData Corporation

// boxed primitives are used on purpose: they are objects and therefore truthy even when they wrap a falsy value
/* oxlint-disable sonarjs/no-primitive-wrappers */

import { describe, expect, it } from "vitest";

import { _compact } from "./compact.js";

function getArguments(..._args: unknown[]): IArguments {
    // eslint-disable-next-line prefer-rest-params
    return arguments;
}

// Expected values match lodash-es@4.18.1 `compact`.
describe("compact", () => {
    it("removes every falsy value", () => {
        expect(_compact([0, 1, false, 2, "", 3, null, undefined, NaN, -0, 0n, 4])).toEqual([1, 2, 3, 4]);
    });

    it("keeps every truthy value, including empty containers and boxed falsy primitives", () => {
        const values = [
            [],
            {},
            " ",
            "0",
            1n,
            -1,
            new Boolean(false),
            new Number(0),
            new String(""),
            () => {},
            Symbol(),
        ];

        expect(_compact(values)).toEqual(values);
    });

    it("returns a new array and leaves the source untouched", () => {
        const source = [1, 0, 2];
        const result = _compact(source);

        expect(result).not.toBe(source);
        expect(source).toEqual([1, 0, 2]);
    });

    it("returns an empty array for null, undefined and an empty array", () => {
        expect(_compact(null)).toEqual([]);
        expect(_compact(undefined)).toEqual([]);
        expect(_compact([])).toEqual([]);
    });

    it("returns an empty array when nothing is truthy", () => {
        expect(_compact([0, false, "", null, undefined, NaN])).toEqual([]);
    });

    it("skips holes in sparse arrays", () => {
        // oxlint-disable-next-line no-sparse-arrays
        expect(_compact([1, , 2, , 3])).toEqual([1, 2, 3]);
    });

    it("keeps the relative order of the surviving values", () => {
        expect(_compact(["c", 0, "a", null, "b"])).toEqual(["c", "a", "b"]);
    });

    it("keeps shared references", () => {
        const item = { a: 1 };

        expect(_compact([item, 0, item])[0]).toBe(item);
        expect(_compact([item, 0, item])[1]).toBe(item);
    });

    it("accepts array-likes", () => {
        expect(_compact({ length: 3, 0: "a", 1: "", 2: "b" })).toEqual(["a", "b"]);
        expect(_compact(getArguments(0, 1, "", 2))).toEqual([1, 2]);
        expect(_compact("a b")).toEqual(["a", " ", "b"]);
        expect(_compact(new Uint8Array([0, 1, 0, 2]))).toEqual([1, 2]);
    });

    it("ignores non-index properties of array-likes", () => {
        expect(_compact(Object.assign([1, 0, 2], { extra: "x" }))).toEqual([1, 2]);
    });

    it("stops at the length, ignoring entries beyond it", () => {
        expect(_compact({ length: 1, 0: "a", 1: "b" })).toEqual(["a"]);
    });

    it("narrows out the falsy members of the element type", () => {
        const values: (string | number | null | undefined | false | "")[] = [
            "a",
            0,
            null,
            "b",
            undefined,
            false,
            1,
        ];
        const result: (string | number)[] = _compact(values);

        expect(result).toEqual(["a", "b", 1]);
    });
});
