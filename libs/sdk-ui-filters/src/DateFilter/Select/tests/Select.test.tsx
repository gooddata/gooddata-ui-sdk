// (C) 2007-2019 GoodData Corporation
import * as React from "react";
import { mount } from "enzyme";
import { Select, ISelectProps } from "../Select";
import { SelectMenu, ISelectMenuProps } from "../SelectMenu";
import { SelectHeading } from "../SelectHeading";
import { SelectOption } from "../SelectOption";
import { SelectButton } from "../SelectButton";
import { SelectSeparator } from "../SelectSeparator";
import { ISelectItemOption, ISelectItemSeparator, ISelectItemHeading, ISelectItem } from "../types";
import { getSelectableItems } from "../utils";

describe("Select", () => {
    const optionFirst: ISelectItemOption<string> = { type: "option", value: "first", label: "First" };
    const optionLast: ISelectItemOption<string> = { type: "option", value: "last", label: "Last" };
    const itemSeparator: ISelectItemSeparator = { type: "separator" };
    const itemHeading: ISelectItemHeading = { type: "heading", label: "heading" };

    const sampleItems: Array<ISelectItem<string>> = [optionFirst, itemSeparator, itemHeading, optionLast];

    const mountSelect = (props: Partial<ISelectProps<string>> = {}) => {
        const defaultProps = {
            items: sampleItems,
        };
        return mount(<Select {...defaultProps} {...props} />);
    };

    it("should render a select button with first option selected by default", () => {
        const mountedSelect = mountSelect();
        const selectButton = mountedSelect.find(SelectButton);
        expect(selectButton.length).toBe(1);
        expect(selectButton.text()).toBe(optionFirst.label);
    });

    it("should render menu and items on button click", () => {
        const mountedSelect = mountSelect();
        const selectButton = mountedSelect.find(SelectButton);
        selectButton.simulate("click");
        const selectMenu = mountedSelect.find(SelectMenu);
        expect(selectMenu.length).toBe(1);
        const selectOptions = mountedSelect.find(SelectOption);
        expect(selectOptions.length).toBe(2);
        const separator = mountedSelect.find(SelectSeparator);
        expect(separator.length).toBe(1);
        const heading = mountedSelect.find(SelectHeading);
        expect(heading.length).toBe(1);
    });

    it("should call onChange when option is selected", () => {
        const onChange = jest.fn();
        const mountedSelect = mountSelect({ onChange });
        const selectButton = mountedSelect.find(SelectButton);
        selectButton.simulate("click");

        // First option is selected by default
        const lastOption = mountedSelect.find(SelectOption).last();
        lastOption.simulate("click");

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange.mock.calls[0][0]).toBe(optionLast);
    });

    it("should display the selected option", () => {
        const mountedSelect = mountSelect();
        mountedSelect.setProps({
            value: optionLast.value,
        });
        const selectButton = mountedSelect.find(SelectButton);
        expect(selectButton.text()).toBe(optionLast.label);
    });

    it("should highlight the selected option", () => {
        const mountedSelect = mountSelect();
        mountedSelect.setProps({
            value: optionLast.value,
        });
        const selectButton = mountedSelect.find(SelectButton);
        selectButton.simulate("click");
        const lastOption = mountedSelect.find(SelectOption).last();
        expect(lastOption.prop("isSelected")).toBe(true);
    });

    describe("SelectMenu", () => {
        it("should set className and option className", () => {
            const props: ISelectMenuProps<string> = {
                className: "menuClassName",
                items: sampleItems,
                getItemProps: (f) => f,
                getMenuProps: (f) => f,
                highlightedIndex: 0,
                optionClassName: "optionClassName",
                selectedItem: optionLast,
            };
            const mountedSelectMenu = mount(<SelectMenu {...props} />);
            expect(mountedSelectMenu.find("div.menuClassName").length).toBe(1);
            expect(mountedSelectMenu.find("div.optionClassName").length).toBe(2);
        });
    });

    describe("getSelectableOptions", () => {
        it('should filter items and return only items with type "option"', () => {
            expect(getSelectableItems(sampleItems)).toEqual([optionFirst, optionLast]);
        });
    });
});
