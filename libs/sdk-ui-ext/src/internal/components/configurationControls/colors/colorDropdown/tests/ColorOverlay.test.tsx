// (C) 2019 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import noop from "lodash/noop";
import cloneDeep from "lodash/cloneDeep";
import { Overlay } from "@gooddata/sdk-ui-kit";

import ColorOverlay, { IColorOverlayProps, DropdownVersionType } from "../ColorOverlay";

const defaultProps: IColorOverlayProps = {
    alignTo: "#somestyle",
    dropdownVersion: DropdownVersionType.ColorPalette,
    onClose: noop,
};

function createComponent(customProps: Partial<IColorOverlayProps> = {}) {
    const props: IColorOverlayProps = { ...cloneDeep(defaultProps), ...customProps };
    return mount<IColorOverlayProps>(<ColorOverlay {...props} />);
}

describe("ColorOverlay", () => {
    it("should render ColorOverlay control", () => {
        const wrapper = createComponent();
        expect(wrapper.find(ColorOverlay).length).toBe(1);
    });

    it("ColorOverlay should be aligned to top left or bottom left", () => {
        const wrapper = createComponent();

        const expectAlignPoints = [
            {
                align: "bl tl",
                offset: {
                    x: 0,
                    y: 2,
                },
            },
            {
                align: "tl bl",
                offset: {
                    x: 0,
                    y: 2,
                },
            },
        ];

        expect(wrapper.find(Overlay).prop("alignTo")).toEqual(defaultProps.alignTo);
        expect(wrapper.find(Overlay).prop("alignPoints")).toEqual(expectAlignPoints);
    });

    it("ColorOverlay should be aligned to center left or bottom left ", () => {
        const wrapper = createComponent({ dropdownVersion: DropdownVersionType.ColorPicker });

        const expectAlignPoints = [
            {
                align: "cr cl",
                offset: {
                    x: 5,
                    y: 0,
                },
            },
            {
                align: "br bl",
                offset: {
                    x: 5,
                    y: 100,
                },
            },
            {
                align: "br bl",
                offset: {
                    x: 5,
                    y: 0,
                },
            },
        ];
        expect(wrapper.find(Overlay).prop("alignTo")).toEqual(defaultProps.alignTo);
        expect(wrapper.find(Overlay).prop("alignPoints")).toEqual(expectAlignPoints);
    });
});
