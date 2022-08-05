// (C) 2019-2022 GoodData Corporation
import React from "react";
// import { mount } from "enzyme";
import { render, cleanup, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import noop from "lodash/noop";
import cloneDeep from "lodash/cloneDeep";
// import { IColor } from "@gooddata/sdk-model";
import { colorPalette } from "../../../../../tests/mocks/testColorHelper";
import { InternalIntlWrapper } from "../../../../../utils/internalIntlProvider";
import ColorDropdown, {
    IColorDropdownOwnProps /*, IconPosition */,
    ISelectableChild,
} from "../ColorDropdown";
// import { ColorPicker } from "@gooddata/sdk-ui-kit";

// import ColorPaletteItem from "../ColorPaletteItem";
// import ColorPalette from "../ColorPalette";
// import CustomColorButton from "../CustomColorButton";
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
            <button data-isSelected={this.props.isSelected} data-position={this.props.position}>
                test{JSON.stringify(this.props)}
            </button>
        );
    }
}

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
    afterEach(cleanup);

    it("should render ColorDropdown control", () => {
        const { getByRole } = createComponent();
        expect(getByRole("button")).toBeTruthy();
    });

    it("should render ColorPalette control when on item button click", async () => {
        const { getByRole, getAllByTitle } = createComponent();
        fireEvent.click(getByRole("button"));
        await waitFor(() => expect(getAllByTitle(/rgb*/i)).toBeTruthy());
    });

    it(
        "should inject isSelected=true into child when ColorPalette control" +
            +"is shown after item button click",
        async () => {
            const { getByRole, getAllByTitle } = createComponent();

            expect(getByRole("button").toHaveAttribute("test-is-selected")).toBeFalsy();
            fireEvent.click(getByRole("button"));
            await waitFor(() => {
                expect(getAllByTitle(/rgb*/i)).toBeTruthy();
                expect(getByRole("button").classList.contains("test-is-selected")).toBeTruthy();
            });
        },
    );

    // it(
    //     "should inject position=IconPosition.Down into child when ColorPalette control" +
    //         +"is shown after item button click",
    //     () => {
    //         const { getByRole } = createComponent();
    //         fireEvent.click(getByRole("button"));
    //         expect(getByRole("")).toBeTruthy();
    //         // expect(wrapper.find(MockItem).prop("position")).toEqual(IconPosition.Down);
    //     },
    // );

    // it("should render ColorPalette and select ColorPaletteItem with guid 04 after item button click", () => {
    //     const wrapper = createComponent();
    //     const expectedColorItem = {
    //         guid: "04",
    //         fill: {
    //             r: 194,
    //             g: 153,
    //             b: 121,
    //         },
    //     };

    //     wrapper.find(".buttonitem").simulate("click");
    //     const selectedItem = wrapper.find(ColorPaletteItem).find({ selected: true });
    //     expect(selectedItem.prop("paletteItem")).toEqual(expectedColorItem);
    // });

    // it(
    //     "should render ColorPalette and not select any ColorPaletteItem after item button click" +
    //         "when selectedColorItem is RGBColor",
    //     () => {
    //         const selectedColorItem: IColor = {
    //             type: "rgb",
    //             value: {
    //                 r: 20,
    //                 g: 178,
    //                 b: 226,
    //             },
    //         };

    //         const wrapper = createComponent({ selectedColorItem });
    //         wrapper.find(".buttonitem").simulate("click");
    //         const selectedItem = wrapper.find(ColorPaletteItem).find({ selected: true });
    //         expect(selectedItem.length).toBe(0);
    //     },
    // );

    // it("should call onColorSelected once when colorItem clicked and return type guid and given guid value", () => {
    //     const onColorSelected = jest.fn();
    //     const wrapper = createComponent({ onColorSelected });
    //     wrapper.find(".buttonitem").simulate("click");
    //     jest.useFakeTimers();

    //     const selectedItem = wrapper.find(ColorPaletteItem).find({ paletteItem: colorPalette[2] });
    //     selectedItem.find("div").simulate("click");

    //     jest.runAllTimers();
    //     expect(onColorSelected).toHaveBeenNthCalledWith(1, { type: "guid", value: "03" });
    // });

    // it("should not render CustomColorButton when showCustomPicker props is false after item button click", () => {
    //     const wrapper = createComponent();
    //     wrapper.find(".buttonitem").simulate("click");
    //     expect(wrapper.find(CustomColorButton).length).toBe(0);
    // });

    // it("should render CustomColorButton when showCustomPicker props is true after item button click", () => {
    //     const wrapper = createComponent({ showCustomPicker: true });
    //     wrapper.find(".buttonitem").simulate("click");
    //     expect(wrapper.find(CustomColorButton).length).toBe(1);
    // });

    // it("should render ColorPicker when CustomColorButton button click", () => {
    //     const wrapper = createComponent({ showCustomPicker: true });
    //     wrapper.find(".buttonitem").simulate("click");

    //     const customColorButtonButton = wrapper.find("button").find(".s-custom-section-button");
    //     customColorButtonButton.simulate("click");

    //     expect(wrapper.find(ColorPicker).length).toBe(1);
    //     expect(wrapper.find(ColorPalette).length).toBe(0);
    // });

    // it(
    //     "should render ColorPicker when CustomColorButton click" +
    //         "and initialRgbColor should be color with 04 in rgb(194, 153, 121)",
    //     () => {
    //         const expectedColor = {
    //             r: 194,
    //             g: 153,
    //             b: 121,
    //         };
    //         const wrapper = createComponent({ showCustomPicker: true });
    //         wrapper.find(".buttonitem").simulate("click");

    //         const customColorButtonButton = wrapper.find("button").find(".s-custom-section-button");
    //         customColorButtonButton.simulate("click");

    //         expect(wrapper.find(ColorPicker).prop("initialRgbColor")).toEqual(expectedColor);
    //     },
    // );

    // it("should inject isSelected=true into child when ColorPicker control shown", () => {
    //     const wrapper = createComponent({ showCustomPicker: true });
    //     wrapper.find(".buttonitem").simulate("click");

    //     const customColorButtonButton = wrapper.find("button").find(".s-custom-section-button");
    //     customColorButtonButton.simulate("click");

    //     expect(wrapper.find(MockItem).prop("isSelected")).toBeTruthy();
    // });

    // it("should inject position=IconPosition.Right into child when ColorPicker control shown", () => {
    //     const wrapper = createComponent({ showCustomPicker: true });
    //     wrapper.find(".buttonitem").simulate("click");

    //     const customColorButtonButton = wrapper.find("button").find(".s-custom-section-button");
    //     customColorButtonButton.simulate("click");

    //     expect(wrapper.find(MockItem).prop("position")).toEqual(IconPosition.Right);
    // });

    // it("should render ColorPalette when ColorPicker cancel button click", () => {
    //     const wrapper = createComponent({ showCustomPicker: true });
    //     wrapper.find(".buttonitem").simulate("click");

    //     const customColorButtonButton = wrapper.find("button").find(".s-custom-section-button");
    //     customColorButtonButton.simulate("click");

    //     const cancelButton = wrapper.find(".s-cancel");
    //     cancelButton.simulate("click");

    //     expect(wrapper.find(ColorPicker).length).toBe(0);
    //     expect(wrapper.find(ColorPalette).length).toBe(1);
    // });

    // it(
    //     "should call onColorSelected once when ColorPicker select color" +
    //         " and return type rgb and given rgb value",
    //     () => {
    //         const onColorSelected = jest.fn();
    //         const wrapper = createComponent({ showCustomPicker: true, onColorSelected });
    //         wrapper.find(".buttonitem").simulate("click");
    //         jest.useFakeTimers();

    //         const customColorButtonButton = wrapper.find("button").find(".s-custom-section-button");
    //         customColorButtonButton.simulate("click");

    //         const pickerInputField = wrapper.find("HexColorInput").find("input");
    //         pickerInputField.simulate("change", { target: { value: "#ff0000" } });

    //         const confirmButton = wrapper.find(".s-ok");
    //         confirmButton.simulate("click");
    //         jest.runAllTimers();

    //         expect(onColorSelected).toHaveBeenNthCalledWith(1, {
    //             type: "rgb",
    //             value: { r: 255, g: 0, b: 0 },
    //         });
    //     },
    // );
});
