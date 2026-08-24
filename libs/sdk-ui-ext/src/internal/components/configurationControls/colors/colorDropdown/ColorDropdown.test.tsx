// (C) 2019-2026 GoodData Corporation

import { memo } from "react";

import { act, fireEvent, render, screen } from "@testing-library/react";
import { cloneDeep } from "lodash-es";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type IColor } from "@gooddata/sdk-model";

import { colorPalette } from "../../../../tests/mocks/testColorHelper.js";
import { InternalIntlWrapper } from "../../../../utils/internalIntlProvider.js";
import { type IColoredItemContentProps } from "../coloredItemsList/ColoredItemContent.js";

import {
    ColorDropdown,
    type IColorDropdownOwnProps,
    type ISelectableChild,
    IconPosition,
} from "./ColorDropdown.js";

export type IMockItemProps = IColoredItemContentProps & ISelectableChild;

/**
 * Delay ColorDropdown waits out before it propagates the picked color (see ColorDropdown.onColorSelected).
 */
const COLOR_SELECTED_DELAY = 100;

const defaultProps: IColorDropdownOwnProps = {
    selectedColorItem: {
        type: "guid",
        value: "04",
    },
    colorPalette,
    onColorSelected: () => {},
};

const MockItem = memo(function MockItem({ isSelected, position }: IMockItemProps) {
    return (
        <button data-is-selected={isSelected} data-icon-position={position}>
            test
        </button>
    );
});

function createComponent(customProps: Partial<IColorDropdownOwnProps> = {}) {
    const props: IColorDropdownOwnProps = { ...cloneDeep(defaultProps), ...customProps };

    return render(
        <InternalIntlWrapper>
            <ColorDropdown {...props}>
                <MockItem color={{ r: 255, g: 0, b: 0 }} text="sometext" />
            </ColorDropdown>
        </InternalIntlWrapper>,
    );
}

/**
 * All the interactions below are plain clicks and one text change, so they are dispatched
 * synchronously: React has committed everything the event triggered by the time fireEvent returns and
 * no assertion has to poll for the result.
 */
function click(element: HTMLElement) {
    fireEvent.click(element);
}

function openDropdown() {
    click(screen.getByText("test"));
}

/**
 * Waits out the propagation delay on the (fake) clock and lets React commit what it triggered, so the
 * delay is never awaited in real time.
 */
async function settleColorSelection() {
    await act(() => vi.advanceTimersByTimeAsync(COLOR_SELECTED_DELAY));
}

