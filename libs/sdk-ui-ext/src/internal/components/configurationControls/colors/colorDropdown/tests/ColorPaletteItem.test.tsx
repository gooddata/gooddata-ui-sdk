// (C) 2019 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
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
    return mount<IColorPaletteItemProps>(<ColorPaletteItem {...props} />);
}

describe("ColorPaletteItem", () => {
    it("should render ColorPaletteItem control", () => {
        const wrapper = createComponent();
        expect(wrapper.find(ColorPaletteItem).length).toBe(1);
    });

    it("should render ColorPaletteItem with red background", () => {
        const wrapper = createComponent();
        expect(wrapper.find("div").prop("style")).toHaveProperty("backgroundColor", "rgb(255,0,0)");
    });

    it("should render unselected ColorPaletteItem", () => {
        const wrapper = createComponent();
        expect(wrapper.find("div").hasClass("gd-color-list-item-active")).toBeFalsy();
    });

    it("should render selected ColorPaletteItem", () => {
        const wrapper = createComponent({ selected: true });
        expect(wrapper.find("div").hasClass("gd-color-list-item-active")).toBeTruthy();
    });

    it("should call onSelect when ColorPaletteItem clicked", () => {
        const onColorSelected = jest.fn();
        const wrapper = createComponent({ onColorSelected });

        wrapper.find("div").simulate("click");
        expect(onColorSelected).toHaveBeenNthCalledWith(1, { type: "guid", value: "red" });
    });
});
