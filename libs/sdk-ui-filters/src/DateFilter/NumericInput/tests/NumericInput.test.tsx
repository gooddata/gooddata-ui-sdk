// (C) 2007-2019 GoodData Corporation
import React from "react";
import { shallow, ShallowWrapper } from "enzyme";
import noop from "lodash/noop";

import { NumericInput } from "../NumericInput";
import { childGetter, clickOn, pressButtonOn } from "../../tests/utils";

const getInput = childGetter("input");
const getInputValue = (numericInput: ShallowWrapper) => getInput(numericInput).prop("value");

const getIncrementButton = childGetter({ arrowDirection: "increment" });
const getDecrementButton = childGetter({ arrowDirection: "decrement" });

const UP_ARROW_CODE = 38;
const DOWN_ARROW_CODE = 40;

describe("NumericInput", () => {
    it("should display the value passed", () => {
        const rendered = shallow(<NumericInput onChange={noop} value={42} />);

        expect(getInputValue(rendered)).toEqual(42);
    });

    it("should disable the increment button when max is reached", () => {
        const rendered = shallow(<NumericInput onChange={noop} max={5} value={5} />);

        expect(getIncrementButton(rendered).prop("disabled")).toBeTruthy();
    });

    it("should disable the increment button when max is exceeded", () => {
        const rendered = shallow(<NumericInput onChange={noop} max={5} value={50} />);

        expect(getIncrementButton(rendered).prop("disabled")).toBeTruthy();
    });

    it("should disable the decrement button when min is reached", () => {
        const rendered = shallow(<NumericInput onChange={noop} min={5} value={5} />);

        expect(getDecrementButton(rendered).prop("disabled")).toBeTruthy();
    });

    it("should disable the decrement button when min is exceeded", () => {
        const rendered = shallow(<NumericInput onChange={noop} min={5} value={0} />);

        expect(getDecrementButton(rendered).prop("disabled")).toBeTruthy();
    });

    it("should not react to up arrow when max is reached", () => {
        const onChange = jest.fn();
        const rendered = shallow(<NumericInput onChange={onChange} max={5} value={5} />);

        pressButtonOn(UP_ARROW_CODE, getInput(rendered));

        expect(onChange).not.toBeCalled();
    });

    it("should not react to down arrow when min is reached", () => {
        const onChange = jest.fn();
        const rendered = shallow(<NumericInput onChange={onChange} min={5} value={5} />);

        pressButtonOn(DOWN_ARROW_CODE, getInput(rendered));

        expect(onChange).not.toBeCalled();
    });

    it.each([
        ["increment", 5, 6, getIncrementButton],
        ["increment", -5, -4, getIncrementButton],
        ["increment", "", 1, getIncrementButton],
        ["increment", -1, 0, getIncrementButton],

        ["decrement", 5, 4, getDecrementButton],
        ["decrement", -5, -6, getDecrementButton],
        ["decrement", "", -1, getDecrementButton],
        ["decrement", 1, 0, getDecrementButton],
    ])(
        "should %s the value from %p to %i when the %s button is clicked",
        (_, from: number, to: number, buttonGetter: any) => {
            const onChange = jest.fn();
            const rendered = shallow(<NumericInput onChange={onChange} value={from} />);

            clickOn(buttonGetter(rendered));

            expect(onChange).toBeCalledWith(to);
        },
    );

    it.each([
        ["increment", -7, 0, 0, 5, getIncrementButton],
        ["increment", -7, 0, 0, undefined, getIncrementButton],

        ["decrement", 7, 5, 0, 5, getDecrementButton],
        ["decrement", 7, 5, undefined, 5, getDecrementButton],
    ])(
        "should %s %i to %i on click with min %p and max %p",
        (_, from: number, to: number, min: number, max: number, buttonGetter: any) => {
            const onChange = jest.fn();
            const rendered = shallow(<NumericInput onChange={onChange} min={min} max={max} value={from} />);

            clickOn(buttonGetter(rendered));

            expect(onChange).toBeCalledWith(to);
        },
    );

    it.each([
        ["increment", 5, 6, UP_ARROW_CODE],
        ["increment", -5, -4, UP_ARROW_CODE],
        ["increment", "", 1, UP_ARROW_CODE],
        ["increment", -1, 0, UP_ARROW_CODE],

        ["decrement", 5, 4, DOWN_ARROW_CODE],
        ["decrement", -5, -6, DOWN_ARROW_CODE],
        ["decrement", "", -1, DOWN_ARROW_CODE],
        ["decrement", 1, 0, DOWN_ARROW_CODE],
    ])(
        "should %s the value from %p to %i when the %s arrow is pressed",
        (_, from: number, to: number, arrowCode: number) => {
            const onChange = jest.fn();
            const rendered = shallow(<NumericInput onChange={onChange} value={from} />);

            pressButtonOn(arrowCode, getInput(rendered));

            expect(onChange).toBeCalledWith(to);
        },
    );

    it.each([
        ["increment", -7, 0, 0, 5, UP_ARROW_CODE],
        ["increment", -7, 0, 0, undefined, UP_ARROW_CODE],

        ["decrement", 7, 5, 0, 5, DOWN_ARROW_CODE],
        ["decrement", 7, 5, undefined, 5, DOWN_ARROW_CODE],
    ])(
        "should %s %i to %i on arrow press with min %p and max %p",
        (_, from: number, to: number, min: number, max: number, arrowCode: number) => {
            const onChange = jest.fn();
            const rendered = shallow(<NumericInput onChange={onChange} min={min} max={max} value={from} />);

            pressButtonOn(arrowCode, getInput(rendered));

            expect(onChange).toBeCalledWith(to);
        },
    );
});
