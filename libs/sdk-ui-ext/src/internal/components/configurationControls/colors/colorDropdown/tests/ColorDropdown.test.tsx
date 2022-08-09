// (C) 2019-2022 GoodData Corporation
import React from "react";
import { cleanup, waitFor, fireEvent } from "@testing-library/react";
import noop from "lodash/noop";
import cloneDeep from "lodash/cloneDeep";
import { IColor } from "@gooddata/sdk-model";
import { colorPalette } from "../../../../../tests/mocks/testColorHelper";
import { setupComponent } from "../../../../../tests/testHelper";
import { InternalIntlWrapper } from "../../../../../utils/internalIntlProvider";
import ColorDropdown, { IColorDropdownOwnProps, IconPosition, ISelectableChild } from "../ColorDropdown";
import { IColoredItemContentProps } from "../../coloredItemsList/ColoredItemContent";

export type IMockItemProps = IColoredItemContentProps & ISelectableChild;

const defaultProps: IColorDropdownOwnProps = {
    selectedColorItem: {
        type: "guid",
        value: "04",
    },
    colorPalette,
    showCustomPicker: false,
    onColorSelected: noop,
};

class MockItem extends React.PureComponent<IMockItemProps> {
    public render() {
        return (
            <button data-is-selected={this.props.isSelected} data-icon-position={this.props.position}>
                test
            </button>
        );
    }
}

function createComponent(customProps: Partial<IColorDropdownOwnProps> = {}) {
    const props: IColorDropdownOwnProps = { ...cloneDeep(defaultProps), ...customProps };

    return setupComponent(
        <InternalIntlWrapper>
            <ColorDropdown {...props}>
                <MockItem color={{ r: 255, g: 0, b: 0 }} text="sometext" />
            </ColorDropdown>
        </InternalIntlWrapper>,
    );
}

