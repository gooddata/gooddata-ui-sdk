// (C) 2007-2025 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { type ColorFormats } from "tinycolor2";
import { describe, expect, it } from "vitest";

import { HueColorPicker, type IHueColorPickerProps } from "../HueColorPicker.js";

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
