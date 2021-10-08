// (C) 2019 GoodData Corporation
import React, { PropsWithChildren } from "react";
import { mount, ReactWrapper } from "enzyme";
import noop from "lodash/noop";
import cloneDeep from "lodash/cloneDeep";
import { DropdownList, IDropdownListProps } from "@gooddata/sdk-ui-kit";
import ColoredItemsList, { IColoredItemsListProps } from "../ColoredItemsList";
import { colorPalette } from "../../../../../tests/mocks/testColorHelper";
import { InternalIntlWrapper, createInternalIntl } from "../../../../../utils/internalIntlProvider";
import { inputItemsMock } from "./mock";

type IDropdownListMockProps = IDropdownListProps<string>;

const defaultProps: IColoredItemsListProps = {
    colorPalette,
    inputItems: [],
    onSelect: noop,
    intl: createInternalIntl(),
};

function obtainDropdownList(
    wrapper: ReactWrapper,
): ReactWrapper<PropsWithChildren<IDropdownListMockProps>, never, unknown> {
    return wrapper.find(DropdownList);
}

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

    it("should render DropdownList control", () => {
        const wrapper = createComponent();
        expect(wrapper.find(DropdownList).length).toBe(1);
    });

    it("should use empty searchString by default", () => {
        const wrapper = createComponent();
        const dropdownList = obtainDropdownList(wrapper);
        expect(dropdownList.props().searchString).toEqual("");
    });

    it("should hide search field for less than 8 items", () => {
        const wrapper = createComponent();
        const dropdownList = obtainDropdownList(wrapper);
        expect(dropdownList.props().showSearch).toBeFalsy();
    });

    it("should hide search field while loading", () => {
        const wrapper = createComponent({
            inputItems: inputItemsMock,
            isLoading: true,
        });
        const dropdownList = obtainDropdownList(wrapper);
        expect(dropdownList.props().showSearch).toBeFalsy();
    });

    it("should show search field for more than 7 items", () => {
        const wrapper = createComponent({
            inputItems: inputItemsMock,
        });
        const dropdownList = obtainDropdownList(wrapper);
        expect(dropdownList.props().showSearch).toBeTruthy();
    });

    it("should ignore searchString when no search field is visible", () => {
        const wrapper = createComponent();
        const onSearchFunc = obtainDropdownList(wrapper).prop("onSearch");
        onSearchFunc("abcd");
        wrapper.update();
        const dropdownList = obtainDropdownList(wrapper);
        expect(dropdownList.props().searchString).toEqual("");
    });

    it("should use searchString when search field is visible", () => {
        const wrapper = createComponent({
            inputItems: inputItemsMock,
        });
        const onSearchFunc = obtainDropdownList(wrapper).prop("onSearch");
        onSearchFunc("abcd");
        wrapper.update();
        const dropdownList = obtainDropdownList(wrapper);
        expect(dropdownList.props().searchString).toEqual("abcd");
    });
});
