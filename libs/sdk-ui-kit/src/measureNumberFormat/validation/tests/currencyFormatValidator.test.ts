// (C) 2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { validateCurrencyFormat } from "../currencyFormatValidator.js";

describe("validateCurrencyFormat", () => {
    it("should fail when format is empty", () => {
        const result = validateCurrencyFormat("");

        expect(result.isValid).toBe(false);
        expect(result.errors[0].code).toBe("empty");
    });

    it("should fail when format does not contain numeric placeholders", () => {
        const result = validateCurrencyFormat('"USD only text"');

        expect(result.isValid).toBe(false);
        expect(result.errors[0].code).toBe("invalidFormat");
    });

    it("should fail when currency symbol is missing", () => {
        const result = validateCurrencyFormat("#,##0.00");

        expect(result.isValid).toBe(false);
        expect(result.errors[0].code).toBe("missingCurrencySymbol");
    });

    it("should accept quoted currency text", () => {
        const result = validateCurrencyFormat('#,##0.00" USD"');

        expect(result.isValid).toBe(true);
    });

    it("should fail when decimal places are missing", () => {
        const result = validateCurrencyFormat("$#,##0");

        expect(result.isValid).toBe(false);
        expect(result.errors.find((error) => error.code === "missingDecimalPlaces")).toBeDefined();
    });

    it("should allow skipping decimal validation", () => {
        const result = validateCurrencyFormat("$#,##0", { requiredDecimalPlaces: 0 });

        expect(result.isValid).toBe(true);
    });

    it("should pass for valid currency format", () => {
        const result = validateCurrencyFormat("[$EUR]#,##0.00");

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });
});
