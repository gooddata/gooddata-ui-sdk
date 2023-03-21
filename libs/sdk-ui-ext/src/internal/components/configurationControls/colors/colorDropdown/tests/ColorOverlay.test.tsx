// (C) 2019-2023 GoodData Corporation
import React from "react";
import { render, screen } from "@testing-library/react";
import noop from "lodash/noop";
import cloneDeep from "lodash/cloneDeep";
import * as uiKit from "@gooddata/sdk-ui-kit";

import ColorOverlay, { IColorOverlayProps, DropdownVersionType } from "../ColorOverlay";

const defaultProps: IColorOverlayProps = {
    alignTo: "#somestyle",
    dropdownVersion: DropdownVersionType.ColorPalette,
    onClose: noop,
};

function createComponent(customProps: Partial<IColorOverlayProps> = {}) {
    const props: IColorOverlayProps = { ...cloneDeep(defaultProps), ...customProps };
    return render(<ColorOverlay {...props} />);
}

describe("ColorOverlay", () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    it("should render ColorOverlay control", () => {
        createComponent();
        expect(screen.getByLabelText("Color overlay content")).toBeInTheDocument();
    });

    it("ColorOverlay should be aligned to top left or bottom left", () => {
        const overlaySpy = jest.spyOn(uiKit, "Overlay").mockImplementation(() => null);

        createComponent();

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

        expect(overlaySpy).toHaveBeenCalledWith(
            expect.objectContaining({ alignPoints: expectAlignPoints, alignTo: defaultProps.alignTo }),
            {},
        );
    });

    it("ColorOverlay should be aligned to center left or bottom left ", () => {
        const overlaySpy = jest.spyOn(uiKit, "Overlay").mockImplementation(() => null);

        createComponent({ dropdownVersion: DropdownVersionType.ColorPicker });

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

        expect(overlaySpy).toHaveBeenCalledWith(
            expect.objectContaining({ alignPoints: expectAlignPoints, alignTo: defaultProps.alignTo }),
            {},
        );
    });
});
