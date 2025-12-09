// (C) 2007-2025 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { NumericInput } from "../NumericInput.js";

const UP_ARROW_CODE = 38;
const DOWN_ARROW_CODE = 40;

const getIncrementButton = () => {
    return screen.getAllByRole("button", { hidden: true })[0];
};

const getDecrementButton = () => {
    return screen.getAllByRole("button", { hidden: true })[1];
};

const getInput = () => {
    return screen.getByRole("textbox");
};

describe("NumericInput", () => {
    it("should display the value passed", () => {
        render(<NumericInput onChange={() => {}} value={42} />);

        expect(screen.getByDisplayValue("42")).toBeInTheDocument();
    });

    it("should disable the increment button when max is reached", () => {
        render(<NumericInput onChange={() => {}} max={5} value={5} />);

        expect(getIncrementButton()).toBeDisabled();
    });

    it("should disable the increment button when max is exceeded", () => {
        render(<NumericInput onChange={() => {}} max={5} value={50} />);

        expect(getIncrementButton()).toBeDisabled();
    });

    it("should disable the decrement button when min is reached", () => {
        render(<NumericInput onChange={() => {}} min={5} value={5} />);

        expect(getDecrementButton()).toBeDisabled();
    });

    it("should disable the decrement button when min is exceeded", () => {
        render(<NumericInput onChange={() => {}} min={5} value={0} />);

        expect(getDecrementButton()).toBeDisabled();
    });

    it("should not react to up arrow when max is reached", () => {
        const onChange = vi.fn();
        render(<NumericInput onChange={onChange} max={5} value={5} />);

        fireEvent.keyDown(getInput(), {
            key: "Up",
            keyCode: UP_ARROW_CODE,
            which: UP_ARROW_CODE,
        });

        expect(onChange).not.toBeCalled();
    });

    it("should not react to down arrow when min is reached", () => {
        const onChange = vi.fn();
        render(<NumericInput onChange={onChange} min={5} value={5} />);

        fireEvent.keyDown(getInput(), {
            key: "Down",
            keyCode: DOWN_ARROW_CODE,
            which: DOWN_ARROW_CODE,
        });

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
    ] as const)(
        "should %s the value from %p to %i when the appropriate button is clicked",
        (_, from, to, buttonGetter) => {
            const onChange = vi.fn();
            render(<NumericInput onChange={onChange} value={from as number | ""} />);

            fireEvent.click(buttonGetter());

            expect(onChange).toBeCalledWith(to);
        },
    );

    it.each([
        ["increment", -7, 0, 0, 5, getIncrementButton],
        ["increment", -7, 0, 0, undefined, getIncrementButton],

        ["decrement", 7, 5, 0, 5, getDecrementButton],
        ["decrement", 7, 5, undefined, 5, getDecrementButton],
    ] as const)(
        "should %s %i to %i on click with min %p and max %p",
        (_, from, to, min, max, buttonGetter) => {
            const onChange = vi.fn();
            render(<NumericInput onChange={onChange} min={min} max={max} value={from} />);

            fireEvent.click(buttonGetter());

            expect(onChange).toBeCalledWith(to);
        },
    );

    it.each([
        ["increment", 5, 6, UP_ARROW_CODE, "Up"],
        ["increment", -5, -4, UP_ARROW_CODE, "Up"],
        ["increment", "", 1, UP_ARROW_CODE, "Up"],
        ["increment", -1, 0, UP_ARROW_CODE, "Up"],

        ["decrement", 5, 4, DOWN_ARROW_CODE, "Down"],
        ["decrement", -5, -6, DOWN_ARROW_CODE, "Down"],
        ["decrement", "", -1, DOWN_ARROW_CODE, "Down"],
        ["decrement", 1, 0, DOWN_ARROW_CODE, "Down"],
    ] as const)(
        "should %s the value from %p to %i when the %s arrow is pressed",
        (_, from, to, arrowCode, key) => {
            const onChange = vi.fn();
            render(<NumericInput onChange={onChange} value={from as number | ""} />);

            fireEvent.keyDown(getInput(), {
                key,
                keyCode: arrowCode,
                which: arrowCode,
            });

            expect(onChange).toBeCalledWith(to);
        },
    );

    it.each([
        ["increment", -7, 0, 0, 5, UP_ARROW_CODE, "Up"],
        ["increment", -7, 0, 0, undefined, UP_ARROW_CODE, "Up"],

        ["decrement", 7, 5, 0, 5, DOWN_ARROW_CODE, "Down"],
        ["decrement", 7, 5, undefined, 5, DOWN_ARROW_CODE, "Down"],
    ] as const)(
        "should %s %i to %i on arrow press with min %p and max %p",
        (_, from, to, min, max, arrowCode, key) => {
            const onChange = vi.fn();
            render(<NumericInput onChange={onChange} min={min} max={max} value={from} />);

            fireEvent.keyDown(getInput(), {
                key,
                keyCode: arrowCode,
                which: arrowCode,
            });

            expect(onChange).toBeCalledWith(to);
        },
    );
});
