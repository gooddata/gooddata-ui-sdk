// (C) 2019-2022 GoodData Corporation
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import defaultUserEvent from "@testing-library/user-event";
import noop from "lodash/noop.js";
import cloneDeep from "lodash/cloneDeep.js";
import ColorPalette, { IColorPaletteProps } from "../ColorPalette.js";
import {
    getLargePalette,
    colorPalette,
    colorPaletteWithOneColor,
} from "../../../../../tests/mocks/testColorHelper.js";
import { describe, it, expect, vi } from "vitest";
import { defaultImport } from "default-import";

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const userEvent = defaultImport(defaultUserEvent);

const defaultProps: IColorPaletteProps = {
    selectedColorGuid: undefined,
    colorPalette,
    onColorSelected: noop,
};

function createComponent(customProps: Partial<IColorPaletteProps> = {}) {
    const props: IColorPaletteProps = { ...cloneDeep(defaultProps), ...customProps };
    return render(<ColorPalette {...props} />);
}

describe("ColorPalette", () => {
    it("should render small ColorPalette", () => {
        createComponent();
        expect(screen.getByLabelText("Color palette")).toHaveClass("gd-color-drop-down-list");
    });

    it("should render large ColorPalette control", () => {
        createComponent({ colorPalette: getLargePalette() });
        expect(screen.getByLabelText("Color palette")).toHaveClass("gd-color-drop-down-list-large");
    });

    it("should render ColorPalette control with 5 colors", () => {
        createComponent();
        expect(screen.queryAllByLabelText(/rgb*/i)).toHaveLength(5);
    });

    it("should render single color colorPalette with selected color", () => {
        const { guid } = colorPaletteWithOneColor[0];
        createComponent({
            colorPalette: colorPaletteWithOneColor,
            selectedColorGuid: guid,
        });
        expect(screen.getByLabelText(/rgb*/i)).toHaveClass("gd-color-list-item-active");
    });

    it("should render single color colorPalette with no selected color", () => {
        createComponent({ colorPalette: colorPaletteWithOneColor });
        expect(screen.queryByLabelText(/rgb*/i)).not.toHaveClass("gd-color-list-item-active");
    });

    it("should render single color colorPalette where selection is not done by invalid guid", () => {
        createComponent({
            colorPalette: colorPaletteWithOneColor,
            selectedColorGuid: "fakegid",
        });
        expect(screen.queryByLabelText(/rgb*/i)).not.toHaveClass("gd-color-list-item-active");
    });

    it("should call onSelect when item clicked", async () => {
        const onColorSelected = vi.fn();
        const { fill, guid } = colorPalette[4];
        createComponent({ onColorSelected });
        await userEvent.click(screen.getByLabelText(`rgb(${fill.r},${fill.g},${fill.b})`));
        await waitFor(() =>
            expect(onColorSelected).toBeCalledWith(expect.objectContaining({ type: "guid", value: guid })),
        );
    });
});
