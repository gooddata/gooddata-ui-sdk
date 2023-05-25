// (C) 2020-2023 GoodData Corporation
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { InputWithNumberFormat, MAX_NUMBER } from "../InputWithNumberFormat.js";
import { Separators } from "../typings.js";
import { describe, it, expect } from "vitest";

class InputWithNumberFormatFragment {
    public value: number | string = undefined;
    private input: any;
    constructor({ separators, value }: { separators?: Separators; value?: number } = {}) {
        this.value = value;
        render(
            <InputWithNumberFormat
                value={this.value}
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

    it("should display empty string when empty value is typed", () => {
        const input = new InputWithNumberFormatFragment({ value: 10 });

        input.simulateChange("");

        expect(screen.getByDisplayValue("")).toBeInTheDocument();
    });

    it("should not be able to type number higher than max number", () => {
        const input = new InputWithNumberFormatFragment({ value: 100 });

        input.simulateChange(`${MAX_NUMBER + 1}`);

        expect(screen.getByDisplayValue("100")).toBeInTheDocument();
    });

    it("should not be able to type number lower than min number", () => {
        const input = new InputWithNumberFormatFragment({ value: 100 });

        input.simulateChange(`${-MAX_NUMBER - 1}`);

        expect(screen.getByDisplayValue("100")).toBeInTheDocument();
    });

    it("should round number which has more numbers right to decimal point than is allowed by platform", () => {
        const input = new InputWithNumberFormatFragment();

        input.simulateChange("0.00000000001").simulateBlur();

        expect(screen.getByDisplayValue("0")).toBeInTheDocument();
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
            ["0.00000000000000000000001", 0, "0.00000000000000000000001"],
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
