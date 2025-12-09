// (C) 2020-2025 GoodData Corporation

import { createIntl, createIntlCache } from "react-intl";
import { describe, expect, it } from "vitest";

import { sanitizeCustomInput, sanitizeInput } from "./utils.js";

const intlCache = createIntlCache();
const intl = createIntl(
    {
        locale: "en-US",
        messages: {
            "rankingFilter.valueTooSmall": "Input value should be a positive number.",
            "rankingFilter.valueTooLarge": "Input value too large.",
        },
    },
    intlCache,
);

describe("RankingFilter ValueDropdown utils", () => {
    describe("sanitizeCustomInput", () => {
        it("should return false for empty input", () => {
            expect(sanitizeCustomInput("")).toBe(false);
        });

        it("should return false for null-like input", () => {
            expect(sanitizeCustomInput(null as unknown as string)).toBe(false);
            expect(sanitizeCustomInput(undefined as unknown as string)).toBe(false);
        });

        it("should return true for valid positive numbers", () => {
            expect(sanitizeCustomInput("1")).toBe(true);
            expect(sanitizeCustomInput("42")).toBe(true);
            expect(sanitizeCustomInput("100")).toBe(true);
            expect(sanitizeCustomInput("99999")).toBe(true);
        });

        it("should return false for zero", () => {
            expect(sanitizeCustomInput("0")).toBe(false);
        });

        it("should return false for negative numbers", () => {
            expect(sanitizeCustomInput("-1")).toBe(false);
            expect(sanitizeCustomInput("-100")).toBe(false);
        });

        it("should return false for values exceeding MAX_VALUE (99999)", () => {
            expect(sanitizeCustomInput("100000")).toBe(false);
            expect(sanitizeCustomInput("999999")).toBe(false);
        });

        it("should return false for non-numeric input", () => {
            expect(sanitizeCustomInput("abc")).toBe(false);
            expect(sanitizeCustomInput("test")).toBe(false);
        });

        it("should handle input with leading/trailing text and extract numbers", () => {
            expect(sanitizeCustomInput("top 10")).toBe(true);
            expect(sanitizeCustomInput("value: 42")).toBe(true);
        });

        it("should handle input with whitespace", () => {
            expect(sanitizeCustomInput("  10  ")).toBe(true);
            expect(sanitizeCustomInput(" 100 ")).toBe(true);
        });
    });

    describe("sanitizeInput", () => {
        it("should return default items when input is empty", () => {
            const result = sanitizeInput("", intl);

            expect(result).toHaveLength(8);
            expect(result.every((item) => item.type === "option")).toBe(true);
            expect(result.map((item) => (item as { value: number }).value)).toEqual([
                3, 5, 10, 15, 20, 25, 50, 100,
            ]);
        });

        it("should return default items when input is null-like", () => {
            const result = sanitizeInput(null as unknown as string, intl);

            expect(result).toHaveLength(8);
        });

        it("should return filtered items matching the input value", () => {
            const result = sanitizeInput("10", intl);

            expect(result).toHaveLength(2);
            expect(result.map((item) => (item as { label: string }).label)).toEqual(["10", "100"]);
        });

        it("should return filtered items for partial match", () => {
            const result = sanitizeInput("1", intl);

            // Should match: 10, 15, 100
            expect(result).toHaveLength(3);
            expect(result.map((item) => (item as { label: string }).label)).toEqual(["10", "15", "100"]);
        });

        it("should return filtered items for value 5", () => {
            const result = sanitizeInput("5", intl);

            // Should match: 5, 15, 25, 50
            expect(result).toHaveLength(4);
            expect(result.map((item) => (item as { label: string }).label)).toEqual(["5", "15", "25", "50"]);
        });

        it("should return error for value less than 1", () => {
            const result = sanitizeInput("0", intl);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                type: "error",
                label: "Input value should be a positive number.",
            });
        });

        it("should return error for negative values", () => {
            const result = sanitizeInput("-10", intl);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                type: "error",
                label: "Input value should be a positive number.",
            });
        });

        it("should return error for values exceeding MAX_VALUE (99999)", () => {
            const result = sanitizeInput("100000", intl);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                type: "error",
                label: "Input value too large.",
            });
        });

        it("should return error for non-numeric input", () => {
            const result = sanitizeInput("abc", intl);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                type: "error",
                label: "Input value should be a positive number.",
            });
        });

        it("should handle input with whitespace", () => {
            const result = sanitizeInput("  10  ", intl);

            expect(result).toHaveLength(2);
            expect(result.map((item) => (item as { label: string }).label)).toEqual(["10", "100"]);
        });

        it("should extract numeric value from mixed input", () => {
            const result = sanitizeInput("top 10", intl);

            expect(result).toHaveLength(2);
            expect(result.map((item) => (item as { label: string }).label)).toEqual(["10", "100"]);
        });

        it("should return empty filtered list for valid value not in defaults", () => {
            const result = sanitizeInput("42", intl);

            // 42 is valid but doesn't match any default item
            expect(result).toHaveLength(0);
        });

        it("should handle boundary value at MAX_VALUE", () => {
            const result = sanitizeInput("99999", intl);

            // Valid value but no match in defaults
            expect(result).toHaveLength(0);
        });

        it("should handle value just above MAX_VALUE", () => {
            const result = sanitizeInput("100000", intl);

            expect(result).toHaveLength(1);
            expect(result[0].type).toBe("error");
        });
    });
});
