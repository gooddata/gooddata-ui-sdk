// (C) 2019-2025 GoodData Corporation

import { memo } from "react";

import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { cloneDeep } from "lodash-es";
import { describe, expect, it, vi } from "vitest";

import { IColor } from "@gooddata/sdk-model";

import { colorPalette } from "../../../../../tests/mocks/testColorHelper.js";
import { InternalIntlWrapper } from "../../../../../utils/internalIntlProvider.js";
import { IColoredItemContentProps } from "../../coloredItemsList/ColoredItemContent.js";
import ColorDropdown, { IColorDropdownOwnProps, ISelectableChild, IconPosition } from "../ColorDropdown.js";

export type IMockItemProps = IColoredItemContentProps & ISelectableChild;

const defaultProps: IColorDropdownOwnProps = {
    selectedColorItem: {
        type: "guid",
        value: "04",
    },
    colorPalette,
    showCustomPicker: false,
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

describe("ColorDropdown", () => {
    it("should render ColorDropdown control", () => {
        createComponent();
        expect(screen.getByText("test")).toBeInTheDocument();
    });

    it("should render ColorPalette control when on item button click", async () => {
        createComponent();
        await userEvent.click(screen.getByText("test"));
        await waitFor(() => expect(screen.queryByLabelText("Color palette")).toBeInTheDocument());
    });

    it(
        "should inject isSelected=true into child when ColorPalette control" +
            +"is shown after item button click",
        async () => {
            createComponent();

            expect(screen.getByText("test")).toHaveAttribute("data-is-selected", "false");
            await userEvent.click(screen.getByText("test"));
            await waitFor(() => {
                expect(screen.queryByLabelText("Color palette")).toBeInTheDocument();
                expect(screen.getByText("test")).toHaveAttribute("data-is-selected", "true");
            });
        },
    );

    it(
        "should inject position=IconPosition.Down into child when ColorPalette control" +
            +"is shown after item button click",
        async () => {
            createComponent();

            await userEvent.click(screen.getByText("test"));
            await waitFor(() => {
                expect(screen.getByText("test")).toHaveAttribute(
                    "data-icon-position",
                    IconPosition.Down.toString(),
                );
            });
        },
    );

    it("should render ColorPalette and select ColorPaletteItem with guid 04 after item button click", async () => {
        const { fill } = colorPalette[3]; // selected by default within component
        const expectedColor = { r: 194, g: 153, b: 121 };
        createComponent();

        await userEvent.click(screen.getByText("test"));
        await waitFor(() => {
            expect(screen.queryByLabelText(`rgb(${fill.r},${fill.g},${fill.b})`)).toHaveClass(
                "gd-color-list-item-active",
            );
            expect(screen.queryByLabelText(`rgb(${fill.r},${fill.g},${fill.b})`)).toHaveStyle({
                backgroundColor: `rgb(${expectedColor.r}, ${expectedColor.g}, ${expectedColor.b})`,
            });
        });
    });

    it(
        "should render ColorPalette and not select any ColorPaletteItem after item button click" +
            "when selectedColorItem is RGBColor",
        async () => {
            const selectedColorItem: IColor = {
                type: "rgb",
                value: {
                    r: 20,
                    g: 178,
                    b: 226,
                },
            };
            createComponent({ selectedColorItem });

            await userEvent.click(screen.getByText("test"));
            await waitFor(() => {
                expect(screen.queryByLabelText("Color palette")).toBeInTheDocument();
                expect(
                    screen.queryByLabelText(
                        `rgb(${selectedColorItem.value.r},${selectedColorItem.value.g},${selectedColorItem.value.b})`,
                    ),
                ).not.toBeInTheDocument();
            });
        },
    );

    it("should call onColorSelected once when colorItem clicked and return type guid and given guid value", async () => {
        const onColorSelected = vi.fn();
        const { guid, fill } = colorPalette[2];
        createComponent({ onColorSelected });

        await userEvent.click(screen.getByText("test"));
        await userEvent.click(screen.queryByLabelText(`rgb(${fill.r},${fill.g},${fill.b})`));
        await waitFor(() => {
            expect(onColorSelected).toBeCalledWith(expect.objectContaining({ type: "guid", value: guid }));
        });
    });

    it("should not render CustomColorButton when showCustomPicker props is false after item button click", async () => {
        createComponent();

        await userEvent.click(screen.getByText("test"));
        await waitFor(() => {
            expect(screen.queryByText("Custom color")).not.toBeInTheDocument();
        });
    });

    it("should render CustomColorButton when showCustomPicker props is true after item button click", async () => {
        createComponent({ showCustomPicker: true });

        await userEvent.click(screen.getByText("test"));
        await waitFor(() => {
            expect(screen.getByText("Custom color")).toBeInTheDocument();
        });
    });

    it("should render ColorPicker when CustomColorButton button click", async () => {
        createComponent({
            showCustomPicker: true,
        });

        await userEvent.click(screen.getByText("test"));
        expect(await screen.findByText("Custom color")).toBeInTheDocument();

        await userEvent.click(screen.getByText("Custom color"));
        await waitFor(() => {
            expect(screen.queryByLabelText("Color picker")).toBeInTheDocument();
            expect(screen.queryByLabelText("Color palette")).not.toBeInTheDocument();
        });
    });

    it(
        "should render ColorPicker when CustomColorButton click" +
            "and initialRgbColor should be color with 04 in rgb(194, 153, 121)",
        async () => {
            const expectedColor = {
                r: 194,
                g: 153,
                b: 121,
            };
            createComponent({
                showCustomPicker: true,
            });

            await userEvent.click(screen.getByText("test"));
            expect(await screen.findByText("Custom color")).toBeInTheDocument();

            expect(
                screen.queryByLabelText(`rgb(${expectedColor.r},${expectedColor.g},${expectedColor.b})`),
            ).toHaveClass("gd-color-list-item-active");
        },
    );

    it("should inject isSelected=true into child when ColorPicker control shown", async () => {
        createComponent({ showCustomPicker: true });

        await userEvent.click(screen.getByText("test"));
        await userEvent.click(screen.getByText("Custom color"));
        expect(screen.getByText("test")).toHaveAttribute("data-is-selected", "true");
    });

    it("should inject position=IconPosition.Right into child when ColorPicker control shown", async () => {
        createComponent({ showCustomPicker: true });

        await userEvent.click(screen.getByText("test"));
        await userEvent.click(screen.getByText("Custom color"));
        expect(screen.getByText("test")).toHaveAttribute("data-icon-position", IconPosition.Right.toString());
    });

    it("should render ColorPalette when ColorPicker cancel button click", async () => {
        createComponent({ showCustomPicker: true });

        await userEvent.click(screen.getByText("test"));
        await userEvent.click(screen.getByText("Custom color"));
        await userEvent.click(screen.getByText("Cancel"));
        await waitFor(() => {
            expect(screen.queryByLabelText("Color picker")).not.toBeInTheDocument();
            expect(screen.queryByLabelText("Color palette")).toBeInTheDocument();
        });
    });

    it(
        "should call onColorSelected once when ColorPicker select color" +
            " and return type rgb and given rgb value",
        async () => {
            const onColorSelected = vi.fn();
            createComponent({
                showCustomPicker: true,
                onColorSelected,
            });

            await userEvent.click(screen.getByText("test"));
            await userEvent.click(screen.getByText("Custom color"));

            await userEvent.clear(screen.getByPlaceholderText("#color"));
            await userEvent.type(screen.getByPlaceholderText("#color"), "#ff0000");
            await userEvent.click(screen.getByText("OK"));
            await waitFor(() => {
                expect(onColorSelected).toBeCalledWith(
                    expect.objectContaining({ type: "rgb", value: { r: 255, g: 0, b: 0 } }),
                );
            });
        },
    );
});
