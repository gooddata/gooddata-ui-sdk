// (C) 2019-2025 GoodData Corporation
import React from "react";

import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import cloneDeep from "lodash/cloneDeep.js";
import noop from "lodash/noop.js";
import { describe, expect, it, vi } from "vitest";

import ColorPaletteItem, { IColorPaletteItemProps } from "../ColorPaletteItem.js";

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
    it("should render ColorPaletteItem control", () => {
        createComponent();
        expect(screen.getByLabelText(/rgb*/i)).toBeInTheDocument();
    });

    it("should render ColorPaletteItem with red background", () => {
        const { fill } = defaultProps.paletteItem;
        createComponent();
        expect(screen.getByLabelText(/rgb*/i)).toHaveStyle(
            `backgroundColor: rgb(${fill.r},${fill.g},${fill.b})`,
        );
    });

    it("should render unselected ColorPaletteItem", () => {
        createComponent();
        expect(screen.getByLabelText(/rgb*/i)).not.toHaveClass("gd-color-list-item-active");
    });

    it("should render selected ColorPaletteItem", () => {
        createComponent({ selected: true });
        expect(screen.getByLabelText(/rgb*/i)).toHaveClass("gd-color-list-item-active");
    });

    it("should call onSelect when ColorPaletteItem clicked", async () => {
        const { fill, guid } = defaultProps.paletteItem;
        const onColorSelected = vi.fn();

        createComponent({ onColorSelected });
        await userEvent.click(screen.getByLabelText(`rgb(${fill.r},${fill.g},${fill.b})`));

        await waitFor(() =>
            expect(onColorSelected).toBeCalledWith(expect.objectContaining({ type: "guid", value: guid })),
        );
    });
});
