// (C) 2019 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import noop from "lodash/noop";
import cloneDeep from "lodash/cloneDeep";
import ColorPalette, { IColorPaletteProps } from "../ColorPalette";
import ColorPaletteItem from "../ColorPaletteItem";
import { getLargePalette, colorPalette } from "../../../../../tests/mocks/testColorHelper";

const defaultProps: IColorPaletteProps = {
    selectedColorGuid: undefined,
    colorPalette,
    onColorSelected: noop,
};

function createComponent(customProps: Partial<IColorPaletteProps> = {}) {
    const props: IColorPaletteProps = { ...cloneDeep(defaultProps), ...customProps };
    return mount<IColorPaletteProps>(<ColorPalette {...props} />);
}

describe("ColorPalette", () => {
    it("should render ColorPalette control", () => {
        const wrapper = createComponent();
        expect(wrapper.find(ColorPalette).length).toBe(1);
    });

    it("should render small ColorPalette control", () => {
        const wrapper = createComponent();
        expect(wrapper.find("div").first().hasClass("gd-color-drop-down-list")).toBeTruthy();
        expect(wrapper.find("div").first().hasClass("gd-color-drop-down-list-large")).toBeFalsy();
    });

    it("should render large ColorPalette control", () => {
        const wrapper = createComponent({ colorPalette: getLargePalette() });
        expect(wrapper.find("div").first().hasClass("gd-color-drop-down-list")).toBeFalsy();
        expect(wrapper.find("div").first().hasClass("gd-color-drop-down-list-large")).toBeTruthy();
    });

    it("should render 5 ColorPaletteItem controls", () => {
        const wrapper = createComponent();
        expect(wrapper.find(ColorPaletteItem).length).toBe(5);
    });

    it("should render 5 ColorPaletteItem controls any has to be selected", () => {
        const wrapper = createComponent();
        const selectedItem = wrapper.find(ColorPaletteItem).find({ selected: true });
        expect(selectedItem.length).toBe(0);
    });

    it("should render 5 ColorPaletteItem controls one has to be selected", () => {
        const wrapper = createComponent({ selectedColorGuid: "04" });
        const selectedItem = wrapper.find(ColorPaletteItem).find({ selected: true });
        expect(selectedItem.length).toBe(1);
    });

    it("should render 5 ColorPaletteItem controls any to be selected by fake guid", () => {
        const wrapper = createComponent({ selectedColorGuid: "fakegid" });
        const selectedItem = wrapper.find(ColorPaletteItem).find({ selected: true });
        expect(selectedItem.length).toBe(0);
    });

    it("should call onSelect when item clicked", () => {
        const onColorSelected = jest.fn();
        const wrapper = createComponent({ onColorSelected });
        const selectedItem = wrapper.find(ColorPaletteItem).find({ paletteItem: colorPalette[3] });
        selectedItem.find("div").simulate("click");
        expect(onColorSelected).toHaveBeenNthCalledWith(1, { type: "guid", value: "04" });
    });
});
