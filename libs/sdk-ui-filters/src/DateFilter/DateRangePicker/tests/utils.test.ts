// (C) 2007-2019 GoodData Corporation
import { mergeDayPickerProps } from "../utils.js";
import { describe, it, expect } from "vitest";

describe("mergeDayPickerProps", () => {
    it.each([
        [{ className: "foo" }, { className: "foo" }, undefined],
        [{ className: "foo" }, { className: "foo" }, {}],
        [{ className: "bar" }, { className: "foo" }, { className: "bar" }],
        [
            { className: "foo", fromMonth: new Date(2019, 0, 1) },
            { className: "foo" },
            { fromMonth: new Date(2019, 0, 1) },
        ],
        [
            {
                modifiers: {
                    today: new Date(2019, 5, 1),
                },
            },
            {
                modifiers: {
                    today: new Date(2019, 0, 1),
                },
            },
            {
                modifiers: {
                    today: new Date(2019, 5, 1),
                },
            },
        ],
        [
            {
                modifiers: {
                    outside: new Date(2019, 2, 2),
                    today: new Date(2019, 5, 1),
                },
            },
            {
                modifiers: {
                    outside: new Date(2019, 2, 2),
                },
            },
            {
                modifiers: {
                    today: new Date(2019, 5, 1),
                },
            },
        ],
    ])(
        "should return %p when defaultProps: %p and userProps: %p",
        (expected: any, defaultProps: any, userProps: any) => {
            const actual = mergeDayPickerProps(defaultProps, userProps);
            expect(actual).toEqual(expected);
        },
    );
});
