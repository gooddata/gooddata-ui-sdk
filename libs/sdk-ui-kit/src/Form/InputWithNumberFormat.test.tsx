// (C) 2020-2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InputWithNumberFormat } from "./InputWithNumberFormat.js";
import { type Separators } from "./typings.js";

class InputWithNumberFormatFragment {
    public value: number | string | null = null;
    private input: any;
    constructor({ separators, value }: { separators?: Separators; value?: number } = {}) {
        this.value = value ?? null;
        render(
            <InputWithNumberFormat
                value={this.value ?? undefined}
                onChange={(v) => {
                    this.value = v;
                }}
                separators={separators}
                placeholder="input placeholder"
            />,
        );
        this.input = screen.getByPlaceholderText("input placeholder");
    }

    inputValue() {
        return this.input.value;
    }

    simulateChange(value: number | string) {
        fireEvent.change(this.input, { target: { value } });
        return this;
    }

    simulateBlur() {
        fireEvent.blur(this.input);
        return this;
    }

    simulateFocus() {
        fireEvent.focus(this.input);
        return this;
    }

    simulateTyping(string: string) {
        string.split("").forEach((letter) => {
            const currentValue = this.inputValue();
            this.simulateChange(currentValue + letter);
        });
        return this;
    }
}

describe("InputWithNumberFormat", () => {
    it("should format input when input is first rendered", () => {
        new InputWithNumberFormatFragment({ value: 100000 });

        expect(screen.getByDisplayValue("100,000")).toBeInTheDocument();
    });

    it("should format input when input is being blured", () => {
        const input = new InputWithNumberFormatFragment();

        input.simulateChange("1000").simulateBlur();

        expect(screen.getByDisplayValue("1,000")).toBeInTheDocument();
    });

    it("should remove thousand separators on focus so the value can be edited as plain digits", () => {
        const input = new InputWithNumberFormatFragment({ value: 1000000 });

        expect(input.inputValue()).toEqual("1,000,000");

        input.simulateFocus();

        expect(input.inputValue()).toEqual("1000000");
    });

    it("should keep the decimal separator when removing thousand separators on focus", () => {
        const input = new InputWithNumberFormatFragment({
            value: 1234.5,
            separators: { thousand: " ", decimal: "," },
        });

        expect(input.inputValue()).toEqual("1 234,5");

        input.simulateFocus();

        expect(input.inputValue()).toEqual("1234,5");
    });

    it("should display empty string when empty value is typed", () => {
        const input = new InputWithNumberFormatFragment({ value: 10 });

        input.simulateChange("");

        expect(screen.getByDisplayValue("")).toBeInTheDocument();
    });

    it("should display empty string when initialized with empty string value", () => {
        render(<InputWithNumberFormat value="" onChange={() => {}} placeholder="empty string input" />);

        const input = screen.getByPlaceholderText("empty string input");
        expect(input).toHaveValue("");
    });

    it("should accept a magnitude beyond the former 10^15 cap", () => {
        const input = new InputWithNumberFormatFragment({ value: 100 });

        input.simulateChange("10000000000000000");

        expect(input.value).toBe(1e16);
    });

    it("should accept a negative magnitude beyond the former cap", () => {
        const input = new InputWithNumberFormatFragment({ value: 100 });

        input.simulateChange("-10000000000000000");

        expect(input.value).toBe(-1e16);
    });

    it("should keep more decimal places than the former 6-decimal limit", () => {
        const input = new InputWithNumberFormatFragment();

        input.simulateChange("0.00000000001").simulateBlur();

        expect(input.value).toBe(1e-11);
        expect(screen.getByDisplayValue("1e-11")).toBeInTheDocument();
    });

    it("should still refuse a value that overflows to Infinity", () => {
        const input = new InputWithNumberFormatFragment({ value: 100 });

        input.simulateChange("1e309");

        expect(screen.getByDisplayValue("100")).toBeInTheDocument();
    });

    describe("input validation", () => {
        it.each([
            ["123", 123, "123"],
            [",123", 123, ",123"],
            ["123,123", 123123, "123,123"],
            ["1235", 1235, "123fksdfnf5sdj"],
            ["1235", 1235, "1235(#*%&$(*#!@)           \n"],
            [".", null, "."],
            ["-", null, "-"],
            ["-0", 0, "-0"],
            ["-0.", 0, "-0."],
            ["0.", 0, "0."],
            ["0.1", 0.1, "0.1"],
            ["1,,,,,,,3,5,4.5", 1354.5, "1,,,,,,,3,5,4.....5"],
            ["0.532", 0.532, "0.532"],
            ["0,,,.532", 0.532, "0,,,.532"],
            ["0,,,.532", 0.532, "0,,,....532"],
            ["-0,,,.532", -0.532, "-0,,,....532"],
            ["-10045", -10045, "-10045"],
            ["-10045.", -10045, "-10045."],
            [",,,,,,,,,,,.", null, ",,,,,,,,,,,."],
            ["0.00000000000000000000001", 1e-23, "0.00000000000000000000001"],
        ])(
            'should display value "%s" in input and returned value should be %s when "%s" is written',
            (resultInputValue, resultValue, typedValue) => {
                const input = new InputWithNumberFormatFragment();

                input.simulateTyping(typedValue);

                expect(screen.getByDisplayValue(resultInputValue)).toBeInTheDocument();
                expect(input.value).toEqual(resultValue);
            },
        );
    });

    describe("scientific notation and full double precision", () => {
        it.each([
            ["1.23e+9", 1230000000],
            ["1e308", 1e308],
            ["1E5", 100000],
            ["-1.5e-3", -0.0015],
        ])("should accept pasted scientific notation %s", (typedValue, expectedValue) => {
            const input = new InputWithNumberFormatFragment();

            input.simulateChange(typedValue);

            expect(input.inputValue()).toBe(typedValue);
            expect(input.value).toBe(expectedValue);
        });

        it.each([
            ["1e308", 1e308],
            ["1.23e+9", 1230000000],
        ])(
            "should keep every character when %s is typed one at a time (no silent truncation)",
            (typedValue, expectedValue) => {
                const input = new InputWithNumberFormatFragment();

                input.simulateTyping(typedValue);

                expect(input.inputValue()).toBe(typedValue);
                expect(input.value).toBe(expectedValue);
            },
        );

        it("should accept magnitudes far above the former cap", () => {
            const input = new InputWithNumberFormatFragment();

            input.simulateChange("1e16");

            expect(input.value).toBe(1e16);
        });

        it("should keep decimal places beyond six", () => {
            const input = new InputWithNumberFormatFragment();

            input.simulateChange("0.00000000123").simulateBlur();

            expect(input.value).toBe(1.23e-9);
            expect(input.inputValue()).toBe("1.23e-9");
        });

        it.each(["1e309", "1e", "e", "e5", "1e+"])(
            "should never let a non-finite value in (%s)",
            (typedValue) => {
                const input = new InputWithNumberFormatFragment();

                input.simulateChange(typedValue);

                expect(Number.isFinite(input.value ?? 0)).toBe(true);
            },
        );

        it("should reject an exponent that overflows to Infinity", () => {
            const input = new InputWithNumberFormatFragment();

            input.simulateChange("1e309");

            expect(input.inputValue()).toBe("");
            expect(input.value).toBeNull();
        });

        it("should normalize the notation on blur without losing the value", () => {
            const input = new InputWithNumberFormatFragment();

            input.simulateChange("1.23e+9").simulateBlur();

            // JS renders exponent form only from 1e21 up, so this one spells out with separators.
            expect(input.inputValue()).toBe("1,230,000,000");
            expect(input.value).toBe(1230000000);
        });

        it("should let an existing extreme value be edited incrementally", () => {
            const input = new InputWithNumberFormatFragment({ value: 1e308 });

            expect(input.inputValue()).toBe("1e+308");

            input.simulateFocus().simulateChange("1e+30");

            expect(input.value).toBe(1e30);
        });
    });

    describe("input validation with different separators", () => {
        it.each([
            ["123 123,123", 123123.123, "123 123,123", { thousand: " ", decimal: "," }],
            ["123'123.123", 123123.123, "123'123.123", { thousand: "'", decimal: "." }],
        ])(
            'should display value "%s" in input and returned value should be %s when "%s" is written',
            (resultInputValue, resultValue, writtenValue, separators) => {
                const input = new InputWithNumberFormatFragment({ separators });

                input.simulateTyping(writtenValue);

                expect(screen.getByDisplayValue(resultInputValue)).toBeInTheDocument();
                expect(input.value).toEqual(resultValue);
            },
        );
    });
});
