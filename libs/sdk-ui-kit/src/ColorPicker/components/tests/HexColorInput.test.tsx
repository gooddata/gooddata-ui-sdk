// (C) 2007-2020 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
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

    return mount(<HexColorInput {...args} />);
}

describe("HexColorInput", () => {
    it("should call onInputChanged with valid hex color", () => {
        const changedMock = jest.fn();
        const expectedHslColor: ColorFormats.HSL = {
            h: 0,
            s: 0,
            l: 1,
        };

        const input = renderInput({ onInputChanged: changedMock });
        input.find("input").simulate("change", {
            target: {
                value: "#ffffff",
            },
        });

        expect(changedMock).toHaveBeenCalledTimes(1);
        expect(changedMock).toHaveBeenCalledWith(expectedHslColor);
    });

    it("shouldn't call onInputChanged with invalid hex color", () => {
        const changedMock = jest.fn();

        const input = renderInput({ onInputChanged: changedMock });
        input.find("input").simulate("change", {
            target: {
                value: "nonsence",
            },
        });

        expect(changedMock).not.toHaveBeenCalled();
    });

    it("shouldn't call onInputChanged with too short but valid hex color", () => {
        const changedMock = jest.fn();

        const input = renderInput({ onInputChanged: changedMock });
        input.find("input").simulate("change", {
            target: {
                value: "#fff",
            },
        });

        expect(changedMock).not.toHaveBeenCalled();
    });
});
