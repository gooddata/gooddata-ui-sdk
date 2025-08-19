// (C) 2007-2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import { mergeDayPickerProps, parseDate } from "../utils.js";

describe("utils", () => {
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

    describe("parseDate", () => {
        it("should return a valid date when the input matches the date format", () => {
            const input = "13/09/2020";
            const dateFormat = "dd/MM/yyyy";
            const result = parseDate(input, dateFormat);

            expect(result).toBeInstanceOf(Date);
            expect(result?.getFullYear()).toBe(2020);
            expect(result?.getMonth()).toBe(8); // Month is zero-based
            expect(result?.getDate()).toBe(13);
        });

        it("should return undefined for a date with year less than 1000", () => {
            const input = "13/09/0020";
            const dateFormat = "dd/MM/yyyy";
            const result = parseDate(input, dateFormat);

            expect(result).toBeUndefined();
        });

        it("should return undefined when input does not fully match the format", () => {
            const input = "13-09-2020";
            const dateFormat = "dd/MM/yyyy";
            const result = parseDate(input, dateFormat);

            expect(result).toBeUndefined();
        });

        it("should return undefined for invalid date strings", () => {
            const input = "invalid-date";
            const dateFormat = "dd/MM/yyyy";
            const result = parseDate(input, dateFormat);

            expect(result).toBeUndefined();
        });

        it("should return undefined for partial input while typing", () => {
            const input = "13/1"; // Incomplete date
            const dateFormat = "dd/MM/yyyy";
            const result = parseDate(input, dateFormat);

            expect(result).toBeUndefined();
        });

        it("should return undefined for empty string input", () => {
            const input = "";
            const dateFormat = "dd/MM/yyyy";
            const result = parseDate(input, dateFormat);

            expect(result).toBeUndefined();
        });
    });
});
