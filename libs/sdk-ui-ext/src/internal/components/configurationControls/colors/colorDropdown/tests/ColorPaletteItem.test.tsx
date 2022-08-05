// (C) 2019-2022 GoodData Corporation
import React from "react";
import { render, cleanup, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
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
    return render(<ColorPaletteItem {...props} />);
}

describe("ColorPaletteItem", () => {
    afterEach(cleanup);

    it("should render ColorPaletteItem control", () => {
        const { getAllByTitle } = createComponent();
        expect(getAllByTitle(/rgb*/i).length).toBe(1);
    });

    it("should render ColorPaletteItem with red background", () => {
        const { fill } = defaultProps.paletteItem;
        const { container } = createComponent();
        expect(container.firstChild).toHaveStyle(`backgroundColor: rgb(${fill.r},${fill.g},${fill.b})`);
    });

    it("should render unselected ColorPaletteItem", () => {
        const { fill } = defaultProps.paletteItem;
        const { getByTitle } = createComponent();
        expect(
            getByTitle(`rgb(${fill.r},${fill.g},${fill.b})`).classList.contains("gd-color-list-item-active"),
        ).toBeFalsy();
    });

    it("should render selected ColorPaletteItem", () => {
        const { fill } = defaultProps.paletteItem;
        const { getByTitle } = createComponent({ selected: true });
        expect(
            getByTitle(`rgb(${fill.r},${fill.g},${fill.b})`).classList.contains("gd-color-list-item-active"),
        ).toBeTruthy();
    });

    it("should call onSelect when ColorPaletteItem clicked", async () => {
        const { fill, guid } = defaultProps.paletteItem;
        const onColorSelected = jest.fn();

        const { getByTitle } = createComponent({ onColorSelected });
        fireEvent.click(getByTitle(`rgb(${fill.r},${fill.g},${fill.b})`));

        await waitFor(() =>
            expect(onColorSelected).toBeCalledWith(expect.objectContaining({ type: "guid", value: guid })),
        );
    });
});
