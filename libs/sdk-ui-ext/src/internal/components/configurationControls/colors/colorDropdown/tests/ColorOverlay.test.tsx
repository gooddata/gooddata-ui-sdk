// (C) 2019-2023 GoodData Corporation
import React from "react";
import { render, screen } from "@testing-library/react";
import noop from "lodash/noop.js";
import cloneDeep from "lodash/cloneDeep.js";
import * as uiKit from "@gooddata/sdk-ui-kit";
import { describe, it, expect, vi, beforeEach } from "vitest";

import ColorOverlay, { IColorOverlayProps, DropdownVersionType } from "../ColorOverlay.js";

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
        vi.restoreAllMocks();
    });

    it("should render ColorOverlay control", () => {
        createComponent();
        expect(screen.getByLabelText("Color overlay content")).toBeInTheDocument();
    });

    it("ColorOverlay should be aligned to top left or bottom left", () => {
        const overlaySpy = vi.spyOn(uiKit, "Overlay").mockImplementation((): null => null);

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
        const overlaySpy = vi.spyOn(uiKit, "Overlay").mockImplementation((): null => null);

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
