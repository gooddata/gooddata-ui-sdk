// (C) 2019 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import noop from "lodash/noop";
import cloneDeep from "lodash/cloneDeep";
import { DropdownBody } from "@gooddata/goodstrap/lib/Dropdown/Dropdown";
import ColoredItemsList, { IColoredItemsListProps } from "../ColoredItemsList";
import { colorPalette } from "../../../../../tests/mocks/testColorHelper";
import { InternalIntlWrapper, createInternalIntl } from "../../../../../utils/internalIntlProvider";
import { inputItemsMock } from "./mock";

const defaultProps: IColoredItemsListProps = {
    colorPalette,
    inputItems: [],
    onSelect: noop,
    intl: createInternalIntl(),
};

function createComponent(customProps: Partial<IColoredItemsListProps> = {}) {
    const props: IColoredItemsListProps = { ...cloneDeep(defaultProps), ...customProps };
    return mount<IColoredItemsListProps>(
        <InternalIntlWrapper>
            <ColoredItemsList {...props} />
        </InternalIntlWrapper>,
    );
}

describe("ColoredItemsList", () => {
    it("should render ColoredItemsList control", () => {
        const wrapper = createComponent();
        expect(wrapper.find(ColoredItemsList).length).toBe(1);
    });

    it("should render DropdownBody control", () => {
        const wrapper = createComponent();
        expect(wrapper.find(DropdownBody).length).toBe(1);
    });

    it("should use empty searchString by default", () => {
        const wrapper = createComponent();
        const dropdown = wrapper.find(DropdownBody);
        expect(dropdown.props().searchString).toEqual("");
    });

    it("should hide search field for less than 8 items", () => {
        const wrapper = createComponent();
        const dropdown = wrapper.find(DropdownBody);
        expect(dropdown.props().isSearchFieldVisible).toBeFalsy();
    });

    it("should hide search field while loading", () => {
        const wrapper = createComponent({
            inputItems: inputItemsMock,
            isLoading: true,
        });
        const dropdown = wrapper.find(DropdownBody);
        expect(dropdown.props().isSearchFieldVisible).toBeFalsy();
    });

    it("should show search field for more than 7 items", () => {
        const wrapper = createComponent({
            inputItems: inputItemsMock,
        });
        const dropdown = wrapper.find(DropdownBody);
        expect(dropdown.props().isSearchFieldVisible).toBeTruthy();
    });

    it("should ignore searchString when no search field is visible", () => {
        const wrapper = createComponent();
        const onSearchFunc = wrapper.find(DropdownBody).prop("onSearch");
        onSearchFunc("abcd");
        wrapper.update();
        const dropdown = wrapper.find(DropdownBody);
        expect(dropdown.props().searchString).toEqual("");
    });

    it("should use searchString when search field is visible", () => {
        const wrapper = createComponent({
            inputItems: inputItemsMock,
        });
        const onSearchFunc = wrapper.find(DropdownBody).prop("onSearch");
        onSearchFunc("abcd");
        wrapper.update();
        const dropdown = wrapper.find(DropdownBody);
        expect(dropdown.props().searchString).toEqual("abcd");
    });
});
