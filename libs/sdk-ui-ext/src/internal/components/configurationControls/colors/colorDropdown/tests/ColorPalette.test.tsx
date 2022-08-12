// (C) 2019-2022 GoodData Corporation
import React from "react";
import { waitFor } from "@testing-library/react";
import noop from "lodash/noop";
import cloneDeep from "lodash/cloneDeep";
import ColorPalette, { IColorPaletteProps } from "../ColorPalette";
import {
    getLargePalette,
    colorPalette,
    colorPaletteWithOneColor,
} from "../../../../../tests/mocks/testColorHelper";
import { setupComponent } from "../../../../../tests/testHelper";

const defaultProps: IColorPaletteProps = {
    selectedColorGuid: undefined,
    colorPalette,
    onColorSelected: noop,
};

function createComponent(customProps: Partial<IColorPaletteProps> = {}) {
    const props: IColorPaletteProps = { ...cloneDeep(defaultProps), ...customProps };
    return setupComponent(<ColorPalette {...props} />);
}

describe("ColorPalette", () => {
    it("should render small ColorPalette", () => {
        const { getByLabelText } = createComponent();
        expect(getByLabelText("Color palette")).toHaveClass("gd-color-drop-down-list");
    });

    it("should render large ColorPalette control", () => {
        const { getByLabelText } = createComponent({ colorPalette: getLargePalette() });
        expect(getByLabelText("Color palette")).toHaveClass("gd-color-drop-down-list-large");
    });

    it("should render ColorPalette control with 5 colors", () => {
        const { queryAllByLabelText } = createComponent();
        expect(queryAllByLabelText(/rgb*/i)).toHaveLength(5);
    });

    it("should render single color colorPalette with selected color", () => {
        const { guid } = colorPaletteWithOneColor[0];
        const { getByLabelText } = createComponent({
            colorPalette: colorPaletteWithOneColor,
            selectedColorGuid: guid,
        });
        expect(getByLabelText(/rgb*/i)).toHaveClass("gd-color-list-item-active");
    });

    it("should render single color colorPalette with no selected color", () => {
        const { queryByLabelText } = createComponent({ colorPalette: colorPaletteWithOneColor });
        expect(queryByLabelText(/rgb*/i)).not.toHaveClass("gd-color-list-item-active");
    });

    it("should render single color colorPalette where selection is not done by invalid guid", () => {
        const { queryByLabelText } = createComponent({
            colorPalette: colorPaletteWithOneColor,
            selectedColorGuid: "fakegid",
        });
        expect(queryByLabelText(/rgb*/i)).not.toHaveClass("gd-color-list-item-active");
    });

    it("should call onSelect when item clicked", async () => {
        const onColorSelected = jest.fn();
        const { fill, guid } = colorPalette[4];
        const { getByLabelText, user } = createComponent({ onColorSelected });
        await user.click(getByLabelText(`rgb(${fill.r},${fill.g},${fill.b})`));
        await waitFor(() =>
            expect(onColorSelected).toBeCalledWith(expect.objectContaining({ type: "guid", value: guid })),
        );
    });
});
