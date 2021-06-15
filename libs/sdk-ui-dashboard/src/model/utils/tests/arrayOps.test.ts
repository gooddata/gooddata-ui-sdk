// (C) 2021 GoodData Corporation
import produce from "immer";
import { moveArrayElement } from "../arrayOps";

describe("array operations", () => {
    describe("move element", () => {
        const Scenarios: Array<
            [desc: string, input: string, fromIndex: number, toIndex: number, expected: string]
        > = [
            ["move first element to the end - two element array", "ab", 0, 1, "ba"],
            ["move first element to the end - two element array using relative toIndex", "ab", 0, -1, "ba"],
            [
                "move first element to the end - three element array using relative toIndex",
                "abc",
                0,
                -1,
                "bca",
            ],
            ["move last element to beginning - three element array", "abc", 2, 0, "cab"],
            ["move last element to beginning - two element array", "ab", 1, 0, "ba"],
            ["do nothing if single element array", "a", 0, 0, "a"],
            ["do nothing if single element array and using relative toIndex", "a", 0, -1, "a"],
        ];

        it.each(Scenarios)("it should %s", (_desc, input, fromIndex, toIndex, expected) => {
            const array = input.split("");
            const result = produce(array, (draft) => {
                moveArrayElement(draft, fromIndex, toIndex);
            });

            expect(result).toEqual(expected.split(""));
        });
    });
});
