// (C) 2020 GoodData Corporation
import React from "react";
import { mount, ReactWrapper } from "enzyme";
import { InputWithNumberFormat, MAX_NUMBER } from "../InputWithNumberFormat";
import { Separators } from "../typings";

class InputWithNumberFormatFragment {
    public value: number | string = undefined;
    private wrapper: ReactWrapper;
    private input: any;
    constructor({ separators, value }: { separators?: Separators; value?: number } = {}) {
        this.value = value;
        this.wrapper = mount(
            <InputWithNumberFormat
                value={this.value}
                onChange={(v) => {
                    this.value = v;
                }}
                separators={separators}
            />,
        );
        this.input = this.wrapper.find("input").at(0);
    }

    inputValue() {
        return this.input.instance().value;
    }

    simulateChange(value: number | string) {
        this.input.simulate("change", { target: { value } });
    }

    simulateBlur() {
        this.input.simulate("blur");
    }

    simulateFocus() {
        this.input.simulate("focus");
    }

    setValueProp(value: number) {
        this.value = value;
        this.wrapper.setProps({ value: this.value });
        this.wrapper.update();
    }

    simulateTyping(string: string) {
        string.split("").forEach((letter) => {
            const currentValue = this.inputValue();
            this.simulateChange(currentValue + letter);
        });
    }
}

describe("InputWithNumberFormat", () => {
    it("should format input when input is first rendered", () => {
        const input = new InputWithNumberFormatFragment({ value: 100000 });

        expect(input.inputValue()).toEqual("100,000");
    });

    it("should format input when input is being blured", () => {
        const input = new InputWithNumberFormatFragment();

        input.simulateChange("1000");
        input.simulateBlur();

        expect(input.inputValue()).toEqual("1,000");
    });

    it("should format input when value prop changes and input is not being focused", () => {
        const input = new InputWithNumberFormatFragment({ value: 10 });

        input.setValueProp(100000);

        expect(input.inputValue()).toEqual("100,000");
    });

    it("should not format input when value prop changes and input is being focused", () => {
        const input = new InputWithNumberFormatFragment({ value: 10 });

        input.simulateFocus();
        input.setValueProp(100000);

        expect(input.inputValue()).toEqual("10");
    });

    it("should return null when empty value is typed", () => {
        const input = new InputWithNumberFormatFragment({ value: 10 });

        input.simulateChange("");

        expect(input.value).toEqual(null);
    });

    it("should not be able to type number higher than max number", () => {
        const input = new InputWithNumberFormatFragment({ value: null });

        input.simulateChange(`${MAX_NUMBER + 1}`);

        expect(input.value).toEqual(null);
    });

    it("should not be able to type number lower than min number", () => {
        const input = new InputWithNumberFormatFragment({ value: null });

        input.simulateChange(`${-MAX_NUMBER - 1}`);

        expect(input.value).toEqual(null);
    });

    it("should round number which has more numbers right to decimal point than is allowed by platform", () => {
        const input = new InputWithNumberFormatFragment();

        input.simulateChange("0.00000000001");
        input.simulateBlur();

        expect(input.inputValue()).toEqual("0");
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

                expect(input.inputValue()).toEqual(resultInputValue);
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

                expect(input.inputValue()).toEqual(resultInputValue);
                expect(input.value).toEqual(resultValue);
            },
        );
    });
});
