// (C) 2007-2020 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
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

    return mount(<HueColorPicker {...args} />);
}

describe("HueColorPicker", () => {
    it("should render Hue color picker with proper pointer", () => {
        const huePicker = renderHueColorPicker();

        expect(huePicker.find(".hue-picker").length).toEqual(1);
    });
});
