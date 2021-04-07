// (C) 2007-2020 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import { withIntl } from "@gooddata/sdk-ui";

import { ColorPicker } from "../ColorPicker";
import { ColorFormats } from "tinycolor2";
import { IColorPickerProps } from "../typings";

const initialRgbColor: ColorFormats.RGB = {
    r: 255,
    g: 0,
    b: 0,
};

const defaultStyle: React.CSSProperties = {
    backgroundColor: "hsl(0, 100%, 50%)",
    borderColor: null,
};

function renderColorPicker(options?: Partial<IColorPickerProps>) {
    const args = {
        initialRgbColor,
        onSubmit: () => false,
        onCancel: () => false,
        ...options,
    };

    const Wrapper = withIntl(ColorPicker, "en-US", {
        "gs.color-picker.inputPlaceholder": "placeholder",
        "gs.color-picker.hex": "hex",
        "gs.color-picker.currentColor": "current color",
        "gs.color-picker.newColor": "new color",
        "gs.color-picker.cancelButton": "cancel",
        "gs.color-picker.okButton": "ok",
    });

    return mount(<Wrapper {...args} />);
}

describe("ColorPicker", () => {
    it("Should render proper default color picker with correct values", () => {
        const colorPicker = renderColorPicker();

        expect(colorPicker.find(".s-current-color").prop("style")).toEqual(defaultStyle);
        expect(colorPicker.find(".s-new-color").prop("style")).toEqual(defaultStyle);
        expect(colorPicker.find(".s-ok").hasClass("disabled")).toBeTruthy();
        expect(colorPicker.find(".s-color-picker-hex").find("input").prop("value")).toEqual("#ff0000");
    });

    it("Should select color from picker and change and set proper values", () => {
        const colorPicker = renderColorPicker();
        colorPicker.find(".s-color-120").first().simulate("click");

        expect(colorPicker.find(".s-current-color").prop("style")).toEqual(defaultStyle);
        expect(colorPicker.find(".s-new-color").prop("style").backgroundColor).toEqual("hsl(0, 50%, 70%)");
        expect(colorPicker.find(".s-ok").hasClass("disabled")).toBeFalsy();
        expect(colorPicker.find(".s-color-picker-hex").find("input").prop("value")).toEqual("#d98c8c");
    });

    it("Should return rgb color on OK button click and call cancel event on Cancel button click", () => {
        const submitMock = jest.fn();
        const cancelMock = jest.fn();

        const colorPicker = renderColorPicker({
            onSubmit: submitMock,
            onCancel: cancelMock,
        });

        const expectedColor: ColorFormats.RGB = {
            r: 217,
            g: 140,
            b: 140,
        };

        colorPicker.find(".s-color-120").first().simulate("click");
        colorPicker.find(".s-ok").simulate("click");
        colorPicker.find(".s-cancel").simulate("click");

        expect(submitMock).toHaveBeenCalledTimes(1);
        expect(cancelMock).toHaveBeenCalledTimes(1);
        expect(submitMock).toHaveBeenCalledWith(expectedColor);
    });
});
