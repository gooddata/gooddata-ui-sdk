// (C) 2007-2020 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
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

    return mount(<ColorPickerMatrix {...args} />);
}

describe("ColorPickerMatrix", () => {
    it("should render 24 color cells based on initial color from lightest to darkest", () => {
        const colorMatrix = renderColorPickerMatrix();

        expect(colorMatrix.find(".color-picker-cell").length).toEqual(24);
        expect(colorMatrix.find(".color-picker-cell").first().prop("style").backgroundColor).toEqual(
            "hsl(3, 10%, 70%)",
        );
        expect(colorMatrix.find(".color-picker-cell").last().prop("style").backgroundColor).toEqual(
            "hsl(3, 100%, 30%)",
        );
    });

    it("should set selected color", () => {
        const selectColorMock = jest.fn();
        const expectedColor: ColorFormats.HSL = {
            h: 3,
            s: 0.1,
            l: 0.7,
        };

        const colorMatrix = renderColorPickerMatrix({ onColorSelected: selectColorMock });

        colorMatrix.find(".color-picker-cell").first().simulate("click");

        expect(selectColorMock).toHaveBeenCalledTimes(1);
        expect(selectColorMock.mock.calls[0][0]).toEqual(expectedColor);
    });
});
