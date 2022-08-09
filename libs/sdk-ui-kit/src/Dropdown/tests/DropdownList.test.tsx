// (C) 2007-2022 GoodData Corporation
import React from "react";
import { mount, ReactWrapper } from "enzyme";
import { DropdownList, IDropdownListNoDataRenderProps, IDropdownListProps } from "../DropdownList";
import { IRenderListItemProps, List } from "../../List";
import { Input } from "../../Form";
import { LoadingMask } from "../../LoadingMask";
import { withIntl } from "@gooddata/sdk-ui";
import { customMessages } from "./customDictionary";
import { DropdownTabs } from "../DropdownTabs";
import { componentMock } from "./testUtils";

type IDropdownListMockProps = IDropdownListProps<string>;

const noDataMock = componentMock<IDropdownListNoDataRenderProps>();
const itemMock = componentMock<IRenderListItemProps<string>>();
const itemRenderer = itemMock.componentWithProps(({ item }) => ({ children: item }));
const mockItems = Array.from(Array(10)).map((_, i): string => `${i}`);

const isNoDataStateRendered = (dropdownList: ReactWrapper) => dropdownList.find(noDataMock.selector).exists();
const isLoadingStateRendered = (dropdownList: ReactWrapper) => dropdownList.find(LoadingMask).exists();
const isSearchFieldRendered = (dropdownList: ReactWrapper) => dropdownList.find(Input).exists();
const isTabsRendered = (dropdownList: ReactWrapper) => dropdownList.find(DropdownTabs).exists();
const isItemListRendered = (dropdownList: ReactWrapper, mockItems: string[]) =>
    dropdownList.find(List).exists() && mockItems.every((item) => dropdownList.text().includes(item));

const renderDropdownList = (props: Partial<IDropdownListMockProps> = {}) => {
    const defaultProps = {
        renderItem: itemRenderer,
    };

    const Wrapper = withIntl<IDropdownListMockProps>(DropdownList, undefined, customMessages);
    return mount(<Wrapper {...defaultProps} {...props} />);
};

describe("DropdownList", () => {
    it("should render the search field, when showSearch is true", () => {
        const dropdownList = renderDropdownList({ showSearch: true });
        expect(isSearchFieldRendered(dropdownList)).toBeTruthy();
    });

    it("should render the tabs, when showTabs is true", () => {
        const dropdownList = renderDropdownList({ showTabs: true });
        expect(isTabsRendered(dropdownList)).toBeTruthy();
    });

    it("should render the loading state, when isLoading is true", () => {
        const dropdownList = renderDropdownList({ isLoading: true });
        expect(isLoadingStateRendered(dropdownList)).toBeTruthy();
    });

    it("should render the no data state, when items are empty", () => {
        const dropdownList = renderDropdownList({ renderNoData: noDataMock.component });
        expect(isNoDataStateRendered(dropdownList)).toBeTruthy();
    });

    it("should render items, when items are not empty", () => {
        const dropdownList = renderDropdownList({ items: mockItems });
        expect(isItemListRendered(dropdownList, mockItems)).toBeTruthy();
    });

    it("should render the footer", () => {
        const footerMock = componentMock();
        const footer = <footerMock.component />;
        const dropdownList = renderDropdownList({ footer });
        expect(dropdownList.find(footerMock.selector).exists()).toBeTruthy();
    });
});
