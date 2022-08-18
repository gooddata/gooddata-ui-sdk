// (C) 2007-2022 GoodData Corporation
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ColorFormats } from "tinycolor2";

import { ColorPickerMatrix, IColorPickerMatrixProps } from "../ColorPickerMatrix";

const initColor: ColorFormats.HSL = {
    h: 3,
    s: 0.5,
    l: 0.5,
};

function renderColorPickerMatrix(options?: Partial<IColorPickerMatrixProps>) {
    const args = {
        initColor,
        onColorSelected: () => false,
        ...options,
    };

    return render(<ColorPickerMatrix {...args} />);
}

describe("ColorPickerMatrix", () => {
    it("should render 24 color cells based on initial color from lightest to darkest", () => {
        renderColorPickerMatrix();

        const colors = screen.getAllByRole("color");
        expect(colors).toHaveLength(24);
        expect(colors[0]).toHaveStyle({ backgroundColor: "hsl(3, 10%, 70%)" });
        expect(colors[23]).toHaveStyle({ backgroundColor: "hsl(3, 100%, 30%)" });
    });

    it("should set selected color", async () => {
        const selectColorMock = jest.fn();
        const expectedColor: ColorFormats.HSL = {
            h: 3,
            s: 0.1,
            l: 0.7,
        };
        renderColorPickerMatrix({ onColorSelected: selectColorMock });

        const colors = screen.getAllByRole("color");
        await userEvent.click(colors[0]);

        expect(selectColorMock).toHaveBeenCalledTimes(1);
        expect(selectColorMock.mock.calls[0][0]).toEqual(expectedColor);
    });
});
