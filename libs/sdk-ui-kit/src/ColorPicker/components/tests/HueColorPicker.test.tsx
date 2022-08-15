// (C) 2007-2022 GoodData Corporation
import React from "react";
import { render, screen } from "@testing-library/react";
import { ColorFormats } from "tinycolor2";

import { HueColorPicker, IHueColorPickerProps } from "../HueColorPicker";

const initColor: ColorFormats.HSL = {
    h: 3,
    s: 0.5,
    l: 0.5,
};

function renderHueColorPicker(options?: Partial<IHueColorPickerProps>) {
    const args = {
        initColor,
        onChange: () => false,
        ...options,
    };

    return render(<HueColorPicker {...args} />);
}

describe("HueColorPicker", () => {
    it("should render Hue color picker with proper pointer", () => {
        renderHueColorPicker();

        expect(screen.getByRole("hue-picker")).toBeInTheDocument();
    });
});
