// (C) 2007-2022 GoodData Corporation
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

function renderComponent(options?: Partial<IColorPickerProps>) {
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

    return render(<Wrapper {...args} />);
}

describe("ColorPicker", () => {
    it("Should render proper default color picker with correct values", () => {
        renderComponent();
        expect(screen.getByLabelText("current-color")).toHaveStyle(defaultStyle);
        expect(screen.getByLabelText("new-color")).toHaveStyle(defaultStyle);
        expect(screen.getByRole("button", { name: "ok" })).toHaveClass("disabled");
        expect(screen.getByRole("textbox")).toHaveValue("#ff0000");
    });

    it("Should select color from picker and change and set proper values", async () => {
        renderComponent();

        await userEvent.click(document.querySelector(".s-color-120"));

        expect(screen.getByLabelText("current-color")).toHaveStyle(defaultStyle);
        expect(screen.getByLabelText("new-color")).toHaveStyle({ backgroundColor: "hsl(0, 50%, 70%)" });
        expect(screen.getByRole("button", { name: "ok" })).not.toHaveClass("disabled");
        expect(screen.getByRole("textbox")).toHaveValue("#d98c8c");
    });

    it("Should return rgb color on OK button click and call cancel event on Cancel button click", async () => {
        const submitMock = jest.fn();
        const cancelMock = jest.fn();

        renderComponent({
            onSubmit: submitMock,
            onCancel: cancelMock,
        });

        const expectedColor: ColorFormats.RGB = {
            r: 217,
            g: 140,
            b: 140,
        };
        await userEvent.click(document.querySelector(".s-color-120"));
        await userEvent.click(screen.getByRole("button", { name: "ok" }));
        await userEvent.click(screen.getByRole("button", { name: "cancel" }));

        expect(submitMock).toHaveBeenCalledTimes(1);
        expect(cancelMock).toHaveBeenCalledTimes(1);
        expect(submitMock).toHaveBeenCalledWith(expectedColor);
    });
});