describe("ColorDropdown", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("should render ColorDropdown control", () => {
        createComponent();
        expect(screen.getByText("test")).toBeInTheDocument();
    });

    it("should render ColorPalette control when on item button click", () => {
        createComponent();

        openDropdown();

        expect(screen.getByLabelText("Color palette")).toBeInTheDocument();
    });

    it(
        "should inject isSelected=true into child when ColorPalette control" +
            +"is shown after item button click",
        () => {
            createComponent();

            expect(screen.getByText("test")).toHaveAttribute("data-is-selected", "false");

            openDropdown();

            expect(screen.getByLabelText("Color palette")).toBeInTheDocument();
            expect(screen.getByText("test")).toHaveAttribute("data-is-selected", "true");
        },
    );

    it(
        "should inject position=IconPosition.Down into child when ColorPalette control" +
            +"is shown after item button click",
        () => {
            createComponent();

            openDropdown();

            expect(screen.getByText("test")).toHaveAttribute(
                "data-icon-position",
                IconPosition.Down.toString(),
            );
        },
    );

    it("should render ColorPalette and select ColorPaletteItem with guid 04 after item button click", () => {
        const { fill } = colorPalette[3]; // selected by default within component
        const expectedColor = { r: 194, g: 153, b: 121 };
        createComponent();

        openDropdown();

        const selectedItem = screen.getByLabelText(`rgb(${fill.r},${fill.g},${fill.b})`);
        expect(selectedItem).toHaveClass("gd-color-list-item-active");
        expect(selectedItem).toHaveStyle({
            backgroundColor: `rgb(${expectedColor.r}, ${expectedColor.g}, ${expectedColor.b})`,
        });
    });

    it(
        "should render ColorPalette and not select any ColorPaletteItem after item button click" +
            "when selectedColorItem is RGBColor",
        () => {
            const selectedColorItem: IColor = {
                type: "rgb",
                value: {
                    r: 20,
                    g: 178,
                    b: 226,
                },
            };
            createComponent({ selectedColorItem });

            openDropdown();

            expect(screen.getByLabelText("Color palette")).toBeInTheDocument();
            expect(
                screen.queryByLabelText(
                    `rgb(${selectedColorItem.value.r},${selectedColorItem.value.g},${selectedColorItem.value.b})`,
                ),
            ).not.toBeInTheDocument();
        },
    );

    it("should call onColorSelected once when colorItem clicked and return type guid and given guid value", async () => {
        const onColorSelected = vi.fn();
        const { guid, fill } = colorPalette[2];
        createComponent({ onColorSelected });

        openDropdown();
        click(screen.getByLabelText(`rgb(${fill.r},${fill.g},${fill.b})`));
        await settleColorSelection();

        expect(onColorSelected).toBeCalledWith(expect.objectContaining({ type: "guid", value: guid }));
    });

    it("should render CustomColorButton when showCustomPicker props is true after item button click", () => {
        createComponent();

        openDropdown();

        expect(screen.getByText("Custom color")).toBeInTheDocument();
    });

    it("should render ColorPicker when CustomColorButton button click", () => {
        createComponent();

        openDropdown();
        click(screen.getByText("Custom color"));

        expect(screen.getByLabelText("Color picker")).toBeInTheDocument();
        expect(screen.queryByLabelText("Color palette")).not.toBeInTheDocument();
    });

    it(
        "should render ColorPicker when CustomColorButton click" +
            "and initialRgbColor should be color with 04 in rgb(194, 153, 121)",
        () => {
            const expectedColor = {
                r: 194,
                g: 153,
                b: 121,
            };
            createComponent();

            openDropdown();

            expect(screen.getByText("Custom color")).toBeInTheDocument();
            expect(
                screen.getByLabelText(`rgb(${expectedColor.r},${expectedColor.g},${expectedColor.b})`),
            ).toHaveClass("gd-color-list-item-active");
        },
    );

    it("should inject isSelected=true into child when ColorPicker control shown", () => {
        createComponent();

        openDropdown();
        click(screen.getByText("Custom color"));

        expect(screen.getByText("test")).toHaveAttribute("data-is-selected", "true");
    });

    it("should inject position=IconPosition.Right into child when ColorPicker control shown", () => {
        createComponent();

        openDropdown();
        click(screen.getByText("Custom color"));

        expect(screen.getByText("test")).toHaveAttribute("data-icon-position", IconPosition.Right.toString());
    });

    it("should render ColorPalette when ColorPicker cancel button click", () => {
        createComponent();

        openDropdown();
        click(screen.getByText("Custom color"));
        click(screen.getByText("Cancel"));

        expect(screen.queryByLabelText("Color picker")).not.toBeInTheDocument();
        expect(screen.getByLabelText("Color palette")).toBeInTheDocument();
    });

    it(
        "should call onColorSelected once when ColorPicker select color" +
            " and return type rgb and given rgb value",
        async () => {
            const onColorSelected = vi.fn();
            createComponent({
                onColorSelected,
            });

            openDropdown();
            click(screen.getByText("Custom color"));

            fireEvent.change(screen.getByPlaceholderText("#color"), { target: { value: "#ff0000" } });
            click(screen.getByText("OK"));
            await settleColorSelection();

            expect(onColorSelected).toBeCalledWith(
                expect.objectContaining({ type: "rgb", value: { r: 255, g: 0, b: 0 } }),
            );
        },
    );
});
