// (C) 2019-2022 GoodData Corporation
import React from "react";
import { render, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import noop from "lodash/noop";
import cloneDeep from "lodash/cloneDeep";
import ColorPalette, { IColorPaletteProps } from "../ColorPalette";
import { getLargePalette, colorPalette } from "../../../../../tests/mocks/testColorHelper";

const defaultProps: IColorPaletteProps = {
    selectedColorGuid: undefined,
    colorPalette,
    onColorSelected: noop,
};

function createComponent(customProps: Partial<IColorPaletteProps> = {}) {
    const props: IColorPaletteProps = { ...cloneDeep(defaultProps), ...customProps };
    return {
        user: userEvent.setup(),
        ...render(<ColorPalette {...props} />),
    };
}

describe("ColorPalette", () => {
    afterEach(cleanup);

    it("should render small ColorPalette control", () => {
        const { getAllByLabelText } = createComponent();
        expect(getAllByLabelText(/rgb*/i).length).toBe(5);
    });

    it("should render large ColorPalette control", () => {
        const { getAllByLabelText } = createComponent({ colorPalette: getLargePalette() });
        expect(getAllByLabelText(/rgb*/i).length).toBe(20);
    });

    it("should render 5 ColorPaletteItem controls one has to be selected", () => {
        const { fill, guid } = colorPalette[3];
        const { getByLabelText } = createComponent({ selectedColorGuid: guid });
        expect(getByLabelText(`rgb(${fill.r},${fill.g},${fill.b})`)).toHaveClass("gd-color-list-item-active");
    });

    it("should render 5 ColorPaletteItem controls any has to be selected", () => {
        const { container } = createComponent();
        expect(container.getElementsByClassName("gd-color-list-item-active").length).toBe(0);
    });

    it("should render 5 ColorPaletteItem controls any to be selected by fake guid", () => {
        const { container } = createComponent({ selectedColorGuid: "fakegid" });
        expect(
            container.getElementsByClassName("gd-color-list-item-active s-color-list-item-fakegid").length,
        ).toBe(0);
    });

    it("should call onSelect when item clicked", async () => {
        const { fill, guid } = colorPalette[4];

        const onColorSelected = jest.fn();
        const { getByLabelText, user } = createComponent({ onColorSelected });
        await user.click(getByLabelText(`rgb(${fill.r},${fill.g},${fill.b})`));

        await waitFor(() =>
            expect(onColorSelected).toBeCalledWith(expect.objectContaining({ type: "guid", value: guid })),
        );
    });
});
