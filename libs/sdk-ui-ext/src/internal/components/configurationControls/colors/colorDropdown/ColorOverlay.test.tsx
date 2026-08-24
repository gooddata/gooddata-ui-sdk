// (C) 2019-2026 GoodData Corporation

import { createElement } from "react";

import { render, screen } from "@testing-library/react";
import { cloneDeep } from "lodash-es";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports
import type * as UiKit from "@gooddata/sdk-ui-kit";

import type * as ColorOverlayModule from "./ColorOverlay.js";

// Mock the Overlay component
vi.mock("@gooddata/sdk-ui-kit", async () => {
    const actual = await vi.importActual("@gooddata/sdk-ui-kit");
    return {
        ...actual,
        Overlay: vi.fn((props) => {
            return createElement("div", { "aria-label": "mocked-overlay" }, props.children);
        }),
    };
});

/*
 * Test isolation is disabled for this package, so the module cache is shared between test files:
 * ColorOverlay.js may already have been evaluated - bound to the real Overlay - by another test file, and
 * the mocked graph this file builds must not outlive it. Re-import both modules up front so this file
 * always observes the mocked Overlay, and drop the mocked graph again on the way out.
 */
let uiKit: typeof UiKit;
let ColorOverlay: typeof ColorOverlayModule.ColorOverlay;
let DropdownVersionType: typeof ColorOverlayModule.DropdownVersionType;
let defaultProps: ColorOverlayModule.IColorOverlayProps;

beforeAll(async () => {
    vi.resetModules();
    uiKit = await import("@gooddata/sdk-ui-kit");
    ({ ColorOverlay, DropdownVersionType } = await import("./ColorOverlay.js"));

    defaultProps = {
        alignTo: "#somestyle",
        dropdownVersion: DropdownVersionType.ColorPalette,
        onClose: () => {},
    };
});

afterAll(() => {
    vi.resetModules();
});

function createComponent(customProps: Partial<ColorOverlayModule.IColorOverlayProps> = {}) {
    const props: ColorOverlayModule.IColorOverlayProps = { ...cloneDeep(defaultProps), ...customProps };
    return render(<ColorOverlay {...props} />);
}

describe("ColorOverlay", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render ColorOverlay control", () => {
        createComponent();
        expect(screen.getByLabelText("Color overlay content")).not.toBeNull();
    });

    it("ColorOverlay should be aligned to top left or bottom left", () => {
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

        expect(uiKit.Overlay).toHaveBeenCalledWith(
            expect.objectContaining({ alignPoints: expectAlignPoints, alignTo: defaultProps.alignTo }),
            undefined,
        );
    });

    it("ColorOverlay should be aligned to center left or bottom left", () => {
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

        expect(uiKit.Overlay).toHaveBeenCalledWith(
            expect.objectContaining({ alignPoints: expectAlignPoints, alignTo: defaultProps.alignTo }),
            undefined,
        );
    });
});
