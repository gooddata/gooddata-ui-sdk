// (C) 2007-2022 GoodData Corporation
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ColorFormats } from "tinycolor2";

import { HexColorInput, IHexColorInputProps } from "../HexColorInput";

const initColor: ColorFormats.HSL = {
    h: 3,
    s: 0.5,
    l: 0.5,
};

function renderInput(options?: Partial<IHexColorInputProps>) {
    const args = {
        initColor,
        onInputChanged: () => false,
        ...options,
    };

    return render(<HexColorInput {...args} />);
}

describe("HexColorInput", () => {
    it("should call onInputChanged with valid hex color", async () => {
        const changedMock = jest.fn();
        const expectedHslColor: ColorFormats.HSL = {
            h: 0,
            s: 0,
            l: 1,
        };
        renderInput({ onInputChanged: changedMock });

        await userEvent.clear(screen.getByRole("textbox"));
        await userEvent.type(screen.getByRole("textbox"), "#ffffff");

        expect(changedMock).toHaveBeenCalledTimes(1);
        expect(changedMock).toHaveBeenCalledWith(expectedHslColor);
    });

    it("shouldn't call onInputChanged with invalid hex color", async () => {
        const changedMock = jest.fn();
        renderInput({ onInputChanged: changedMock });

        await userEvent.clear(screen.getByRole("textbox"));
        await userEvent.type(screen.getByRole("textbox"), "nonsence");

        expect(changedMock).not.toHaveBeenCalled();
    });

    it("shouldn't call onInputChanged with too short but valid hex color", async () => {
        const changedMock = jest.fn();
        renderInput({ onInputChanged: changedMock });

        await userEvent.clear(screen.getByRole("textbox"));
        await userEvent.type(screen.getByRole("textbox"), "#fff");

        expect(changedMock).not.toHaveBeenCalled();
    });
});
