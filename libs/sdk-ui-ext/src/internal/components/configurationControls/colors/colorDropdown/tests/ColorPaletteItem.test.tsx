// (C) 2019-2022 GoodData Corporation
import React from "react";
import { render, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import noop from "lodash/noop";
import cloneDeep from "lodash/cloneDeep";
import ColorPaletteItem, { IColorPaletteItemProps } from "../ColorPaletteItem";

const defaultProps: IColorPaletteItemProps = {
    selected: false,
    paletteItem: {
        guid: "red",
        fill: {
            r: 255,
            g: 0,
            b: 0,
        },
    },
    onColorSelected: noop,
};

function createComponent(customProps: Partial<IColorPaletteItemProps> = {}) {
    const props: IColorPaletteItemProps = { ...cloneDeep(defaultProps), ...customProps };
    return {
        user: userEvent.setup(),
        ...render(<ColorPaletteItem {...props} />),
    };
}

describe("ColorPaletteItem", () => {
    afterEach(cleanup);

    it("should render ColorPaletteItem control", () => {
        const { getByLabelText } = createComponent();
        expect(getByLabelText(/rgb*/i)).toBeInTheDocument();
    });

    it("should render ColorPaletteItem with red background", () => {
        const { fill } = defaultProps.paletteItem;
        const { getByLabelText } = createComponent();
        expect(getByLabelText(/rgb*/i)).toHaveStyle(`backgroundColor: rgb(${fill.r},${fill.g},${fill.b})`);
    });

    it("should render unselected ColorPaletteItem", () => {
        const { getByLabelText } = createComponent();
        expect(getByLabelText(/rgb*/i)).not.toHaveClass("gd-color-list-item-active");
    });

    it("should render selected ColorPaletteItem", () => {
        const { getByLabelText } = createComponent({ selected: true });
        expect(getByLabelText(/rgb*/i)).toHaveClass("gd-color-list-item-active");
    });

    it("should call onSelect when ColorPaletteItem clicked", async () => {
        const { fill, guid } = defaultProps.paletteItem;
        const onColorSelected = jest.fn();

        const { getByLabelText, user } = createComponent({ onColorSelected });
        await user.click(getByLabelText(`rgb(${fill.r},${fill.g},${fill.b})`));

        await waitFor(() =>
            expect(onColorSelected).toBeCalledWith(expect.objectContaining({ type: "guid", value: guid })),
        );
    });
});