describe("ColorDropdown", () => {
    afterEach(cleanup);

    it("should render ColorDropdown control", () => {
        const { getByText } = createComponent();
        expect(getByText("test")).toBeInTheDocument();
    });

    it("should render ColorPalette control when on item button click", async () => {
        const { getByText, queryByLabelText, user } = createComponent();
        await user.click(getByText("test"));
        await waitFor(() => expect(queryByLabelText("Color palette")).toBeInTheDocument());
    });

    it(
        "should inject isSelected=true into child when ColorPalette control" +
            +"is shown after item button click",
        async () => {
            const { getByText, queryByLabelText, user } = createComponent();

            expect(getByText("test")).toHaveAttribute("data-is-selected", "false");
            await user.click(getByText("test"));
            await waitFor(() => {
                expect(queryByLabelText("Color palette")).toBeInTheDocument();
                expect(getByText("test")).toHaveAttribute("data-is-selected", "true");
            });
        },
    );

    it(
        "should inject position=IconPosition.Down into child when ColorPalette control" +
            +"is shown after item button click",
        async () => {
            const { getByText, user } = createComponent();

            await user.click(getByText("test"));
            await waitFor(() => {
                expect(getByText("test")).toHaveAttribute("data-icon-position", IconPosition.Down.toString());
            });
        },
    );

    it("should render ColorPalette and select ColorPaletteItem with guid 04 after item button click", async () => {
        const { fill } = colorPalette[3]; // selected by default within component
        const expectedColor = { r: 194, g: 153, b: 121 };
        const { queryByLabelText, getByText, user } = createComponent();

        await user.click(getByText("test"));
        await waitFor(() => {
            expect(queryByLabelText(`rgb(${fill.r},${fill.g},${fill.b})`)).toHaveClass(
                "gd-color-list-item-active",
            );
            expect(queryByLabelText(`rgb(${fill.r},${fill.g},${fill.b})`)).toHaveStyle({
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
            const { getByText, queryByLabelText, user } = createComponent({ selectedColorItem });

            await user.click(getByText("test"));
            await waitFor(() => {
                expect(queryByLabelText("Color palette")).toBeInTheDocument();
                expect(
                    queryByLabelText(
                        `rgb(${selectedColorItem.value.r},${selectedColorItem.value.g},${selectedColorItem.value.b})`,
                    ),
                ).not.toBeInTheDocument();
            });
        },
    );

    it("should call onColorSelected once when colorItem clicked and return type guid and given guid value", async () => {
        const onColorSelected = jest.fn();
        const { guid, fill } = colorPalette[2];
        const { getByText, queryByLabelText, user } = createComponent({ onColorSelected });

        await user.click(getByText("test"));
        await user.click(queryByLabelText(`rgb(${fill.r},${fill.g},${fill.b})`));
        await waitFor(() => {
            expect(onColorSelected).toBeCalledWith(expect.objectContaining({ type: "guid", value: guid }));
        });
    });

    it("should not render CustomColorButton when showCustomPicker props is false after item button click", async () => {
        const { getByText, queryByText, user } = createComponent();

        await user.click(getByText("test"));
        await waitFor(() => {
            expect(queryByText("Custom color")).not.toBeInTheDocument();
        });
    });

    it("should render CustomColorButton when showCustomPicker props is true after item button click", async () => {
        const { getByText, user } = createComponent({ showCustomPicker: true });

        await user.click(getByText("test"));
        await waitFor(() => {
            expect(getByText("Custom color")).toBeInTheDocument();
        });
    });

    it("should render ColorPicker when CustomColorButton button click", async () => {
        const { getByText, findByText, queryByLabelText, user } = createComponent({
            showCustomPicker: true,
        });

        await user.click(getByText("test"));
        expect(await findByText("Custom color")).toBeInTheDocument();

        await user.click(getByText("Custom color"));
        await waitFor(() => {
            expect(queryByLabelText("Color picker")).toBeInTheDocument();
            expect(queryByLabelText("Color palette")).not.toBeInTheDocument();
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
            const { getByText, queryByLabelText, findByText, user } = createComponent({
                showCustomPicker: true,
            });

            await user.click(getByText("test"));
            expect(await findByText("Custom color")).toBeInTheDocument();

            expect(
                queryByLabelText(`rgb(${expectedColor.r},${expectedColor.g},${expectedColor.b})`),
            ).toHaveClass("gd-color-list-item-active");
        },
    );

    it("should inject isSelected=true into child when ColorPicker control shown", async () => {
        const { getByText, user } = createComponent({ showCustomPicker: true });

        await user.click(getByText("test"));
        await user.click(getByText("Custom color"));
        expect(getByText("test")).toHaveAttribute("data-is-selected", "true");
    });

    it("should inject position=IconPosition.Right into child when ColorPicker control shown", async () => {
        const { getByText, user } = createComponent({ showCustomPicker: true });

        await user.click(getByText("test"));
        await user.click(getByText("Custom color"));
        expect(getByText("test")).toHaveAttribute("data-icon-position", IconPosition.Right.toString());
    });

    it("should render ColorPalette when ColorPicker cancel button click", async () => {
        const { getByText, queryByLabelText, user } = createComponent({ showCustomPicker: true });

        await user.click(getByText("test"));
        await user.click(getByText("Custom color"));
        await user.click(getByText("Cancel"));
        await waitFor(() => {
            expect(queryByLabelText("Color picker")).not.toBeInTheDocument();
            expect(queryByLabelText("Color palette")).toBeInTheDocument();
        });
    });

    it(
        "should call onColorSelected once when ColorPicker select color" +
            " and return type rgb and given rgb value",
        async () => {
            const onColorSelected = jest.fn();
            const { getByText, getByPlaceholderText, user } = createComponent({
                showCustomPicker: true,
                onColorSelected,
            });

            await user.click(getByText("test"));
            await user.click(getByText("Custom color"));

            fireEvent.change(getByPlaceholderText("#color"), { target: { value: "" } });
            await user.type(getByPlaceholderText("#color"), "#ff0000");
            await user.click(getByText("OK"));
            await waitFor(() => {
                expect(onColorSelected).toBeCalledWith(
                    expect.objectContaining({ type: "rgb", value: { r: 255, g: 0, b: 0 } }),
                );
            });
        },
    );
});
